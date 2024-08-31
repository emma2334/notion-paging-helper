import type {
  AppendBlockChildrenParameters,
  GetPageResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints'

export type PageId = string
export type BlockId = string

export type Content = AppendBlockChildrenParameters['children']
export type Paragraph = Extract<Content[number], { type?: 'paragraph' }>
export type Page = Extract<GetPageResponse, { properties: object }>
export type Subpage = Extract<
  ListBlockChildrenResponse['results'][number],
  { type: 'child_page' }
>

export type PageInfo = {
  id: PageId
  title?: string
}
