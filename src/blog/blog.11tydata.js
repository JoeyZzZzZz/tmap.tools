// Every Markdown file in this folder becomes a post at /blog/<file-name>/.
// Add `draft: true` to its front matter to keep it unpublished.
export default {
  lang: "en",
  section: "blog",
  layout: "layouts/article.njk",
  permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`),
};
