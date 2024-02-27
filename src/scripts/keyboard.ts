import { sidebar, treeData } from '@/store/data'

document.onkeydown = (e) => {
  if (treeData.value.length > 0) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (!sidebar.currentList.length) return
      const index = sidebar.currentList.findIndex((item) => item.key === sidebar.select?.key)
      if (index === -1 || index + 1 === sidebar.currentList.length) {
        sidebar.select = {
          name: sidebar.currentList[0].name,
          key: sidebar.currentList[0].key
        }
      } else {
        const _index = index + 1
        sidebar.select = {
          name: sidebar.currentList[_index].name,
          key: sidebar.currentList[_index].key
        }
      }
      return
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (!sidebar.currentList.length) return
      const index = sidebar.currentList.findIndex((item) => item.key === sidebar.select?.key)
      if (index === -1 || index === 0) {
        const _index = sidebar.currentList.length - 1
        sidebar.select = {
          name: sidebar.currentList[_index].name,
          key: sidebar.currentList[_index].key
        }
      } else {
        const _index = index - 1
        sidebar.select = {
          name: sidebar.currentList[_index].name,
          key: sidebar.currentList[_index].key
        }
      }
      return
    }
  }
}
