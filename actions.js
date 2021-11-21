const readlineSync = require('readline-sync')
const { config, notion } = require('./init')

module.exports = {
  getInfo,
  handleAll,
  single,
}

/**
 * Get the target id and check up link form.
 *
 * @param      {srting}  The question for asking page id
 * @return     {Object}  The information of config
 */
function getInfo(idQuestion) {
  // Get id
  const pageId = readlineSync
    .question(idQuestion || `Target url or ID: `, {
      limit: /\S+/,
      limitMessage: `ID is required.`,
    })
    .match(/[^\/|\-|#]+/g)
    .at(-1)
  // Check if need to show page title
  const withTitle = readlineSync.keyInYNStrict(
    'Does paging go with title under each link?'
  )

  return { pageId, withTitle }
}

/**
 * Add paging links to every subpage under the target page or block.
 *
 * @param      {Object}   arg1            The argument 1
 * @param      {string}   arg1.pageId     The page identifier
 * @param      {boolean}  arg1.withTitle  To show the page title under the link
 *                                        or not
 */
async function handleAll({ pageId, withTitle }) {
  let done = false
  let total = 0
  let start_cursor
  let last_page
  let errors = []

  while (!done) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor,
      page_size: 50,
    })
    done = !response.has_more
    start_cursor = response.next_cursor

    // Find block which is page
    const subPage = response.results
      .filter(e => e.type === 'child_page')
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
    console.log(`\n[ Subpage ${pageNum} processing... ]`)

    // Add last page from previous task if there's one
    last_page && subPage.unshift(last_page)

    // Add prev and next btn to each page
    await Promise.all(
      subPage.map(
        async (e, i) =>
          await insertPagingLink({
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
  console.log(`\nDone (${total - errors.length}/${total}), error:`)
  errors.length
    ? console.error(errors.map(e => `${e.title} (id: ${e.id})`).join('\n'))
    : console.log('None')
}

/**
 * Add paging links to specific page
 *
 * @param      {Object}   arg1            The argument 1.
 * @param      {string}   arg1.pageId     The page identifier
 * @param      {boolean}  arg1.withTitle  To show the page title under the link
 *                                        or not
 */
async function single({ pageId, withTitle }) {
  const target = await notion.pages.retrieve({ page_id: pageId })
  const parentId = target.parent.page_id
  let stage = 'find target'
  let start_cursor, last_page, prev, next

  while (stage !== 'end') {
    // Get content in parent page
    const parentContent = await notion.blocks.children.list({
      block_id: parentId,
      start_cursor,
    })
    start_cursor = parentContent.next_cursor

    // Filter out subpages
    const pages = parentContent.results
      .filter(e => e.type === 'child_page')
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
        if (targetIndex + 1 < pages.length) {
          next = pages[targetIndex + 1]
          stage = 'end'
        } else if (parentContent.has_more) {
          break
        }

      case 'end':
        await insertPagingLink({
          block: { id: pageId, title: target.title },
          prev,
          next,
          withTitle,
        })
        console.log('Done!')
    }
    last_page = pages.at(-1)
  }
}

/**
 * Add a link.
 *
 * @param      {string}        name       Page name
 * @param      {string}        blockId    The block identifier
 * @param      {boolean}       withTitle  To show the page title under the link
 *                                        or not
 * @return     {Object|Array}  The notion content
 */
function addLink(name, blockId, withTitle) {
  let content = [
    { type: 'text', text: { content: name, link: { url: `/${blockId}` } } },
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
 *
 * @param      {Object}                   arg1                 The argument 1
 * @param      {Object.<string, number>}  arg1.block           The target
 * @param      {Object.<string, number>}  arg1.prev            The previous
 * @param      {Object.<string, number>}  arg1.next            The next
 * @param      {boolean}                  arg1.withTitle       To show the page
 *                                                             title under the
 *                                                             link or not
 * @return     {Object}                   Error records
 */
async function insertPagingLink({
  block,
  prev,
  next,
  withTitle,
  newLine = true,
}) {
  const content = newLine
    ? [{ object: 'block', type: 'paragraph', paragraph: { text: [] } }]
    : []

  try {
    await notion.blocks.children.append({
      block_id: block.id,
      children: content.concat(
        addLink(config.PREV_TEXT || '← Prev', prev, withTitle),
        addLink(config.NEXT_TEXT || 'Next →', next, withTitle)
      ),
    })
  } catch (error) {
    console.error(block.title, error)
    return { ...block }
  }
}
