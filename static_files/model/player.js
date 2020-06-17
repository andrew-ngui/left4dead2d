class Player extends Mass {
	constructor(stage, x, y) {
		super(stage, x, y);
		this.colour = 'rgba(10,100,100,1)';
		this.radius = 20;
		this.angle = 0;		
		this.weapons = [new Gun(this.stage, this.x, this.y, this),
			new Hook(this.stage, this.x, this.y, 1, this), 
			new Throw(this.stage, this.x, this.y, Grenade,this), 
			new Build(this.stage, this.x , this.y, Mine, this),
			new Punch(this.stage, this.x, this.y, this)
		];
		this.weapons[4].bulletLevel = 2;
		this.speed = 3;
		this.maxSpeed = 3;
		this.dx = 0;
		this.dy = 0;
		this.hp = 20;
		this.maxHp = this.hp;
		this.hasMove = true;
		this.weaponIndex=0;
		this.maxKnockoutPeriod = 40;
		this.maxSlowPeriod = 40;
		this.knockoutPeriod = 0;
		this.slowPeriod = 0;

		this.kills = 0;

		// sprite for player
		var playerSprite = new Image();
		playerSprite.src = '../img/player.png';
		this.image = playerSprite;
		this.animeAngle = [-50,-40,-30,-20,-10,0,10,20,30,40,50,0];
		this.animeIndex = this.animeAngle.length - 1;

	}

	move(dx, dy) {
		if(this.stage.isGameOver() && this.stage.endGame<=0) {
			return;
		}
		if (this.hasMove == true) {
			if (dx != null) {this.dx = dx;}
			if (dy != null) {this.dy = dy;}
		}
	}

	moving(x,y) {
		this.x = x;
		this.y = y;
		for (var i = 0; i<this.weapons.length;i++) {
			if (this.weapons[i] != null) {
				this.weapons[i].x = this.x;
				this.weapons[i].y = this.y;
			}
		}

	}

	switch(id) {
		this.weaponIndex=id;
	}

	knockout(time) {
		this.hasMove = false;
		if (time != null) {
			this.knockoutPeriod = time;
		} else {
			this.knockoutPeriod = this.maxKnockoutPeriod;
		}
		
	}

	slow() {
		this.speed = this.maxSpeed/2;
		this.slowPeriod = this.maxSlowPeriod;
	}


	isDead() {
		if (this.hp <= 0) {
			this.stage.removeActor(this);
			this.weapons[0].user = null;
			
			return true;
		}
		return false;
	}


	headTo(x,y){
		if(this.stage.isGameOver() && this.stage.endGame<=0){
			return;
		}
		var x_dist = x-this.x;
		var y_dist = this.y-y;
		var a = Math.atan((y_dist)/(x_dist)) * 180/Math.PI;
		if (x_dist < 0) {
			a += 180;
		}
		this.angle = a;
		for (var i = 0; i <this.weapons.length;i++){
			if (this.weapons[i] != null)
			this.weapons[i].angle = a;
		}

	}

	use() {
		if (this.stage.isGameOver() && this.stage.endGame<=0) {
			return;
		}
		if (this.weapons[this.weaponIndex] != null && !(this.isDead())) {
			this.weapons[this.weaponIndex].use();
		}
		
	}

	usePunch(){
		if ((this.stage.isGameOver() && this.stage.endGame<=0) || this.isDead()) {
			return;
		}
		this.weapons[4].use();
		this.animeIndex = 0;
	}

	nextMove() {
		var x = this.x+this.dx*this.speed;
		var y = this.y+this.dy*this.speed;
		return {"x":x,"y":y};
	}
	step(){
		var x = this.nextMove().x;
		var y = this.nextMove().y;
		if (this.animeIndex < this.animeAngle.length - 1) {
			this.animeIndex++;
		}
		

		if (this.knockoutPeriod > 0 ) {
			console.log("gotKnockout:",this.knockoutPeriod);
			this.knockoutPeriod--;
			if (this.knockoutPeriod <= 0) {
				this.hasMove = true;
				this.dx = 0;
				this.dy = 0;
			}
		}
			

		if (this.slowPeriod == 0 ) {

			this.speed = this.maxSpeed;
		} else {
			this.slowPeriod--;
		}
		
		for (var i=0;i<this.stage.actors.length;i++) {
			if (this.stage.actors[i] != this && 
				this.stage.actors[i].isHit(x,y,this.radius)) {
					if (this.stage.actors[i] instanceof Mass) {
						if (this.hasMove == false) {			
							this.dx = 0;
							this.dy = 0;
							this.hasMove = true;
						}
						var bounceOff = this.stage.actors[i].bounceOff(this);
						x = bounceOff.x;
						y = bounceOff.y;
	
					} else if (this.stage.actors[i] instanceof Weapon) {
					
						if (this.weapons[0] != null) {
							this.weapons[0].x=this.x-(this.radius+this.weapons[0].radius)*1.5*
							Math.cos(this.angle * Math.PI/180);
							this.weapons[0].y=this.y+(this.radius+this.weapons[0].radius)*1.5*
							Math.sin(this.angle * Math.PI/180);
							this.weapons[0].user = null;
						}
						this.weapons[0] = this.stage.actors[i];
						this.weapons[0].user = this;
					} else if (this.stage.actors[i] instanceof Item) {
						this.stage.actors[i].hit(this);

					}

			} 
		}
		for (var i=0;i<this.stage.actors.length;i++) {
			if (this.stage.actors[i] != this && 
				this.stage.actors[i].isHit(x,y,this.radius)) {
					if (this.stage.actors[i] instanceof Mass) {
						x = this.x;
						y = this.y;
					}
			}
		}
		if(x>0 && x<this.stage.width && 
			y>0 && y<this.stage.height) {
				this.moving(x,y);
		} else {
			this.hasMove = true;
		}

			
	}
	
	draw(context){
		context.save();
		context.beginPath();
		context.translate(this.x,this.y);
		context.rotate((-this.angle+this.animeAngle[this.animeIndex])* Math.PI/180);
		context.translate(-75,-75); // move half length back of sprite
		context.drawImage(this.image,0,0);
		context.stroke();
		context.closePath();
		context.restore();
	}

}