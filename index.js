var express=require('express');
var app = express();
// var http = require('http');
var server = app.listen(process.env.PORT||3000);
var io = require('socket.io').listen(server);
var players=new Map();
// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('./db.sqlite');

// db.serialize(function() {
// 	db.each("SELECT Question, answer from tossupsdbnew order by random() limit 40", function(err, row) {
// 		ans = row.Answer.toString().replace("&#8203;", "").replace("\\n", "").replace("\\\"").replace("\'").replace(/\s*\(.*?\)\s*/g, '').replace(/ *\[[^\]]*]/, '');
// 		bracketInd = ans.indexOf('[')
// 		parenInd = ans.indexOf('(')
// 		ans = ans.substring(0, bracketInd===-1?ans.length:bracketInd).substring(0, parenInd===-1?ans.length:parenInd)
// 		console.log(ans)
// 		question = row.Question.replace(/(<([^>]+)>)/ig,"").replace("&#8203;", "")
		
// 	});
// });

// db.close();

var fs = require('fs')
var raw = fs.readFileSync("./databases/protobowl411.json");
console.log("database read")
var db = JSON.parse(raw)

var hsDb = []
for(var i = 0; i<db.length; i++){
	if(db[i].difficulty == "HS"){
		hsDb.push(db[i])
	}
}

app.use(express.static("./assets"));
app.get('/', function(req, res){
	res.sendFile(__dirname+ '/index.html');
});

io.on('connection', function(socket){
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
		io.emit('buzz', players.get(msg));
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
	socket.on('new question', function(){
		var randQ = hsDb[Math.floor(Math.random() * hsDb.length)];
		io.emit('new question', randQ)
	})
	socket.on("continue", function(){
		io.emit('continue')
	})
});

console.log("QBBuzz listening on port "+3000+"!")