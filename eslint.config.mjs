import { defineConfig } from 'eslint/config';
import { globals } from 'eslint-config-zakodium';
import js from 'eslint-config-zakodium/js';
import react from 'eslint-config-zakodium/react';

export default defineConfig(
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  js,
  react,
);
