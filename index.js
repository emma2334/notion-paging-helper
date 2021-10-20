const { Client } = require('@notionhq/client')
const readlineSync = require('readline-sync')

/* Seting up */
// Get page id
let pageId = readlineSync.question('Page ID: ')
while (!pageId) {
  pageId = readlineSync.question('Page ID is required: ')
}

// Check if need to show page title
let withTitle = false
switch (
  readlineSync.question('Does paging go with title under each link? [y/N] ')
) {
  case 'y':
  case 'Y':
  case 'yes':
  case 'YES':
    withTitle = true
    break
}

// Set button style
const text = {
  prev: process.env.PREV_TEXT || '← Prev',
  next: process.env.NEXT_TEXT || 'Next →',
}

/* Initializing a client */
const notion = new Client({
  auth: process.env.NOTION_KEY,
})

/* Adding paging to each subpage */
;(async () => {
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

    // Handle last page
    last_page && subPage.unshift(last_page)
    last_page = subPage[subPage.length - 1]

    // Add prev and next btn to each page
    await Promise.all(
      subPage.map(
        async (e, i) =>
          await appendPagingLink({
            block: e,
            prev: subPage[i - 1]?.id,
            next: subPage[i + 1]?.id,
          })
      )
    ).then(results => {
      errors = errors.concat(results.flatMap((e, i) => e || []))
    })
  }

  // Show result
  console.log(`\nDone (${total - errors.length}/${total}), error:`)
  errors.length
    ? console.error(errors.map(e => `${e.title} (id: ${e.id})`).join('\n'))
    : console.log('None')
})()

async function appendPagingLink({ block, prev, next }) {
  try {
    const response = await notion.blocks.children.append({
      block_id: block.id,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: { text: [] },
        },
      ].concat(addLink(text.prev, prev), addLink(text.next, next)),
    })
  } catch (error) {
    return { ...block, error: error.body }
  }

  function addLink(name, blockId) {
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
}
