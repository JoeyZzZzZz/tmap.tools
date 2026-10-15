// Every Markdown file in this folder becomes an article at /design/<file-name>/.
// Add `draft: true` to its front matter to keep it unpublished.
export default {
  lang: "en",
  section: "design",
  layout: "layouts/article.njk",
  permalink: (data) => (data.draft ? false : `/design/${data.page.fileSlug}/`),
};
