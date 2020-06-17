ui = ["#ui_login","#ui_game","#ui_register","#ui_main"];
nav = {0:["#nav_login","#nav_register"],1:["#nav_main","#nav_profile","#nav_game","#nav_logout"]};
dict = {
	"login": ["Login","login"],
	"register": ["Register","register"],
	"main": ["Home","main"],
	"profile": ["Profile","register"],
	"game": ["Left 4 Dead 2D","game"],
	"logout": ["Logout","login"]
};
state = null;
loggedin = false;
game = null;

// run on load of page
$(function(){
	// Setup all events here and display the appropriate UI
	navBar();
	displayPage("login");
	
	$("#loginSubmit").submit(function(event){event.preventDefault();login();});
	$("#nav_register").on('click',function(){$("#profileSubmit").trigger("reset")});	
	$("#nav_logout").on('click',logout);
	$("#nav_game").on('click',function(){$("main").css('background-color', 'black');if(stage==null) {setupGame(); }});
	$("#nav_profile").on('click',profile);
	$("#profileSubmit").submit(function(event){event.preventDefault();if (!loggedin){register();} else {update();}});
	$("#delete").on('click',clear);
	$("#nav_main").on('click',function(){getStat();getPersonalStat();})
	$("#gameButtonStart").on('click',function(){$(".gameMenu").hide();startGame();})
	$("#gameButtonRestart").on('click',function(){$(".gameMenu").hide();setupGame();startGame();})
});

// Create NavBar
function navBar() {
	var head = "<nav class='navbar'><ul class='nav-ul'>";
	var tail = "</ul></nav>";
	var body = "";

	for (var key in dict) {
		body += "<li class='nav-ul-li' id='nav_"+key+
		"'><a class='nav-ul-li-a' href='#' onclick=displayPage('"+
		key + "')>" +
		dict[key][0] + "</a></li>"
	}
	var msg = head + body + tail;
	
	$("#top_nav").html(msg);

}

// Request all users from the server, check the specified values exist
function login(){
	// username require validation
	$("#ui_login #result").text("");
	if ($("#user").val() == "") {
		$("#ui_login #result").text("Username required");
		return false;
	} 
	// password require validation
	if ($("#password").val() == "") {
		$("#ui_login #result").text("Password required");
		return false;
	} 
	$.ajax({ 
		method: "POST",  //need to create cookies
		url: "/ftd/api/login/",
		data: { username: $("#user").val(), password: $("#password").val()}
	}).done(function(data){
		if ("success" in data && data["success"] == 1) { 
			loggedin = true;
			getStat();
			getPersonalStat();
			displayPage("main");
			$("#user").val("");
		}
	}).fail(function(data){
		$("#ui_login #result").text(data.responseJSON.error);
	});
	$("#password").val("");

}

function logout(){
	$.ajax({ 
		method: "DELETE",  //need to delete cookies
		url: "/ftd/api/logout/",
	});
	window.location.reload();
	
}

function register(){
	// check password and cpassword matching in front end
	// other front end validation will be handled in html
	if ( $("#ui_register #passwordRegister").val() !=  $("#ui_register #cpasswordRegister").val()) {
		$("#ui_register #result").text("Password and Confirmed Password not match");
		return false;
	} 
	$.ajax({ 
		method: "POST",  //need to account
		url: "/ftd/api/register/",
		data: getFormVal()
	}).done(function(data){
		if ("success" in data && data["success"] == 1) { 	
			$("#ui_login #result").text("Register success");
			$("#ui_register #result").text("");
			$("#profileSubmit").trigger("reset");
			displayPage("login");
		}

	}).fail(function(data){
		// username has been used msg
		if (data.responseJSON.error == "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username") {
			$("#ui_register #result").text("Username has been used");
		} else {
			$("#ui_register #result").text(data.responseJSON.error);
		}
		
	});
	$("#passwordRegister").val("");
	$("#cpasswordRegister").val("");
	return false;
}

// Toggle the active page and hide other pages
function displayPage(active) {
	$("main").css('background-color', 'white');
	for (var i = 0; i < ui.length;i++){
		$(ui[i]).hide();
	}
	$("#ui_"+dict[active][1]).show();
	displayNavBar(active);
	pauseGame();


}

