# Testing Versatile Banner in Discourse Development

This guide explains how to test the Versatile Banner theme component in a local Discourse development environment.

## Prerequisites

- Discourse development environment set up ([Discourse Development Guide](https://meta.discourse.org/t/beginners-guide-to-install-discourse-for-development-using-docker/102009))
- Git installed
- Access to Discourse admin panel
- Discourse Theme CLI: `gem install discourse_theme`

## Installation Steps

### 1. Clone the Theme Component

Clone the repository to your local development environment:

```bash
git clone https://github.com/[your-username]/discourse-versatile-banner.git
cd discourse-versatile-banner
```

### 2. Set up Theme CLI

Initialize the theme for development:

```bash
# This will create a .discourse-site file with your settings
discourse_theme init
```

When prompted, enter:
- Your Discourse URL: `http://localhost:3000`
- Your admin API key (create one at `/admin/api/keys`)

### 3. Install via Theme CLI or Admin Panel

#### Option A: Using Theme CLI (Recommended)
```bash
# This will create the theme component in your Discourse instance
discourse_theme upload .
```

#### Option B: Via Admin Panel

1. Start your Discourse development server:
   ```bash
   bundle exec rails server
   ```

2. Navigate to `http://localhost:3000/admin`

3. Go to **Customize → Themes**

4. Click **Install** → **From a git repository**

5. Enter the repository URL:
   - For local development: `file:///path/to/discourse-versatile-banner`
   - For GitHub: `https://github.com/[username]/discourse-versatile-banner`

6. Click **Install**

### 4. Start Development with Live Reload

Start the theme watcher for automatic syncing:

```bash
discourse_theme watch . --verbose
```

This will:
- Watch all theme files for changes
- Automatically sync changes to your Discourse instance
- Show verbose output of what's being synced
- No need to manually refresh (just reload the browser page)

### 5. Configure the Banner Settings

1. After installation, click on the **Versatile Banner** theme component

2. Go to the **Settings** tab

3. Configure the banner slides:

#### Basic Configuration:
```yaml
# Enable banners (1-3)
banner_1_enabled: true
banner_2_enabled: true
banner_3_enabled: false

# Banner 1 settings
banner_1_background_color: "#EED4A1"
banner_1_content_image: "des1"
banner_1_content_image_alt: "First Banner"

# Banner 2 settings
banner_2_background_color: "#FF6C00"
banner_2_content_image: "des2"
banner_2_content_image_alt: "Second Banner"

# Enable auto-carousel
enable_auto_carousel: true
auto_carousel_speed: "medium"
auto_carousel_pause_on_hover: true
```

#### Advanced Configuration:
```yaml
# Dark mode support
banner_1_background_color_dark: "#333333"
banner_2_background_color_dark: "#444444"

# Background images (optional)
banner_1_background_image: "https://example.com/bg1.jpg"
banner_1_background_image_dark: "https://example.com/bg1-dark.jpg"

# Display settings
display_on_mobile: true
display_on_desktop: true
show_for_anon: true
show_for_members: true
```

### 6. Add to a Theme

1. Go to your main theme (or create a test theme)
2. In the theme settings, under **Theme Components**, add **Versatile Banner**
3. Save the theme

## Testing Scenarios

### 1. Single Banner Test
```yaml
banner_1_enabled: true
banner_2_enabled: false
banner_3_enabled: false
```
- Verify no carousel arrows appear
- Check image is centered
- Test responsive behavior

### 2. Multiple Banners Test
```yaml
banner_1_enabled: true
banner_2_enabled: true
banner_3_enabled: true
```
- Verify carousel arrows appear
- Test manual navigation
- Check auto-rotation if enabled

### 3. Mobile Responsiveness
- Test on different viewport sizes:
  ```bash
  # In Chrome DevTools
  - iPhone SE (375px)
  - iPad (768px)
  - Desktop (1920px)
  ```

### 4. Dark Mode Testing
1. Enable dark mode in Discourse user preferences
2. Verify dark background colors/images are applied
3. Check contrast and visibility

### 5. Performance Testing
```bash
# Monitor browser console for errors
# Check network tab for asset loading
# Verify smooth transitions
```

## Running JavaScript Tests

From the Discourse root directory:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test test/acceptance/versatile-banner-test.js

# Run with coverage
pnpm test --coverage
```

## Running Ruby System Tests

```bash
# Run the system specs
bundle exec rspec plugins/discourse-versatile-banner/spec/system/core_features_spec.rb

# Run with specific example
bundle exec rspec plugins/discourse-versatile-banner/spec/system/core_features_spec.rb:15
```

## Live Reload Development

For faster development iteration:

1. Install the Discourse Theme CLI:
   ```bash
   gem install discourse_theme
   ```

2. From your theme component directory:
   ```bash
   cd /path/to/discourse-versatile-banner
   discourse_theme watch . --verbose
   ```

3. When prompted, enter:
   - Your Discourse URL (e.g., `http://localhost:3000`)
   - Your admin API key (get from `/admin/api/keys`)
   - Select the theme component to update

4. The watcher will now automatically sync changes to your local Discourse instance
5. Refresh your browser to see changes instantly

Alternative: If you already have the theme configured in `.discourse-site` file:
```bash
discourse_theme watch
```

## Debugging Tips

### 1. Check Browser Console
```javascript
// In browser console, check if settings are loaded
Discourse.ThemeSettings.versatile_banner_theme

// Check if component is rendered
document.querySelector('.banner-box')
```

### 2. Verify Assets Loading
```javascript
// Check if images are loading correctly
document.querySelectorAll('.banner-main-image').forEach(img => {
  console.log(img.src, img.complete);
});
```

### 3. Test Carousel State
```javascript
// Check active slide
document.querySelector('.carousel-slide.active')

// Manually trigger next slide
document.querySelector('.carousel-btn.next').click()
```

## Common Issues and Solutions

### Images Not Showing
1. Verify image assets are properly defined in `about.json`
2. Check image file exists in `assets/images/`
3. Ensure correct file extension (.png)

### Carousel Not Working
1. Check if multiple banners are enabled
2. Verify JavaScript console for errors
3. Ensure carousel initialization runs (`didInsertCarousel`)

### Dark Mode Not Working
1. Verify dark color settings are configured
2. Check browser is in dark mode
3. Inspect CSS variables in DevTools

### Mobile Layout Issues
1. Test with actual device or accurate emulation
2. Check viewport meta tag
3. Verify responsive CSS media queries

## Useful Commands

```bash
# Watch for changes and auto-sync
discourse_theme watch . --verbose

# Upload theme once
discourse_theme upload .

# Download theme from Discourse
discourse_theme download <theme_name>

# Check for linting errors
npx eslint javascripts/
npx stylelint common/*.scss

# Clear Discourse theme cache
cd /path/to/discourse
bundle exec rake themes:clear_cache

# Run JavaScript tests
pnpm test test/acceptance/versatile-banner-test.js
```

## Testing Checklist

- [ ] Single banner displays correctly
- [ ] Multiple banners show carousel controls
- [ ] Auto-rotation works (if enabled)
- [ ] Manual navigation works
- [ ] Pause on hover works
- [ ] Mobile responsive (< 768px)
- [ ] Tablet responsive (768px - 1024px)
- [ ] Desktop responsive (> 1024px)
- [ ] Dark mode colors apply correctly
- [ ] Background images load properly
- [ ] Alt text is present for accessibility
- [ ] No JavaScript console errors
- [ ] Smooth transitions between slides
- [ ] Settings changes apply immediately
- [ ] Component uninstalls cleanly