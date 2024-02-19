<template>
  <n-split
    direction="horizontal"
    style="height: 100vh"
    :default-size="0.2"
    :max="0.8"
    :min="0.2"
  >
    <template #1>
      <n-tree
        class="tree"
        :data="treeData as any as TreeOption[]"
        label-field="name"
        virtual-scroll
        show-line
        :override-default-node-click-behavior="override"
        @update:selected-keys="itemClick"
      />
    </template>
    <template #2>
      <div
        class="preview"
        v-show="previewItem.path"
      >
        <img
          v-if="previewItem.type === 'image'"
          :src="previewItem.path"
        />
        <audio
          v-else-if="previewItem.type === 'audio'"
          :src="previewItem.path"
          autoplay
          loop
          controls
          controlslist="nofullscreen noplaybackrate"
        ></audio>
        <video
          v-else-if="previewItem.type === 'video'"
          :src="previewItem.path"
          autoplay
          loop
          controls
          controlslist="nofullscreen noplaybackrate"
        ></video>
        <div
          v-else-if="previewItem.type === 'text'"
          class="text"
        >
          <n-code
            :code="previewItem.text"
            language="json"
            show-line-numbers
          />
        </div>
        <div
          v-else
          style="user-select: none"
        >
          暂不支持的文件格式
        </div>
      </div>
    </template>
  </n-split>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import type { TreeOption, TreeOverrideNodeClickBehavior } from 'naive-ui'
import { notification } from '@/assets/scripts/ui'
import { encryptionKey, treeData } from '@/store/data'

const previewItem = reactive({
  type: 'img',
  name: '',
  path: '',
  text: ''
})

const override: TreeOverrideNodeClickBehavior = ({ option }) => {
  if (option.children) {
    return 'toggleExpand'
  }
  return 'default'
}

const itemClick = (...args: any[]) => {
  const node: FileSystemFileHandle = args[2].node

  previewItem.name = node.name
  if (/\.(webm|mp4|avi)$/i.test(node.name)) {
    previewItem.type = 'video'
    preview(node)
    return
  }
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(node.name)) {
    previewItem.type = 'image'
    preview(node)
    return
  }
  if (/\.(rpgmvp|png_)$/i.test(node.name)) {
    previewItem.type = 'image'
    preview(node, true)
    return
  }
  if (/\.(ogg|mp3|m4a)$/i.test(node.name)) {
    previewItem.type = 'audio'
    preview(node)
    return
  }
  if (/\.(rpgmvo|ogg_|rpgmvm|m4a_)$/i.test(node.name)) {
    previewItem.type = 'audio'
    preview(node, true)
    return
  }
  if (/\.(txt|json)$/i.test(node.name)) {
    previewItem.type = 'text'
    previewText(node)
    return
  }
  previewItem.type = 'other'
}

const decryptBuffer = (arrayBuffer: ArrayBufferLike) => {
  if (encryptionKey.value === null) return arrayBuffer
  const body = arrayBuffer.slice(16)
  const view = new DataView(body)
  const key = encryptionKey.value.match(/.{2}/g)!

  for (let i = 0; i < 16; i++) {
    view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
  }
  return body
}

const preview = async (handle: FileSystemFileHandle, decode = false) => {
  let buffer: ArrayBuffer
  let file
  try {
    file = await handle.getFile()
  } catch (err) {
    notification.error({
      content: '无法打开该文件',
      meta: String(err),
      duration: 3000
    })
    return
  }
  let type = file.type
  if (!type) {
    if (/\.(rpgmvp|png_)$/i.test(handle.name)) {
      type = 'image/png'
    } else if (/\.(rpgmvo|ogg_)$/i.test(handle.name)) {
      type = 'audio/ogg'
    } else if (/\.(rpgmvm|m4a_)$/i.test(handle.name)) {
      type = 'audio/m4a'
    }
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      buffer = e.target.result as ArrayBuffer
      if (decode) {
        buffer = decryptBuffer(buffer)
      }
      URL.revokeObjectURL(previewItem.path)
      previewItem.path = URL.createObjectURL(new Blob([buffer], { type }))
    }
  }
  reader.readAsArrayBuffer(file)
}

const previewText = async (handle: FileSystemFileHandle) => {
  const file = await handle.getFile()
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      previewItem.text = e.target.result as string
    }
  }
  reader.readAsText(file)
}
</script>

<style lang="stylus" scoped>
.tree
  height 100vh

.preview
  height 100vh
  width 100%
  min-width 500px
  display flex
  justify-content center
  align-items center
  overflow auto

  .text
    box-sizing border-box
    padding 15px
    width 100%
    height 100%

  img, video
    display block
    max-width 100%
    max-height 100%
    object-fit scale-down
    box-shadow 2px 2px #eee
    background-image conic-gradient(#eee 0 25%, transparent 0 50%, #eee 0 75%, transparent 0)
    background-size 24px 24px
</style>
