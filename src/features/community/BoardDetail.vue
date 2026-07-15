<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <section class="page container">
    <h1>게시판 상세</h1>
    <p>id: {{ route.params.id }}</p>
  </section>
</template>