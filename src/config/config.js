import defaultConfig from './default.js';

async function getCustomConfig() {
  try {
    await import('./custom.json', { assert: { type: 'json' } });
  } catch {
    return {};
  }
}

export async function getConfig() {
  const customConfig = await getCustomConfig();
  const config = { ...defaultConfig, ...customConfig };
  if (config.rocLogin && config.rocLogin.url) {
    // Remove trailing slash
    config.rocLogin.url = config.rocLogin.url.replace(/\/$/, '');
  }
  return config;
}
