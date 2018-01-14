var express=require('express');
var app = express();
var server = app.listen(process.env.PORT||3000);
var io = require('socket.io').listen(server);
var players=new Map();
var fs = require('fs')
var raw = fs.readFileSync("./databases/protobowl411.json");
console.log("database read")
var db = JSON.parse(raw)
var checkAnswer = require("./checker.js").checkAnswer
var Timer = require("timer.js")
var permcolors = ["White", "Silver", "Gray", "Black", "Red", "Maroon", "Yellow", "Olive" , "Lime", "Green", "Aqua", "Teal", "Blue", "Navy", "Fuchsia", "Purple"]
var colors = ["White", "Silver", "Gray", "Black", "Red", "Maroon", "Yellow", "Olive" , "Lime", "Green", "Aqua", "Teal", "Blue", "Navy", "Fuchsia", "Purple"]

app.use(express.static("./assets"));
app.get('/', function(req, res){
	res.sendFile(__dirname+ '/index.html');
});

var hsDb = db
// for(var i = 0; i<db.length; i++){
// 	if(db[i].difficulty == "HS"){
// 		hsDb.push(db[i])
// 	}
// }

var stop = null
var cont = null
var paused = true
var ended = false
var curQ = null
var curInd = -1
var buzzing = false
var prompting = false
var answerShown = false
var buzzed = 0

var questionTimer = new Timer({
	tick:0.001,
	onstart : function(millisec) {
		var sec = (millisec / 1000).toFixed(1);
		io.emit("end timer", sec)
	},
	ontick  : function(millisec) {
		var sec = (millisec / 1000).toFixed(1);
		if(millisec%10 == 0){
			io.emit("end timer", sec)
		}
	},
	onstop  : function() {
		answerShown = true
		io.emit("end question", {
			question: curQ,
			ind:curInd
		})
	},
	onend   : function() {
		answerShown = true
		io.emit("end question", {
			question: curQ,
			ind:curInd
		})	}
	});
io.on('connection', function(socket){
	io.to(socket.client.id).emit("update", {
		question:curQ,
		index:curInd,
		ended:ended,
		answerShown:answerShown
	})
	socket.on('new player', function(msg){
		// console.log("connect")
		var color = null
		if(colors.length > 0){
			var ind = Math.floor(Math.random() * colors.length);
			color = colors[ind];
			colors.splice(ind, 1)
		}
		else{
			var randr = Math.floor(Math.random()*255).toString(16)
			var randg = Math.floor(Math.random()*255).toString(16)
			var randb = Math.floor(Math.random()*255).toString(16)
			color = `#${randr}${randg}${randb}`
		}
		players.set(socket.client.id, {
			name:msg,
			color: color,
			points:0
		});
		var send={
			id:players.get(socket.client.id),
			arr:Array.from(players.values())
		}
		io.emit('new connection', send);
	})
	socket.on("update connections", function(){
		io.emit('update connections', Array.from(players.values()))
	})
	socket.on('buzz', function(msg){
		buzzing = true
		buzz(msg)
	})
	socket.on('reset', function(){
		io.emit('reset');
	})
	socket.on('disconnect', function(){
		var dis= players.get(socket.client.id);
		if(dis != null){
			var name = dis.name
			var col = dis.color
			if(permcolors.includes(col)){
				colors.push(col)
			}
		}
		players.delete(socket.client.id);
		var send={
			id:dis,
			arr:Array.from(players.values())
		}
		io.emit('disconnection', send);
	})
	socket.on('new question', function(){
		curQ = hsDb[Math.floor(Math.random() * hsDb.length)];
		res = startQuestion(curQ)
		stop = res.stop
		cont = res.cont
		io.emit('new question', curQ)
		io.emit('reset')
	})
	socket.on("answer", function(msg){
		var answer = msg.ans
		var id = msg.id
		// console.log(msg.ans)
		res = checkAnswer(answer, curQ.answer, curQ.question, {})
		prompting = false
		if(res === "prompt" && !prompting){
			console.log('d')
			io.emit("prompt", {
				answer:answer,
				id:id
			})

		}
		else if(res){
			var value = -1
			if(curQ.question.includes("(*)") && curQ.question.split(" ").indexOf("(*)")>curInd){
				value = 15
			}
			else{
				value = 10
			}
			players.get(id).points+=value
			io.emit("correct", {
				answer:answer,
				question:curQ,
				ind:curInd,
				player:players.get(id),
				value:value
			})
			questionTimer.stop()
			if(ended){
				questionTimer.stop()
			}
			else{
				stop()
			}
			answerShown = true
			paused = true
			ended = true

			io.emit("end question", {
				question: curQ,
				ind:curInd
			})
		}
		else{
			if(ended){
				questionTimer.start()
			}
			else{
				players.get(id).points-=5;
				console.log(players.get(id).points)
				cont()
			}
			io.emit("reset")
			io.emit("incorrect", {
				player:players.get(id),
				answer: answer,
				ended:ended
			})
			if(buzzed === players.size){
				stop()
				ended = true
				paused = true
				answerShown = true
				io.emit("end question", {
					question: curQ,
					ind:curInd
				})
				questionTimer.stop()
			}
			

		}
	})
	socket.on("continue", function(){
		cont()
	})
});
console.log("QBBuzz listening on port "+3000+"!")

function buzz(id){
	buzzed++;
	io.emit('buzz', players.get(id));
	name = players.get(id)
	if(!ended){
		stop()
	}
	else{
		questionTimer.pause()
	}
	io.to(id).emit("you buzz")
}

function startQuestion(question){
	var answer = question.answer;
	var text = question.question.split(" ");
	questionTimer.stop()
	answerShown= false
	curInd = 0;
	paused = false
	ended = false
	buzzed = 0
	// console.log("new question")
	var read = setInterval(function(){
		paused = false
		io.emit("word", text[curInd])
		curInd++;
		if(curInd>=text.length){
			clearInterval(read)
			paused = true
			ended = true
			questionTimer.start(5)
		}
	}, 100)
	function cont(){
		if(paused && !ended){
			paused = false
			read = setInterval(function(){
				// $("#questionText").append(text[curInd]+" ");
				io.emit("word", " "+text[curInd])
				curInd++;
				if(curInd>=text.length){
					clearInterval(read)
					paused = true
					ended = true
					questionTimer.start(5)
					// io.emit("end text")
					// $("#startq").html("Next Question")
					// $("#startq").removeClass("disabled")
				}
			}, 100)
		}
	}
	function stop(){
		clearInterval(read)
		paused = true
	}
	return {
		stop:stop,
		cont:cont
	};
}