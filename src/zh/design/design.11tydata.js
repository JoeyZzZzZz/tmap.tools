// Every Markdown file in this folder becomes an article at /zh/design/<file-name>/.
// Add `draft: true` to its front matter to keep it unpublished.
export default {
  lang: "zh",
  section: "design",
  layout: "layouts/article.njk",
  permalink: (data) => (data.draft ? false : `/zh/design/${data.page.fileSlug}/`),
};
