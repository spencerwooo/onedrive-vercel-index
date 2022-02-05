const path = require('path')

const { i18n, localePath } = require('./next-i18next.config')

module.exports = {
  input: ['**/*.{ts,tsx}', '!**/node_modules/**'],
  options: {
    sort: true,
    removeUnusedKeys: true,
    func: {
      list: ['t'],
      extensions: ['.ts', '.tsx']
    },
    lngs: i18n.locales,
    ns: ['common'],
    defaultLng: i18n.defaultLocale,
    defaultNs: 'common',
    defaultValue: (lng, _ns, key) => (lng === i18n.defaultLocale ? key : ''),
    resource: {
      loadPath: path.join(localePath, '{{lng}}/{{ns}}.json'),
      savePath: path.join(localePath, '{{lng}}/{{ns}}.json')
    },
    nsSeparator: false,
    keySeparator: false
  }
}
