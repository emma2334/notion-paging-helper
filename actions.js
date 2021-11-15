const { config, notion } = require('./init')

module.exports = {
  handleAll,
}

async function handleAll(pageId, withTitle) {
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
    const subPage = response?.results
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
          await appendPagingLink({
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
    last_page = subPage[subPage.length - 1]
  }

  // Show result
  console.log(`\nDone (${total - errors.length}/${total}), error:`)
  errors.length
    ? console.error(errors.map(e => `${e.title} (id: ${e.id})`).join('\n'))
    : console.log('None')
}

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
async function appendPagingLink({
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
