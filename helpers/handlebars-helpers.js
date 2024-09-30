const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')

// 啟用 dayjs 的相對時間功能
dayjs.extend(relativeTime)

module.exports = {
  currentYear: () => dayjs().year(),

  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },

  // 把這裡命名為 timeAgo
  relativeTimeFromNow: a => dayjs(a).fromNow()
}
