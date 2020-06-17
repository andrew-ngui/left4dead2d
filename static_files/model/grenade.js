class Grenade extends Item {
	//health one (implement later)
	//should be similar to Ball class
	constructor(stage, x, y, angle, speed, range, user) {
		super(stage, x, y);
		this.fromX = x;
		this.fromY = y;
		this.colour = 'rgba(0,100,0,1)';
		this.innerColour  = 'rgba(200,200,0,0.7)';
		this.radius = 5;
		this.hp = 5;
		this.maxRadius = 100;
		this.expSpeed = 2.5;
		this.angle = angle;
		this.speed = speed;
		this.range = range;
		this.user = user;
		this.hasHit = false;
		this.players = [];
		this.damage = 10;
		this.weaponsIndex = 2;

		var grenadeSprite = new Image();
		grenadeSprite.src = '../img/grenade.png';
		this.image = grenadeSprite;

		var explosion = new Audio('../sound/explosion.wav');
		this.explosionSound = explosion;
	}

	isHit(x,y,d) {
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {
			return true;
		}
		return false;
    }

	step(){
		if (this.user == null) {
			return;
		}

		if (!this.hasHit){
			this.x=this.x+Math.cos(this.angle * Math.PI/180)*this.speed;
			this.y=this.y-Math.sin(this.angle * Math.PI/180)*this.speed;
		}
		
		var r = Math.sqrt((this.x-this.fromX)**2 + (this.y-this.fromY)**2);
		for (var i=0;i<this.stage.actors.length;i++) {
			if (this.stage.actors[i] != this.user && 
				this.stage.actors[i].isHit(this.x,this.y,this.radius) &&
				this.stage.actors[i] instanceof Mass) {
				this.colour = 'rgba(200,0,0,0.7)';
				this.hasHit = true;
			}
		}
		
		if (r > this.range) {
			this.colour = 'rgba(200,0,0,0.7)';
			this.hasHit = true;
		}

		if (this.hasHit == true && this.radius < this.maxRadius) {
			this.radius+=this.expSpeed;
			this.explosionSound.play();

			for (var i=0;i<this.stage.actors.length;i++) {
				if (this.stage.actors[i].isHit(this.x,this.y,this.radius) &&
					this.stage.actors[i] instanceof Mass) {
					if (this.players.indexOf(this.stage.actors[i])<0) {
						this.hit(this.stage.actors[i]);	
					}
					
				}
			}

		}
		if (this.radius >= this.maxRadius) {
			this.stage.removeActor(this);
			for (var i = 0; i < this.players.length;i++) {
				if (this.players[i] instanceof Player) {
					this.players[i].hasMove = true;
					this.players[i].dx = 0;
					this.players[i].dy = 0;
				}
				
			}
			
		}
		

		if(this.x<0 || this.x>this.stage.width || 
			this.y<0 || this.y>this.stage.height ){
			this.stage.removeActor(this);
		}
	}



	hit(actor) {
		if(this.user == null && actor instanceof Enemy) {
			return;
		}
		if (this.user == null && actor instanceof Player && !(actor instanceof Enemy)) {
			this.user = actor;
			actor.weapons[this.weaponsIndex].hp += this.hp;
			this.stage.removeActor(this);
			return;
		}
		if (this.user == actor) {
			return;
		}


		if (actor instanceof Player) {
			if (this.players.indexOf(actor)<0) {
				actor.hp-=this.damage;
			} 
			this.players.push(actor);
			var dx = (actor.x - this.x);
			var dy = (actor.y - this.y);
			var s = Math.sqrt(dx**2+dy**2);

			actor.dx = dx*this.speed/5/s;
			actor.dy = dy*this.speed/5/s;
			actor.knockout(null);
		}
		
	}

	draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x,this.y);
		if (this.user == null) {
			context.shadowBlur = 5;
			context.shadowColor = "white";
		}
		if (this.hasHit == false) {
			context.translate(-20,-20); // move half length back of sprite
			context.drawImage(this.image,0,0);
		} else {
			context.fillStyle = this.colour;
			var gradient = context.createRadialGradient(0, 0, this.radius*0.8, 0, 0, this.radius);
			gradient.addColorStop(0, this.innerColour);
			gradient.addColorStop(1, this.colour);
			context.arc(0, 0, this.radius, 0, 2 * Math.PI, false); 
			context.fillStyle = gradient;
			context.fill(); 
		}

		context.closePath();
		context.restore();
	}

}

class Mine extends Grenade {
	constructor(stage, x, y, type) {
		super(stage,x,y,null,null,null,null);
		this.colour = 'rgba(0,50,0,1)';
		this.radius = 10;
		this.speed = 10;
		this.maxRadius = 200;
		this.hp = 1;
		var mineSprite = new Image();
		if (type == 0) {
			mineSprite.src = '../img/mine.png';
		} else {
			mineSprite.src = '../img/mineInactive.png';
		}
		this.image = mineSprite;
		this.weaponsIndex = 3;
		this.type = type;
	}
	isHit(x,y,d) {
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {
			if (this.type == 0) {
				this.user = true;
			}
			return true;
		}
		return false;
    }

}

class Cocktail extends Grenade {
	constructor(stage, x, y, angle, speed, range, user) {
		super(stage, x, y, angle, speed, range, user);
		this.colour = 'rgba(0,50,0,1)';
		this.innerColour = "rgba(200,200,0,0.3)";
		this.maxRadius = 200;
		this.duration = 200;
		
		var grenadeSprite = new Image();
		grenadeSprite.src = '../img/cocktail.png';
		this.image = grenadeSprite;

	}
	step(){
		if (this.user == null) {
			return;
		}

		if (!this.hasHit){
			this.x=this.x+Math.cos(this.angle * Math.PI/180)*this.speed;
			this.y=this.y-Math.sin(this.angle * Math.PI/180)*this.speed;
		}
		
		var r = Math.sqrt((this.x-this.fromX)**2 + (this.y-this.fromY)**2);
		for (var i=0;i<this.stage.actors.length;i++) {
			if (this.stage.actors[i] != this.user && 
				this.stage.actors[i].isHit(this.x,this.y,this.radius) &&
				this.stage.actors[i] instanceof Mass) {
				this.colour = 'rgba(0,200,0,0.3)';
				this.hasHit = true;
			}
		}
		
		if (r > this.range) {
			this.colour = 'rgba(0,200,0,0.3)';
			this.hasHit = true;
		}

		if (this.hasHit == true && this.radius < this.maxRadius) {
			if (this.radius < this.maxRadius) {
				this.radius+=this.expSpeed;
			}
			for (var i=0;i<this.stage.actors.length;i++) {
				if (this.stage.actors[i].isHit(this.x,this.y,this.radius) &&
					this.stage.actors[i] instanceof Mass) {
					this.hit(this.stage.actors[i]);	
					
				}
			}

		}

		if (this.radius >= this.maxRadius) {
			this.duration--;
			if (this.duration <= 0) {
				this.stage.removeActor(this);
			}
			
		}
		

		if(this.x<0 || this.x>this.stage.width || 
			this.y<0 || this.y>this.stage.height ){
			this.stage.removeActor(this);
		}
	}



	hit(actor) {
		if(this.user == null && actor instanceof Enemy) {
			return;
		}
		if (this.user == null && actor instanceof Player && !(actor instanceof Enemy)) {
			this.user = actor;
			actor.weapons[2].hp += this.hp;
			this.stage.removeActor(this);
			return;
		}


		if (actor instanceof Player && !(actor instanceof Enemy)) {
			actor.hp-=0.01;
			actor.slow();
		}
		
	}

}