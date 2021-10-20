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

# Set token as an environment variable
$ export NOTION_KEY=secret_...

# Run
$ node index.js
Page ID: edebb5fcb6fd4e9ba36ee7f1191ade70
Does paging go with title under each link? [y/N] y
```

# Change button wording

If you don't like the default wording `← Prev` and `Next →` for buttons, you can set your own ones.

```bash
# change wording
export PREV_TEXT=上一篇
export NEXT_TEXT=下一篇

# unset
unset PREV_TEXT
unset NEXT_TEXT
```
