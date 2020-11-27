var app = require('express')();
var http = require('http').createServer(app);
const PORT = 8080;
var io = require('socket.io')(http);


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})


http.listen(PORT, () => {
    //console.log(`listening on *:${PORT}`);
});

app.get('/getChannels', (req, res) => {
    res.json({
        channels: []
    })
});
