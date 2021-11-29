/**
 * Use [nginx autoindex module](https://nginx.org/en/docs/http/ngx_http_autoindex_module.html)
 * to serve local files.
 * Minimal example nginx config:
 * ```nginx
 * location / {
 *   root: /var/www/files;
 *   add_header Access-Control-Allow-Origin *;
 *   autoindex: on;
 *   autoindex_format: json;
 * }
 * ```
 * Because nginx cannot (easily) generate a temporary url for files, the provider has no protected route support.
 * And because nginx autoindex doesnot support paging, though next param works, every time we will fetch all items.
 */

import axios from 'axios'
import { posix as pathPosix } from 'path'

import { Provider, QueryErrors, QueryOptions } from './interface'
import siteConfig from '../config/site.json'
import allApiConfig from '../config/api.json'

export class NginxAutoindexProvider implements Provider {
  private apiConfig = allApiConfig.nginxAutoindex

  async query(path: string, options?: QueryOptions) {
    // Check path is folder or file
    let isFolder = false
    const url = this.apiConfig.driveApi + pathPosix.join(this.apiConfig.base, path)
    // nginx autoindex treats having trailing slash or not differently.
    // We use it to check path is folder or file.
    const folderUrl = url.endsWith('/') ? url : url + '/'
    const folderRes = await axios.get(folderUrl)
    if (folderRes.status === 200) {
      isFolder = true
    }

    if (isFolder) {
      if (options?.assertFile) {
        throw new Error(QueryErrors['assertFileErrMsg'])
      }

      let items = folderRes.data as any[]
      let nextPage = 0
      if (options?.next) {
        nextPage = parseInt(options.next)
        items = items.slice(nextPage * siteConfig.maxItems)
      }
      if (items.length > siteConfig.maxItems) {
        nextPage += 1
      }

      const folderData = {
        children: items.map(c => {
          // Generate GUID from path
          c.id = `${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`
          return c
        }),
        ...(nextPage === 0 ? {} : { next: nextPage.toString() }),
      }
      return { folder: folderData }
    } else {
      const fileRes = await axios.head(url)
      const meta = {
        id: path,
        name: '', // No returned in headers
        mtime: fileRes.headers['last-modified'],
        url,
      }
      return { file: meta }
    }
  }
}

const nginxAutoindex = new NginxAutoindexProvider()
export default nginxAutoindex
