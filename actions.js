const { config, notion } = require('./init')

const actions = {
  addLink: (name, blockId, withTitle) => {
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
  },
  appendPagingLink: async ({
    block,
    prev,
    next,
    withTitle,
    newLine = true,
  }) => {
    const content = newLine
      ? [{ object: 'block', type: 'paragraph', paragraph: { text: [] } }]
      : []

    try {
      await notion.blocks.children.append({
        block_id: block.id,
        children: content.concat(
          actions.addLink(config.PREV_TEXT || '← Prev', prev, withTitle),
          actions.addLink(config.NEXT_TEXT || 'Next →', next, withTitle)
        ),
      })
    } catch (error) {
      console.error(block.title, error)
      return { ...block }
    }
  },
}
module.exports = actions
