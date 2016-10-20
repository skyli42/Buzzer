var express=require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players=new Map();

app.use(express.static("./assets"));
app.get('/', function(req, res){
  res.sendFile(__dirname+ '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('new player', function(msg){
  	players.set(socket.client.id, msg);
  	console.log(socket.client.id, msg)
  })
  socket.on('buzz', function(msg){
  	buzz(msg);
  })
  socket.on('reset', function(){
  	console.log('reset')
  	io.emit('reset');
  })
});
var buzz=function(id){
	console.log(players.get(id))
	io.emit('buzz', players.get(id));
	console.log(id)
}


http.listen(process.env.PORT, function(){
  console.log('listening on *:3000');
});