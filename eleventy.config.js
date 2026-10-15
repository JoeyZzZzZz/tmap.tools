import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItAnchor from "markdown-it-anchor";

// Collections that hold the articles. Each one is a folder of Markdown files;
// the folder's *.11tydata.js gives every file its language, layout and URL.
const SECTIONS = {
  showcase_en: "src/showcase/*.md",
  showcase_zh: "src/zh/showcase/*.md",
  design_en: "src/design/*.md",
  design_zh: "src/zh/design/*.md",
};

const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight, { preAttributes: { tabindex: 0 } });

  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ typographer: false, linkify: true });
    md.use(markdownItAnchor, {
      level: [2, 3],
      slugify,
      permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
    });
    // Tables scroll on their own on narrow screens instead of widening the page.
    md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
    md.renderer.rules.table_close = () => "</table></div>\n";
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  for (const [name, glob] of Object.entries(SECTIONS)) {
    eleventyConfig.addCollection(name, (api) =>
      api
        .getFilteredByGlob(glob)
        .filter((item) => !item.data.draft)
        .sort((a, b) => b.date - a.date),
    );
  }

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("longDate", (d, lang) => {
    const date = new Date(d);
    if (lang === "zh") {
      return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
    }
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  });

  // The same article in the other language, matched by translationKey.
  eleventyConfig.addFilter("translationOf", (all, key, lang) => {
    if (!key) return null;
    return (all || []).find((p) => p.data.translationKey === key && p.data.lang !== lang) || null;
  });

  // Headings (h2, h3) of rendered article HTML, for the table of contents.
  eleventyConfig.addFilter("toc", (html) => {
    const out = [];
    const re = /<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
    let m;
    while ((m = re.exec(html || ""))) {
      const text = m[3].replace(/<[^>]+>/g, "").trim();
      out.push({ level: Number(m[1]), id: m[2], text });
    }
    return out;
  });

  // Rough reading time: 230 English words or 400 Chinese characters a minute.
  eleventyConfig.addFilter("readingMinutes", (html, lang) => {
    const text = String(html || "").replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<[^>]+>/g, " ");
    const cjk = (text.match(/[㐀-鿿]/g) || []).length;
    const words = text.replace(/[㐀-鿿]/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(cjk / 400 + words / 230));
  });

  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    // Markdown is plain Markdown: braces in pseudocode or config never get read as template tags.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
