var express = require('express');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

// rest
var item = require('./routes/item');
var reach = require('./routes/reach');

// express
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// dev
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// api routing
app.get('/api/item', item.list);
app.get('/api/reach', reach.list);

// server
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});



// map of connections to socket
var tickers = {}

// socket connection handling
socketio.listen(server).on('connection', function (socket) {
    socket.on('message', function (msg) {
        if (msg !== 'feed_me') return;

        console.log('Starting live feed for ' + socket.id);

        tickers[socket.id] = setInterval(function () {
            console.log('Updating session ' + socket.id);
            socket.emit('update', createImpressionsNode());
        }, 2000);
    });

    socket.on('disconnect', function () {
        console.log('Stopping live feed for ' + socket.id);

        clearInterval(tickers[socket.id]);
    });
});

var createImpressionsNode = function () {
    var randInt = function() { return Math.floor(Math.random()  * 10000).toString() };
    var date = new Date().toISOString();
    return {
        "post_impressions": [
            {
                "value": randInt(),
                "timestamp": date
            }
        ],
        "post_impressions_organic": [
            {
                "value": randInt(),
                "timestamp": date
            }
        ],
        "post_impressions_viral": [
            {
                "value": randInt(),
                "timestamp": date
            }
        ],
        "post_impressions_paid": [
            {
                "value": randInt(),
                "timestamp": date
            }
        ]
    }
};