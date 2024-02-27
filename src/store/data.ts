import { getFilterList } from '@/scripts/uilts'
import { ref, computed, reactive } from 'vue'

const encryptionKey = ref<string | null>(null)
const image = ref<DirectoryHandle | undefined>()
const audio = ref<DirectoryHandle | undefined>()

const keys = reactive({
  image: '',
  audio: ''
})

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

const sidebar: {
  select?: BaseItem
  readonly currentImageList: BaseItem[]
  readonly currentAudioList: BaseItem[]
  readonly currentList: BaseItem[]
} = reactive({
  search: '',
  select: {
    name: '',
    key: ''
  },
  currentImageList: computed(() => getFilterList(image.value)),
  currentAudioList: computed(() => getFilterList(audio.value)),
  currentList: computed(() => {
    const list: BaseItem[] = []
    if (sidebar.currentImageList.length > 0) {
      list.push(...sidebar.currentImageList)
    }
    if (sidebar.currentAudioList.length > 0) {
      list.push(...sidebar.currentAudioList)
    }
    return list
  })
})

export { encryptionKey, image, audio, keys, treeData, sidebar }
