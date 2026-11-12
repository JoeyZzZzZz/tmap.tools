import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItAnchor from "markdown-it-anchor";

// Collections that hold the articles. Each one is a folder of Markdown files;
// the folder's *.11tydata.js gives every file its language, layout and URL.
const SECTIONS = {
  blog_en: "src/blog/*.md",
  blog_zh: "src/zh/blog/*.md",
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
    .replace(/^-|-$/g, "")
    // An id should start with a letter: "1. Scan…" becomes "s1-scan…".
    .replace(/^(\d)/, "s$1");

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
    // A draft has permalink false, so it is still in the collection with no url.
    // Skip those: an unpublished counterpart must not become a link.
    return (
      (all || []).find(
        (p) => p.data.translationKey === key && p.data.lang !== lang && typeof p.url === "string",
      ) || null
    );
  });

  // Headings (h2, h3) of rendered article HTML, for the table of contents.
  // The text comes out of rendered HTML, so entities are decoded here; the
  // template escapes it again on output (otherwise a heading with "quotes"
  // showed up in the TOC as &quot;quotes&quot;).
  const decodeEntities = (s) =>
    s
      .replace(/&quot;/g, '"')
      .replace(/&#0*39;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  eleventyConfig.addFilter("toc", (html) => {
    const out = [];
    const re = /<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
    let m;
    while ((m = re.exec(html || ""))) {
      const text = decodeEntities(m[3].replace(/<[^>]+>/g, "")).trim();
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

  // Headings: a heading made of two sentences keeps each sentence whole where it
  // fits ("CVE-… was “fixed”." / "The backdoor never left." rather than "… The" /
  // "backdoor …"), and an identifier such as CVE-2021-26614 never breaks at a hyphen.
  // Returns HTML; every piece is escaped here.
  eleventyConfig.addFilter("sentences", (s) => {
    const esc = (t) =>
      String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/\b([A-Z]{2,}-\d{4}-\d{3,})\b/g, '<span class="nobr">$1</span>')
        // A Chinese clause mark stays with the character before it (no lone "，" line).
        .replace(/([^\s<>][”’」』）》]*[，、：；。！？])/g, '<span class="nobr">$1</span>')
        // Line breaking never splits around a curly quote, so "26614“已修复”" would be one
        // unbreakable word: allow a break before an opening quote that follows a word.
        .replace(/(?<=[\w>])“/g, "<wbr>“");
    // English splits after a sentence; Chinese after a clause mark (，：；), where a
    // Chinese heading would break anyway, so a line never starts with punctuation.
    const parts = String(s ?? "").split(/(?<=[.!?])\s+(?=\S)|(?<=[，：；。！？])(?=\S)/);
    if (parts.length < 2) return esc(s ?? "");
    return parts.map((p) => `<span class="sentence">${esc(p)}</span>`).join(/[，：；。！？]$/.test(parts[0]) ? "" : " ");
  });

  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  // The published entry in a collection with this translationKey, or null.
  eleventyConfig.addFilter("byKey", (items, key) =>
    (items || []).find((p) => p.data.translationKey === key && typeof p.url === "string") || null,
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    // Markdown is plain Markdown: braces in pseudocode or config never get read as template tags.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
