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

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(packageRoot, 'src');

export const BASE_URL_PLACEHOLDER = '{{BASE_PATH}}';

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

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
const exactAlias = (id, file) => ({
  find: new RegExp(`^${escapeRegExp(id)}$`, 'u'),
  // Regex alias replacements treat dollar signs as substitution syntax.
  replacement: file.replaceAll('$', '$$$$'),
});

function themeAliases(root, relativePath = '') {
  const directory = path.join(root, relativePath);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.posix.join(relativePath, entry.name);
    if (entry.isDirectory()) return themeAliases(root, entryPath);
    if (!entry.isFile()) return [];
    const file = path.join(root, entryPath);
    const aliases = [exactAlias(`theme/${entryPath}`, file)];
    const extension = path.extname(entry.name);
    if (extension) {
      aliases.push(exactAlias(`theme/${entryPath.slice(0, -extension.length)}`, file));
    }
    if (entry.name === 'index.js') {
      aliases.push(exactAlias(`theme/${relativePath}`, file));
    }
    return aliases;
  });
}

function hasAlias(aliases, id) {
  if (Array.isArray(aliases)) {
    return aliases.some(({ find }) => (
      find instanceof RegExp ? find.test(id) : find === id
    ));
  }
  return Object.hasOwn(aliases ?? {}, id);
}

export function themeFallback({ themeRoots } = {}) {
  let roots;
  const setRoots = root => {
    roots = [...(themeRoots ?? [path.join(root, 'src/theme')]), sourceRoot];
  };
  const resolveThemeFile = (id) => {
    if (!id.startsWith('theme/')) return null;
    const relativePath = id.slice('theme/'.length);
    return roots
      .map(root => resolveFile(path.join(root, relativePath)))
      .find(Boolean) || null;
  };

  return {
    name: 'swift-docc-render-theme-fallback',
    enforce: 'pre',
    config: (userConfig = {}) => {
      setRoots(path.resolve(userConfig.root ?? process.cwd()));
      return {
        resolve: {
          alias: [
            ...roots.slice(0, -1).flatMap(root => themeAliases(root)),
            {
              find: /^theme\/(.*)$/,
              replacement: `${sourceRoot}/$1`,
            },
          ],
        },
        css: {
          preprocessorOptions: {
            scss: {
              importers: [{
                findFileUrl(url) {
                  const file = resolveThemeFile(url);
                  return file ? pathToFileURL(file) : null;
                },
              }],
            },
          },
        },
      };
    },
    configResolved(config) {
      // order the theme fallback from custom theme to swift-docc-render/src
      setRoots(config.root);
    },
    resolveId: resolveThemeFile,
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

export function localDocCArchive(archivePath) {
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
          Reflect.set(response, 'statusCode', 404);
          response.end();
          return;
        }

        Reflect.set(response, 'statusCode', 200);
        response.setHeader('Content-Type', contentType(file));
        fs.createReadStream(file).pipe(response);
      });
    },
  };
}

