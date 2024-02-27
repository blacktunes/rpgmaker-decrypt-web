/// <reference types="vite/client" />

interface Window {
  BUILD_TIME: Date
}

/** 构建时间 */
declare const BUILD_TIME: number

interface BaseItem {
  name: string
  key: string
}

interface BaseHandle {
  key: string
  disabled?: boolean
}

type DirectoryHandle = BaseHandle &
  FileSystemDirectoryHandle & {
    root?: boolean
    children: (DirectoryHandle | FileHandle)[] | null
    getChildrenDir: (name: string) => DirectoryHandle | undefined
    getChildrenFile: (name: string) => FileHandle | undefined
  }

type FileHandle = BaseHandle & FileSystemFileHandle
