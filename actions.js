const readlineSync = require('readline-sync')
const fs = require('fs')
const { echo } = require('./logger')

module.exports = {
  getInfo,
  getConfig,
}

/**
 * Get the target id and check up link form.
 *
 * @param      {srting}  The question for asking page id
 * @return     {Object}  The information of config
 */
function getInfo() {
  // Get id
  const target = readlineSync.question(`Target url or ID: `, {
    limit: /\S+/,
    limitMessage: `ID is required.`,
  })

  let workspace, pageId
  try {
    const { hash, hostname, pathname } = new URL(target)
    const path = pathname.split('/')
    workspace = hostname === 'www.notion.so' ? path[1] : hostname.split('.')[0]
    pageId = hash ? hash.slice(1) : path.at(-1).split('-').at(-1)
  } catch (e) {
    pageId = target
  }

  // Check if need to show page title
  const withTitle = readlineSync.keyInYNStrict(
    'Does paging go with title under each link?'
  )

  return { workspace, pageId, withTitle }
}

function getConfig() {
  let config = {}
  try {
    config = require('./config.json')
  } catch (e) {
    echo('[ Configuration ]')
    config.NOTION_KEY = readlineSync.question('Notion key: ', {
      limit: /\S+/,
      limitMessage: 'Notion key is required.',
    })
    if (readlineSync.keyInYNStrict('Would you like change button wording?')) {
      config.PREV_TEXT = readlineSync.question('"← Prev": ')
      config.NEXT_TEXT = readlineSync.question('"Next →": ')
    }
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2))
    echo('\n')
  }

  return config
}
