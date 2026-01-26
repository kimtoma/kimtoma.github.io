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

This is a Jekyll 4.1.1 static site using the Poole theme with dark mode customization. Deployed via GitHub Pages to kimtoma.com.

**Layout hierarchy**: `_layouts/default.html` → `page.html` (pages) / `post.html` (blog posts)

**Styling**: Modular SCSS in `_sass/` with CSS variables defined in `_variables.scss`. Main entry point is `styles.scss`. Theme uses `data-theme="dark-poole"`.

**Content**:
- Blog posts in `_posts/` (YYYY-MM-DD-slug.md format)
- Media files organized by year in `media/YYYY/`
- Static pages: `about.md`, `projects.md`, `archive.md`

**Plugins**: jekyll-gist, jekyll-paginate, jekyll-seo-tag

**Features**: Mermaid.js diagrams (initialized in post.html), Rouge syntax highlighting, Atom feed at /atom.xml
