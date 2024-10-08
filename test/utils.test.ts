import { expect } from 'chai'
import { parseTarget } from '../src/utils'

describe('parseTarget', () => {
  const workspace = 'emma-chung'
  const pageId = 'a9e27522eaf34b7f856c737ffea175b7'

  const test = (
    val: string,
    expectedResult: ReturnType<typeof parseTarget>
  ) => {
    expect(parseTarget(val)).eql(expectedResult)
  }

  it('pure id', () => {
    test(pageId, { workspace: undefined, pageId })
  })

  it('page url', () => {
    test(
      'https://www.notion.so/emma-chung/Paging-demo-a9e27522eaf34b7f856c737ffea175b7?pvs=4',
      { workspace, pageId }
    )
  })

  it('public page url', () => {
    test(
      'https://emma-chung.notion.site/Paging-demo-a9e27522eaf34b7f856c737ffea175b7',
      { workspace, pageId }
    )
  })

  it('block url', () => {
    test(
      'https://www.notion.so/emma-chung/Paging-demo-a9e27522eaf34b7f856c737ffea175b7?pvs=4#8d8638f3bea646ed995ec773397c4fe0',
      { workspace, pageId: '8d8638f3bea646ed995ec773397c4fe0' }
    )
  })

  describe('unexpected input', () => {
    const testCases: [
      val: string,
      expectedResult: ReturnType<typeof parseTarget>,
      note?: string
    ][] = [
      ['test', { workspace: undefined, pageId: undefined }],
      [
        'www.notion.so/emma-chung/Paging-demo-a9e27522eaf34b7f856c737ffea175b7?pvs=4',
        { workspace, pageId },
      ],
      [
        'https://www.notio.so/emma-chung/Paging-demo-a9e27522eaf34b7f856c737ffea175b7',
        { workspace: undefined, pageId },
        'not notion url',
      ],
      [
        'https://www.notion.so/emma-chung/Page-1-e2ad44a0143e46a9ad1ba4de2fa07956?pvs=4https://www.notion.so/emma-chung/Paging-demo-a9e27522eaf34b7f856c737ffea175b7?pvs=4',
        { workspace, pageId },
        'multiple urls',
      ],
      [
        'https://www.notion.so/test/Page-1-e2ad44a0143e46a9ad1ba4de2fa07956https://www.notion.so/emma-chung/Paging-demo-a9e27522eaf34b7f856c737ffea175b7',
        { workspace, pageId },
        'multiple urls from different workspace',
      ],
    ]

    testCases.forEach(([val, expectedResult, note], i) => {
      it(`case ${i + 1}${note ? `: ${note}` : ''}`, () => {
        test(val, expectedResult)
      })
    })
  })
})
