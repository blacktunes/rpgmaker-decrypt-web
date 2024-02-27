<template>
  <NSplit
    direction="horizontal"
    style="height: 100vh"
    :default-size="0.2"
    :max="0.8"
    :min="0.2"
  >
    <template #1>
      <div class="sidebar">
        <NTree
          ref="treeRef"
          class="tree"
          :animated="false"
          block-line
          block-node
          :cancelable="false"
          :data="treeData as unknown as TreeOption[]"
          expand-on-click
          :expanded-keys="expandedKeys"
          :keyboard="false"
          label-field="name"
          :node-props="nodeProps"
          :render-prefix="renderPrefix"
          :render-label="renderLabel"
          :selected-keys="selectedKeys"
          :show-irrelevant-nodes="false"
          show-line
          virtual-scroll
          @update:expanded-keys="updateExpandedKeys"
        >
          <template #empty>
            <div class="empty">
              <NIcon
                size="50"
                depth="5"
              >
                <Empty />
              </NIcon>
            </div> </template
        ></NTree>
        <div class="button-list">
          <NTooltip
            trigger="hover"
            class="tip"
          >
            <template #trigger>
              <NIcon
                depth="3"
                class="btn"
                @click="scrollTo('top')"
              >
                <VerticalAlignTopOutlined />
              </NIcon>
            </template>
            <span>滚动到顶部</span>
          </NTooltip>
          <NTooltip trigger="hover">
            <template #trigger>
              <NIcon
                depth="3"
                class="btn"
                @click="scrollTo('bottom')"
              >
                <VerticalAlignBottomOutlined />
              </NIcon>
            </template>
            <span>滚动到底部</span>
          </NTooltip>
          <NTooltip trigger="hover">
            <template #trigger>
              <NIcon
                depth="3"
                class="btn"
                @click="updateExpandedKeys([])"
              >
                <CollapseAll />
              </NIcon>
            </template>
            <span>折叠文件夹</span>
          </NTooltip>
        </div>
      </div>
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
          <NCode
            :code="previewItem.text"
            :hljs="hljs"
            :language="getExtname(previewItem.name)"
            show-line-numbers
          />
        </div>
        <div
          v-else-if="previewItem.type === 'error'"
          class="other"
        >
          <NIcon
            size="42"
            color="#888"
          >
            <DocumentError24Regular />
          </NIcon>
          {{ previewItem.path }}
        </div>
        <div
          v-else
          class="other"
        >
          <NIcon
            size="40"
            color="#888"
          >
            <FileUnknownOutlined />
          </NIcon>
          暂不支持的文件格式
        </div>
      </div>
    </template>
  </NSplit>
</template>

<script lang="tsx" setup>
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import js from 'highlight.js/lib/languages/javascript'
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { type TreeOption, type NTree, NIcon, NTag } from 'naive-ui'
import { notification } from '@/scripts/ui'
import {
  isImage,
  isVideo,
  isAudio,
  isText,
  isEncryptedAudio,
  isEncryptedImage,
  isUnencryptedAudio,
  isUnencryptedImage,
  getParentKeys
} from '@/scripts/uilts'
import { encryptionKey, keys, treeData, sidebar } from '@/store/data'
import {
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  CollapseAll,
  FolderOutline,
  FolderOpen,
  ImageOutline,
  Image,
  VideocamOutline,
  Videocam,
  SoundOutlined,
  SoundFilled,
  DocumentTextOutline,
  DocumentText,
  FileUnknownOutlined,
  FileUnknownFilled,
  DocumentError24Regular,
  Empty
} from '@/components/Common/Icon'

hljs.registerLanguage('json', json)
hljs.registerLanguage('js', js)

const treeRef = ref<InstanceType<typeof NTree> | null>(null)

const expandedKeys = ref<string[]>([keys.image, keys.audio])

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      if (option.children !== undefined) return
      if (option.key === sidebar.select?.key) return
      sidebar.select = {
        name: option.name as string,
        key: option.key as string
      }
    }
  }
}

const renderPrefix = ({ option }: { option: TreeOption }) => {
  const key = option.key as string
  const name = option.name as string

  if (option.children !== undefined) {
    if (expandedKeys.value.includes(key)) {
      return (
        <NIcon>
          <FolderOpen />
        </NIcon>
      )
    } else {
      return (
        <NIcon>
          <FolderOutline />
        </NIcon>
      )
    }
  } else {
    if (isImage(name)) {
      if (sidebar.select?.key === key) {
        return (
          <NIcon>
            <Image />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <ImageOutline />
          </NIcon>
        )
      }
    }
    if (isVideo(name)) {
      if (sidebar.select?.key === key) {
        return (
          <NIcon>
            <Videocam />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <VideocamOutline />
          </NIcon>
        )
      }
    }
    if (isAudio(name)) {
      if (sidebar.select?.key === key) {
        return (
          <NIcon>
            <SoundFilled />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <SoundOutlined />
          </NIcon>
        )
      }
    }
    if (isText(name)) {
      if (sidebar.select?.key === key) {
        return (
          <NIcon>
            <DocumentText />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <DocumentTextOutline />
          </NIcon>
        )
      }
    }
  }
  if (sidebar.select?.key === key) {
    return (
      <NIcon>
        <FileUnknownFilled />
      </NIcon>
    )
  } else {
    return (
      <NIcon>
        <FileUnknownOutlined />
      </NIcon>
    )
  }
}

