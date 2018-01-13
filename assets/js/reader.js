function startQuestion(question){
	var answer = question.answer;
	var text = question.question.split(" ");
	var index = 0;
	window.stopped = false
	$("#startq").addClass("disabled")
	var read = setInterval(function(){
		window.stopped = false
		$("#questionText").append(text[index]+" ");
		index++;
		if(index>=text.length){
			clearInterval(read)
			window.stopped = true
			$("#startq").html("Next Question")
			$("#startq").removeClass("disabled")
		}
	}, 100)
	function cont(){
		if(window.stopped){
			window.stopped = false
			read = setInterval(function(){
				$("#questionText").append(text[index]+" ");
				index++;
				if(index>=text.length){
					clearInterval(read)
					window.stopped = true
					$("#startq").html("Next Question")
					$("#startq").removeClass("disabled")
				}
			}, 100)
		}
	}
	function stop(){
		clearInterval(read)
		window.stopped = true
	}
	return {
		stop:stop,
		cont:cont
	};
}