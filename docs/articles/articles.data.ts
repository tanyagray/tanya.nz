import { createContentLoader } from 'vitepress';
import { formatDistanceToNow } from 'date-fns';

function dateSort(a, b) {
  return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date);
}

export default createContentLoader('articles/published/*.md', {
  render: true, // include rendered full page HTML?
  excerpt: true,
  transform(rawData) {
    // map, sort, or filter the raw data as you wish.
    // the final result is what will be shipped to the client.
    return rawData.sort(dateSort).map((note) => {
      return {
        title: note.frontmatter.title,
        date: note.frontmatter.date,
        url: note.url,
        relativeDate: formatDistanceToNow(note.frontmatter.date, {
          addSuffix: true,
        }),
        excerpt: note.excerpt,
      };
    });
  },
});
