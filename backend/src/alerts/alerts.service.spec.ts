import type { Model } from 'mongoose';
import type { AlertDocument } from '../database/schemas/alert.schema.js';
import type { ReadingDocument } from '../database/schemas/reading.schema.js';
import { AlertsService } from './alerts.service.js';
import type { QueryAlertsDto } from './dto/query-alerts.schema.js';

/** Minimal stand-in for a hydrated Reading document — just what evaluate() touches. */
function createMockReading(overrides: Partial<ReadingDocument> = {}): ReadingDocument {
  return {
    _id: 'reading-id-1',
    sensorId: 'temp-01',
    sensorType: 'temperature',
    value: 20,
    unit: '°C',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    receivedAt: new Date('2026-01-01T00:00:01.000Z'),
    isAlert: false,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ReadingDocument;
}

describe('AlertsService', () => {
  let alertModel: { create: ReturnType<typeof vi.fn>; find: ReturnType<typeof vi.fn> };
  let service: AlertsService;

  beforeEach(() => {
    alertModel = {
      create: vi.fn().mockResolvedValue({ _id: 'alert-id-1' }),
      find: vi.fn(),
    };
    service = new AlertsService(alertModel as unknown as Model<AlertDocument>);
  });

  describe('evaluate', () => {
    it('returns null and creates nothing when the value is within bounds', async () => {
      const reading = createMockReading({ sensorType: 'temperature', value: 20 });

      const result = await service.evaluate(reading);

      expect(result).toBeNull();
      expect(alertModel.create).not.toHaveBeenCalled();
      expect(reading.save).not.toHaveBeenCalled();
      expect(reading.isAlert).toBe(false);
    });

    it('does not flag exact boundary values (strict > / < only)', async () => {
      const atMax = createMockReading({ sensorType: 'temperature', value: 40 });
      const atMin = createMockReading({ sensorType: 'temperature', value: -10 });

      await expect(service.evaluate(atMax)).resolves.toBeNull();
      await expect(service.evaluate(atMin)).resolves.toBeNull();
      expect(alertModel.create).not.toHaveBeenCalled();
    });

    it('flags a reading above the max threshold as "above"', async () => {
      const reading = createMockReading({
        _id: 'reading-id-2',
        sensorId: 'temp-01',
        sensorType: 'temperature',
        value: 45.5,
        timestamp: new Date('2026-01-02T00:00:00.000Z'),
      });

      const alert = await service.evaluate(reading);

      expect(alertModel.create).toHaveBeenCalledWith({
        readingId: 'reading-id-2',
        sensorId: 'temp-01',
        sensorType: 'temperature',
        value: 45.5,
        threshold: 40,
        direction: 'above',
        triggeredAt: reading.timestamp,
      });
      expect(reading.isAlert).toBe(true);
      expect(reading.save).toHaveBeenCalledTimes(1);
      expect(alert).toEqual({ _id: 'alert-id-1' });
    });

    it('flags a reading below the min threshold as "below"', async () => {
      const reading = createMockReading({ sensorType: 'humidity', value: 4, unit: '%' });

      await service.evaluate(reading);

      expect(alertModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ direction: 'below', threshold: 10, value: 4 }),
      );
      expect(reading.isAlert).toBe(true);
    });

    it('never reports "below" for air_quality, which has no configured minimum', async () => {
      const reading = createMockReading({ sensorType: 'air_quality', value: 0, unit: 'AQI' });

      const result = await service.evaluate(reading);

      expect(result).toBeNull();
      expect(alertModel.create).not.toHaveBeenCalled();
    });

    it('flags air_quality above its max even though it has no minimum', async () => {
      const reading = createMockReading({ sensorType: 'air_quality', value: 200, unit: 'AQI' });

      await service.evaluate(reading);

      expect(alertModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ direction: 'above', threshold: 150 }),
      );
    });

    it('logs and rethrows if persisting the alert fails, without swallowing the error', async () => {
      const reading = createMockReading({ sensorType: 'temperature', value: 50 });
      const dbError = new Error('connection lost');
      alertModel.create.mockRejectedValueOnce(dbError);

      await expect(service.evaluate(reading)).rejects.toThrow('connection lost');
      // The reading should never be flagged if the Alert document was never persisted.
      expect(reading.isAlert).toBe(false);
      expect(reading.save).not.toHaveBeenCalled();
    });
  });

  describe('query', () => {
    function mockFindChain(result: AlertDocument[]) {
      const exec = vi.fn().mockResolvedValue(result);
      const sort = vi.fn().mockReturnValue({ exec });
      alertModel.find.mockReturnValue({ sort });
      return { sort, exec };
    }

    it('builds an empty filter and sorts newest-first when no params are given', async () => {
      const { sort } = mockFindChain([]);

      await service.query({} as QueryAlertsDto);

      expect(alertModel.find).toHaveBeenCalledWith({});
      expect(sort).toHaveBeenCalledWith({ triggeredAt: -1 });
    });

    it('filters by sensorId when provided', async () => {
      mockFindChain([]);

      await service.query({ sensorId: 'temp-01' } as QueryAlertsDto);

      expect(alertModel.find).toHaveBeenCalledWith({ sensorId: 'temp-01' });
    });

    it('filters by acknowledged, including the explicit false case', async () => {
      mockFindChain([]);

      await service.query({ acknowledged: false } as QueryAlertsDto);

      expect(alertModel.find).toHaveBeenCalledWith({ acknowledged: false });
    });

    it('builds a $gte/$lte range on triggeredAt from from/to', async () => {
      mockFindChain([]);

      await service.query({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T00:00:00.000Z',
      } as QueryAlertsDto);

      expect(alertModel.find).toHaveBeenCalledWith({
        triggeredAt: {
          $gte: new Date('2026-01-01T00:00:00.000Z'),
          $lte: new Date('2026-01-31T00:00:00.000Z'),
        },
      });
    });

    it('returns whatever the query resolves to', async () => {
      const alerts = [{ _id: 'a1' }, { _id: 'a2' }] as unknown as AlertDocument[];
      mockFindChain(alerts);

      const result = await service.query({} as QueryAlertsDto);

      expect(result).toBe(alerts);
    });
  });
});
