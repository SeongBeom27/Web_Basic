var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
const { Http2ServerRequest } = require('http2');


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
        if (queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.HTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        ` <a href="/create">create</a>
                    <a href="/update?id=${title}">update</a>
                    <form action="delete_process" method="post">
                      <input type="hidden" name="id" value="${title}">
                      <input type="submit" value="delete">
                    </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function(err, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var title = 'WEB - create';
                var list = template.list(filelist);
                var html = template.HTML(title, list, `

                    <form action="/create_process" method="post">
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
                     
                `, ``);
                response.writeHead(200);
                // 사람들이 실제로 받게되는 화면 data를 reponse.end(data)로 넘겨준다.
                response.end(html);
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
    } else if (pathname === '/update') {
        fs.readdir('./data', function(err, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var list = template.list(filelist);
                var title = filteredId;
                var html = template.HTML(title, list,
                    `
                    <form action="/update_process" method="post">
                        <!--   form 태그 내부에 있는 값들을 위 주소로 전송한다 -->

                        <!--  hidden 이라는 아이디로 value 값이 전송이 된다. 이
                              value 값 ( 수정할 파일의 이름) 
                              을 알아야 update_process에서 처리가 가능하다.
                        -->
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <!--    description 값을 query string으로 전송하게 된다. -->
                        <p>
                            <input type="submit">
                        </p>
                     </form> 
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200);
                // 사람들이 실제로 받게되는 화면 data를 reponse.end(data)로 넘겨준다.
                response.end(html);
            });
        });
    } else if (pathname === "/update_process") {
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
            var id = post.id;
            var title = post.title;
            var description = post.description;

            // error 처리를 매우 잘해줘야함.
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                    // 파일 저장이 성공적을 됐을 경우 실행


                    // writeHead ( 302 는 리다이렉트 하라는 의미)
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end('success');
                });
            });
        });
    } else if (pathname === "/delete_process") {
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
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(err) {
                // writeHead ( 302 는 리다이렉트 하라는 의미)
                // 삭제가 끝나면 홈으로 보낸다
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('not found');
    }
});
app.listen(3000);