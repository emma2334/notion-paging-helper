export function parseTarget(target: string) {
  let workspace: string | undefined
  let pageId = target.match(/([a-f0-9]{32})/g)?.at(-1)
  try {
    const { hash, hostname, pathname } = new URL(target)
    const path = pathname.split('/')
    if (!hostname.includes('notion')) throw new Error()

    workspace = hostname === 'www.notion.so' ? path[1] : hostname.split('.')[0]
    pageId = hash ? hash.slice(1) : path.at(-1).split('-').at(-1)
  } catch (e) {
    pageId = target.match(/([a-f0-9]{32})/g)?.at(-1)
  }

  return { workspace, pageId }
}
