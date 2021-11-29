import axios from 'axios'
import { posix as pathPosix } from 'path'

import { Provider, QueryErrors, QueryOptions } from './interface'
import siteConfig from '../config/site.json'
import allApiConfig from '../config/api.json'

export class OnedriveProvider implements Provider {
  private apiConfig = allApiConfig.onedrive ?? allApiConfig

  private basePath = pathPosix.resolve('/', this.apiConfig.base)

  private encodePath(path: string) {
    let encodedPath = pathPosix.join(this.basePath, pathPosix.resolve('/', path))
    if (encodedPath === '/' || encodedPath === '') {
      return ''
    }
    encodedPath = encodedPath.replace(/\/$/, '')
    return `:${encodeURIComponent(encodedPath)}`
  }

  // Store access token in memory, cuz Vercel doesn't provide key-value storage natively
  private _access_token = ''

  private async getAccessToken() {
    if (this._access_token) {
      console.log('Fetch token from memory.')
      return this._access_token
    }

    const body = new URLSearchParams()
    body.append('client_id', this.apiConfig.clientId)
    body.append('redirect_uri', this.apiConfig.redirectUri)
    body.append('client_secret', process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '')
    body.append('refresh_token', process.env.REFRESH_TOKEN ? process.env.REFRESH_TOKEN : '')
    body.append('grant_type', 'refresh_token')

    const resp = await axios.post(this.apiConfig.authApi, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (resp.data.access_token) {
      this._access_token = resp.data.access_token
      return this._access_token
    }
  }

  async query(path: string, options?: QueryOptions) {
    const accessToken = await this.getAccessToken()
    const requestPath = this.encodePath(path)
    // Handle response from OneDrive API
    const requestUrl = `${this.apiConfig.driveApi}/root${requestPath}`
    // Whether path is root, which requires some special treatment
    const isRoot = requestPath === ''

    // Querying current path identity (file or folder) and follow up query children in folder
    // console.log(accessToken)

    const { data: identityData } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
      },
    })

    if ('folder' in identityData) {
      if (options?.assertFile) {
        throw new Error(QueryErrors['assertFileErrMsg'])
      }

      const { data: folderData } = await axios.get(`${requestUrl}${isRoot ? '' : ':'}/children`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: options?.next
          ? {
            select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
            top: siteConfig.maxItems,
            $skipToken: options.next,
          }
          : {
            select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
            top: siteConfig.maxItems,
          },
      })

      // Extract next page token from full @odata.nextLink
      const nextPage = folderData['@odata.nextLink']
        ? folderData['@odata.nextLink'].match(/&\$skiptoken=(.+)/i)[1]
        : null

      folderData.value = folderData.value.map(c => OnedriveProvider.formatFileMeta(c))

      // Return paging token if specified
      if (nextPage) {
        return { folder: folderData, next: nextPage }
      } else {
        return { folder: folderData }
      }
    }
    return { file: OnedriveProvider.formatFileMeta(identityData) }
  }

  private static formatFileMeta(data: any) {
    data.url = data['@microsoft.graph.downloadUrl']
    delete data['@microsoft.graph.downloadUrl']
    data.lastModified = data.lastModifiedDateTime
    delete data.lastModifiedDateTime
    return data
  }
}

const onedrive = new OnedriveProvider()
export default onedrive
