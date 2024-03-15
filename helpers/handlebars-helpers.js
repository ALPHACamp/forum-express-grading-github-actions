const dayjs = require('dayjs')

/*輸出東西提共給handlebars template{{}}引用************************************* */

module.exports = {
  currentYear: () => dayjs().year(),
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}
