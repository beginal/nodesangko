var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');

function TemplateHTML(title,list,body,isupdate) {
  return (
`  <!doctype html>
  <html>
  <head>
    <title>WEB - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${isupdate}
    
    ${body}
  </body>
  </html>`
  )
}

function TemplateList(filelist) {
  var list = '<ul>';
        var i = 0;
        while (i < filelist.length) {
          list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
          i += 1
        }
        list = list + '</ul>';
        return list;
}

function TemplateAll(title,description,filelist,response,isupdate) {
  var title = title
  var list = TemplateList(filelist);
  var template = TemplateHTML(title,list,`<h2>${title}</h2>${description}`,
  isupdate ? `<a href="/update?id=${title}">update</a>` : `
  <a href="/create">create</a>`)
  return (
    response.writeHead(200),
    response.end(template)
  )
}
var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === '/') {
    if (queryData.id === undefined) {

      fs.readdir('./data', function (err, filelist) {
        TemplateAll('Welcome','Hello Node.js',filelist,response)
      })
    } else {
      fs.readdir('./data', function (err, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          TemplateAll(queryData.id,description,filelist,response,true)
        })
      })
    }

  } else if (pathname === '/create') {
    fs.readdir('./data', function (err, filelist) {
      TemplateAll('Create',`
      <form action="/create_process" method='post'>
      <p><input type="text", placeholder="제목" name="title" /></p>
      <p>
      <textarea placeholder="내용" name="description"></textarea>
      </p>
      <input type="submit">
      </form>
      `,filelist,response)
    })
  } else if(pathname === '/create_process') {
    var body= '';
    request.on('data', function(data){
      body += data;
    })
    request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description
        fs.writeFile(`data/${title}`,description,'utf8',function() {
          response.writeHead(302,
            {Location: `/?id=${title}`});
          response.end('Success');
        })
    })
    
  } else if (pathname === '/update') {
    console.log(queryData)
    fs.readdir('./data', function (err, filelist) {
      fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
        var title = queryData.id
        TemplateAll('Update',`
      <form action="/update_process" method='post'>
      <input type="hidden", name="id" value=${title} />
      <p><input type="text", placeholder="제목" name="title" value=${title} /></p>
      <p>
      <textarea placeholder="내용" name="description">${description}</textarea>
      </p>
      <input type="submit">
      </form>
      `,filelist,response)
      })
    })
  } else if (pathname === '/update_process') {
    var body= ''
    request.on('data',function(data) {
      body += data
    })
    request.on('end',function() {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      console.log(post)
      fs.rename(`data/${id}`,`data/${title}`,function() {
        fs.writeFile(`data/${title}`,description,'utf8',function() {
        response.writeHead(302,
          {Location: `/?id=${title}`});
        response.end('Success');
      })
      })
      
    })
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);