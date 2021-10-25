[➡️ Check demo](https://emma-chung.notion.site/Paging-demo-a9e27522eaf34b7f856c737ffea175b7)

# Setup integration

[Setup integration](https://www.notion.so/my-integrations) and invite it to your page.

![Screenshot](https://i.imgur.com/ZXwB6K6.png)

# Run the script

Clone the project to your computer and export the `Internal Integration Token` which generated in the former step.

```bash
# Setup project
$ git clone git@github.com:emma2334/notion-paging-helper.git
$ npm i

# Run
$ node index.js
[ Configuration ] # Only shown if there's no config.json
Notion key: secret_...
Would you like change button wording? [y/n]: y
"← Prev": 上一篇
"Next →": 下一篇

Target url or ID: edebb5fcb6fd4e9ba36ee7f1191ade70
Does paging go with title under each link? [y/n] y
```

## Config.json

Though the script will create one if config.json isn't found. You still can write it by yourself, and it allows you to use multiple keys.

```js
{
  // --------------------------------------------------------------------
  // Notion Key
  // --------------------------------------------------------------------
  //
  // @param {(string | object[])} "NOTION_KEY"
  // @param {string} "NOTION_KEY[].name"
  // @param {string} "NOTION_KEY[].key"
  //
  // Examples:
  //
  //     "NOTION_KEY": "secret_..."
  //
  //     "NOTION_KEY": [
  //       {
  //         "name": "Key",
  //         "key": "secret_..."
  //       }
  //     ]
  //
  //
  // The internal integration token genertated from
  // https://www.notion.so/my-integrations.
  // --------------------------------------------------------------------
  "NOTION_KEY": [
    {
      "name": "Key 1",
      "key": "secret_..."
    },
    {
      "name": "Key 2",
      "key": "secret_..."
    }
  ],
  // --------------------------------------------------------------------
  // Prev Text
  // --------------------------------------------------------------------
  //
  // @param {string} "PREV_TEXT"
  // @default "← Prev"
  //
  // Wording for previous page button
  // --------------------------------------------------------------------
  "PREV_TEXT": "上一篇",
  // --------------------------------------------------------------------
  // Next Text
  // --------------------------------------------------------------------
  //
  // @param {string} "NEXT_TEXT"
  // @default "Next →"
  //
  // Wording for next page button
  // --------------------------------------------------------------------
  "NEXT_TEXT": "下一篇"
}
```
