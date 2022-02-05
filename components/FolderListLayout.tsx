import type { OdFolderObject } from '../types'

import { FC } from 'react'
import emojiRegex from 'emoji-regex'
import { useClipboard } from 'use-clipboard-copy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Link from 'next/link'

import { getBaseUrl } from '../utils/getBaseUrl'
import { getFileIcon } from '../utils/getFileIcon'
import { humanFileSize, formatModifiedDateTime } from '../utils/fileDetails'

import { Downloading, Checkbox } from './FileListing'

type OdFolderChildren = OdFolderObject['value'][number]

const FileListItem: FC<{ fileContent: OdFolderChildren }> = ({ fileContent: c }) => {
  const emojiIcon = emojiRegex().exec(c.name)
  const renderEmoji = emojiIcon && !emojiIcon.index

  return (
    <div className="grid cursor-pointer grid-cols-10 items-center space-x-2 px-3 py-2.5">
      <div className="col-span-10 flex items-center space-x-2 truncate md:col-span-6" title={c.name}>
        {/* <div>{c.file ? c.file.mimeType : 'folder'}</div> */}
        <div className="w-5 flex-shrink-0 text-center">
          {renderEmoji ? (
            <span>{emojiIcon ? emojiIcon[0] : '📁'}</span>
          ) : (
            <FontAwesomeIcon icon={c.file ? getFileIcon(c.name, { video: Boolean(c.video) }) : ['far', 'folder']} />
          )}
        </div>
        <div className="truncate">
          {renderEmoji ? c.name.replace(emojiIcon ? emojiIcon[0] : '', '').trim() : c.name}
        </div>
      </div>
      <div className="col-span-3 hidden flex-shrink-0 font-mono text-sm text-gray-700 dark:text-gray-500 md:block">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
      <div className="col-span-1 hidden flex-shrink-0 truncate font-mono text-sm text-gray-700 dark:text-gray-500 md:block">
        {humanFileSize(c.size)}
      </div>
    </div>
  )
}

const FolderListLayout = ({
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
      <div className="grid grid-cols-12 items-center space-x-2 border-b border-gray-900/10 px-3 dark:border-gray-500/30">
        <div className="col-span-12 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:col-span-6">
          Name
        </div>
        <div className="col-span-3 hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          Last Modified
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          Size
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          Actions
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
            <Checkbox
              checked={totalSelected}
              onChange={toggleTotalSelected}
              indeterminate={true}
              title={'Select files'}
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
      </div>

      {folderChildren.map((c: OdFolderChildren) => (
        <div className="grid grid-cols-12 hover:bg-gray-100 dark:hover:bg-gray-850" key={c.id}>
          <Link href={`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`} passHref>
            <a className="col-span-10">
              <FileListItem fileContent={c} />
            </a>
          </Link>

          {c.folder ? (
            <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
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
            <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
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
          <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
            {!c.folder && !(c.name === '.password') && (
              <Checkbox
                checked={selected[c.id] ? 2 : 0}
                onChange={() => toggleItemSelected(c.id)}
                title="Select file"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FolderListLayout
