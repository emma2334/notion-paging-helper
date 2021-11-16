const { notion } = require('./init')
const { getInfo, handleAll, single } = require('./actions')

switch (process.argv[2]) {
  /* Add paging to each subpage */
  case 'all':
  case undefined:
    handleAll(getInfo())
    break

  /* Add paging to specific page */
  case 'single':
    console.log(
      '\x1b[41m%s\x1b[0m',
      '!!! The page should be the one which is directly under a page instead of a block. !!!'
    )
    single(getInfo())
    break

  default:
    console.error(`There's no such action`)
}
