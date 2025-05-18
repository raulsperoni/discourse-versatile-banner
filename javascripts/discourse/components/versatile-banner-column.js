import Component from "@glimmer/component";

export default class VersatileBannerColumn extends Component {
  // Helper to check if value is a URL
  isHttpLink(value) {
    if (typeof value !== "string") return false;
    // Accept absolute and relative URLs as images
    return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
  }

  isColorCode(value) {
    if (typeof value !== "string") return false;
    // Accepts #hex, rgb(), rgba(), hsl(), hsla()
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ||
      /^rgb(a)?\(/.test(value) ||
      /^hsl(a)?\(/.test(value);
  }

  isIconString(value) {
    if (typeof value !== "string") return false;
    // Avoid 'this' context issues by referencing helpers via prototype
    const isHttpLink = VersatileBannerColumn.prototype.isHttpLink;
    const isColorCode = VersatileBannerColumn.prototype.isColorCode;
    return !isHttpLink.call(this, value) && !isColorCode.call(this, value) && value.length > 0;
  }
}
