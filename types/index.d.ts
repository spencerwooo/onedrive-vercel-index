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
  }
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

// Search result type which is returned by /api/search?q={query}
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

// driveItem type which is returned by /api/item?id={id}
export type OdDriveItem = {
  '@odata.context': string
  '@odata.etag': string
  id: string
  name: string
  parentReference: {
    driveId: string
    driveType: string
    id: string
    path: string
  }
}