const renderLabel = ({ option }: { option: TreeOption }) => {
  const name = option.name as string
  if (option.root) {
    if (option.key === keys.image) {
      return (
        <>
          图片
          <NTag
            size="small"
            style="margin-left: 5px;pointer-events: none;"
          >
            {sidebar.currentImageList.length}
          </NTag>
        </>
      )
    }
    if (option.key === keys.audio) {
      return (
        <>
          音频
          <NTag
            size="small"
            style="margin-left: 5px;pointer-events: none;"
          >
            {sidebar.currentAudioList.length}
          </NTag>
        </>
      )
    }
  }
  return name
}

const selectedKeys = computed(() => (sidebar.select ? [sidebar.select.key] : []))

const updateExpandedKeys = (keys: string[]) => {
  expandedKeys.value = keys
}

const setHighlight = async () => {
  if (sidebar.select?.key) {
    await nextTick()
    treeRef.value?.scrollTo({
      key: sidebar.select.key
    })
  }
}

watch(selectedKeys, () => {
  if (sidebar.select?.key) {
    const { keys: parentKeys, node } = getParentKeys(treeData.value, sidebar.select?.key)

    parentKeys.forEach((key) => {
      if (!expandedKeys.value.includes(key)) {
        expandedKeys.value.push(key)
      }
    })

    if (node) {
      previewNode(node)
    }
    setHighlight()
  }
})

const previewItem = reactive({
  type: 'img',
  name: '',
  path: '',
  text: ''
})

const previewNode = (node: FileHandle) => {
  previewItem.name = node.name
  previewItem.path = ''
  previewItem.text = ''
  if (isVideo(node.name)) {
    previewItem.type = 'video'
    preview(node)
    return
  }
  if (isUnencryptedImage(node.name)) {
    previewItem.type = 'image'
    preview(node)
    return
  }
  if (isEncryptedImage(node.name)) {
    previewItem.type = 'image'
    preview(node, true)
    return
  }
  if (isUnencryptedAudio(node.name)) {
    previewItem.type = 'audio'
    preview(node)
    return
  }
  if (isEncryptedAudio(node.name)) {
    previewItem.type = 'audio'
    preview(node, true)
    return
  }
  if (isText(node.name)) {
    previewItem.type = 'text'
    previewText(node)
    return
  }
  previewItem.type = 'other'
  previewItem.path = 'other'
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
  const file = await getFile(handle)
  if (!file) return

  let buffer: ArrayBuffer
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
  const file = await getFile(handle)
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      let text = e.target.result as string
      try {
        text = JSON.stringify(JSON.parse(text), undefined, 2)
      } catch {
        // 不是JSON
      }
      previewItem.text = text
    }
  }
  reader.readAsText(file)
  previewItem.path = 'text'
}

const getExtname = (name: string) => {
  const parts = name.split('.')
  return parts[parts.length - 1]
}

const getFile = async (handle: FileSystemFileHandle) => {
  let file
  try {
    file = await handle.getFile()
  } catch (err) {
    previewItem.path = '无法打开该文件'
    previewItem.type = 'error'

    notification.error({
      content: '无法打开该文件',
      meta: String(err),
      duration: 3000
    })
  }
  return file
}

const scrollTo = (type: 'top' | 'bottom') => {
  if (treeRef.value) {
    treeRef.value.scrollTo({ position: type })
  }
}
</script>

<style lang="stylus" scoped>
.sidebar
  display flex
  flex-direction column
  height 100%

  .tree
    flex 1
    width 100%

  .button-list
    display flex
    justify-content flex-end
    align-items center
    gap 2px
    height 25px
    padding 0 5px
    background #eee

    .btn
      padding 2px
      border-radius 2px
      cursor pointer
      background transparent

      &:hover
        background rgba(200, 200, 200, 0.5)

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

  .other
    display flex
    flex-direction column
    justify-content center
    align-items center
    margin-bottom 50px
    gap 10px
    color #888
    font-weight bold
    user-select none

.empty
  display flex
  flex-direction column
  justify-content center
  align-items center
  height 100%
</style>
