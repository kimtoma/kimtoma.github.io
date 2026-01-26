# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Install dependencies
bundle install

# Build the site
bundle exec jekyll build

# Serve locally with auto-reload (http://localhost:4000)
bundle exec jekyll serve
```

## Architecture

Jekyll 4.1.1 static site using customized Poole theme with Dark/Light mode. Deployed via GitHub Pages to kimtoma.com (Cloudflare CDN).

**Layout hierarchy**: `_layouts/default.html` → `page.html` (pages) / `post.html` (blog posts)

**Styling**: Modular SCSS in `_sass/` with CSS variables in `_variables.scss`. Theme controlled via `data-theme="dark"` or `data-theme="light"` on `<html>`.

**Content**:
- Blog posts: `_posts/` (YYYY-MM-DD-slug.md)
- Media: `media/YYYY/`
- Static pages: `about.md`, `projects.md`, `archive.md`
- LLM context: `llms.txt`, `llms-full.txt`

## Theme Toggle

- Toggle button in header (`_layouts/default.html`)
- Icons: 🌞 (dark mode) / 🌚 (light mode)
- Preference saved in localStorage
- Scripts use `data-cfasync="false"` for Cloudflare Rocket Loader compatibility

## Plugins

jekyll-gist, jekyll-paginate, jekyll-seo-tag

## Features

- Dark/Light theme toggle
- Mermaid.js diagrams
- Rouge syntax highlighting
- Atom feed (`/atom.xml`)
- Google Analytics, Cloudflare Insights
