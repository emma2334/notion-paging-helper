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
[ Configuration ] # Only shown when there's no config.json
Notion key: secret_...
Would you like change button wording? [y/n]: y
"← Prev": 上一篇
"Next →": 下一篇

Target url or ID: edebb5fcb6fd4e9ba36ee7f1191ade70
Does paging go with title under each link? [y/n] y
```

## Apply to all pages under the target

The target could be a page or a block.

```bash
$ node index.js
$ node index.js all
```

## Only apply to specific page

⚠️ The page should be the one which is directly under a page instead of a block.

```bash
$ node index.js single
```

# Config.json

Though the script will create one if config.json isn't found. You still can write it by yourself, and it allows you to use multiple keys.

```json
{
  "NOTION_KEY": {
    "key 1": "secret_...",
    "key 2": "secret_..."
  },
  "PREV_TEXT": "上一篇",
  "NEXT_TEXT": "下一篇"
}
```

| Key name             | Type                     | Description                       |
| -------------------- | ------------------------ | --------------------------------- |
| NOTION_KEY           | srting, string[], object | Integration token                 |
| PREV_TEXT (optional) | string                   | Wording for previous page button. |
| NEXT_TEXT (optional) | string                   | Wording for next page button.     |

### NOTION_KEY

The internal integration token genertated from https://www.notion.so/my-integrations.

```js
// string
{ "NOTION_KEY": 'secret_...' }

// array
{ "NOTION_KEY": ['secret_...'] }

// object
{ "NOTION_KEY": { "key_name": 'secret_...' } }
```

Recommend setting `key_name` to workspace names. The script will retrieve the corresponding key when the target is a Notion URL.

### PREV_TEXT (Optional)

Wording for previous page button.

### NEXT_TEXT (Optional)

Wording for next page button.
