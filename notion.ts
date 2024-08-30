import readlineSync from 'readline-sync'
import { Client } from '@notionhq/client'
import { getConfig } from './actions'
import { echo, error } from './logger'

export class Notion {
  private notion: Client
  private config = getConfig()

  constructor(workspace?: string) {
    const { NOTION_KEY } = this.config
    // Get key
    let notionKey: string | undefined
    if (typeof NOTION_KEY === 'string') {
      notionKey = NOTION_KEY
    } else if (typeof NOTION_KEY === 'object') {
      let keys: string[], names: string[]
      if (NOTION_KEY instanceof Array) {
        keys = NOTION_KEY
        names = NOTION_KEY
      } else {
        keys = Object.values(NOTION_KEY)
        names = Object.keys(NOTION_KEY)
      }

      if (keys.length === 1) {
        // Contain only one key
        notionKey = keys[0]
      } else if (workspace && names.includes(workspace)) {
        // Get specific key
        notionKey = NOTION_KEY[workspace]
      } else {
        // Select the key to use
        const index = readlineSync.keyInSelect(names, 'Which key?', {
          cancel: false,
        })
        notionKey = keys[index]
      }
    }
    this.notion = new Client({
      auth: notionKey,
    })
  }

  /**
   * Add paging links to every subpage under the target page or block.
   */
  async handleAll(pageId: string, withTitle: boolean) {
    let done = false
    let total = 0
    let start_cursor: string
    let last_page
    let errors = []

    while (!done) {
      const response = await this.notion.blocks.children.list({
        block_id: pageId,
        start_cursor,
        page_size: 50,
      })
      done = !response.has_more
      start_cursor = response.next_cursor

      // Find block which is page
      const subPage = response.results
        .filter(e => "type" in e && e.type === 'child_page')
        .map(e => ({
          id: e.id.replaceAll('-', ''),
          title: e.child_page.title,
        }))

      if (!subPage.length) continue

      // Show progress
      const pageNum =
        subPage.length > 1
          ? `#${total + 1}-${(total += subPage.length)}`
          : `#${(total += subPage.length)}`
      echo(`\n[ Subpage ${pageNum} processing... ]`)

      // Add last page from previous task if there's one
      last_page && subPage.unshift(last_page)

      // Add prev and next btn to each page
      await Promise.all(
        subPage.map(
          async (e, i) =>
            await this.insertPagingLink({
              block: e,
              prev: subPage[i - 1]?.id,
              next: subPage[i + 1]?.id,
              withTitle,
              newLine: e.id !== last_page?.id,
            })
        )
      ).then(results => {
        errors = errors.concat(results.flatMap((e, i) => e || []))
      })
      last_page = subPage.at(-1)
    }

    // Show result
    echo(`\nDone (${total - errors.length}/${total}), error:`)
    errors.length
      ? echo(errors.map(e => `${e.title} (id: ${e.id})`).join('\n'))
      : echo('None')
  }

  /**
   * Add paging links to specific page
   */
  async single(pageId: string, withTitle: boolean) {
    const target = await this.notion.pages.retrieve({ page_id: pageId })
    const parentId = 'parent' in target && 'page_id' in target.parent && target.parent.page_id
    let stage = 'find target'
    let start_cursor: string, last_page: string, prev: string, next: string

    if (!parentId) {
      stage = 'end'
      echo('Done!')
    }

    while (stage !== 'end') {

      // Get content in parent page
      const parentContent = await this.notion.blocks.children.list({
        block_id: parentId,
        start_cursor: start_cursor || undefined,
      })
      start_cursor = parentContent.next_cursor

      // Filter out subpages
      const pages = parentContent.results
        .filter(e => "type" in e && e.type === 'child_page')
        .map(e => e.id.replaceAll('-', ''))

      if (!pages.length) continue
      const targetIndex = pages.findIndex(e => e === pageId)

      switch (stage) {
        case 'find target':

          if (targetIndex > -1) stage = 'find prev'
          else break

        case 'find prev':

          prev = pages[targetIndex - 1] || last_page
          stage = 'find next'

        case 'find next':

          if (targetIndex + 1 === pages.length && parentContent.has_more) break
          else if (targetIndex > -1) next = pages[targetIndex + 1]
          else next = pages[0]
          stage = 'end'

        case 'end':
          await this.insertPagingLink({
            block: { id: pageId, title: target.title },
            prev,
            next,
            withTitle,
          })
          echo('Done!')
      }
      last_page = pages.at(-1)

      // End process if can't find target and no more content in parent page
      if (targetIndex < 0 && parentContent.next_cursor === null) {
        stage = 'end'
        error('\nThe page needs to be directly under the parent page.')
      }
    }
  }

  /**
   * Add a link.
   */
  addLink(hint: string, blockId: string, withTitle: boolean): Content {
    let content: Content = [
      { type: 'text', text: { content: hint, link: { url: `/${blockId}` } } },
    ]
    if (withTitle) {
      content = content.concat([
        { type: 'text', text: { content: '\n' } },
        { type: 'mention', mention: { type: 'page', page: { id: blockId } } },
      ])
    }

    return blockId
      ? { object: 'block', type: 'paragraph', paragraph: { text: content } }
      : []
  }

  /**
   * Insert paging links to page.
   */
  async insertPagingLink({ block, prev, next, withTitle, newLine = true }) {
    const content: Content = newLine
      ? [{ object: 'block', type: 'paragraph', paragraph: { text: [] } }]
      : []

    try {
      await this.notion.blocks.children.append({
        block_id: block.id,
        children: content.concat(
          this.addLink(this.config.PREV_TEXT || '← Prev', prev, withTitle),
          this.addLink(this.config.NEXT_TEXT || 'Next →', next, withTitle)
        ),
      })
    } catch (error) {
      echo(block.title, error)
      return { ...block }
    }
  }
}
