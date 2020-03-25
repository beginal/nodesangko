const express = require('express')

module.exports = {
    html:function(title, list, body, authStatus, isupdate ) {
      return (
        `  <!doctype html>
      <html>
      <head>
        <title>WEB - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
      ${authStatus}
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${isupdate}
        ${body}
      </body>
      </html>`
      )
    },
    list:function (filelist) {
      var list = '<ul>';
      var i = 0;
      while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i += 1
      }
      list = list + '</ul>';
      return list;
    },
    page:function (title, description, filelist, response, authStatus = true, isupdate) {
      var title = title
      var list = this.list(filelist);
      var html = this.html(title, list, `<h2>${title}</h2>${description}`,
      authStatus ? '<a href="/login">login</a>' :
      '<a href="/logout_process">logout</a>',
        isupdate ? ` 
      <a href="/update?id=${title}">update</a>
      <form action="delete_process" name="deleteform" method="post" >
      <input type="hidden" name="id" value=${title} />
      <input type="submit" value="delete"  />
      </form>
      ` : `
      <a href="/create">create</a>`
      )
      return (
        response.send(html)
      )
    }
  }