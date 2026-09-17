import { defineConfig, presetWind3 } from 'unocss';

export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: {
      alert: '#dc2626',
    },
  },
});
