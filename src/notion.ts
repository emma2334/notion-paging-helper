import readlineSync from 'readline-sync'
import { Client } from '@notionhq/client'
import { getConfig } from './actions'
import { echo, error } from './logger'
import {
  PageId,
  BlockId,
  Content,
  Paragraph,
  PageInfo,
  Page,
} from './types/notion'

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
  async handleAll(pageId: PageId, withTitle: boolean) {
    let done = false
    let total = 0
    let start_cursor: BlockId | undefined
    let last_page: PageInfo | undefined
    let errors: PageInfo[] = []

    while (!done) {
      const response = await this.notion.blocks.children.list({
        block_id: pageId,
        start_cursor,
        page_size: 50,
      })
      done = !response.has_more
      start_cursor = response.next_cursor || undefined

      // Find block which is page
      const subPages: PageInfo[] = response.results
        .filter(e => 'child_page' in e)
        .map(e => ({
          id: e.id.replaceAll('-', ''),
          title: e.child_page.title,
        }))

      if (!subPages.length) continue

      // Show progress
      const pageNum =
        subPages.length > 1
          ? `#${total + 1}-${(total += subPages.length)}`
          : `#${(total += subPages.length)}`
      echo(`\n[ Subpage ${pageNum} processing... ]`)

      // Add last page from previous task if there's one
      if (last_page) subPages.unshift(last_page)

      // Add prev and next btn to each page
      await Promise.all(
        subPages.map(
          async (e, i) =>
            await this.insertPagingLink({
              block: e,
              prev: subPages[i - 1]?.id,
              next: subPages[i + 1]?.id,
              withTitle,
              newLine: e.id !== last_page?.id,
            })
        )
      ).then(results => {
        errors = errors.concat(results.flatMap(e => e || []))
      })
      last_page = subPages.at(-1)
    }

    // Show result
    echo(`\nDone (${total - errors.length}/${total}), error:`)
    if (errors.length) {
      echo(errors.map(e => `${e.title} (id: ${e.id})`).join('\n'))
    } else {
      echo('None')
    }
  }

  /**
   * Add paging links to specific page
   */
  async single(pageId: PageId, withTitle: boolean) {
    const target = (await this.notion.pages.retrieve({
      page_id: pageId,
    })) as Page

    // The page has no sibling pages
    if (!('page_id' in target.parent)) {
      echo('Done!')
      return
    }

    const parentId = target.parent.page_id
    let stage = 'find target'
    let start_cursor: BlockId | undefined
    let last_page: PageId | undefined
    let prev: PageId | undefined
    let next: PageId | undefined

    while (stage !== 'end') {
      // Get content in parent page
      const parentContent = await this.notion.blocks.children.list({
        block_id: parentId,
        start_cursor,
      })
      start_cursor = parentContent.next_cursor || undefined

      // Filter out subpages
      const pages = parentContent.results
        .filter(e => 'child_page' in e)
        .map(e => e.id.replaceAll('-', ''))

      if (!pages.length) continue
      const targetIndex = pages.findIndex(e => e === pageId)

      /* eslint-disable no-fallthrough */
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
            block: { id: pageId },
            prev,
            next,
            withTitle,
          })
          echo('Done!')
      }
      /* eslint-enable */

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
  addLink(
    hint: string,
    pageId: PageId | undefined,
    withTitle: boolean
  ): Paragraph[] {
    if (!pageId) return []

    let content: Paragraph['paragraph']['text'] = [
      { text: { content: hint, link: { url: `/${pageId}` } } },
    ]
    if (withTitle) {
      content = content.concat([
        { text: { content: '\n' } },
        { mention: { page: { id: pageId } } },
      ])
    }

    return [{ object: 'block', paragraph: { text: content } }]
  }

  /**
   * Insert paging links to page.
   */
  async insertPagingLink({
    block,
    prev,
    next,
    withTitle,
    newLine = true,
  }: {
    block: PageInfo
    prev?: PageId
    next?: PageId
    withTitle: boolean
    newLine?: boolean
  }) {
    const content: Content = newLine
      ? [{ object: 'block', paragraph: { text: [] } }]
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
