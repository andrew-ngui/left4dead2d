let stage=null;
let interval=null;
list=[];
//Set up the stage
function setupGame(){
	stage=new Stage(document.getElementById('stage'),interval);
	stage.draw();
	// https://javascript.info/keyboard-events
	
}

//Start the game, set all the buttons and clicks
function startGame(){
	if(stage.state == "gameover") {
		setupGame();
	}
	document.addEventListener('keydown', moveByKey);
	document.addEventListener('keydown', switchByKey);
	document.addEventListener('keydown',pauseByKey);
	document.addEventListener('keyup', stopByKey);
	document.addEventListener('contextmenu', rightClickByMouse);
	document.getElementById('stage').addEventListener('mousemove',moveByMouse);
	document.getElementById('stage').addEventListener('click',clickByMouse);
	stage.state = "start";
	clearInterval(interval);
	interval=setInterval(function(){ 
		stage.step(); stage.draw(); 
		if (stage.state == "gameover") {
			$(".gameMenu").show();
			$("#gameButtonStart").html("PLAY AGAIN");
			$("#gameButtonRestart").hide();
			clearInterval(interval);
			interval=null;
			postStat();

		}
	},20);
}

//Pause the game
function pauseGame(){
	if(stage != null) {
		document.removeEventListener('contextmenu', rightClickByMouse);
		$(".gameMenu").show();
		if (stage.state == "start") {
			$("#gameButtonStart").html("RESUME");
			$("#gameButtonRestart").show();
		}
		stage.state = "menu";
		stage.draw();
		clearInterval(interval);
		interval=null;
	}

}
//Right click for using melee
function rightClickByMouse() {
	event.preventDefault();
	stage.player.usePunch();
}

// WASD keydown for move
function moveByKey(event){
	var key = event.key;
	console.log(key);
	var moveMap = { 
		'a': { "dx": -1, "dy": 0},
		's': { "dx": 0, "dy": 1},
		'd': { "dx": 1, "dy": 0},
		'w': { "dx": 0, "dy": -1}
	};
	if(key in moveMap && list.indexOf(key)==-1){
		list.push(key);
	}
	var dx = 0;
	var dy = 0;
	for (var i = 0; i < list.length; i++) {
		dx += moveMap[list[i]].dx;
		dy += moveMap[list[i]].dy;
	}
	stage.player.move(dx, dy);
}
// WASD keyup for stop
function stopByKey(event){
	var key = event.key;
	var dx = 0;
	var dy = 0;
	var moveMap = { 
		'a': { "dx": -1, "dy": 0},
		's': { "dx": 0, "dy": 1},
		'd': { "dx": 1, "dy": 0},
		'w': { "dx": 0, "dy": -1}
	};
	if(key in moveMap && list.indexOf(key)>=0){
		var index=list.indexOf(key);
		if(index!=-1){
			list.splice(index,1);
		}
		
	}
	for (var i = 0; i < list.length; i++) {
		dx += moveMap[list[i]].dx;
		dy += moveMap[list[i]].dy;
	}
	stage.player.move(dx, dy);

}
// 1234 for switching weapons
function switchByKey(event){
	var key = event.key;
	
	var switchMap = { 
		'1': { "id":0}, // gun
		'2': { "id":1}, // hook
		'3': { "id":2}, // nade
		'4': { "id":3}  // build
	};
	if(key in switchMap){
		stage.player.switch(switchMap[key].id);
	}

	// reload gun if currently equipped
	if (key == 'r') {
		var gun = stage.player.weapons[0];
		if (stage.player.weaponIndex == 0 && gun.isReloading == false) {
			gun.reload();
		}
	}
}

// Use mouse to aim
function moveByMouse(event) {
	var x = event.offsetX;
	var y = event.offsetY;
	// console.log("x:",x);
	// console.log("y:",y);
	
	x = x+stage.player.x-stage.canvas.width/2;
	y = y+stage.player.y-stage.canvas.height/2;
	stage.player.headTo(x,y);
}
// Mouse click to use weapon
function clickByMouse() {
	// console.log("clicked");
	stage.player.use();
}

// Escape to pause the game 
function pauseByKey(event){
	var key = event.key;
	if (key == "Escape") {
		pauseGame();
	}
}

