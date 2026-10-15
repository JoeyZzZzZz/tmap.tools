// Every Markdown file in this folder becomes a post at /zh/blog/<file-name>/.
// Add `draft: true` to its front matter to keep it unpublished.
export default {
  lang: "zh",
  section: "blog",
  layout: "layouts/article.njk",
  permalink: (data) => (data.draft ? false : `/zh/blog/${data.page.fileSlug}/`),
};
