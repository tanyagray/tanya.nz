import { defineConfig } from 'vitepress';

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'en-US',
  title: "Tanya's Space",
  description: 'Vite & Vue powered static site generator.',

  head: [
    [
      'script',
      {
        async: '',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-M1NW9DWX0F',
      },
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-M1NW9DWX0F');`,
    ],
  ],

  themeConfig: {
    nav: [
      { text: 'Articles', link: '/articles/' },
      { text: 'Notes', link: '/notes/' },
      { text: 'Learn', link: '/learn/' },

      // {
      //   text: 'Dropdown Menu',
      //   items: [
      //     { text: 'Item A', link: '/item-1' },
      //     { text: 'Item B', link: '/item-2' },
      //     { text: 'Item C', link: '/item-3' },
      //   ],
      // },

      // ...
    ],

    sidebar: [
      {
        // text: 'Guide',
        items: [
          { text: 'Example', link: '/example' },
          // ...
        ],
      },
    ],
  },
});
