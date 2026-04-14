// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://zvictorliu.github.io/',
    i18n: {
        locales: ['en', 'zh'],
        defaultLocale: 'zh',
        routing: {
            prefixDefaultLocale: false,
        },
    },
});
