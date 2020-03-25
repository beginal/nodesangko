const express = require('express')
const app = express();
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const template = require('./lib/template2');
const sanitizeHtml = require('sanitize-html');

app.get('/', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    const title = 'Welcome';
    const description = 'Hello, Express!';
    const list = template.list(filelist);
    const html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    res.send(html);
  });
});


app.get('/page/:pageId', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    const filterId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filterId}`, 'utf8', (err, description) => {
      const title = req.params.pageId;
      const sanTitle = sanitizeHtml(title);
      const sanDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      const list = template.list(filelist);
      const html = template.HTML(sanTitle, list, `
      <h2>${sanTitle}</h2>${sanDescription}`,
        `<a href="/create">create</a>
      <a href="/update/${sanTitle}">update</a>
      <form action="/delete_process" method="post">
      <input type="hidden" name="id", value=${sanTitle} />
      <input type="submit" value="delete" />
      </form>
      `
      );
      res.send(html);
    });
  });
});

app.get('/create', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    const list = template.list(filelist);
    const html = template.HTML('Create', list,
      ` <form action="/create_process" method='post'>
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
});

app.post('/create_process', (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  })
  req.on('end', () => {
    const post = qs.parse(body);
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', () => {
      res.redirect(`/?id=${title}`)
    });
  });
});

app.get('/update/:pageId', (req, res) => {
  fs.readdir('./data', (err, filelist) => {
    let filterId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filterId}`, 'utf8', (err, description) => {
      const list = template.list(filelist);
      const title = filterId;
      const html = template.HTML('Update', list,
        ` <form action="/update_process" method='post'>
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
});

app.post('/update_process', (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  })
  req.on('end', () => {
    const post = qs.parse(body);
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`,`data/${title}`, () => {
      fs.writeFile(`data/${title}`, description, 'utf8', () => {
        res.redirect(`/?id={$title}`)
      })
    })
  });
});

app.post('/delete_process', (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  })
  req.on('end', () => {
    const post = qs.parse(body);
    const id = post.id;
    const filterId = path.parse(id).base;
    fs.unlink(`data/${filterId}`, (err) => {
      res.redirect(`/`)
    })
  });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
