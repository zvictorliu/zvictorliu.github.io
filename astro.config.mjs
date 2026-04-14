// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://zvictorliu.github.io/',
    trailingSlash: 'always',
    i18n: {
        locales: ['en', 'zh'],
        defaultLocale: 'zh',
        fallback: {
            en: 'zh',
        },
        routing: {
            prefixDefaultLocale: false,
            fallbackType: 'rewrite',
        },
    },
});
