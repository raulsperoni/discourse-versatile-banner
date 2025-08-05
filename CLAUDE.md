# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Discourse theme component called "Versatile Banner" that adds a customizable banner to the top of Discourse forums. The component is built using Ember.js and provides various configuration options through settings.

## Common Development Commands

```bash
# Linting
npx eslint .
npx stylelint "**/*.scss"
npx ember-template-lint .

# Running tests
bundle exec rspec spec/system/core_features_spec.rb  # Ruby system tests
pnpm test                                             # JavaScript tests
```

## Architecture

### Component Structure
- **Main Component**: `javascripts/discourse/components/versatile-banner.js` - Core banner logic with carousel functionality and category support
- **Column Component**: `javascripts/discourse/components/versatile-banner-column.js` - Individual column rendering
- **Templates**: Corresponding `.hbs` files for component markup

### Key Features
1. **Multi-column Layout**: Supports up to 4 configurable columns
2. **Category Integration**: Each column can display category information with icons/images
3. **Auto-carousel**: Automatic slide rotation with configurable speed
4. **Responsive Design**: Mobile/desktop display controls
5. **Cookie-based State**: Dismissible/collapsible state persisted in cookies

### Settings Architecture
- Settings defined in `settings.yml` with extensive configuration options
- Categories referenced by ID and resolved at runtime
- Display rules based on user state (anon/member) and URL patterns

### Testing
- **Acceptance Tests**: `test/acceptance/versatile-banner-test.js` - UI behavior testing
- **System Tests**: `spec/system/core_features_spec.rb` - Ruby integration tests
- **Migration Tests**: Settings migration tests for icon compatibility

### Asset Management
- Images stored in `assets/images/` and registered in `about.json`
- Assets referenced in templates using `{{asset-path}}` helper

### Important Patterns
- Cookie management uses `discourse/lib/cookie` utilities
- Category lookup uses `this.site.categories.find()`
- Icon fallback chain: uploaded_logo → color → icon
- Component lifecycle hooks for carousel initialization/cleanup