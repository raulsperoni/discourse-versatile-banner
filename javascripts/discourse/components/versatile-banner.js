import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import cookie, { removeCookie } from "discourse/lib/cookie";
import { defaultHomepage } from "discourse/lib/utilities";
import { i18n } from "discourse-i18n";

export default class VersatileBanner extends Component {
  constructor() {
    super(...arguments);
  }

  // Carousel logic
  @action
  didInsertCarousel(element) {
    const carousel = element.querySelector('#versatile-carousel');
    if (!carousel) return;
    
    // Set background images and content images via JavaScript since helpers cause WeakMap errors
    this.bannerSlides.forEach((slide, idx) => {
      const slideElement = carousel.querySelector(`.carousel-slide:nth-child(${idx + 1})`);
      if (slideElement) {
        // Set background image
        if (slide.backgroundImage && settings.theme_uploads[slide.backgroundImage]) {
          slideElement.style.backgroundImage = `url(${settings.theme_uploads[slide.backgroundImage]})`;
          slideElement.style.backgroundSize = 'cover';
          slideElement.style.backgroundPosition = 'center';
        }
        
        // Set content image src
        const imgElement = slideElement.querySelector('.banner-main-image');
        if (imgElement && slide.contentImage && settings.theme_uploads[slide.contentImage]) {
          imgElement.src = settings.theme_uploads[slide.contentImage];
          console.log(`[DEBUG] Set image src for slide ${idx + 1}: ${settings.theme_uploads[slide.contentImage]}`);
        }
      }
    });
    
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    
    // Only set up carousel if there are multiple slides
    if (slides.length <= 1) return;
    
    // Find the currently active slide (should be index 0)
    let currentIndex = slides.findIndex(slide => slide.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0;
    let autoMoveInterval = null;

    // Get settings for auto-movement
    const enableAutoCarousel = settings.enable_auto_carousel;
    const autoCarouselSpeed = settings.auto_carousel_speed;
    const pauseOnHover = settings.auto_carousel_pause_on_hover;

    // Determine interval based on speed setting
    const getIntervalTime = () => {
      switch (autoCarouselSpeed) {
        case 'slow': return 7000; // 7 seconds
        case 'fast': return 3000; // 3 seconds
        case 'medium':
        default: return 5000; // 5 seconds
      }
    };

    // Apply dark mode styles dynamically
    slides.forEach((slide) => {
      const darkBgColor = slide.dataset.darkBackgroundColor;
      const darkBgImage = slide.dataset.darkBackgroundImage;
      
      if (darkBgColor || darkBgImage) {
        slide.style.setProperty('--data-dark-background-color', darkBgColor || '');
        slide.style.setProperty('--data-dark-background-image', darkBgImage ? `url(${darkBgImage})` : '');
      }
    });

    function updateSlides(newIndex) {
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === newIndex);
      });
      currentIndex = newIndex;
    }

    function moveNext() {
      let idx = currentIndex + 1;
      if (idx >= slides.length) idx = 0;
      updateSlides(idx);
    }

    function movePrev() {
      let idx = currentIndex - 1;
      if (idx < 0) idx = slides.length - 1;
      updateSlides(idx);
    }

    // Set up auto-movement if enabled
    if (enableAutoCarousel && slides.length > 1) {
      const startAutoMove = () => {
        if (autoMoveInterval) clearInterval(autoMoveInterval);
        autoMoveInterval = setInterval(moveNext, getIntervalTime());
      };

      const stopAutoMove = () => {
        if (autoMoveInterval) {
          clearInterval(autoMoveInterval);
          autoMoveInterval = null;
        }
      };

      // Start auto-movement
      startAutoMove();

      // Pause on hover if enabled
      if (pauseOnHover) {
        carousel.addEventListener('mouseenter', stopAutoMove);
        carousel.addEventListener('mouseleave', startAutoMove);
      }

      // Reset interval after manual navigation
      const resetInterval = () => {
        if (enableAutoCarousel) {
          stopAutoMove();
          startAutoMove();
        }
      };

      // Add event listener for cleanup when component is destroyed
      element.addEventListener('willDestroyElement', () => {
        stopAutoMove();
        if (pauseOnHover) {
          carousel.removeEventListener('mouseenter', stopAutoMove);
          carousel.removeEventListener('mouseleave', startAutoMove);
        }
      });
      
      // Set up button click handlers with interval reset
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          movePrev();
          resetInterval();
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          moveNext();
          resetInterval();
        });
      }
    } else {
      // No auto-movement, just set up button handlers
      if (prevBtn) {
        prevBtn.addEventListener('click', movePrev);
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', moveNext);
      }
    }
  }

  @service router;
  @service currentUser;

  @tracked bannerClosed = this.cookieClosed || false;
  @tracked
  bannerCollapsed =
    this.collapsedFromCookie !== null
      ? this.collapsedFromCookie
      : this.isDefaultCollapsed;

  cookieClosed = cookie("banner_closed");
  cookieCollapsed = cookie("banner_collapsed");
  isDefaultCollapsed = settings.default_collapsed_state === "collapsed";
  collapsedFromCookie = this.cookieCollapsed
    ? JSON.parse(this.cookieCollapsed).collapsed
    : null;
  get bannerSlides() {
    const slides = [];
    
    // Check each banner configuration
    for (let i = 1; i <= 3; i++) {
      const enabled = settings[`banner_${i}_enabled`];
      const bgColor = settings[`banner_${i}_background_color`];
      const bgColorDark = settings[`banner_${i}_background_color_dark`];
      const bgImage = settings[`banner_${i}_background_image`];
      const bgImageDark = settings[`banner_${i}_background_image_dark`];
      const contentImg = settings[`banner_${i}_content_image`];
      const contentImgAlt = settings[`banner_${i}_content_image_alt`];
      
      if (enabled) {
        // Validate and clean the values to prevent WeakMap errors
        const cleanValue = (val) => {
          if (val === null || val === undefined) {
            return "";
          }
          return String(val);
        };
        
        // Handle asset references for background images (format: $assetname)
        const cleanBackgroundImage = (val) => {
          if (!val) return "";
          const strVal = String(val);
          if (strVal.startsWith('$')) {
            // Convert $agenda to agenda for asset-path helper
            return strVal.substring(1);
          }
          return strVal;
        };
        
        const slide = {
          index: i,
          backgroundColor: cleanValue(bgColor),
          backgroundColorDark: cleanValue(bgColorDark),
          backgroundImage: cleanBackgroundImage(bgImage),
          backgroundImageDark: cleanBackgroundImage(bgImageDark),
          contentImage: cleanBackgroundImage(contentImg), // Also clean content image for $ prefix
          contentImageAlt: cleanValue(contentImgAlt),
        };
        console.log(`[DEBUG] Final slide ${i} contentImage: "${slide.contentImage}", backgroundImage: "${slide.backgroundImage}"`);
        slides.push(slide);
      }
    }
    
    return slides;
  }
  
  get showCarouselControls() {
    return this.bannerSlides.length > 1;
  }

  // Removed column-related code since you're not using columns anymore


  get cookieExpirationDate() {
    if (settings.cookie_lifespan === "none") {
      removeCookie("banner_closed", { path: "/" });
      removeCookie("banner_collapsed", { path: "/" });
      return null;
    } else {
      const now = new Date();
      switch (settings.cookie_lifespan) {
        case "days":
          now.setDate(now.getDate() + 1);
          break;
        case "weeks":
          now.setDate(now.getDate() + 7);
          break;
        case "months":
          now.setMonth(now.getMonth() + 1);
          break;
        case "years":
          now.setFullYear(now.getFullYear() + 1);
          break;
        default:
          now.setDate(now.getDate() + 1);
      }
      return now;
    }
  }

  get displayForUser() {
    return (
      (settings.show_for_members && this.currentUser) ||
      (settings.show_for_anon && !this.currentUser)
    );
  }

  get showOnRoute() {
    const path = this.router.currentURL;

    if (
      settings.display_on_homepage &&
      this.router.currentRouteName === `discovery.${defaultHomepage()}`
    ) {
      return true;
    }

    if (settings.url_must_contain.length) {
      const allowedPaths = settings.url_must_contain.split("|");
      return allowedPaths.some((allowedPath) => {
        if (allowedPath.slice(-1) === "*") {
          return path.indexOf(allowedPath.slice(0, -1)) === 0;
        }
        return path === allowedPath;
      });
    }
  }

  get shouldShow() {
    return this.displayForUser && this.showOnRoute;
  }

  get toggleLabel() {
    return this.bannerCollapsed
      ? i18n("theme_metadata.versatile_banner.toggle.expand_label")
      : i18n("theme_metadata.versatile_banner.toggle.collapse_label");
  }

  get toggleIcon() {
    return this.bannerCollapsed ? "chevron-down" : "chevron-up";
  }

  @action
  closeBanner() {
    this.bannerClosed = true;

    if (this.cookieExpirationDate) {
      const bannerState = { name: settings.cookie_name, closed: "true" };
      cookie("banner_closed", JSON.stringify(bannerState), {
        expires: this.cookieExpirationDate,
        path: "/",
      });
    }
  }

  @action
  toggleBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    let bannerState = {
      name: settings.cookie_name,
      collapsed: this.bannerCollapsed,
    };

    if (this.cookieExpirationDate) {
      if (this.cookieCollapsed) {
        bannerState = JSON.parse(this.cookieCollapsed);
        bannerState.collapsed = this.bannerCollapsed;
      }
    } else {
      bannerState.collapsed = this.bannerCollapsed;
    }

    cookie("banner_collapsed", JSON.stringify(bannerState), {
      expires: this.cookieExpirationDate,
      path: "/",
    });
  }
}
