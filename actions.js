const readlineSync = require('readline-sync')
const fs = require('fs')

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
    const pathname = new URL(target).pathname.split('/')
    workspace = pathname[1]
    pageId = pathname.at(-1).split('-').at(-1)
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
    console.log('[ Configuration ]')
    config.NOTION_KEY = readlineSync.question('Notion key: ', {
      limit: /\S+/,
      limitMessage: 'Notion key is required.',
    })
    if (readlineSync.keyInYNStrict('Would you like change button wording?')) {
      config.PREV_TEXT = readlineSync.question('"← Prev": ')
      config.NEXT_TEXT = readlineSync.question('"Next →": ')
    }
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2))
    console.log('\n')
  }

  return config
}
