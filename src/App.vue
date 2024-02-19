<template>
  <Preview v-if="treeData.length > 0" />
  <Home v-else />
</template>

<script lang="ts" setup>
import { treeData } from '@/store/data'
import Home from './components/Home.vue'
import Preview from './components/Preview.vue'
</script>
