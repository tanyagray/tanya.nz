<script setup>
import { data as notes } from './notes.data.ts'
</script>

<div class="note" v-for="note of notes">
  <header>
    <h2>{{ note.title }}</h2>
    <time datetime="note.date">
      {{ note.relativeDate }}
    </time>
  </header>
  <div v-html="note.html"></div>
</div>
