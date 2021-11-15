const readlineSync = require('readline-sync')
const fs = require('fs')
const { notion } = require('./init')
const { handleAll } = require('./actions')

/* Seting up */
// Get id
const pageId = readlineSync
  .question('Target url or ID: ', {
    limit: /\S+/,
    limitMessage: 'Page ID is required.',
  })
  .match(/[^\/|\-|#]+/g)
  .at(-1)

// Check if need to show page title
const withTitle = readlineSync.keyInYNStrict(
  'Does paging go with title under each link?'
)

/* Adding paging to each subpage */
handleAll(pageId, withTitle)
