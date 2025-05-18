import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Versatile Banner - Logged out", function () {
  test("banner can be hidden from anons", async function (assert) {
    settings.show_for_anon = false;
    await visit("/");
    assert.dom(".banner-box").doesNotExist("hides the banner for anons");
  });

  test("banner can be shown to anons", async function (assert) {
    settings.show_for_anon = true;
    await visit("/");
    assert.dom(".banner-box").exists("shows the banner for anons");
  });
});

acceptance("Versatile Banner - Logged in", function (needs) {
  needs.user();

  test("banner can be hidden from members", async function (assert) {
    settings.show_for_members = false;
    await visit("/");
    assert.dom(".banner-box").doesNotExist("hides the banner for members");
  });

  test("banner can be shown to members", async function (assert) {
    settings.show_for_members = true;
    await visit("/");
    assert.dom(".banner-box").exists("shows the banner for members");
  });
});

acceptance("Versatile Banner - Routing", function () {
  settings.show_for_anon = true;
  settings.url_must_contain = "/c/*";

  test("banner is visible on the homepage", async function (assert) {
    settings.display_on_homepage = true;
    await visit("/");
    assert.dom(".banner-box").exists("shows the banner on the homepage");
  });

  test("banner is hidden from the homepage", async function (assert) {
    settings.display_on_homepage = false;
    await visit("/");
    assert.dom(".banner-box").doesNotExist("hides the banner on the homepage");
  });

  test("banner is visible on a set route", async function (assert) {
    settings.display_on_homepage = false;
    await visit("/c/1");

    assert.dom(".banner-box").exists("shows the banner on the /c/* route");
  });

  test("banner is not visible on other routes", async function (assert) {
    settings.display_on_homepage = false;
    await visit("/u");

    assert
      .dom(".banner-box")
      .doesNotExist("does not show the banner on the /u route");
  });
});

acceptance("Versatile Banner - Category Icon Rendering", function () {
  test("renders absolute image URL as <img>", async function (assert) {
    settings.show_for_anon = true;
    settings.first_column_category_id = 7;
    // Simulate category with absolute URL
    server.create("category", {
      id: 7,
      name: "Image Absolute",
      uploaded_logo: { url: "https://example.com/image.png" },
    });
    await visit("/");
    assert.dom(".category-icon img").exists("renders absolute image URL as <img>");
  });
  test("renders relative image URL as <img>", async function (assert) {
    settings.show_for_anon = true;
    settings.first_column_category_id = 8;
    server.create("category", {
      id: 8,
      name: "Image Relative",
      uploaded_logo: { url: "/uploads/example.png" },
    });
    await visit("/");
    assert.dom(".category-icon img").exists("renders relative image URL as <img>");
  });
  test("renders color code as color dot", async function (assert) {
    settings.show_for_anon = true;
    settings.first_column_category_id = 9;
    server.create("category", {
      id: 9,
      name: "Color Dot",
      uploaded_logo: null,
      color: "#ff0000",
    });
    await visit("/");
    assert.dom(".category-icon .color-dot").exists("renders color code as color dot");
  });
  test("renders icon string as d-icon", async function (assert) {
    settings.show_for_anon = true;
    settings.first_column_category_id = 10;
    server.create("category", {
      id: 10,
      name: "Icon String",
      uploaded_logo: null,
      color: null,
      icon: "shield-alt",
    });
    await visit("/");
    assert.dom(".category-icon .d-icon").exists("renders icon string as d-icon");
  });
});

acceptance("Versatile Banner - Category Info/Content Fallback", function () {
  test("renders category info if content is empty", async function (assert) {
    settings.show_for_anon = true;
    settings.first_column_content = "";
    settings.first_column_category_id = 11;
    server.create("category", {
      id: 11,
      name: "Category Only",
      uploaded_logo: { url: "/uploads/example2.png" },
      description: "Description here",
    });
    await visit("/");
    assert.dom(".category-info").exists("renders category info if content is empty");
    assert.dom(".category-info .category-title").hasText("Category Only");
    assert.dom(".category-info .category-about").hasTextContaining("Description here");
  });
  test("renders content if present, not category info", async function (assert) {
    settings.show_for_anon = true;
    settings.first_column_content = "<h3>Custom Content</h3>";
    settings.first_column_category_id = 12;
    server.create("category", {
      id: 12,
      name: "Category Hidden",
      uploaded_logo: { url: "/uploads/example3.png" },
      description: "Should not show",
    });
    await visit("/");
    assert.dom(".single-box h3").hasText("Custom Content");
    assert.dom(".category-info").doesNotExist("does not render category info if content present");
  });
});

acceptance("Versatile Banner - Visibility", function () {
  test("banner can be expanded", async function (assert) {
    settings.show_for_anon = true;
    settings.collapsible = true;
    settings.default_collapsed_state = "collapsed";

    const encodedCookieValue = encodeURIComponent(
      JSON.stringify({
        name: "v1",
        collapsed: true,
      })
    );

    document.cookie = `banner_collapsed=${encodedCookieValue}; path=/;`;

    await visit("/");
    await click("button.toggle");

    assert
      .dom(".--banner-collapsed")
      .doesNotExist("the banner does not have the collapsed class");
  });

  test("banner can be collapsed", async function (assert) {
    settings.collapsible = true;
    settings.default_collapsed_state = "expanded";

    const encodedCookieValue = encodeURIComponent(
      JSON.stringify({
        name: "v1",
        collapsed: false,
      })
    );

    document.cookie = `banner_collapsed=${encodedCookieValue}; path=/;`;

    await visit("/");
    await click(".banner-box button.toggle");

    assert
      .dom(".--banner-collapsed")
      .exists("the banner has the collapsed class");
  });

  test("banner can be dismissed", async function (assert) {
    settings.dismissible = true;
    settings.cookie_lifespan = "none";

    await visit("/");
    await click(".banner-box button.close");

    assert.dom(".banner-box").doesNotExist("the banner can be dismissed");
  });
});
