export type OdFileObject = {
  '@microsoft.graph.downloadUrl': string
  name: string
  size: number
  id: string
  lastModifiedDateTime: string
  file: {
    mimeType: string
    hashes: {
      quickXorHash: string
      sha1Hash: string
      sha256Hash: string
    }
  },
  video: any // Check if field exists only currently
}

export type OdFolderObject = {
  '@odata.count': number
  value: Array<{
    id: string
    name: string
    lastModifiedDateTime: string
    size: number
    folder: {
      childCount: number
      view: {
        sortBy: 'name'
        sortOrder: 'ascending'
        viewType: 'thumbnails'
      }
    }
  }>
}

export type OdSearchResult = Array<{
  id: string
  name: string
  file?: OdFileObject
  folder?: OdFolderObject
  path: string
  parentReference: {
    id: string
    name: string
    path: string
  }
}>
