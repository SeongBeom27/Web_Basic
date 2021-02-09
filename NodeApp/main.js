var http = require('http');
var fs = require('fs');
var url = require('url');
const { Http2ServerRequest } = require('http2');

function templateHTML(title, list, body) {
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${body}
    </body>
    </html>
    `;
}

function templateList(filelist) {
    var list = '<ol>';
    var i = 0;
    while (i < filelist.length) {
        list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
    }
    list = list + '</ol>';
    return list;
}
var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    // pathname으로는 home과 다른 페이지를 구별할 수 없다.
    if (pathname == '/') {
        fs.readdir('./data', function(err, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                var list = templateList(filelist);
                var title = queryData.id;
                // homepage의 경우
                if (queryData.id == undefined) {
                    title = 'Welcome';
                    description = 'Hello, Node.js';
                }
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                response.writeHead(200);
                // 사람들이 실제로 받게되는 화면 data를 reponse.end(data)로 넘겨준다.
                response.end(template);
            });
        });
    } else {
        response.writeHead(404);
        response.end('not found');
    }
});
app.listen(3000);