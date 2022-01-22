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