// Toggle the active nav bar option
function displayNavBar(active){
	var showIndex, hideIndex;
	if (loggedin) {
		showIndex = 1;
		hideIndex = 0;
	} else {
		showIndex = 0;
		hideIndex = 1;
	}
	for (var i = 0; i<nav[hideIndex].length;i++){
		$(nav[hideIndex][i]).hide();
		$(nav[hideIndex][i]+" a").removeClass("active");
	}
	for (var i = 0; i<nav[showIndex].length;i++){
		$(nav[showIndex][i]).show();
		$(nav[showIndex][i]+" a").removeClass("active");
	}
	$("#nav_"+active+" a").addClass("active");
	
}

// Get profile info
function profile() {
	$("#delete").html("Delete Account");
	$("#submit").html("Update");
	$("#account").html("");
	$("#ui_register #result").text("");
	$.ajax({ 
		method: "GET", 
		url: "/ftd/api/profile/"
	}).done(function(data){
		if ("success" in data && data["success"] == 1) { 
			$('#ui_register #first').val(data['profile']['first']);
			$('#ui_register #last').val(data['profile']['last']);
			$('#ui_register #given').val(data['profile']['given']); 
			$('#ui_register  #dob').val(data['profile']['dob']);
			$('#ui_register #gender').val(data['profile']['gender']);
			$('#ui_register input[name="yearofstudy"]').filter('[value='+data['profile']['yearofstudy']+']').prop('checked', true);
		}
	}).fail(function(data){
		$("#ui_register #result").text(data.responseJSON.error);
	});
}

// Delete account
function clear() {
	if (!loggedin) {
		$("#profileSubmit").trigger("reset");
	} else {
		if (confirm("Are you sure?")) {
			$.ajax({ 
				method: "DELETE", 
				url: "/ftd/api/delete/",
			}).done(function(data){
				if ("success" in data && data["success"] == 1) { 
					window.location.reload();
				} 
				
			});
			return false;
		  }
	}
}


function update() {
	//front end input will be handled by html
	var formVal = getFormVal();
	$.ajax({ 
		method: "PUT", //update the user profile
		url: "/ftd/api/update/",
		data: formVal
	}).done(function(data){
		if ("success" in data && data["success"] == 1) { 
			$("#ui_register #result").text("Update Successfully");
		}
		
	}).fail(function(data){
		$("#ui_register #result").text(data.responseJSON.error);
	});
	return false;
	
	
}
//get form value
function getFormVal() {
	var data = { username: $("#ui_register #userRegister").val(), password: $("#ui_register #passwordRegister").val(),
	cpassword: $('#ui_register #cpasswordRegister').val(), first: $('#ui_register #first').val(), 
	last: $('#ui_register #last').val(), given: $('#ui_register #given').val(), 
	dob: $('#ui_register  #dob').val(), gender: $('#ui_register #gender').val(), 
	yearofstudy:$("#ui_register input[name='yearofstudy']:checked").val()
	}
	console.log(data);
	return data;
}
// get leader board stat
function getStat() {
	$.ajax({ 
		method: "GET", 
		url: "/ftd/api/leaderboard/"
	}).done(function(data){
		if ("success" in data && data["success"] == 1) { 
			$("#leaderboard").find("tr:not(:first)").remove();
			for(i=0;i<data["stat"].length;i++){
				$('#leaderboard > tbody:last-child').append('<tr><td>'+
				data["stat"][i]["username"]+'</td><td>'+data["stat"][i]["kills"]+'</td></tr>');;
			}
		}
	});
}
// get personal best
function getPersonalStat() {
	$.ajax({ 
		method: "GET", 
		url: "/ftd/api/personal/"
	}).done(function(data){
		if ("success" in data && data["success"] == 1) { 
			$("#personal").find("tr:not(:first)").remove();
			for(i=0;i<data["stat"].length;i++){
				$('#personal > tbody:last-child').append('<tr><td>'+
				data["stat"][i]["username"]+'</td><td>'+data["stat"][i]["kills"]+'</td></tr>');;
			}
		}
	});
}
// post stat after gameover
function postStat() {
	if (stage != null && stage.state == "gameover") {
		$.ajax({ 
			method: "POST", 
			url: "/ftd/api/poststat/",
			data: {kills:stage.player.kills}
		});
	}
	}
