// Every Markdown file in this folder becomes an article at /zh/showcase/<file-name>/.
// Add `draft: true` to its front matter to keep it unpublished.
export default {
  lang: "zh",
  section: "showcase",
  layout: "layouts/article.njk",
  permalink: (data) => (data.draft ? false : `/zh/showcase/${data.page.fileSlug}/`),
};
