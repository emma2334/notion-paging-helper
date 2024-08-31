[➡️ Check demo](https://emma-chung.notion.site/Paging-demo-a9e27522eaf34b7f856c737ffea175b7)

# Setup integration

[Setup integration](https://www.notion.so/my-integrations) and invite it to your page.

![Screenshot](https://i.imgur.com/ZXwB6K6.png)

# Run the script

Clone the project to your computer and export the `Internal Integration Token` which generated in the former step.

```bash
# Apply to all pages under the target
$ yarn start
$ yarn start all


# Only apply to specific page
$ yarn start single


# Run with the compiled script
$ yarn build
$ yarn start:static
```

# Config.json

Though the script will create one if config.json isn't found. You still can write it by yourself, and it allows you to use multiple keys.

```json
{
  "NOTION_KEY": {
    "key1": "secret_...",
    "key2": "secret_..."
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
