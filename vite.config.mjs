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
import { fileURLToPath, pathToFileURL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(projectRoot, 'src');
const appRoot = path.join(projectRoot, 'app');
const BASE_URL_PLACEHOLDER = '{{BASE_PATH}}';
const LICENSE_HEADER = `This source file is part of the Swift.org open source project

Copyright (c) 2021 Apple Inc. and the Swift project authors
Licensed under Apache License v2.0 with Runtime Library Exception

See https://swift.org/LICENSE.txt for license information
See https://swift.org/CONTRIBUTORS.txt for Swift project authors`;
const DISTRIBUTION_LICENSE_HEADER = [
  '/*!',
  ...LICENSE_HEADER.split('\n').map(line => ` *${line ? ` ${line}` : ''}`),
  ' */',
].join('\n');

const proxyPathPattern = /^\/(data|downloads|images|videos|index|theme-settings\.json)(?:\/|$)/;
const themeRoots = [
  path.join(projectRoot, 'src/theme'),
  sourceRoot,
];
const builtinHighlightLanguages = [
  'bash',
  'c',
  'cpp',
  'css',
  'diff',
  'http',
  'java',
  'javascript',
  'json',
  'llvm',
  'markdown',
  'objectivec',
  'perl',
  'php',
  'pkl',
  'python',
  'ruby',
  'scss',
  'shell',
  'swift',
  'typescript',
  'xml',
  'yaml',
];
const customHighlightLanguages = new Set(['markdown', 'pkl', 'swift']);

function resolveFile(candidate) {
  return [
    candidate,
    `${candidate}.js`,
    `${candidate}.vue`,
    `${candidate}.json`,
    `${candidate}.scss`,
    path.join(candidate, 'index.js'),
  ].find(file => fs.existsSync(file));
}

function themeFallback() {
  return {
    name: 'swift-docc-render-theme-fallback',
    enforce: 'pre',
    resolveId(id) {
      if (!id.startsWith('theme/')) return null;
      const relativePath = id.slice('theme/'.length);
      return themeRoots
        .map(root => resolveFile(path.join(root, relativePath)))
        .find(Boolean) || null;
    },
  };
}

function contentType(file) {
  return {
    '.css': 'text/css',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
  }[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function localDocCArchive(archivePath) {
  return {
    name: 'swift-docc-render-local-archive',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url, 'http://localhost');
        if (!proxyPathPattern.test(url.pathname)) {
          next();
          return;
        }

        let archiveRelativePath = decodeURIComponent(url.pathname);
        if (url.pathname.startsWith('/data/diffs/') && url.searchParams.has('changes')) {
          const extension = path.extname(archiveRelativePath);
          archiveRelativePath = [
            archiveRelativePath.slice(0, -extension.length),
            '-',
            url.searchParams.get('changes'),
            extension,
          ].join('');
        }

        const file = path.resolve(archivePath, `.${archiveRelativePath}`);
        const archiveRoot = `${path.resolve(archivePath)}${path.sep}`;
        if (!file.startsWith(archiveRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          next();
          return;
        }

        Reflect.set(response, 'statusCode', 200);
        response.setHeader('Content-Type', contentType(file));
        fs.createReadStream(file).pipe(response);
      });
    },
  };
}

function validateLocalDocCArchive(archivePath) {
  const dataPath = path.join(archivePath, 'data');
  if (fs.existsSync(dataPath) && fs.statSync(dataPath).isDirectory()) return;

  throw new Error(
    [
      `VITE_DEV_SERVER_PROXY="${archivePath}" is not a rendered DocC archive`,
      '(the data directory is missing). A .docc source catalog cannot be served directly.',
      'Run "pnpm docs:build", then use "VITE_DEV_SERVER_PROXY=docs pnpm serve".',
    ].join(' '),
  );
}

function indexTemplate({ title, isBuild }) {
  const baseUrl = isBuild ? `${BASE_URL_PLACEHOLDER}/` : '/';
  const noScript = fs.readFileSync(
    path.join(sourceRoot, 'assets/global-elements/noscript.html'),
    'utf8',
  );

  return {
    name: 'swift-docc-render-index-template',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replaceAll('__SWIFT_DOCC_RENDER_BASE_URL__', baseUrl)
          .replace('__SWIFT_DOCC_RENDER_TITLE__', title)
          .replace('<!-- SWIFT_DOCC_RENDER_NOSCRIPT -->', noScript);
      },
    },
  };
}

function highlightLanguageLoaders(additionalLanguages) {
  const virtualModuleId = 'virtual:swift-docc-highlight-languages';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  const languages = [...new Set([
    ...builtinHighlightLanguages,
    ...additionalLanguages
      .split(',')
      .map(language => language.trim())
      .filter(language => /^[a-z0-9-]+$/.test(language)),
  ])];

  return {
    name: 'swift-docc-render-highlight-languages',
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : null;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return null;
      const loaders = languages.map((language) => {
        const moduleId = customHighlightLanguages.has(language)
          ? path.join(sourceRoot, `utils/custom-highlight-lang/${language}.js`)
          : `highlight.js/lib/languages/${language}`;
        return `${JSON.stringify(language)}: () => import(${JSON.stringify(moduleId)})`;
      });
      return `export default {${loaders.join(',')}};`;
    },
  };
}

