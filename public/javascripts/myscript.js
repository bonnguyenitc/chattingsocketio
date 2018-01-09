$(document).ready(function() {
	$(window).load(function(){
    $('#myModal').modal('show');
  });

  $('#myModal').modal({
   	backdrop: 'static', 
   	keyboard: false
  });

  $("#btnAdd").click(function(event) {
		if($.trim($("#txtUser").val()) === "") {
      $("#error_msg").html('<div class="alert alert-danger" role="alert"><a href="#" class="alert-link">Vui lòng nhập Username</a></div>');
		} else {
			$(this).parent().parent().parent().parent().modal('hide');
		}
	});
});

var socket  = io.connect('http://chattingsocketio-chattingsocketio.7e14.starter-us-west-2.openshiftapps.com/');
//get all user
var flag_user = false;
socket.on("online",function (data) {
	if(flag_user== false){
		data.forEach(function (val,key) {
      updateUser(val["name"],false);
	});
	flag_user = true;
	} 
});

var flag_message = false;
socket.on("messageAll",function (data) {
	if(flag_message== false){
		data.forEach(function (val,key) {
			var data = {
				user : val['name'],
				msg  : val['messages']
			};
     	updateMessage(data);
	});
	flag_message = true;
	} 
});


// user

$('#btnAdd').on('click', function () {
	var user = $('#txtUser').val();
	if(user != ''){	
		socket.emit('join',user);
		updateUser(user, true);
		userChecked(user);
	}
});

$('#txtUser').on('blur', function () {
	var user = $('#txtUser').val();
	$.ajax({
		url: '/check/'+user,
		type: 'get',
		dataType: 'html',
		data: {user : user},
		success: function(data) {
			if(data == 'false'){
				alert("Trùng tên rồi mày !!! Nhập lại nhé ku :)");
			}
			if(data == 'true'){	
					alert("Thêm được rồi");
					$("#btnAdd").removeAttr("disabled");
				
			}			
		}
	  });
});


socket.on('listUser',function(data){
		updateUser(data, false);
	});

function userChecked(user){
	$.ajax({
		type: "get",
		url: "/session-join/"+user,
		dataType: "html"
	});
}

function updateUser(user, active){
	var active;
	var logout;
	var onlined =  $('#listUser').attr('onlined');
	if(active == true || onlined == user){
		active = 'style="background-color:#c9e2c9;"';
		logout = '<a id="alogout" onclick="logOut()" attr-logout="'  + user + '"'+'>Đăng xuất</a>';
		status = '';
	}else{
		active = "";
		logout = '';
		status = 'Đang online';
	}
		xhtml = '<li attr-name-user="'+ user +'"  class="media"'+ active + '>';
		xhtml +='<div class="media-body">';
        xhtml +='<div class="media">';
        xhtml +='<a class="pull-left" href="#">';
        xhtml +='<img class="media-object img-circle" style="max-height:40px;" src="images/user.png" />';
        xhtml +='</a>';
		xhtml +='<div class="media-body" >';
        xhtml +='<h5>'+ user + ' <span id="status">' + status + '</span>' +'</h5>' + logout;
        xhtml +='</div>';
        xhtml +='</div>';
        xhtml +='</div>';
		xhtml +='</li>';
		
		$("#listUser").append(xhtml);
}
// tin nhắn
$("#btnSend").on('click', function () {

		if($('#listUser').attr('onlined')==''){
			var user = $("#txtUser").val();
		}else{
			var user = $('#listUser').attr('onlined');
		}

		var msg = $("#txtMessage").val();
		if(msg.length > 0){
			var data = {
				user : user,
				msg  : msg
			};
	
			socket.emit('message', data);
			$('#txtMessage').val('');
			add_message(msg);
			updateMessage(data);
		}
		
		//console.log(data);
});

$("#txtMessage").bind("keypress", {}, keypressInBox);

function keypressInBox(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode                        
        e.preventDefault();
		if($('#listUser').attr('onlined')==''){
			var user = $("#txtUser").val();
		}else{
			var user = $('#listUser').attr('onlined');
		}

		var msg = $("#txtMessage").val();
		if(msg.length > 0){
			var data = {
				user : user,
				msg  : msg
			};
	
			socket.emit('message', data);
			$('#txtMessage').val('');
			add_message(msg);
			updateMessage(data);
		}
        setInterval(function(){ $('.okok').animate({
			scrollTop: $('.okok').get(0).scrollHeight
		}, 1500); }, 1000);
    }
};



function add_message(message){
	$.ajax({
		type: "POST",
		url: "/insert-message",
		data: { message : message },
		dataType: "html"
	});
}

socket.on('messages', (data)=>{
	updateMessage(data);
});

var scroll = function(){
	
}
function updateMessage(data){
		var user = $('#listUser').attr('onlined');
		
		if(user == data.user){			
			var xhtml = '<li class="media">';
			xhtml += '<div class="row"> ';
			xhtml += '<div class="col-md-10 col-ms-10">	';
			xhtml += '<div class="media-bodyyy" >'+ data.msg;			   					   
			xhtml += '</div>';
			xhtml += '</div>';
			xhtml += '<div class = "col-md-2 col-ms-2">';
			xhtml += '<div class="media-image">';
			xhtml += '<a class="pull-left" href="#">';
			xhtml += '<img class="media-object img-circle" src="images/user.png" />';
			xhtml += '<small class="text-muted">'+ data.user +'</small>';
			xhtml += '</a>';
			xhtml += '</div>';
			xhtml += '</div>';
			xhtml += '</div>	';		
			xhtml += '</li>';
		}else{
			var xhtml = '<li class="media">';
            xhtml +='<div class="media-body user">';
            xhtml +='<a class="pull-left" href="#">';
			xhtml +='<img class="media-object img-circle" src="images/user.png" />';
			xhtml +='<small class="text-muted">'+ data.user + '</small>';
            xhtml +='</a>';
            xhtml +='<div class="media-body msgf" >'+ data.msg;	                                    
            xhtml +='</div>';
            xhtml +='</div>';
			xhtml +='</li>';
		}

			

		$('#listMessage').append(xhtml);
}

function logOut(){
	var user = $('a#alogout').attr('attr-logout');
	socket.emit("logout",user);
	window.location.href = "/logout/"+user;
	
}

socket.on('logout',(user)=>{
	$("ul#listUser li[attr-name-user='"+user+"']").remove();
});























