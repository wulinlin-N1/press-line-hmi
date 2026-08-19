<script setup lang="ts">
import MainContainer from './components/container/Index.vue'
import IndexView from './views/Index.vue'
</script>

<template>
  <MainContainer :options="{ width: 1920, height: 1080 }">
    <IndexView />
  </MainContainer>
</template>
