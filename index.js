var express=require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var players=new Map();

app.use(express.static("./assets"));
app.get('/', function(req, res){
	res.sendFile(__dirname+ '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('new player', function(msg){
		console.log("connect")
		players.set(socket.client.id, msg);
		var send={
			id:players.get(socket.client.id),
			arr:Array.from(players.values())
		}
		io.emit('new connection', send);
	})
	socket.on('buzz', function(msg){
		buzz(msg);
	})
	socket.on('reset', function(){
		io.emit('reset');
	})
	socket.on('disconnect', function(){
		var dis= players.get(socket.client.id);
		players.delete(socket.client.id);
		var send={
			id:dis,
			arr:Array.from(players.values())
		}
		// io.emit('new connection', Array.from(players.values()));
		io.emit('disconnection', send);
	})
});

var buzz=function(id){
	io.emit('buzz', players.get(id));
}

server.listen(app.listen(process.env.PORT || 3000, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%s', host, port);
}));