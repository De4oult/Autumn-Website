# Autumn Website

<p align="center">
    <img src="https://i.imgur.com/1bXTXQe.png" alt="Autumn logo" width="120" />
</p>

<p align="center">
    <strong>The official website for Autumn Framework: a small, warm home for documentation, roadmap, releases, and project updates.</strong>
</p>

__Autumn Website__ is the public-facing site for the Autumn Framework project. It presents the framework in a clear, calm way and gathers the pages that matter most for readers: landing content, documentation entry points, roadmap, releases, SEO metadata, and multilingual content.

The repository is focused on the website itself, not the Python framework source code. If you are looking for the framework implementation, packages, or backend internals, use the main Autumn repository instead.

## What the site includes
- A localized landing page for presenting Autumn’s tone, positioning, and core ideas
- Documentation entry points and content pages
- Roadmap and releases pages backed by structured content files
- Open Graph, Twitter, sitemap, robots, and LLM-oriented indexing files
- A custom 404 experience in the same visual language as the rest of the site

## Stack
- `Nuxt 4`
- `Vue 3`
- `@nuxt/content`
- `@nuxtjs/i18n`
- `@nuxtjs/sitemap`
- Tailwind CSS
- Static generation via `nuxt generate`

## Development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run generate
```

The generated static output will be written to `.output/public`.

## Content structure
- `app/` contains the Nuxt application, layouts, pages, and components
- `content/` stores localized structured content such as roadmap and release notes
- `i18n/` contains translation files
- `public/` holds static assets such as the logo, OG image, `robots.txt`, and `llms.txt`

## Author
```
     _      _  _               _ _   
  __| | ___| || |   ___  _   _| | |_ 
 / _` |/ _ \ || |_ / _ \| | | | | __|
| (_| |  __/__   _| (_) | |_| | | |_ 
 \__,_|\___|  |_|  \___/ \__,_|_|\__|
```

## __Thank you a lot!__

<br>

## How to reach me
<a href="https://t.me/kayra_dev">
    <img src="https://img.shields.io/badge/-Telegram-informational?style=for-the-badge&logo=telegram" alt="Telegram Badge" height="30" />
</a>
<img src="https://img.shields.io/badge/-kayra.dist@gmail.com-informational?style=for-the-badge&logo=gmail" alt="Gmail Badge" height="30" />
