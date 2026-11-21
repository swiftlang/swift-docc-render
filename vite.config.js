/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import swiftDocCRender, { localDocCArchive } from './vite.js';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(projectRoot, 'src');

function validateLocalDocCArchive(archivePath) {
  const dataPath = path.join(archivePath, 'data');
  if (fs.existsSync(dataPath) && fs.statSync(dataPath).isDirectory()) return;

  throw new Error(
    [
      `VITE_DEV_SERVER_PROXY="${archivePath}" is not a rendered DocC archive`,
      '(the data directory is missing). A .docc source catalog cannot be served directly.',
      'Run VITE_DEV_SERVER_PROXY=/path/to/[name].doccarchive',
    ].join(' '),
  );
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const isBuild = command === 'build';
  const title = env.VITE_APP_TITLE ?? 'Documentation';
  const target = env.VITE_APP_TARGET ?? '';
  const archiveProxy = env.VITE_DEV_SERVER_PROXY || 'http://localhost:8000';
  const archiveIsLocal = fs.existsSync(archiveProxy);

  if (!isBuild && archiveIsLocal) validateLocalDocCArchive(archiveProxy);

  return {
    plugins: [
      ...swiftDocCRender({
        additionalHighlightLanguages: env.VITE_APP_HLJS_LANGUAGES || '',
        defaultLocale: env.VITE_APP_DEFAULT_LOCALE || '',
        performanceEnabled: env.VITE_APP_PERFORMANCE_ENABLED || '',
        target,
        title,
      }),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('custom-'),
          },
        },
      }),
      vueDevTools(),
      ...(archiveIsLocal ? [localDocCArchive(archiveProxy)] : []),
    ],
    resolve: {
      alias: {
        '@': sourceRoot,
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isBuild ? 'production' : 'development'),
    },
    server: archiveIsLocal ? {} : {
      proxy: {
        '/data': archiveProxy,
        '/downloads': archiveProxy,
        '/images': archiveProxy,
        '/index': archiveProxy,
        '/theme-settings.json': archiveProxy,
        '/videos': archiveProxy,
      },
    },
    build: {
      outDir: path.join(projectRoot, 'dist'),
      emptyOutDir: true,
      rolldownOptions: {
        checks: {
          // ContentNode is loaded asynchronously here to break a recursive component
          // dependency, not to create a separate chunk.
          ineffectiveDynamicImport: false,
          // Sass compilation is expected to dominate this stylesheet-heavy build.
          pluginTimings: false,
        },
      },
    },
  };
});
