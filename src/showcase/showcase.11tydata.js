// Every Markdown file in this folder becomes an article at /showcase/<file-name>/.
// Add `draft: true` to its front matter to keep it unpublished.
export default {
  lang: "en",
  section: "showcase",
  layout: "layouts/article.njk",
  permalink: (data) => (data.draft ? false : `/showcase/${data.page.fileSlug}/`),
};
