$(document).ready(function() {
    $.post(window.location.pathname, function(data) {
        window.user = data
        // console.log(window.user)
        if (window.user == null) {
        	// console.log('hello')
            $("#modal1").modal({
                dismissible: false,
                ready: function(modal, trigger) {
                    window.curModal = "name"
                },
                complete: function() {
                    window.curModal = null
                }
            }).modal('open');
        } else {
            socket.emit("new player", {
                name: window.user.username,
                user: window.user
            })
        }
    })

});
$(window).keypress(function(e) {
    if (e.which == 13 || e.keyCode == 13) {
        e.preventDefault()
        // console.log("enter")
        if (window.curModal === "name") {
        	// console.log("name")
            socket.emit('new player', {
                name: $('#name').val(),
                user: null
            });
            $("#modal1").modal('close');
            $("#name").val("")
            window.curModal = null
        } else if (window.curModal === "buzz") {
            buzzTimer.stop()
        } else if(window.curModal === "prompt"){
            promptTimer.stop()
        }
        return false;
    } else if (e.keyCode === 0 || e.keyCode === 32) {
        if (window.curModal == null) {
            e.preventDefault()
            var focused = $(':focus');
            if (!focused.is("input") && !$('#buzzer').hasClass('disabled')) {
                buzz()
            } else if ($('#buzzer').hasClass('disabled')) {
                Materialize.toast("You can't buzz right now!", 2000)
            }
        }
    } else if (e.keyCode === 82 || e.keyCode === 114) {
        // console.log(window.curModal)
        if (window.curModal == null && !$("#reset").hasClass("disabled"))
            socket.emit("reset")
    } else if (e.keyCode === 67 || e.keyCode === 99) {
        if (window.curModal == null)
            socket.emit("continue")
    } else if (e.keyCode === 110 || e.keyCode === 78) {
        if (window.curModal == null && !$("#startq").hasClass("disabled")) {
            next();
        }
    } else return true;
})