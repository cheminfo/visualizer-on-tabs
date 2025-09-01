const config = '../config.json';

const defaultConfig = {};

export function getConfig() {
  return config.visualizerConfig || defaultConfig;
}
