<script setup>
import { data as articles } from './articles.data.ts'
</script>

<div class="article" v-for="article of articles">
  <header>
    <h2><a :href="article.url">{{ article.title }}</a></h2>
    <time datetime="article.date">
      {{ article.relativeDate }}
    </time>
  </header>
  <div v-html="article.excerpt"></div>
</div>