export function indexTemplate({ title }) {
  let baseUrl;
  const noScript = fs.readFileSync(
    path.join(sourceRoot, 'assets/global-elements/noscript.html'),
    'utf8',
  );

  return {
    name: 'swift-docc-render-index-template',
    configResolved(config) {
      // Vite URL-encodes the placeholder; keep it root-relative for transformIndex.js.
      baseUrl = decodeURI(config.base) === `/${BASE_URL_PLACEHOLDER}/`
        ? `${BASE_URL_PLACEHOLDER}/`
        : config.base;
    },
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

export function highlightLanguageLoaders(additionalLanguages) {
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

export function distributionLicenseHeaders() {
  let outputRoot;
  const normalizeHeader = contents => (
    `${DISTRIBUTION_LICENSE_HEADER}\n${
      contents.replace(`${DISTRIBUTION_LICENSE_HEADER}\n`, '')
    }`
  );

  return {
    name: 'swift-docc-render-license-headers',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outputRoot = path.resolve(config.root, config.build.outDir);
    },
    generateBundle(_options, bundle) {
      // Add headers while the generated chunks and assets are still in the bundler pipeline.
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
      // Reapply the header to the final files in case later output processing rewrote them.
      ['css', 'js'].forEach((directory) => {
        const outputDirectory = path.join(outputRoot, directory);
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

function baseConfiguration({
  buildTarget,
  defaultLocale,
  performanceEnabled,
  scssAdditionalData,
  target,
  title,
}) {
  return {
    name: 'swift-docc-render-base-config',
    config(userConfig, { command }) {
      const isBuild = command === 'build';
      const userScss = userConfig.css?.preprocessorOptions?.scss;
      const userOutput = userConfig.build?.rolldownOptions?.output;
      const optimizeDepsExclude = ['swift-docc-render', 'docc-render']
        .filter(dependency => !userConfig.optimizeDeps?.exclude?.includes(dependency));
      const optimizeDepsInclude = [
        'swift-docc-render > css.escape',
        'swift-docc-render > highlight.js/lib/core',
        'swift-docc-render > @apple/highlightjs-pkl',
      ].filter(dependency => !userConfig.optimizeDeps?.include?.includes(dependency));
      const dedupe = ['vue', 'vue-router', 'vue-i18n']
        .filter(dependency => !userConfig.resolve?.dedupe?.includes(dependency));
      return {
        base: userConfig.base ?? (isBuild ? `/${BASE_URL_PLACEHOLDER}/` : '/'),
        experimental: {
          renderBuiltUrl: userConfig.experimental?.renderBuiltUrl ?? ((filename, { hostType }) => {
            if (hostType === 'js') {
              return { runtime: `new URL(${JSON.stringify(filename)}, document.baseURI).href` };
            }
            return undefined;
          }),
        },
        resolve: {
          ...(!hasAlias(userConfig.resolve?.alias, 'docc-render') && { alias: {
            'docc-render': sourceRoot,
          } }),
          dedupe,
        },
        optimizeDeps: {
          exclude: optimizeDepsExclude,
          include: optimizeDepsInclude,
        },
        define: {
          'process.env.VUE_APP_DEFAULT_LOCALE': userConfig.define?.[
            'process.env.VUE_APP_DEFAULT_LOCALE'
          ] ?? JSON.stringify(defaultLocale),
          'process.env.VUE_APP_PERFORMANCE_ENABLED': userConfig.define?.[
            'process.env.VUE_APP_PERFORMANCE_ENABLED'
          ] ?? JSON.stringify(performanceEnabled),
          'process.env.VUE_APP_TARGET': userConfig.define?.[
            'process.env.VUE_APP_TARGET'
          ] ?? JSON.stringify(target),
          'process.env.VUE_APP_TITLE': userConfig.define?.[
            'process.env.VUE_APP_TITLE'
          ] ?? JSON.stringify(title),
        },
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: [
                `$build-target: '${buildTarget}'; $is-target-ide: $build-target == 'ide';`,
                scssAdditionalData,
              ].filter(Boolean).join(' '),
              ...(!userScss?.silenceDeprecations && { silenceDeprecations: [
                'color-functions',
                'global-builtin',
                'if-function',
                'import',
                'slash-div',
              ] }),
            },
          },
        },
        build: {
          sourcemap: userConfig.build?.sourcemap ?? false,
          ...(!Array.isArray(userOutput) && { rolldownOptions: {
            output: {
              assetFileNames: userOutput?.assetFileNames ?? (({ names = [] }) => (
                names.some(name => name.endsWith('.css'))
                  ? 'css/[name].[hash][extname]'
                  : 'assets/[name].[hash][extname]'
              )),
              chunkFileNames: userOutput?.chunkFileNames ?? 'js/[name].[hash].js',
              entryFileNames: userOutput?.entryFileNames ?? 'js/[name].[hash].js',
            },
          } }),
        },
      };
    },
  };
}

export default function swiftDocCRender({
  additionalHighlightLanguages = '',
  target = '',
  buildTarget = ['ide', 'default'].includes(target) ? target : 'default',
  defaultLocale = '',
  performanceEnabled = '',
  scssAdditionalData = '',
  themeRoots,
  title = 'Documentation',
} = {}) {
  return [
    baseConfiguration({
      buildTarget,
      defaultLocale,
      performanceEnabled,
      scssAdditionalData,
      target,
      title,
    }),
    themeFallback({ themeRoots }),
    highlightLanguageLoaders(additionalHighlightLanguages),
    distributionLicenseHeaders(),
    indexTemplate({ title }),
  ];
}
