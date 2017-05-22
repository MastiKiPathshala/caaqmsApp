var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');

var server = http.createServer(function(request, response) {

    response.writeHead(200, {"Content-Type": "text/html"});
    //response.end("Hello Azure!");
    response.end(index);

});

var port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);
