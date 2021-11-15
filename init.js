const { Client } = require('@notionhq/client')
const readlineSync = require('readline-sync')

;(() => {
  /* Check config */
  try {
    config = require('./config')
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

  /* Get key */
  let key = config.NOTION_KEY
  check_key: if (typeof key === 'object') {
    // Parse object to array
    if (!Array.isArray(key)) {
      key = Object.entries(key).map(e => ({ name: e[0], key: e[1] }))
    }

    // Break if there's only one key
    if (key.length < 2) {
      key = key[0].key
      break check_key
    }

    // Select the key to use
    const index = readlineSync.keyInSelect(
      key.map(e => e.name),
      'Which key?',
      { cancel: false }
    )
    key = key[index].key
    console.log('\n')
  }

  /* Export config and notion client */
  module.exports = {
    config,
    notion: new Client({
      auth: key,
    }),
  }
})()
