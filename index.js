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
  readlineSync.question('Do paging go with title under each link? [y/N] ')
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
  prev: '← Prev',
  next: 'Next →',
}
switch (readlineSync.question('Change link text? [y/N] ')) {
  case 'y':
  case 'Y':
  case 'yes':
  case 'YES':
    text.prev = readlineSync.question('Previous page: ') || text.prev
    text.next = readlineSync.question('Next Page: ') || text.next
    break
}

/* Initializing a client */
const notion = new Client({
  auth: process.env.NOTION_KEY,
})

/* Adding paging to each subpage */
;(async () => {
  const response = await notion.blocks.children.list({ block_id: pageId })

  const subPage = response?.results
    .filter(e => e.type === 'child_page')
    .map(e => ({
      id: e.id.replaceAll('-', ''),
      title: e.child_page.title,
    }))

  console.log('\n======================')
  console.log('Subpages count: ', subPage.length)
  console.log('======================\n')

  Promise.all(
    subPage.map(
      async (e, i) =>
        await appendPagingLink({
          block: e,
          prev: subPage[i - 1]?.id,
          next: subPage[i + 1]?.id,
        })
    )
  ).then(results => {
    const total = subPage.length
    const errors = results.flatMap((e, i) => (!e ? i : []))
    console.log(`Done (${total - errors.length}/${total})`)
  })
})()

async function appendPagingLink({ block, prev, next }) {
  try {
    const response = await notion.blocks.children.append({
      block_id: block.id,
      children: [].concat(addLink(text.prev, prev), addLink(text.next, next)),
    })
    return true
  } catch (error) {
    console.error(`Error block: ${block.title}(id: ${block.id})\n`, error.body)
    return false
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
