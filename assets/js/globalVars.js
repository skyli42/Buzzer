var socket = io();
window.curModal = null
window.eligible = true
window.user = null
var buzzTimer = new Timer({
	onstart : function(millisec) {
		var sec = Math.round(millisec / 1000, 2);
		$("#buzzTimer").text(sec);
	},
	ontick  : function(millisec) {
		var sec = Math.round(millisec / 1000, 2);
		$("#buzzTimer").text(sec);
	},
	onstop  : function() {
		socket.emit("answer", {
			ans:$("#answerInput").val(),
			id:socket.id
		});
		$("#answerInput").val("")
		$("#answerModal").modal('close')
		window.curModal = null
	},
	onend   : function() {
		socket.emit("answer", {
			ans:$("#answerInput").val(),
			id: socket.id
		});
		$("#answerInput").val("")
		$("#answerModal").modal('close')
		window.curModal = null
	}
});
var promptTimer = new Timer({
	onstart : function(millisec) {
		var sec = Math.round(millisec / 1000, 2);
		$("#promptTimer").text(sec);
	},
	ontick  : function(millisec) {
		var sec = Math.round(millisec / 1000, 2);
		$("#promptTimer").text(sec);
	},
	onstop  : function() {
		socket.emit("answer", {
			ans:$("#promptInput").val(),
			id:socket.id
		});
		$("#promptInput").val("")
		$("#promptModal").modal('close')
		window.curModal = null
	},
	onend   : function() {
		socket.emit("answer", {
			ans:$("#promptInput").val(),
			id: socket.id
		});
		$("#promptInput").val("")
		$("#promptModal").modal('close')
		window.curModal = null
	}
});


function buzz(){
	if(window.eligible){
		socket.emit("buzz", socket.id)
	}
	else{
		Materialize.toast("You already buzzed!", 2000)
	}
}
function next(){
	socket.emit("new question")
}
