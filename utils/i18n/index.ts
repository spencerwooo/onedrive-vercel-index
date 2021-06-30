import zh_CN from './zh_CN.json'
import en_US from './en_US.json'

import siteConfig from '../../config/site.json'

/**
 * Get string of different languages
 *
 * @export
 * @param {string} key
 * @return {string}
 */

export default function i18n (key: string) {

    switch (siteConfig.language) {
        case "zh_CN":
            return zh_CN[key];
            break;
        case "en_US":
            return en_US[key];
            break;
        default:
            return en_US[key]
    }
}