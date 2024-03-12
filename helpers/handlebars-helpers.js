const dayjs = require('dayjs')

/*輸出東西提共給handlebars template{{}}引用************************************* */

module.exports = {
  currentYear: () => dayjs().year()
}
