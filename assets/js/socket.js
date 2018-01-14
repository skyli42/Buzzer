function updateConnections(array){
  $('#connections').empty();
  for(var i in array){
    $('#connections').append(
      $('<li>').html(`<div class = 'box' style='background: ${array[i].color}; color:${array[i].color}'>&nbsp; </div> ${array[i].name}: ${array[i].points}`)
      );
  }

}
socket.on('update connections', (array)=>updateConnections(array))

socket.on('update', function(msg){
  question = msg.question
  i = msg.index
  if(i != -1&& !msg.ended){
    $("#startq").addClass("disabled")
  }
  if(msg.answerShown){
    $("#buzzer").addClass("disabled")
  }
  if(question != null){
    $("#questionInfo").html(`Tournament: ${question.tournament} ${question.year} (${question.difficulty})`)
    $("#questionText").html(question.question.split(" ").slice(0, i).join(" "))
    if(msg.answerShown){
      var ans = question.answer
      ans=ans.replace(new RegExp('{', 'g'), "<strong>").replace(new RegExp('}', 'g'),"</strong>")
      $("#answerText").html(`ANSWER: ${ans}`)
    }
  }
})
socket.on('buzz', function(msg){
  $('#buzzer').addClass('disabled');
  $('#messages').prepend($('<li id = "curBuzz">').text(msg.name+" buzzed!"));
  $('#messages').prepend('<div class="divider"></div>');
  var backgroundCol = msg.color
  var darkColors = ["Black", "Teal", "Maroon"]
  var textCol = msg.color==="Black"?"white":"black"
  $("#questionText").append(` <div class = 'box' style='background: ${backgroundCol}; color:${textCol}; border:${msg.color==="White"?"black 1px solid":""}'>!</div> `)
  Materialize.toast(msg.name+" buzzed!", 2000)
  var audio = new Audio('/media/buzz_sound.mp3');
  audio.play();
});
socket.on("you buzz", function(){
  window.eligible = false
  $("#answerModal").modal({
    dismissible: false,
    inDuration: 0,
    outDuration:0,
    ready: function(modal, trigger){
      window.curModal = "buzz"
      $("#answerInput").focus()
    },
    complete:function(){
      window.curModal = null
    }
  }).modal('open')
  buzzTimer.start(5)
})
socket.on("correct", function(msg){
  $("#curBuzz").remove()
  $("#messages").prepend($("<li>").html(`${msg.player.name}: ${msg.answer} (${msg.value} points)`))
  // var ind = msg.ind
  // $("#questionText").append(msg.question.question.split(" ").slice(ind,msg.question.question.split(" ").length).join(" "))
  socket.emit("update connections")
})
socket.on('incorrect', function(msg){
  socket.emit("update connections")
  console.log(msg.ended)
  var value = msg.ended?0:-5;
  $("#curBuzz").remove()
  $("#messages").prepend($("<li>").html(`${msg.player.name}: ${msg.answer} (${value})`))
})
socket.on('prompt', function(msg){
  if(socket.id==msg.id){
    $("#promptModal").modal({
      dismissible: false,
      inDuration: 0,
      ready: function(modal, trigger){
        window.curModal = "buzz"
        $("#promptInput").focus()
      },
      complete:function(){
        window.curModal = null
      }
    }).modal('open')
    $("#promptInput").val(msg.ans)
    buzzTimer.start(5)
  }
  $("#curBuzz").remove()
  $("#messages").prepend($("<li id = \"curBuzz\">").html(`${msg.player.name}: ${msg.answer} (prompt)`))
})
socket.on('reset', function(){
  $('#buzzer').removeClass('disabled');
  // $('#messages').prepend($('<li>').text('reset!'));
  // $('#messages').prepend('<div class="divider"></div>');
});
socket.on('new connection', function(msg){
  Materialize.toast(msg.id.name+" has connected!", 4000);
  updateConnections(msg.arr);
})
socket.on('disconnection', function(msg){
  Materialize.toast(msg.id.name+" has disconnected", 4000);
  updateConnections(msg.arr);
})
socket.on('new question', function(question){
  $("#questionText").empty()
  $("#answerText").html("ANSWER: ")
  $("#startq").addClass('disabled')
  window.eligible = true
  $("#questionInfo").html(`Tournament: ${question.tournament} ${question.year} (${question.difficulty})`)
})
socket.on('word', function(word){
  $("#questionText").append(word+" ")
})
socket.on('end timer', function(sec){
  if(sec<=2){
    $("#timer").css("background", "rgba(255, 50, 50, 0.7)")
  }
  else{
    $("#timer").css("background", "aqua")
  }
  $("#timer").html(sec)
})
socket.on('end question', function(msg){
  var ind = msg.ind
  $("#questionText").append(msg.question.question.split(" ").slice(ind,msg.question.question.split(" ").length).join(" "))
  var question = msg.question
  $("#timer").css("background", "inherit")
  $("#timer").empty()
  $("#startq").html("Next Question")
  $("#startq").removeClass("disabled")
  var ans = question.answer
  ans=ans.replace(new RegExp('{', 'g'), "<strong>").replace(new RegExp('}', 'g'),"</strong>")
  $("#answerText").html(`ANSWER: ${ans}`)
  $("#buzzer").addClass("disabled")
})
