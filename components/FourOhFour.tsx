import Image from 'next/image'
import { Trans } from 'next-i18next'

const FourOhFour: React.FC<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <script>window.location.replace(\"/\");</script>
  )
}

export default FourOhFour
