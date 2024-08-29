const { Notion } = require('./notion')
const { getInfo } = require('./actions')

const { workspace, pageId, withTitle } = getInfo()
const notion = new Notion(workspace)

switch (process.argv[2]) {
  // Add paging to each subpage
  case 'all':
  case undefined:
    notion.handleAll(pageId, withTitle)
    break

  // Add paging to specific page
  case 'single':
    notion.single(pageId, withTitle)
    break

  default:
    console.error(`There's no such action`)
}
