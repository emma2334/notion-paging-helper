import { Notion } from './notion'
import { getInfo } from './actions'
import { echo } from './logger'

switch (process.argv[2]) {
  // Add paging to each subpage
  case 'all':
  case undefined: {
    const { workspace, pageId, withTitle } = getInfo()
    const notion = new Notion(workspace)
    notion.handleAll(pageId, withTitle)
    break
  }

  // Add paging to specific page
  case 'single': {
    const { workspace, pageId, withTitle } = getInfo()
    const notion = new Notion(workspace)
    notion.single(pageId, withTitle)
    break
  }

  default:
    echo(`There's no such action`)
}
