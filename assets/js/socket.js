function updateConnections(array){
  $('#connections').empty();
  for(var i in array){
    $('#connections').append($('<li>').text(array[i]));
  }
}
socket.on('buzz', function(msg){
  $('#buzzer').addClass('disabled');
  $('#messages').prepend($('<li>').text(msg+" buzzed!"));
  Materialize.toast(msg+" buzzed!", 2000)
  window.stop()
  var audio = new Audio('/media/buzz_sound.mp3');
  audio.play();
});
socket.on('reset', function(){
  $('#buzzer').removeClass('disabled');
  $('#messages').prepend($('<li>').text('reset!'));
  $('#messages').prepend('<div class="divider"></div>');
});
socket.on('new connection', function(msg){
  Materialize.toast(msg.id+" has connected!", 4000);
  updateConnections(msg.arr);
})
socket.on('disconnection', function(msg){
  Materialize.toast(msg.id+" has disconnected", 4000);
  updateConnections(msg.arr);
})
socket.on('new question', function(question){
  obj = startQuestion(question)
  window.stop = obj.stop
  window.cont = obj.cont
})
socket.on("continue", function(){
  window.cont()
})