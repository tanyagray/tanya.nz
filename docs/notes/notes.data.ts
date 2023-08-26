import { createContentLoader } from 'vitepress';
import { formatDistanceToNow } from 'date-fns';

function dateSort(a, b) {
  return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date);
}

function noteTransform(rawData) {}

export default createContentLoader('notes/published/*.md', {
  render: true, // include rendered full page HTML?
  transform(rawData) {
    // map, sort, or filter the raw data as you wish.
    // the final result is what will be shipped to the client.
    return rawData.sort(dateSort).map((note) => {
      return {
        title: note.frontmatter.title,
        date: note.frontmatter.date,
        relativeDate: formatDistanceToNow(note.frontmatter.date, {
          addSuffix: true,
        }),
        html: note.html,
      };
    });
  },
});