function distributionLicenseHeaders() {
  const normalizeHeader = contents => (
    `${DISTRIBUTION_LICENSE_HEADER}\n${
      contents.replace(`${DISTRIBUTION_LICENSE_HEADER}\n`, '')
    }`
  );

  return {
    name: 'swift-docc-render-license-headers',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      Object.values(bundle).forEach((output) => {
        if (output.type === 'chunk') {
          // eslint-disable-next-line no-param-reassign
          output.code = normalizeHeader(output.code);
        } else if (output.fileName.endsWith('.css')) {
          // eslint-disable-next-line no-param-reassign
          output.source = normalizeHeader(output.source);
        }
      });
    },
    closeBundle() {
      ['css', 'js'].forEach((directory) => {
        const outputDirectory = path.join(projectRoot, 'dist', directory);
        if (!fs.existsSync(outputDirectory)) return;
        fs.readdirSync(outputDirectory).forEach((fileName) => {
          const outputFile = path.join(outputDirectory, fileName);
          const contents = fs.readFileSync(outputFile, 'utf8');
          fs.writeFileSync(outputFile, normalizeHeader(contents));
        });
      });
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, projectRoot, '');
  const isBuild = command === 'build';
  const title = env.VITE_APP_TITLE ?? 'Documentation';
  const target = env.VITE_APP_TARGET ?? '';
  const archiveProxy = env.VITE_DEV_SERVER_PROXY || 'http://localhost:8000';
  const archiveIsLocal = fs.existsSync(archiveProxy);
  const buildTarget = ['ide', 'default'].includes(target) ? target : 'default';

  if (!isBuild && archiveIsLocal) validateLocalDocCArchive(archiveProxy);

  return {
    root: appRoot,
    base: isBuild ? `/${BASE_URL_PLACEHOLDER}/` : '/',
    publicDir: path.join(appRoot, 'public'),
    envDir: projectRoot,
    plugins: [
      themeFallback(),
      highlightLanguageLoaders(env.VITE_APP_HLJS_LANGUAGES || ''),
      distributionLicenseHeaders(),
      vue({
        template: {
          compilerOptions: {
            whitespace: 'preserve',
            isCustomElement: tag => tag.startsWith('custom-'),
          },
        },
      }),
      indexTemplate({ title, isBuild }),
      ...(archiveIsLocal ? [localDocCArchive(archiveProxy)] : []),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: sourceRoot },
        { find: 'docc-render', replacement: sourceRoot },
        { find: 'theme', replacement: sourceRoot },
        {
          find: 'highlight-js-alias',
          replacement: path.join(projectRoot, 'node_modules/highlight.js'),
        },
      ],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isBuild ? 'production' : 'development'),
      'process.env.VUE_APP_DEFAULT_LOCALE': JSON.stringify(
        env.VITE_APP_DEFAULT_LOCALE || '',
      ),
      'process.env.VUE_APP_HLJS_LANGUAGES': JSON.stringify(
        env.VITE_APP_HLJS_LANGUAGES || '',
      ),
      'process.env.VUE_APP_PERFORMANCE_ENABLED': JSON.stringify(
        env.VITE_APP_PERFORMANCE_ENABLED || '',
      ),
      'process.env.VUE_APP_TARGET': JSON.stringify(target),
      'process.env.VUE_APP_TITLE': JSON.stringify(title),
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$build-target: '${buildTarget}'; $is-target-ide: $build-target == 'ide';`,
          importers: [{
            findFileUrl(url) {
              if (!url.startsWith('theme/')) return null;
              const relativePath = url.slice('theme/'.length);
              const file = themeRoots
                .map(root => resolveFile(path.join(root, relativePath)))
                .find(Boolean);
              return file ? pathToFileURL(file) : null;
            },
          }],
          silenceDeprecations: [
            'color-functions',
            'global-builtin',
            'if-function',
            'import',
            'slash-div',
          ],
        },
      },
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
      sourcemap: false,
      rolldownOptions: {
        checks: {
          // ContentNode is loaded asynchronously here to break a recursive component
          // dependency, not to create a separate chunk.
          ineffectiveDynamicImport: false,
          // Sass compilation is expected to dominate this stylesheet-heavy build.
          pluginTimings: false,
        },
        output: {
          assetFileNames: ({ names = [] }) => (
            names.some(name => name.endsWith('.css'))
              ? 'css/[name].[hash][extname]'
              : 'assets/[name].[hash][extname]'
          ),
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
        },
      },
    },
  };
});
