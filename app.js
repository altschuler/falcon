var express = require('express'),
    http = require('http'),
    path = require('path'),
    socket = require('./socket/sharedSocket');

// rest
var item = require('./routes/item'),
    reach = require('./routes/reach');

// express
var app = express();
app.set('port', process.env.PORT || 3000);
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
app.post('/api/item', item.create);
app.get('/api/reach', reach.list);

// server
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// initialize socket
socket.listen(server);

