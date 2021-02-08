var http = require('http');
var fs = require('fs');
var app = http.createServer(function(request, response) {
    var url = request.url;
    if (request.url == '/') {
        url = '/index.html';
    }
    if (request.url == '/favicon.ico') {
        return response.writeHead(404);
    }
    response.writeHead(200);
    // 사용자에게 전달하는 것이 .end(data (url)) 이 들어간다.
    response.end(fs.readFileSync(__dirname + url));

});
app.listen(3000);