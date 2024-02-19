import { ref, computed } from 'vue'

const encryptionKey = ref<string | null>(null)
const audio = ref<DirectoryHandle | undefined>()
const image = ref<DirectoryHandle | undefined>()

const treeData = computed(() => {
  const list = []
  if (image.value) {
    list.push(image.value)
  }
  if (audio.value) {
    list.push(audio.value)
  }
  return list
})

export { encryptionKey, audio, image, treeData }
