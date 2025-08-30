import defaultConfig from './default.js';

export function getConfig(customConfig) {
  const config = { ...defaultConfig, ...customConfig };
  if (config.rocLogin && config.rocLogin.url) {
    // Remove trailing slash
    config.rocLogin.url = config.rocLogin.url.replace(/\/$/, '');
  }
  return config;
}
