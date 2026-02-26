import defaultVisualizerConfig from './visualizer.js';

export function getConfig(customConfig) {
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
  return config;
}
