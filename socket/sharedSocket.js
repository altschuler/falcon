var io = require('socket.io');

// map of tickers for sockets
var tickers = {}
// map of last used impression dates for sockets
var dates = {}

var publishSocket = null;

module.exports.listen = function (server) {
    // socket connection handling
    io = io.listen(server).on('connection', function (socket) {
        // listen for reach live feed requests
        socket.on('reachFeed', function () {
            console.log('Starting reach feed for ' + socket.id);

            tickers[socket.id] = setInterval(function () {
                console.log('Updating session ' + socket.id);
                socket.emit('update', createReachData(socket.id));
            }, 2000);
        });

        // listen for publish live feed request
        socket.on('publishFeed', function () {
            publishSocket = socket;
            console.log('Starting publish feed for ' + socket.id);
        });

        socket.on('disconnect', function () {
            console.log('Stopping feed for ' + socket.id);

            // clean connection usage
            clearInterval(tickers[socket.id]);
            delete tickers[socket.id];
            delete dates[socket.id];
        });
    });
}

exports.broadcast = {
    publishingItem: function (item) {
        io.sockets.emit('publishUpdate', item);
    }
}

// generate a random reach data item
var createReachData = function (socketId) {

    var randInt = function(min, max) { return Math.floor(Math.random()  * (max-min)) + min; };

    // initialize date to fixed one
    if (dates[socketId] === undefined)
        dates[socketId] = new Date("2013-08-12T09:15:16.74Z");

    // create and save new date
    dates[socketId] = new Date(dates[socketId].getTime() + randInt(50000, 100000));

    // create new date by adding a few minutes
    var date = dates[socketId].toISOString();

    return {
        "post_impressions": [{
            "value": randInt(0, 100000),
            "timestamp": date
        }],
        "post_impressions_organic": [{
            "value": randInt(0, 100000),
            "timestamp": date
        }],
        "post_impressions_viral": [{
            "value": randInt(0, 100000),
            "timestamp": date
        }],
        "post_impressions_paid": [{
            "value": randInt(0, 100000),
            "timestamp": date
        }]
    }
};