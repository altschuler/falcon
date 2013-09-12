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

// map of tickers for sockets
var tickers = {}
// map of last used impression dates for sockets
var dates = {}

// socket connection handling
socketio.listen(server).on('connection', function (socket) {
    // listen for reach live feed requests
    socket.on('reachFeed', function () {
        console.log('Starting reach feed for ' + socket.id);

        tickers[socket.id] = setInterval(function () {
            console.log('Updating session ' + socket.id);
            socket.emit('update', createImpressionsNode(socket.id));
        }, 2000);
    });

    socket.on('disconnect', function () {
        console.log('Stopping feed for ' + socket.id);

        // clean connection usage
        clearInterval(tickers[socket.id]);
        delete tickers[socket.id];
        delete dates[socket.id];
    });
});

var createImpressionsNode = function (socketId) {

    var randInt = function(min, max) { return Math.floor(Math.random()  * (max-min)) + min; };

    // initialize date to fixed one
    if (dates[socketId] === undefined)
        dates[socketId] = new Date("2013-08-12T09:15:16.74Z");

    // create and save new date
    dates[socketId] = new Date(dates[socketId].getTime() + randInt(50000, 100000));

    // create new date by adding a few minutes
    var date = dates[socketId].toISOString();

    return {
        "post_impressions": [
            {
                "value": randInt(0, 100000),
                "timestamp": date
            }
        ],
        "post_impressions_organic": [
            {
                "value": randInt(0, 100000),
                "timestamp": date
            }
        ],
        "post_impressions_viral": [
            {
                "value": randInt(0, 100000),
                "timestamp": date
            }
        ],
        "post_impressions_paid": [
            {
                "value": randInt(0, 100000),
                "timestamp": date
            }
        ]
    }
};