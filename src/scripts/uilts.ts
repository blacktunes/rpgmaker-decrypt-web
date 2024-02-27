export const isVideo = (name: string) => /\.(webm|mp4|avi)$/i.test(name)
export const isUnencryptedImage = (name: string) => /\.(png|jpg|jpeg|webp|gif)$/i.test(name)
export const isEncryptedImage = (name: string) => /\.(rpgmvp|png_)$/i.test(name)
export const isImage = (name: string) => isEncryptedImage(name) || isUnencryptedImage(name)
export const isUnencryptedAudio = (name: string) => /\.(ogg|mp3|m4a)$/i.test(name)
export const isEncryptedAudio = (name: string) => /\.(rpgmvo|ogg_|rpgmvm|m4a_)$/i.test(name)
export const isAudio = (name: string) => isEncryptedAudio(name) || isUnencryptedAudio(name)
export const isText = (name: string) => /\.(txt|json|js)$/i.test(name)

export const generateUUID = () => Math.random().toString(36) + '-' + Date.now().toString(36)

export const sort = (obj: DirectoryHandle) => {
  if (obj.children) {
    obj.children.sort((a, b) => {
      if ('children' in a && !('children' in b)) {
        return -1
      }
      if (!('children' in a) && 'children' in b) {
        return 1
      }
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    })
    for (const i in obj.children) {
      if ('children' in obj.children[i]) {
        sort(obj.children[i] as DirectoryHandle)
      }
    }
  }
  return obj
}

export const getFilterList = (obj?: DirectoryHandle | FileHandle, pattern: string = '') => {
  if (!obj) return []
  const { children, name, key } = obj as DirectoryHandle
  let list: BaseItem[] = []
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      list = [...list, ...getFilterList(child, pattern)]
    }
  } else {
    if (
      (!pattern.length || name.toLowerCase().includes(pattern.toLowerCase())) &&
      children === undefined
    ) {
      list.push({
        name,
        key
      })
    }
  }
  return list
}

export const getParentKeys = (tree: DirectoryHandle[], id: string) => {
  const keys: string[] = []
  let node: DirectoryHandle | FileHandle | null = null

  const walk = (nodes: (DirectoryHandle | FileHandle)[], key: string) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) {
        keys.unshift(nodes[i].key)
        node = nodes[i] as FileHandle
        return true
      }
      const currentNode = nodes[i]
      if ('children' in currentNode) {
        if (currentNode.children && currentNode.children.length > 0) {
          if (walk(currentNode.children, key)) {
            keys.unshift(nodes[i].key)
            return true
          }
        }
      }
    }
    return false
  }

  walk(tree, id)
  return { keys, node }
}
