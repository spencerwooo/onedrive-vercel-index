// API response object for /api?path=<path_to_file_or_folder>, this may return either a file or a folder.
// Pagination is also declared here with the 'next' parameter.
export type OdAPIResponse = { file?: OdFileObject; folder?: OdFolderObject; next?: string }
// A folder object returned from the OneDrive API. This contains the parameter 'value', which is an array of items
// inside the folder. The items may also be either files or folders.
export type OdFolderObject = {
  '@odata.count': number
  '@odata.context': string
  '@odata.nextLink'?: string
  value: Array<{
    '@microsoft.graph.downloadUrl': string
    id: string
    name: string
    size: number
    lastModifiedDateTime: string
    file?: { mimeType: string; hashes: { quickXorHash?: string; sha1Hash?: string; sha256Hash?: string } }
    folder?: { childCount: number; view: { sortBy: string; sortOrder: 'ascending'; viewType: 'thumbnails' } }
    image?: OdImageFile
    video?: OdVideoFile
    'thumbnails@odata.context'?: string
    thumbnails?: Array<OdThumbnail>
  }>
}
export type OdFolderChildren = OdFolderObject['value'][number]
// A file object returned from the OneDrive API. This object may contain 'video' if the file is a video.
export type OdFileObject = {
  '@microsoft.graph.downloadUrl': string
  '@odata.context': string
  name: string
  size: number
  id: string
  lastModifiedDateTime: string
  file: { mimeType: string; hashes: { quickXorHash: string; sha1Hash?: string; sha256Hash?: string } }
  image?: OdImageFile
  video?: OdVideoFile
  'thumbnails@odata.context'?: string
  thumbnails?: Array<OdThumbnail>
}
// A representation of a OneDrive image file. Some images do not return a width and height, so types are optional.
export type OdImageFile = {
  width?: number
  height?: number
}
// A representation of a OneDrive video file. All fields are declared here, but we mainly use 'width' and 'height'.
export type OdVideoFile = {
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
export type OdThumbnail = {
  id: string
  large: { height: number; width: number; url: string }
  medium: { height: number; width: number; url: string }
  small: { height: number; width: number; url: string }
}
// API response object for /api/search?q=<query>. Likewise, this array of items may also contain either files or folders.
export type OdSearchResult = Array<{
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
