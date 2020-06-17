class Rope extends Projectile {
	constructor(stage, x, y, angle, speed, range, type, user) {
		super(stage, x, y);
		this.colour = '	rgba(160,82,45,1)';
		this.radius = 2;
		this.angle = angle;
		this.speed = speed;
		this.range = range;
		this.user = user;
		this.hasHit = false;
		this.type = type;
	}
	step(){
		if (!this.hasHit) {
			this.x=this.x+Math.cos(this.angle * Math.PI/180)*this.speed;
			this.y=this.y-Math.sin(this.angle * Math.PI/180)*this.speed;
		}
		
		var r = Math.sqrt((this.x-this.user.x)**2 + (this.y-this.user.y)**2);
	
		for (var i=0;i<this.stage.actors.length;i++) {
			if (this.stage.actors[i] != this.user && 
				this.stage.actors[i].isHit(this.x,this.y,this.radius) &&
				this.stage.actors[i] instanceof Mass && this.hasHit == false) {
				this.hit(this.stage.actors[i]);
				this.hasHit = true;
			}
		}	

		if(this.x<0 || this.x>this.stage.width || 
			this.y<0 || this.y>this.stage.height ||
			r > this.range || this.stage.actors.indexOf(this.user) < 0) {
			this.stage.removeActor(this);
			this.user.hasMove = true;
			this.user.dx = 0;
			this.user.dy = 0;
		}
		if(this.hasHit == true && this.user.hasMove == true) {
			this.stage.removeActor(this);
		}
	}

	hit(actor) {
		if (actor instanceof Mass) {
			var dx = (this.user.x - this.x);
			var dy = (this.user.y - this.y);
			var s = Math.sqrt(dx**2+dy**2);
			if (this.type == 1) {
				this.user.move(-dx*this.speed/2/s,-dy*this.speed/2/s);
				this.user.knockout(null);
			} else {
				if (actor instanceof Player) {
					actor.move(dx*this.speed/2/s,dy*this.speed/2/s);
					console.log("knockoutPeriod:",2*s/(this.speed*this.user.speed));
					actor.knockout(2*s/(this.speed*this.user.speed));
				}

			}

		}

		
	}

	draw(context){
		context.save();
		context.beginPath(); 
		context.lineWidth = 2;
		context.strokeStyle = this.colour;
		context.moveTo(this.user.x,this.user.y);
		context.lineTo(this.x,this.y);
		context.stroke();
		context.closePath();
		context.restore();
	}

}