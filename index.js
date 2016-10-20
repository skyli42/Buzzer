var express=require('express');
var app = express();
var http = require('http');
var app = express();
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
  	players.set(socket.client.id, msg);
  	// console.log(socket.client.id, msg)
  })
  socket.on('buzz', function(msg){
  	buzz(msg);
  })
  socket.on('reset', function(){
  	io.emit('reset');
  })
});
var buzz=function(id){
	// console.log(players.get(id))
	io.emit('buzz', players.get(id));
}

server.listen(app.listen(process.env.PORT || 3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
}));