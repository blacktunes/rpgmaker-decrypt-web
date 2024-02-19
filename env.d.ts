/// <reference types="vite/client" />

interface Window {
  BUILD_TIME: Date
}

/** 构建时间 */
declare const BUILD_TIME: number

type DirectoryHandle = FileSystemDirectoryHandle & {
  key: string
  children: (DirectoryHandle | FileSystemFileHandle)[]
  getChildrenDir: (name: string) => DirectoryHandle | undefined
  getChildrenFile: (name: string) => FileSystemFileHandle | undefined
}

type FileHandle = FileSystemFileHandle & {
  key: string
}
