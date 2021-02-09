var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id
    console.log(queryData.id);
    if (_url == '/') {
        // 최상위 경로
        title = 'Welcome';
    }
    if (_url == '/favicon.ico') {
        return response.writeHead(404);
    }
    response.writeHead(200);
    fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
        var template = `
        <!doctype html>
        <html>
        <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
        </head>
        <body>
        <h1><a href="/">WEB</a></h1>
        <ol>
            <li><a href="/?id=HTML">HTML</a></li>
            <li><a href="/?id=CSS">CSS</a></li>
            <li><a href="/?id=Javascript">JavaScript</a></li>
        </ol>
        <h2>${title}</h2>
        <p>${description}</p>
        </body>
        </html>
        `
            // 사람들이 실제로 받게되는 화면 data를 reponse.end(data)로 넘겨준다.
        response.end(template);
    })
});
app.listen(3000);