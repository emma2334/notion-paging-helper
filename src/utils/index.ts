export function parseTarget(target: string) {
  // RULE: get the workspace name from the last notion url
  let workspace
  const workspaceUrl =
    target
      .match(/([a-zA-Z0-1-]+)\.notion\.site|www\.notion\.so\/([a-zA-Z0-1-]+)/g)
      ?.at(-1) ?? ''
  if (workspaceUrl.length) {
    workspace = workspaceUrl.includes('www.notion.so')
      ? workspaceUrl.split('/').at(-1)
      : workspaceUrl.split('.')[0]
  }

  // RULE: get the last id
  const pageId = target.match(/([a-f0-9]{32})/g)?.at(-1)

  return { workspace, pageId }
}
