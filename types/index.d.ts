// API response object for /api?path=<path_to_file_or_folder>, this may return either a file or a folder.
// Pagination is also declared here with the 'next' parameter.
export declare type OdAPIResponse = { file?: OdFileObject; folder?: OdFolderObject; next?: string }
// A folder object returned from the OneDrive API. This contains the parameter 'value', which is an array of items
// inside the folder. The items may also be either files or folders.
export declare type OdFolderObject = {
  '@odata.count': number
  '@odata.context': string
  '@odata.nextLink'?: string
  value: Array<{
    '@microsoft.graph.downloadUrl': string
    id: string
    name: string
    size: number
    lastModifiedDateTime: string
    file?: { mimeType: string; hashes: { quickXorHash: string; sha1Hash?: string; sha256Hash?: string } }
    folder?: { childCount: number; view: { sortBy: string; sortOrder: 'ascending'; viewType: 'thumbnails' } }
    video?: OdVideoFile
  }>
}
// A file object returned from the OneDrive API. This object may contain 'video' if the file is a video.
export declare type OdFileObject = {
  '@microsoft.graph.downloadUrl': string
  '@odata.context': string
  name: string
  size: number
  id: string
  lastModifiedDateTime: string
  file: { mimeType: string; hashes: { quickXorHash: string; sha1Hash?: string; sha256Hash?: string } }
  video?: OdVideoFile
}
// A representation of a OneDrive video file. All fields are declared here, but we mainly use 'width' and 'height'.
export declare type OdVideoFile = {
  width: number
  height: number
  duration: number
  bitrate: number
  frameRate: number
  audioBitsPerSample: number
  audioChannels: number
  audioFormat: string
  audioSamplesPerSecond: number
}
// API response object for /api/search?q=<query>. Likewise, this array of items may also contain either files or folders.
export declare type OdSearchResult = Array<{
  id: string
  name: string
  file?: OdFileObject
  folder?: OdFolderObject
  path: string
  parentReference: { id: string; name: string; path: string }
}>
// API response object for /api/item?id={id}. This is primarily used for determining the path of the driveItem by ID.
export type OdDriveItem = {
  '@odata.context': string
  '@odata.etag': string
  id: string
  name: string
  parentReference: { driveId: string; driveType: string; id: string; path: string }
}
