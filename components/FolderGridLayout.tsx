import type { OdFolderObject } from '../types'

import Link from 'next/link'
import emojiRegex from 'emoji-regex'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useClipboard } from 'use-clipboard-copy'

import { getFileIcon } from '../utils/getFileIcon'
import { getBaseUrl } from '../utils/getBaseUrl'
import { formatModifiedDateTime } from '../utils/fileDetails'
import { Checkbox, Downloading } from './FileListing'

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
      <div className="h-32 overflow-hidden rounded border border-gray-900/10 dark:border-gray-500/30">
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
  const clipboard = useClipboard()

  return (
    <div className="rounded bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center border-b border-gray-900/10 px-3 text-xs font-bold uppercase tracking-widest text-gray-600 dark:border-gray-500/30 dark:text-gray-400">
        <div className="flex-1">{folderChildren.length} items</div>
        <div className="flex p-1.5 text-gray-700 dark:text-gray-400">
          <Checkbox
            checked={totalSelected}
            onChange={toggleTotalSelected}
            indeterminate={true}
            title={'Select all files'}
          />
          {totalGenerating ? (
            <Downloading title="Downloading selected files, refresh page to cancel" />
          ) : (
            <button
              title="Download selected files"
              className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
              disabled={totalSelected === 0}
              onClick={handleSelectedDownload}
            >
              <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} size="lg" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4">
        {folderChildren.map((c: OdFolderChildren) => (
          <div key={c.id} className="group relative overflow-hidden rounded hover:bg-gray-100 dark:hover:bg-gray-850">
            <div className="absolute top-0 right-0 z-10 m-1 rounded bg-white/50 py-0.5 dark:bg-gray-900/50">
              {c.folder ? (
                <div>
                  <span
                    title="Copy folder permalink"
                    className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => {
                      clipboard.copy(`${getBaseUrl()}${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
                      toast('Copied folder permalink.', { icon: '👌' })
                    }}
                  >
                    <FontAwesomeIcon icon={['far', 'copy']} />
                  </span>
                  {folderGenerating[c.id] ? (
                    <Downloading title="Downloading folder, refresh page to cancel" />
                  ) : (
                    <span
                      title="Download folder"
                      className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={() => {
                        const p = `${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`
                        handleFolderDownload(p, c.id, c.name)()
                      }}
                    >
                      <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <span
                    title="Copy raw file permalink"
                    className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => {
                      clipboard.copy(
                        `${getBaseUrl()}/api?path=${path === '/' ? '' : path}/${encodeURIComponent(c.name)}&raw=true`
                      )
                      toast.success('Copied raw file permalink.')
                    }}
                  >
                    <FontAwesomeIcon icon={['far', 'copy']} />
                  </span>
                  <a
                    title="Download file"
                    className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                    href={c['@microsoft.graph.downloadUrl']}
                  >
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                  </a>
                </div>
              )}
            </div>

            <div className="absolute top-0 left-0 z-10 m-1 rounded bg-white/50 py-0.5 dark:bg-gray-900/50">
              {!c.folder && !(c.name === '.password') && (
                <Checkbox
                  checked={selected[c.id] ? 2 : 0}
                  onChange={() => toggleItemSelected(c.id)}
                  title="Select file"
                />
              )}
            </div>

            <Link href={`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`} passHref>
              <a>
                <GridItem c={c} />
              </a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FolderGridLayout
