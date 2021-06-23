const icons = {
  image: ['far', 'file-image'],
  pdf: ['far', 'file-pdf'],
  word: ['far', 'file-word'],
  powerpoint: ['far', 'file-powerpoint'],
  excel: ['far', 'file-excel'],
  audio: ['far', 'file-audio'],
  video: ['far', 'file-video'],
  archive: ['far', 'file-archive'],
  code: ['far', 'file-code'],
  text: ['far', 'file-alt'],
  file: ['far', 'file'],
  markdown: ['fab', 'markdown'],
}

const extensions = {
  gif: icons.image,
  jpeg: icons.image,
  jpg: icons.image,
  png: icons.image,
  heic: icons.image,
  webp: icons.image,

  pdf: icons.pdf,

  doc: icons.word,
  docx: icons.word,

  ppt: icons.powerpoint,
  pptx: icons.powerpoint,

  xls: icons.excel,
  xlsx: icons.excel,

  aac: icons.audio,
  mp3: icons.audio,
  ogg: icons.audio,

  avi: icons.video,
  flv: icons.video,
  mkv: icons.video,
  mp4: icons.video,

  gz: icons.archive,
  rar: icons.archive,
  zip: icons.archive,

  css: icons.code,
  py: icons.code,
  html: icons.code,
  js: icons.code,
  ts: icons.code,
  c: icons.code,
  rb: icons.code,
  cpp: icons.code,

  txt: icons.text,
  rtf: icons.text,
  md: icons.markdown,
}

/**
 * To stop TypeScript complaining about indexing the object with a non-existent key
 * https://dev.to/mapleleaf/indexing-objects-in-typescript-1cgi
 *
 * @param obj Object with keys to index
 * @param key The index key
 * @returns Whether or not the key exists inside the object
 */
const hasKey = <O>(obj: O, key: PropertyKey): key is keyof O => {
  return key in obj
}

export default function getFileIcon(fileName: string) {
  const extension = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
  return hasKey(extensions, extension) ? extensions[extension] : icons.file
}
