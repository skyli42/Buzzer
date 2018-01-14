$('#reset').click(()=>socket.emit('reset'));

$("#submit_button").click(()=>socket.emit('new player', $('#name').val()));

$('#startq').click(function(){
	if(!$('#startq').hasClass('disabled')){
		next()
	}
});

$('#buzzer').click(function(){
	if(!$('#buzzer').hasClass('disabled')){
		buzz()
	}
	else{
		Materialize.toast("You can't buzz right now!", 2000)
	}
});