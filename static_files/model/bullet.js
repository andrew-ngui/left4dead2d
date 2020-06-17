class Projectile extends Actor {

}

class Bullet extends Projectile {
	//health one (implement later)
	//should be similar to Ball class
	constructor(stage, x, y, angle, speed, range, type, user) {
		super(stage, x, y);
		this.fromX = x;
		this.fromY = y;
		if (type == 0) {
			this.colour = 'rgba(212,175,55,1)';
		} else {
			this.colour = 'rgba(212,175,55,0)';
		}
		
		this.radius = 2;
		this.angle = angle;
		this.speed = speed;
		this.range = range;
		this.user = user;
	}
	step(){
		// move in specified angle at given speed
		this.x=this.x+Math.cos(this.angle * Math.PI/180)*this.speed;
		this.y=this.y-Math.sin(this.angle * Math.PI/180)*this.speed;
		
		// on each step: check if bullet has collided with any objects
		// execute hit function and handle accordingly if so
		for (var i=0;i<this.stage.actors.length;i++) {
			if (this.stage.actors[i] != this.user && 
				this.stage.actors[i].isHit(this.x,this.y,this.radius) &&
				this.stage.actors[i] instanceof Mass) {
				this.hit(this.stage.actors[i]);
			}
		}
		
		// calculate distance from originated point and remove once it passes its range
		var r = Math.sqrt((this.x-this.fromX)**2 + (this.y-this.fromY)**2);
		if(this.x<0 || this.x>this.stage.width || 
			this.y<0 || this.y>this.stage.height ||
			r > this.range){
			this.stage.removeActor(this);
		}
	}

	hit(actor) {
		actor.hp--;
		this.stage.removeActor(this);
	}

	draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x,this.y);
		context.fillStyle = this.colour;
		context.arc(0, 0, this.radius, 0, 2 * Math.PI, false); 
		context.fill(); 
		context.closePath();
		context.restore();
	}

}