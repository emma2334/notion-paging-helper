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

Page ID: edebb5fcb6fd4e9ba36ee7f1191ade70
Does paging go with title under each link? [y/n] y
```
