import customConfig from './custom.json' with { type: 'json' };
import defaultVisualizerConfig from './visualizer.js';

const config = {
  ...customConfig,
  visualizer: {
    ...defaultVisualizerConfig,
    ...customConfig?.visualizer,
  },
};
if (config.rocLogin && config.rocLogin.url) {
  // Remove trailing slash
  config.rocLogin.url = config.rocLogin.url.replace(/\/$/, '');
}

export default config;
