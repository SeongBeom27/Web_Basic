var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

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
    <h1><a href="/">WEB2</a></h1>
    ${list}
    <a href="/create">create</a>
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
/* 
    createServer 콜백 함수를 웹페이지에 들어올 때마다 nodejs가 호출하는 함수이다.
    
    request : 요청할 때 웹브라우저가 보내준 정보들
    response : 우리가 웹브라우저에 전송할 정보들
*/
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
    } else if (pathname === '/create') {
        fs.readdir('./data', function(err, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                var title = 'WEB - create';
                var list = templateList(filelist);
                var template = templateHTML(title, list, `

                    <form action="http://localhost:3000/create_process" method="post">
                        <!--   form 태그 내부에 있는 값들을 위 주소로 전송한다 -->
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                            <textarea name="description" placeholder="description"></textarea>
                        </p>
                        <!--    description 값을 query string으로 전송하게 된다. -->
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                     
                `);
                response.writeHead(200);
                // 사람들이 실제로 받게되는 화면 data를 reponse.end(data)로 넘겨준다.
                response.end(template);
            });
        });
    } else if (pathname == '/create_process') {
        var body = '';
        // data 부분은 조각 조각의 양들을 서버쪽에서 수신할 때마다 아래 콜백 함수를 호출하게 되어있다.
        request.on('data', function(data) {
            body += data;

            // 너무 많은 데이터가 들어오면 연결을 끊는 코드 
            if (body.length > 1e6) {
                request.connection.destroy();
            }
        });

        request.on('end', function(data) {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                // 파일 저장이 성공적을 됐을 경우 실행


                // writeHead ( 302 는 리다이렉트 하라는 의미)
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end('success');
            });
        });
    } else {
        response.writeHead(404);
        response.end('not found');
    }
});
app.listen(3000);