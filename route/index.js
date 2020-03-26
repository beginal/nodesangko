const express = require('express')
const router = express.Router()
const template = require('../lib/template2');

router.get('/', (req, res) => {
  const title = 'Welcome';
  const description = 'Hello, Express!';
  const list = template.list(req.list);
  const html = template.HTML(title, list,
    `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:20px;">
      `,
    `<a href="/page/create">create</a>`
  );
  res.send(html);
});

module.exports = router;