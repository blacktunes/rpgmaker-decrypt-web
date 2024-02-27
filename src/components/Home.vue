<template>
  <div
    class="home"
    :class="{ hover }"
    @click="onClick"
    @drop.prevent="onDrop"
    @dragover.prevent
    @dragenter="hover = true"
    @dragleave="hover = false"
  >
    <n-text style="font-size: 16px"> 点击或者拖动文件夹到该区域来加载 </n-text>
    <n-p
      depth="3"
      style="margin: 8px 0 0 0"
    >
      这个网站能查看RPGMakerMV/MZ常规加密的音频和图片
    </n-p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { notification } from '@/scripts/ui'
import { generateUUID, sort } from '@/scripts/uilts'
import { encryptionKey, audio, image, keys } from '@/store/data'

const hover = ref(false)

const onDrop = async (e: DragEvent) => {
  hover.value = false
  const handle = await e.dataTransfer?.items[0]?.getAsFileSystemHandle()
  if (handle) {
    if (handle.kind === 'directory') {
      getFileSystemHandle(handle as FileSystemDirectoryHandle)
    } else {
      notification.warning({
        content: '请选择文件夹',
        duration: 3000
      })
    }
  } else {
    notification.warning({
      content: '读取失败',
      duration: 3000
    })
  }
}

const onClick = async () => {
  try {
    getFileSystemHandle(await showDirectoryPicker())
  } catch {
    console.warn('未打开文件夹')
  }
}

const getFileSystemHandle = async (handle: FileSystemDirectoryHandle) => {
  let root = (await processHandle(handle)) as DirectoryHandle
  let data = root.getChildrenDir('data')
  if (!data) {
    const www = root.getChildrenDir('www')
    if (www) {
      root = www
    }
    data = root.getChildrenDir('data')
  }
  if (data) {
    const systemFile = data.getChildrenFile('System.json')
    if (systemFile) {
      const file = await systemFile.getFile()
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            const system = JSON.parse(e.target.result as string)
            if (system.encryptionKey) {
              encryptionKey.value = system.encryptionKey
            }
            if (system.gameTitle) {
              document.title = system.gameTitle
            }
          } catch (err) {
            console.error(err)
          }
        }
      }
      reader.readAsText(file)
    } else {
      notification.warning({
        content: '无法加载System.json',
        meta: '加密文件将无法读取',
        duration: 3000
      })
    }
  } else {
    notification.warning({
      content: '未发现data目录',
      meta: '加密文件将无法读取',
      duration: 3000
    })
  }

  const imageList = root.getChildrenDir('img')
  if (imageList) {
    imageList.root = true
    sort(imageList)
    keys.image = imageList.key
    image.value = imageList
  }
  const audioList= root.getChildrenDir('audio')
  if (audioList) {
    audioList.root = true
    sort(audioList)
    keys.audio = audioList.key
    audio.value = audioList
  }

  if (!audio.value && !image.value) {
    notification.warning({
      content: '未发现游戏资源',
      meta: '该目录可能不是RM游戏目录',
      duration: 3000
    })
  }
}

const processHandle = async (handle: FileSystemDirectoryHandle | FileSystemFileHandle) => {
  if (handle.kind === 'file') {
    const fileHandle = handle as FileHandle
    fileHandle.key = generateUUID()
    return fileHandle
  }
  const dirHandle = handle as DirectoryHandle

  dirHandle.key = generateUUID()
  dirHandle.children = []
  dirHandle.getChildrenDir = (name: string) =>
    dirHandle.children?.find(
      (item) => item.name === name && item.kind === 'directory'
    ) as DirectoryHandle
  dirHandle.getChildrenFile = (name: string) =>
    dirHandle.children?.find((item) => item.name === name && item.kind === 'file') as FileHandle

  const iter = handle.entries()
  for await (const item of iter) {
    dirHandle.children.push(await processHandle(item[1]))
  }
  if (!dirHandle.children.length) {
    dirHandle.children = null
    dirHandle.disabled = true
  }
  return dirHandle
}
</script>

<style lang="stylus" scoped>
.hover
  &:before
    border-color #18a058 !important

.home
  flex 1
  position relative
  width 100vw
  height 100vh
  display flex
  flex-direction column
  justify-content center
  align-items center
  cursor pointer

  &:hover
    &:before
      border-color #18a058

  &:before
    content ''
    position absolute
    top 10px
    right 10px
    bottom 10px
    left 10px
    border 1px dashed rgb(224, 224, 230)
    border-radius 5px
    transition border-color 0.3s
    pointer-events none
</style>
