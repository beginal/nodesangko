const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template2');

router.get('/create', (req, res) => {
  const list = template.list(req.list);
  const html = template.HTML('Create', list,
    ` <form action="/page/create_process" method='post'>
        <p><input type="text", placeholder="제목" name="title"></p>
        <p>
        <textarea placeholder="내용" name="description"></textarea>
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
      `, ''
  );
  res.send(html)
});

router.post('/create_process', (req, res) => {
  const post = req.body;
  const title = post.title;
  const description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', () => {
    res.redirect(`/page/${title}`)
  });
});

router.get('/update/:pageId', (req, res) => {
  let filterId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filterId}`, 'utf8', (err, description) => {
    const list = template.list(req.list);
    const title = filterId;
    const html = template.HTML('Update', list,
      ` <form action="/page/update_process" method='post'>
      <input type="hidden", placeholder="제목" name="id" value=${title}>
      <p><input type="text", placeholder="제목" name="title" value=${title}></p>
      <p>
      <textarea placeholder="내용" name="description">${description}</textarea>
      </p>
      <p>
      <input type="submit">
      </p>
      </form>
    `, ''
    );
    res.send(html)
  })
});

router.post('/update_process', (req, res) => {
  const post = req.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, () => {
    fs.writeFile(`data/${title}`, description, 'utf8', () => {
      res.redirect(`/page/${title}`)
    })
  })
});

router.post('/delete_process', (req, res) => {
    const post = req.body;
    const id = post.id;
    const filterId = path.parse(id).base;
    fs.unlink(`data/${filterId}`, (err) => {
      res.redirect(`/`)
    })
  });

router.get('/:pageId', (req, res, next) => {
  const filterId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filterId}`, 'utf8', (err, description) => {
    if (!err) {
      const title = req.params.pageId;
      const sanTitle = sanitizeHtml(title);
      const sanDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      const list = template.list(req.list);
      const html = template.HTML(sanTitle, list, `
      <h2>${sanTitle}</h2>${sanDescription}`,
        `<a href="/page/create">create</a>
      <a href="/page/update/${sanTitle}">update</a>
      <form action="/page/delete_process" method="post">
      <input type="hidden" name="id", value=${sanTitle} />
      <input type="submit" value="delete" />
      </form>
      `
      );
      res.send(html);
    } else {
      next(err);
    }
  });
});

module.exports = router