function randint(n){ return Math.floor(Math.random()*n); }

class Stage {
	constructor(canvas,interval){
		this.canvas = canvas;
		this.interval = interval;
		this.state = "menu";

		var bkg = new Image();
		
		bkg.onload=function() {
			var context = canvas.getContext('2d');
			context.drawImage(bkg,0, 0);
		}
		bkg.src = '../img/cover.jpg';
		this.bkg = bkg;


		this.time = 0;
		this.level = 0;
		
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
		this.boss=null;
		// the logical width and height of the stage
		this.width=2000;
		this.height=2000;

		// Add the player to the center of the stage
		var ammunition = new Ammunition(this, Math.floor(this.width/2), Math.floor(this.height/2));
		this.addActor(ammunition);
		this.player = new Player(this, Math.floor(this.width/2), Math.floor(this.height/2))
		this.addPlayer(this.player);
		// if (this.player.weapons[0] != null)
		// 	this.addActor(this.player.weapons[0]);

		this.addActor(new Zone(this,this.width/2,this.height/2,this.width,this.height));

		// initialize our HUD
		this.hud = new HUD(this.player, this);

		// get sprite for grass
		var grassSprite = new Image();
		grassSprite.src = '../img/grass.png';
		this.image = grassSprite;

		var outerSprite = new Image();
		outerSprite.src = '../img/outer.png';
		this.outer = outerSprite;
	

		var house = new House(this, Math.floor(this.width/2), Math.floor(this.height/2),200,200,4);
		this.addActor(house);


		// Add in some enemies
		this.AddEnemies(6,null);


		// Add in some Obstacles
		var total=20;
		while(total>0){
			var x=Math.floor((Math.random()*this.width)); 
			var y=Math.floor((Math.random()*this.height)); 
			var obstacle = new Mass(this, x, y);
			if (!this.isHit(x,y,obstacle.radius)) {
				this.addActor(obstacle);
				total--;
			}
		}
			

		// add some grenades
		var total=4;
		while(total>0){
			var x=Math.floor((Math.random()*this.width)); 
			var y=Math.floor((Math.random()*this.height)); 
			var grenade = new Grenade(this, x, y, null, null, null, null);
			if (!this.isHit(x,y,grenade.radius)) {
				this.addActor(grenade);
				total--;
			}
		}

		// add some mines
		var total=4;
		while(total>0){
			var x=Math.floor((Math.random()*this.width)); 
			var y=Math.floor((Math.random()*this.height)); 
			var mine = new Mine(this, x, y,1);
			if (!this.isHit(x,y,mine.radius)) {
				this.addActor(mine);
				total--;
			}
		}
	

	}

	isHit(x,y,d) {
		for (var i = 0; i < this.actors.length;i++) {
			if (this.actors[i].isHit(x,y,d)) {
				return true;
			}
		}
		return false;
	}

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		if(this.state != "start") {
			return;
		}

		if (this.isGameOver()) {
			if (this.endGame > 0) {
				this.endGame--;
			} else {
				console.log("gameover");
				this.state = "gameover";
				return;
			}
		}

		this.timer();

		for(var i=0;i<this.actors.length;i++){
			if (!this.actors[i].isDead()) {
				this.actors[i].step();
			}
			
		}
		if (this.time % 1500 == 0) {
			this.AddEnemies(this.level*2+6,null);
			this.level++;
		}

		if (this.time > 6000 && this.boss == null) {
			this.AddEnemies(1,6);

		}
		// since the hud is not in the actors list
		this.hud.step();
	}

	timer() {
        this.time++;
    }

	draw(){
		var context = this.canvas.getContext('2d');
		if (this.state == "start") {
			context.setTransform(1,0,0,1,0,0); //clear the old transform
			context.clearRect(0, 0, this.width, this.height);
			this.drawGrass();
	
			context.translate(-this.player.x+this.canvas.width/2,-this.player.y+this.canvas.height/2); //use new player pos as center
			context.beginPath();
			context.rect(0, 0, this.width, this.height);
			context.stroke();
			this.drawGrass();
			for(var i=0;i<this.actors.length;i++){
				this.actors[i].draw(context);
			}
			// ensure the hud to be drawn on top
			this.hud.draw(context);
		} else if (this.state == "menu") {
			context.setTransform(1,0,0,1,0,0); //clear the old transform
			context.clearRect(0, 0, this.width, this.height);
			this.drawBkg();

		}



		


	}

	drawBkg() {
		var context = this.canvas.getContext('2d');
		context.drawImage(this.bkg,0, 0);
	}

	drawGrass() {
		var context = this.canvas.getContext('2d');
		context.translate(-1000,-1000); // origin for outer later of tree wall
		context.drawImage(this.outer,0, 0);
		context.stroke();

		// go back to origin and draw playing field grass
		context.translate(1000,1000);
		context.drawImage(this.image,0,0);
		context.stroke();	
	}

	AddEnemies(total,flag) {
		while(total>0){
			var type;
			if (flag == null) {
				type = randint(6);
			} else {
				type = flag;
			}
			
			var axis = randint(2);
			if (randint(2)==0) {
				var x=Math.max(Math.floor((Math.random()*this.width))*axis,20); 
				var y=Math.max(Math.floor((Math.random()*this.width))*(1-axis),20);
			} else {
				var x=Math.min(this.width-Math.floor((Math.random()*this.width))*axis,this.width-20); 
				var y=Math.min(this.height-Math.floor((Math.random()*this.width))*(1-axis),this.height-20);
			}

			if (type == 0) {
				var enemy = new Zombie(this, x, y, this.player);
			} else if (type == 1) {
				var enemy = new Zombie(this, x, y, this.player);
			} else if (type == 2) {
				var enemy = new Smoker(this, x, y, this.player);
			} else if (type == 3) {
				var enemy = new Boomer(this, x, y, this.player);
			} else if (type == 4) {
				var enemy = new Hunter(this, x, y, this.player);
			} else if (type == 5) {
				var enemy = new Spitter(this, x, y, this.player);
			} else if (type == 6) {
				var enemy = new ZombieKing(this, x, y, this.player);
			}
			// console.log(enemy);
			if (!this.isHit(x,y,enemy.radius)) {
				this.addActor(enemy);
				if (type == 6) {
					this.boss = enemy;
				}
				total--;
			}
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}

	isGameOver() {
		if (this.player.isDead() || (this.boss != null && this.boss.isDead())) {
			if (this.endGame == null) {
				this.endGame = 200;
			}
			
			return true;
		}
		return false;
	}

	isWin() {
		if (this.isGameOver()) {
			if (!this.player.isDead()) {
				return true;
			}
		}
		return false;
	}
} // End Class Stage