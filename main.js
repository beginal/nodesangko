var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var path = require('path');
var cookie = require('cookie')
var template = require('./lib/template.js');
var sanitizeHtml = require('sanitize-html');

function authIsOwner(request,response){
  var isOwner = false;
  var cookies = {};
  if(request.headers.cookie){
    cookies = cookie.parse(request.headers.cookie);
    console.log(cookies)
  }
  if(cookies.id === 'beginal' && cookies.password === '111111') {
    isOwner = true;
  }
  return isOwner;
}

function isLoggedIn(response,isOwner) {
  if(!isOwner) {
    response.end('login please!!')
    return false;
  }
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var isOwner = authIsOwner(request,response);

  if (pathname === '/') {
    if (queryData.id === undefined) {

      fs.readdir('./data', function (err, filelist) {
        template.page('Welcome', 'Hello Node.js', filelist, response, !isOwner)
      })
    } else {
      var filterId = path.parse(queryData.id).base;
      fs.readdir('./data', function (err, filelist) {
        fs.readFile(`data/${filterId}`, 'utf8', function (err, description) {
          template.page(filterId, description, filelist, response, !isOwner, true)
        })
      })
    }

  } else if (pathname === '/login') {
    fs.readdir('./data', function (err, filelist) {
        template.page('Login', `
      <form action="/login_process" method='post'>
      <p><input type="text", placeholder="ID" name="id" /></p>
      <p><input type="password", placeholder="PASSWORD" name="password" /></p>
      <input type="submit">
      </form>
      `, filelist, response, !isOwner)
    })
  } else if (pathname === '/login_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    })
    request.on('end', function () {
      var post = qs.parse(body);
      if(post.id === 'beginal' && post.password === '111111') {
        response.writeHead(302, {
          'Set-Cookie':[
            `id=${post.id}`,
            `password=${post.password}`,
          ],
          Location: `/`
        })
        response.end();
      } else {
        response.end('Who?');
      }
      })
  } else if (pathname === '/logout_process') {
    isLoggedIn(response,isOwner)
    var body = '';
    request.on('data', function (data) {
      body += data;
    })
    request.on('end', function () {
      var post = qs.parse(body);
        response.writeHead(302, {
          'Set-Cookie':[
            `id=; Max-Age=0`,
            `password=; Max-Age=0`,
          ],
          Location: `/`
        })
        response.end();
      
      })
  } else if (pathname === '/create') {
    isLoggedIn(response,isOwner)
    fs.readdir('./data', function (err, filelist) {
      template.page('Create', `
      <form action="/create_process" method='post'>
      <p><input type="text", placeholder="제목" name="title" /></p>
      <p>
      <textarea placeholder="내용" name="description"></textarea>
      </p>
      <input type="submit">
      </form>
      `, filelist, response, !isOwner)
    })
  } else if (pathname === '/create_process') {
    isLoggedIn(response,isOwner)
    var body = '';
    request.on('data', function (data) {
      body += data;
    })
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title
      var description = post.description
      fs.writeFile(`data/${title}`, description, 'utf8', function () {
        response.writeHead(302,
          { Location: `/?id=${title}` });
        response.end('Success');
      })
    })

  } else if (pathname === '/update') {    
    isLoggedIn(response,isOwner)
    fs.readdir('./data', function (err, filelist) {
      var filterId = path.parse(queryData.id).base;
      fs.readFile(`data/${filterId}`, 'utf8', function (err, description) {
        var title = filterId
        template.page('Update', `
      <form action="/update_process" method='post'>
      <input type="hidden", name="id" value=${title} />
      <p><input type="text", placeholder="제목" name="title" value=${title} /></p>
      <p>
      <textarea placeholder="내용" name="description">${description}</textarea>
      </p>
      <input type="submit">
      </form>
      `, filelist, response, !isOwner)
      })
    })
  } else if (pathname === '/update_process') {    
    isLoggedIn(response,isOwner)
    var body = ''
    request.on('data', function (data) {
      body += data
    })
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function () {
        fs.writeFile(`data/${title}`, description, 'utf8', function () {
          response.writeHead(302,
            { Location: `/?id=${title}` });
          response.end();
        })
      })

    })
  } else if (pathname === '/delete_process') {    
    isLoggedIn(response,isOwner)
    var body = ''
    request.on('data', function (data) {
      body += data
    })
    request.on('end', function () {
      var post = qs.parse(body);
      var filterId = path.parse(post.id).base;
      fs.unlink(`data/${filterId}`, function (err) {
        if(err) {
          return console.log(err)
        }
        response.writeHead(302, { Location: '/' });
        response.end();
      })
    })
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);