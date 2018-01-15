var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);
var fs = require('fs')
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
mongoose.Promise = require('bluebird')
var url = process.env.MONGOLAB_URL;
console.log(url)
var checkAnswer = require("./checker.js").checkAnswer
var Timer = require("timer.js")
var permcolors = ["White", "Silver", "Gray", "Black", "Red", "Maroon", "Yellow", "Olive", "Lime", "Green", "Aqua", "Teal", "Blue", "Navy", "Fuchsia", "Purple"]
var colors = ["White", "Silver", "Gray", "Black", "Red", "Maroon", "Yellow", "Olive", "Lime", "Green", "Aqua", "Teal", "Blue", "Navy", "Fuchsia", "Purple"]

var activePlayers = new Map();

// var JSON5 = require('json5')
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

require('./config/passport')(passport); // pass passport for configuration


// app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set('view engine', 'ejs'); // set up ejs for templating

app.use(express.static("./assets"));

app.use(session({ secret: 'ireallylikesecretsdoyou' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport);



app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

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
	tick: 0.001,
	onstart: function(millisec) {
		var sec = (millisec / 1000).toFixed(1);
		io.emit("end timer", sec)
	},
	ontick: function(millisec) {
		var sec = (millisec / 1000).toFixed(1);
		if (millisec % 10 == 0) {
			io.emit("end timer", sec)
		}
	},
	onstop: function() {
		answerShown = true
		io.emit("end question", {
			question: curQ,
			ind: curInd
		})
	},
	onend: function() {
		answerShown = true
		io.emit("end question", {
			question: curQ,
			ind: curInd
		})
	}
});
var questionSchema = new Schema({
	category: String,
	subcategory: String,
	difficulty: String,
	tournament: String,
	question: String,
	source: String,
	num: Number,
	answer: String,
	seen: Number,
	type: String,
	round: String
});
var userSchema = new Schema({
	email: String,
	points: Number,
	username: String
})
var Question = mongoose.model('question', questionSchema);
var User = mongoose.model('user', userSchema)
mongoose.connect(url)
var db = mongoose.connection
var hsDb = []
db.once('open', function() {
	var query = Question.find({ "difficulty": "HS" }).lean()
	query.exec(function(err, question) {
		if (err) console.log(err)
			hsDb = question
	}).then(function() {
		io.on('connection', function(socket) {
			var subfolder = socket.handshake.headers.referer;
            // console.log(subfolder)
            io.to(socket.client.id).emit("update", {
            	question: curQ,
            	index: curInd,
            	ended: ended,
            	answerShown: answerShown
            })

            socket.on('new player', function(msg) {
            	var color = null
            	if (colors.length > 0) {
            		var ind = Math.floor(Math.random() * colors.length);
            		color = colors[ind];
            		colors.splice(ind, 1)
            	} else {
            		var randr = Math.floor(Math.random() * 255).toString(16)
            		var randg = Math.floor(Math.random() * 255).toString(16)
            		var randb = Math.floor(Math.random() * 255).toString(16)
            		color = `#${randr}${randg}${randb}`
            	}
            	if (msg.user == null) {
            		activePlayers.set(socket.client.id, {
            			name: msg.name,
            			color: color,
            			user: null,
            			points: 0
            		});
                    // console.log("null user")
                } else {
                	console.log(msg.user)
                	// var user = JSON.parse(JSON5.parse(msg.user).stringify())
                	var user = msg.user
                	console.log(user.points)
                	activePlayers.set(socket.client.id, {
                		name: user.username,
                		color: color,
                		user: user,
                		points: user.points
                	})
                }
                var send = {
                	id: activePlayers.get(socket.client.id),
                	arr: Array.from(activePlayers.values())
                }
                io.emit('new connection', send);
            })
            socket.on("new username", function(msg) {
            	console.log(msg)

            	User.findOneAndUpdate({ _id: msg.user._id }, { username: msg.username },{new:true}, function(err, doc) {
            		if(err)console.log(err)
            			console.log(doc)
            		console.log(`Changed username to ${msg.username}`)
            	});
            })
            socket.on("update connections", () => io.emit('update connections', Array.from(activePlayers.values())))

            socket.on('buzz', function(msg) {
            	buzzing = true
            	buzz(msg)
            })
            socket.on('reset', () => io.emit('reset'))

            socket.on('disconnect', function() {
            	if (!subfolder.includes("profile") && !subfolder.includes("login")) {
            		var dis = activePlayers.get(socket.client.id);
            		if (dis != null) {
            			var name = dis.name
            			var col = dis.color
            			if (permcolors.includes(col)) {
            				colors.push(col)
            			}
            		}
            		if (activePlayers.get(socket.client.id).user != null) {
            			User.findOneAndUpdate({ _id: activePlayers.get(socket.client.id).user._id }, { points: activePlayers.get(socket.client.id).points }, function() {
                            // console.log(`Updated points for ${activePlayers.get(socket.client.id).user._id}`)
                        });
            		}
            		activePlayers.delete(socket.client.id);
            		var send = {
            			id: dis,
            			arr: Array.from(activePlayers.values())
            		}
            		io.emit('disconnection', send);
            	}
            })
            socket.on('new question', function() {
            	curQ = hsDb[Math.floor(Math.random() * hsDb.length)];
            	res = startQuestion(curQ)
            	stop = res.stop
            	cont = res.cont
            	io.emit('new question', curQ)
            	io.emit('reset')
            })
            socket.on("answer", function(msg) {
            	var answer = msg.ans
            	var id = msg.id
            	res = checkAnswer(answer, curQ.answer, curQ.question, {})
            	prompting = false
            	if (res === "prompt" && !prompting) {
            		io.emit("prompt", {
            			answer: answer,
            			id: id
            		})
            	} else if (res) {
            		var value = -1
            		if (curQ.question.includes("(*)") && curQ.question.split(" ").indexOf("(*)") > curInd) {
            			value = 15
            		} else if (curQ.question.includes("[*]") && curQ.question.split(" ").indexOf("[*]") > curInd) {
            			value = 15
            		} else {
            			value = 10
            		}
            		activePlayers.get(id).points += value
            		io.emit("correct", {
            			answer: answer,
            			question: curQ,
            			ind: curInd,
            			player: activePlayers.get(id),
            			value: value
            		})
            		questionTimer.stop()
            		if (ended) {
            			questionTimer.stop()
            		} else {
            			stop()
            		}
            		answerShown = true
            		paused = true
            		ended = true

            		io.emit("end question", {
            			question: curQ,
            			ind: curInd
            		})
            	} else {
            		if (ended) {
            			questionTimer.start()
            		} else {
            			activePlayers.get(id).points -= 5;
            			console.log(activePlayers.get(id).points)
            			cont()
            		}
            		io.emit("reset")
            		io.emit("incorrect", {
            			player: activePlayers.get(id),
            			answer: answer,
            			ended: ended
            		})
            		if (buzzed === activePlayers.size) {
            			stop()
            			ended = true
            			paused = true
            			answerShown = true
            			io.emit("end question", {
            				question: curQ,
            				ind: curInd
            			})
            			curInd = curQ.question.split(" ").length

            			questionTimer.stop()
            		}
            	}
            })
            socket.on("continue", () => cont())
        });
console.log("QBBuzz listening on port " + 3000 + "!")
})
})

function buzz(id) {
	buzzed++;
	io.emit('buzz', activePlayers.get(id));
	name = activePlayers.get(id)
	if (!ended) {
		stop()
	} else {
		questionTimer.pause()
	}
	io.to(id).emit("you buzz")
}

function startQuestion(question) {
	var answer = question.answer;
	var text = question.question.split(" ");
	questionTimer.stop()
	answerShown = false
	curInd = 0;
	paused = false
	ended = false
	buzzed = 0
    // console.log("new question")
    var read = setInterval(function() {
    	paused = false
    	io.emit("word", text[curInd])
    	curInd++;
    	if (curInd >= text.length) {
    		clearInterval(read)
    		paused = true
    		ended = true
    		questionTimer.start(5)
    	}
    }, 100)

    function cont() {
    	if (paused && !ended) {
    		paused = false
    		read = setInterval(function() {
                // $("#questionText").append(text[curInd]+" ");
                io.emit("word", " " + text[curInd])
                curInd++;
                if (curInd >= text.length) {
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

    function stop() {
    	clearInterval(read)
    	paused = true
    }
    return {
    	stop: stop,
    	cont: cont
    };
}