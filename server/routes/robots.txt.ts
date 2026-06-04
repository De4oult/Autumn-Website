export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event);
    const baseUrl = String(config.public.url || 'https://autumn.de4oult.online').replace(/\/+$/, '');

    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');

    return [
        'User-agent: *',
        'Allow: /',
        'Disallow: /_nuxt/',
        'Disallow: /api/',
        'Disallow: /preview/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`
    ].join('\n');
});
