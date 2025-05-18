import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import cookie, { removeCookie } from "discourse/lib/cookie";
import { convertIconClass } from "discourse/lib/icon-library";
import { defaultHomepage } from "discourse/lib/utilities";
import { i18n } from "discourse-i18n";

export default class VersatileBanner extends Component {
  // Carousel logic
  @action
  didInsertCarousel(element) {
    const carousel = element.querySelector('#versatile-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    let currentIndex = 0;

    function updateSlides(newIndex) {
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === newIndex);
      });
      currentIndex = newIndex;
    }

    prevBtn.addEventListener('click', () => {
      let idx = currentIndex - 1;
      if (idx < 0) idx = slides.length - 1;
      updateSlides(idx);
    });
    nextBtn.addEventListener('click', () => {
      let idx = currentIndex + 1;
      if (idx >= slides.length) idx = 0;
      updateSlides(idx);
    });
  }

  @service router;
  @service site;
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
  get columnData() {
    const columns = [
      {
        content: settings.first_column_content,
        class: "first_column",
        category: this.firstColumnCategory,
        categoryTitle: this.firstColumnCategoryTitle,
        categoryIcon: this.firstColumnCategoryIcon,
        categoryAbout: this.firstColumnCategoryAbout,
      },
      {
        content: settings.second_column_content,
        class: "second_column",
        category: this.secondColumnCategory,
        categoryTitle: this.secondColumnCategoryTitle,
        categoryIcon: this.secondColumnCategoryIcon,
        categoryAbout: this.secondColumnCategoryAbout,
      },
      {
        content: settings.third_column_content,
        class: "third_column",
        category: this.thirdColumnCategory,
        categoryTitle: this.thirdColumnCategoryTitle,
        categoryIcon: this.thirdColumnCategoryIcon,
        categoryAbout: this.thirdColumnCategoryAbout,
      },
      {
        content: settings.fourth_column_content,
        class: "fourth_column",
        category: this.fourthColumnCategory,
        categoryTitle: this.fourthColumnCategoryTitle,
        categoryIcon: this.fourthColumnCategoryIcon,
        categoryAbout: this.fourthColumnCategoryAbout,
      },
    ];
    // Only return columns where a category is found
    return columns.filter(col => col.category);
  }

  // Category lookup helpers for each column
  get firstColumnCategory() {
    const id = settings.first_column_category_id;
    console.log('[VersatileBanner] first_column_category_id:', id);
    if (!id || !this.site.categories) return null;
    const cat = this.site.categories.find(cat => cat.id === id);
    console.log('[VersatileBanner] firstColumnCategory:', cat);
    return cat;
  }
  get firstColumnCategoryTitle() {
    return this.firstColumnCategory?.name || "";
  }
  get firstColumnCategoryIcon() {
    // Prefer uploaded_logo, then color, then icon
    return this.firstColumnCategory?.uploaded_logo?.url || this.firstColumnCategory?.color || this.firstColumnCategory?.icon || "";
  }
  get firstColumnCategoryAbout() {
    return this.firstColumnCategory?.description || this.firstColumnCategory?.topic_html || "";
  }

  get secondColumnCategory() {
    const id = settings.second_column_category_id;
    console.log('[VersatileBanner] second_column_category_id:', id);
    if (!id || !this.site.categories) return null;
    const cat = this.site.categories.find(cat => cat.id === id);
    console.log('[VersatileBanner] secondColumnCategory:', cat);
    return cat;
  }
  get secondColumnCategoryTitle() {
    return this.secondColumnCategory?.name || "";
  }
  get secondColumnCategoryIcon() {
    return this.secondColumnCategory?.uploaded_logo?.url || this.secondColumnCategory?.color || this.secondColumnCategory?.icon || "";
  }
  get secondColumnCategoryAbout() {
    return this.secondColumnCategory?.description || this.secondColumnCategory?.topic_html || "";
  }

  get thirdColumnCategory() {
    const id = settings.third_column_category_id;
    console.log('[VersatileBanner] third_column_category_id:', id);
    if (!id || !this.site.categories) return null;
    const cat = this.site.categories.find(cat => cat.id === id);
    console.log('[VersatileBanner] thirdColumnCategory:', cat);
    return cat;
  }
  get thirdColumnCategoryTitle() {
    return this.thirdColumnCategory?.name || "";
  }
  get thirdColumnCategoryIcon() {
    return this.thirdColumnCategory?.uploaded_logo?.url || this.thirdColumnCategory?.color || this.thirdColumnCategory?.icon || "";
  }
  get thirdColumnCategoryAbout() {
    return this.thirdColumnCategory?.description || this.thirdColumnCategory?.topic_html || "";
  }

  get fourthColumnCategory() {
    const id = settings.fourth_column_category_id;
    console.log('[VersatileBanner] fourth_column_category_id:', id);
    if (!id || !this.site.categories) return null;
    const cat = this.site.categories.find(cat => cat.id === id);
    console.log('[VersatileBanner] fourthColumnCategory:', cat);
    return cat;
  }
  get fourthColumnCategoryTitle() {
    return this.fourthColumnCategory?.name || "";
  }
  get fourthColumnCategoryIcon() {
    return this.fourthColumnCategory?.uploaded_logo?.url || this.fourthColumnCategory?.color || this.fourthColumnCategory?.icon || "";
  }
  get fourthColumnCategoryAbout() {
    return this.fourthColumnCategory?.description || this.fourthColumnCategory?.topic_html || "";
  }


  get cookieExpirationDate() {
    if (settings.cookie_lifespan === "none") {
      removeCookie("banner_closed", { path: "/" });
      removeCookie("banner_collapsed", { path: "/" });
    } else {
      return moment().add(1, settings.cookie_lifespan).toDate();
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
      ? i18n(themePrefix("toggle.expand_label"))
      : i18n(themePrefix("toggle.collapse_label"));
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
