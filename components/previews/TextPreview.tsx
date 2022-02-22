import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import useFileContent from '../../utils/fetchOnMount'
import { DownloadBtnContainer, PreviewContainer } from './Containers'

const TextPreview = ({ file }) => {
  const { asPath } = useRouter()
  const { t } = useTranslation()

  const { response: content, error, validating } = useFileContent(`/api/raw/?path=${asPath}`, asPath)
  if (error) {
    return (
      <PreviewContainer>
        <FourOhFour errorMsg={error} />
      </PreviewContainer>
    )
  }

  if (validating) {
    return (
      <PreviewContainer>
        <Loading loadingText={t('Loading file content...')} />
      </PreviewContainer>
    )
  }

  if (!content) {
    return (
      <>
        <PreviewContainer>
          <FourOhFour errorMsg={t('File is empty.')} />
        </PreviewContainer>
        <DownloadBtnContainer>
          <DownloadButtonGroup />
        </DownloadBtnContainer>
      </>
    )
  }

  return (
    <div>
      <PreviewContainer>
        <pre className="overflow-x-scroll p-0 text-sm md:p-3">{content}</pre>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default TextPreview
