/**
 * 
 *     refactoring
 *
 *     리팩토링이란, 동작 방식은 같되 내부 코드를 효율적으로 바꾸는 것을 의미한다.
 */
module.exports = {
    html: function(title, list, body, control) {
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
        ${control}
        ${body}
        </body>
        </html>
        `;
    },
    list: function(filelist) {
        var list = '<ol>';
        var i = 0;
        while (i < filelist.length) {
            list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list + '</ol>';
        return list;
    }
};