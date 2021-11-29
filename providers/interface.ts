export interface Provider {
  // If path is folder, get folder meta and list folder children with their meta;
  // If path is file, get file meta.
  query(path: string, options?: QueryOptions & {
    [key: string]: any // Service-specified optimizing params can be put in it
  }): Promise<{ file: FileMeta } | { folder: FolderMeta, next?: string }>
}

export interface QueryOptions {
  next?: string, // Paging token
  assertFile?: boolean, // If path is not file, throw error other than processing it further as folder
}

export const QueryErrors = {
  assertFileErrMsg: 'Path is not file',
}

export interface FileMeta {
  id: string // ID should be GUID, e.g. UUID or path is acceptable
  name: string // File name
  size: number; // Byte size
  lastModified: string // Datetime string with timezone which is parsable by js Date
  url: string; // Raw url to the file
  file: any; // Anything but should ne true
  [key: string]: any
}

export type FolderMeta = {
  children: FileMeta[]
  [key: string]: any
}
