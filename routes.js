const fs = require('fs');

const requestHandler = (req, res) => {
    // logging the request object to the console
    console.log(req.url, req.method, req.headers);
    // process.exit(); // Uncommenting this will stop the server after the first request
    const url = req.url;
    const method = req.method;

  if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Enter message</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>');
        res.write('<html>');
        return res.end();
    }

    if (url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => { // event listener for 'data' event
            console.log(chunk); // chunk is a buffer
            body.push(chunk); // pushing the chunk to the body array
        });
        return req.on('end', () => { // event listener for 'end' event
          const parsedBody = Buffer.concat(body).toString(); // concatenating the body array and converting it to string
          console.log(parsedBody); // parsedBody will be in the format 'message=HelloWorld'
          const message = parsedBody.split('=')[1]; // splitting the parsedBody to get the message
          fs.writeFile('message.txt', message, (err) => {
            res.statusCode = 302; // 302 means redirection(where?)
            res.setHeader('Location', '/'); // (here)redirecting to the root route
            return res.end(); // return to prevent further execution
          }); // blocking code, not recommended for real apps
        });
    }
    res.setHeader('Content-Type', 'text/html'); // setting the content type of the response
    res.write('<html>');
    res.write('<head><title>My First Page</title></head>');
    res.write('<body><h1>Hello from my Node.js server!</h1></body>');
    res.write('<html>');
    res.end();
    
};

module.exports = requestHandler;

// Alternative way to export multiple items
// module.exports = {
//     handler: requestHandler,
//     someText: 'Some hard coded text'
// };