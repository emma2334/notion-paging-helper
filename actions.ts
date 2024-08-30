import readlineSync from 'readline-sync'
import fs from 'fs'
import path from 'path'
import { echo } from './logger'
import Module from "node:module";
const require = Module.createRequire(import.meta.url);

/**
 * Get the target id and check up link form.
 */
export function getInfo() {
  // Get id
  const target = readlineSync.question(`Target url or ID: `, {
    limit: /\S+/,
    limitMessage: `ID is required.`,
  })

  let workspace: string, pageId: string
  try {
    const { hash, hostname, pathname } = new URL(target)
    const path = pathname.split('/')
    workspace = hostname === 'www.notion.so' ? path[1] : hostname.split('.')[0]
    pageId = hash ? hash.slice(1) : path.at(-1).split('-').at(-1)
  } catch (e) {
    pageId = target
  }

  // Check if need to show page title
  const withTitle: boolean = readlineSync.keyInYNStrict(
    'Does paging go with title under each link?'
  )

  return { workspace, pageId, withTitle }
}

export function getConfig() {
  let config: {
    NOTION_KEY: string | string[] | Record<string, string>
    PREV_TEXT?: string
    NEXT_TEXT?: string
  } = { NOTION_KEY: '' }
  try {
    config = require('./config.json')
  } catch (e) {
    echo('\n[ Configuration ]')
    config.NOTION_KEY = readlineSync.question('Notion key: ', {
      limit: /\S+/,
      limitMessage: 'Notion key is required.',
    })
    if (readlineSync.keyInYNStrict('Would you like change button wording?')) {
      config.PREV_TEXT = readlineSync.question('"← Prev": ', {
        defaultInput: '← Prev',
      })
      config.NEXT_TEXT = readlineSync.question('"Next →": ', {
        defaultInput: 'Next →',
      })
    }
    fs.writeFileSync(
      path.resolve(import.meta.dirname, 'config.json'),
      JSON.stringify(config, null, 2)
    )
    echo('\n')
  }

  return config
}
