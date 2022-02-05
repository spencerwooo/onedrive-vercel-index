import type { OdFolderObject } from '../types'

import Link from 'next/link'
import emojiRegex from 'emoji-regex'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { getFileIcon } from '../utils/getFileIcon'
import { formatModifiedDateTime } from '../utils/fileDetails'

type OdFolderChildren = OdFolderObject['value'][number]

const GridItem = ({ c }: { c: OdFolderChildren }) => {
  const emojiIcon = emojiRegex().exec(c.name)
  const renderEmoji = emojiIcon && !emojiIcon.index

  const ChildIcon = () =>
    renderEmoji ? (
      <span>{emojiIcon ? emojiIcon[0] : '📁'}</span>
    ) : (
      <FontAwesomeIcon icon={c.file ? getFileIcon(c.name, { video: Boolean(c.video) }) : ['far', 'folder']} />
    )

  // We use the generated medium thumbnail for rendering preview images
  const thumbnail = c.thumbnails && c.thumbnails.length > 0 ? c.thumbnails[0].medium : null

  return (
    <div className="space-y-2">
      <div className="h-32 overflow-hidden rounded border border-gray-900 dark:border-gray-500/30">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="h-full w-full object-cover object-top" src={thumbnail.url} alt={c.name} />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center rounded-lg">
            <ChildIcon />
            <span className="absolute bottom-0 right-0 m-1 font-medium text-gray-700 dark:text-gray-500">
              {c.folder?.childCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-center space-x-2">
        <span className="w-5 flex-shrink-0 text-center">
          <ChildIcon />
        </span>
        <span className="overflow-hidden truncate">
          {renderEmoji ? c.name.replace(emojiIcon ? emojiIcon[0] : '', '').trim() : c.name}
        </span>
      </div>
      <div className="truncate text-center font-mono text-xs text-gray-700 dark:text-gray-500">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
    </div>
  )
}

const FolderGridLayout = ({
  path,
  folderChildren,
  selected,
  toggleItemSelected,
  totalSelected,
  toggleTotalSelected,
  totalGenerating,
  handleSelectedDownload,
  folderGenerating,
  handleFolderDownload,
  toast,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 rounded bg-white p-3 dark:bg-gray-900 dark:text-gray-100 md:grid-cols-5">
      {folderChildren.map((c: OdFolderChildren) => (
        <Link key={c.id} href={`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`} passHref>
          <a className="overflow-hidden rounded hover:bg-gray-100 dark:hover:bg-gray-850">
            <GridItem c={c} />
          </a>
        </Link>
      ))}
    </div>
  )
}

export default FolderGridLayout
