$('#reset').click(()=>socket.emit('reset'));

$("#submit_button").click(()=>socket.emit('new player', $('#name').val()));

$('#startq').click(function(){
	if(!$('#startq').hasClass('disabled') && window.stopped){
		socket.emit('new question');
	}
});

$('#buzzer').click(function(){
	if(!$('#buzzer').hasClass('disabled')){
		socket.emit('buzz', socket.id);
	}
	else{
		Materialize.toast("You can't buzz right now!", 2000)
	}
});