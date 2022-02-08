import dayjs from 'dayjs'

import siteConfig from '../config/site.config'

/**
 * Convert raw bits file/folder size into a human readable string
 *
 * @param size File or folder size, in raw bits
 * @returns Human readable form of the file or folder size
 */
export const humanFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const num = size / Math.pow(1024, i)
  const round = Math.round(num)
  const formatted = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
  return `${formatted} ${'KMGTPEZY'[i - 1]}B`
}

/**
 * Convert the last modified date time into locale friendly string
 *
 * @param lastModifedDateTime DateTime string in ISO format
 * @returns Human readable form of the file or folder last modified date
 */
export const formatModifiedDateTime = (lastModifedDateTime: string) => {
  return dayjs(lastModifedDateTime).format(siteConfig.datetimeFormat)
}
