<template>
  <Preview v-if="treeData.length > 0" />
  <template v-else>
    <Home />
    <NButton
      text
      tag="a"
      href="https://github.com/blacktunes/rpgmaker-decrypt-web"
      target="_blank"
      style="height: 20px;margin-bottom: 5px;"
    >
      https://github.com/blacktunes/rpgmaker-decrypt-web
    </NButton>
  </template>
</template>

<script lang="ts" setup>
import { treeData } from '@/store/data'
import Home from './components/Home.vue'
import Preview from './components/Preview.vue'
</script>
