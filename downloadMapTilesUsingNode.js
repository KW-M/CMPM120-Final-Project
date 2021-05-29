var fs = require('fs'),
    request = require('request');

const http = require('http');
var url = require('url');


var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
// download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function () {
//     console.log('done');
// });


const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    console.log("got request", req.url)
    var queryData = url.parse(req.url, true).query;


    if (queryData.url && queryData.filePath && queryData.url.startsWith("https://services.nationalmap.gov/arcgis/rest")) {
        console.log(`downloading: ` + queryData.url)

        var dirname = queryData.filePath.match(/(.*)[\/\\]/)[1] || '';
        console.log(`to: ` + dirname)
        fs.promises.access(queryData.filePath).then(() => {
            console.log("file Already Found: ", queryData.filePath)
        }).catch(() => {
            fs.promises.mkdir(dirname, { recursive: true }).then(() => {
                download(queryData.url, queryData.filePath, () => { console.log("Done:" + queryData.filePath) })
            })
        })
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hi');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

