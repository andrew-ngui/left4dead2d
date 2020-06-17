class Weapon extends Actor {
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
//TODO: remove/move this

class Gun extends Weapon {
	constructor(stage, x, y, user) {
		super(stage, x, y);
		this.angle = null;
		this.colour = 'rgba(0,0,0,0)';
		this.hp = 24; // health as the number of bullets
		this.mag = 8; // bullets currently in the magazine 
		this.magMax = this.mag; // max size of mag
		this.isReloading = false;
		this.user = user;
		this.range = 400;
		this.speed = 10;
		this.radius = 5;
		this.bulletLevel = 0; // # of bullet upgrades
		this.bulletLevelMax = 3;
		this.ammoLevel = 0; // # of ammo upgrades
		this.ammoLevelMax = 3; 
		this.maxHp = this.hp;
		this.offset = 60; // offset the gun from the player's position to line up with sprite

		this.reloadTime = 5000; // 5 seconds to start

		var gunshot = new Audio('../sound/gunshot.mp3');
		this.shotSound = gunshot;
		var reload = new Audio('../sound/reload.wav');
		this.reloadSound = reload;
		var doneReload = new Audio('../sound/doneReload.mp3');
		this.doneReloadSound = doneReload;

	}

	isHit(x,y,d) {
		if (this.user != null) {
			return false;
		}
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {
			return true;
		}
		return false;
	}
	
	

	use() {
		if (this.mag > 0) {
			// shoot main bullet
			
			// if we store the sound in an attribute, it can't overlap
			// work around this by cloning it before every call
			const gunshot = this.shotSound.cloneNode();
			gunshot.play();

			this.stage.addActor(new Bullet(this.stage, 
				this.x+Math.cos(this.angle * Math.PI/180)*this.offset, 
				this.y-Math.sin(this.angle * Math.PI/180)*this.offset,
				this.angle, this.speed, this.range,0,this.user));
			// shoot extra bullets for each upgrade level
			for (var i = 0; i < this.bulletLevel; i++) {
				var dr = 2.5 * (i+1);
					this.stage.addActor(new Bullet(this.stage, 
					this.x+Math.cos(this.angle * Math.PI/180)*this.offset,
					this.y-Math.sin(this.angle * Math.PI/180)*this.offset,
					this.angle+dr, this.speed, this.range,0,this.user));
				this.stage.addActor(new Bullet(this.stage, 
					this.x+Math.cos(this.angle * Math.PI/180)*this.offset,
					this.y-Math.sin(this.angle * Math.PI/180)*this.offset,
					this.angle-dr, this.speed, this.range,0,this.user));
			}
			this.mag--;
		}
		if (this.isReloading == false && this.mag == 0 && this.hp != 0) { // automatic reload when empty
			this.reload();
		}

			
	}

	// initiate reload process: empty current mag if necessary, wait for reload timer, execute refill after it is done
	reload() {
		this.isReloading = true;
		this.mag = 0; // account for reloading before having empty magazine
		setTimeout(this.refill.bind(this), this.reloadTime); // bind necessary for function in setTimeout to reference this object
		this.reloadSound.play();
	}

	// refill the magazine and undo reload flag
	refill() {
		var bullets = this.hp - this.magMax;
		if (bullets < 0) {
			this.mag = this.hp;
			this.hp = 0;
		} else {
			this.hp -= this.magMax;
			this.mag = this.magMax;
		}
		this.isReloading = false;
		this.doneReloadSound.play();
	}

	


}

class Punch extends Weapon {
	//health as the number of bullets (implement later)
	//use method to create bullet
	constructor(stage, x, y, user) {
		super(stage, x, y);
		this.angle = null;
		this.colour = 'rgba(0,0,0,1)';
		this.hp = 1;
		this.user = user;
		this.range = 50;
		this.speed = 10;
		this.radius = 5;
		this.bulletLevel = 0;
	}


	use() {

		this.stage.addActor(new Bullet(this.stage, 
			this.x,this.y,this.angle, this.speed, this.range,1,this.user));
		for (var i = 0; i < this.bulletLevel; i++) {
			var dr = 2.5 * (i+1);
			this.stage.addActor(new Bullet(this.stage, 
				this.x,this.y,this.angle+dr, this.speed, this.range,1,this.user));
			this.stage.addActor(new Bullet(this.stage, 
				this.x,this.y,this.angle-dr, this.speed, this.range,1,this.user));
		}

	}

}

// Generic class for throwable objects
class Throw extends Weapon {
	//health as the number of bullets (implement later)
	//use method to create bullet
	constructor(stage, x, y,item ,user) {
		super(stage, x, y);
		this.angle = null;
		this.colour = 'rgba(0,0,0,1)';
		this.hp = 0;
		this.user = user;
		this.range = 200;
		this.speed = 10;
		this.radius = 5;
		this.item = item;
	}


	use() {
		if (this.hp > 0) {
			this.stage.addActor(new this.item(this.stage, 
				this.x, this.y, this.angle, this.speed, this.range,this.user));
			this.hp--;
		}	

	}
}

class Hook extends Weapon {
	//health as the number of bullets (implement later)
	//use method to create bullet
	constructor(stage, x, y, type, user) {
		super(stage, x, y);
		this.angle = null;
		this.colour = 'rgba(0,0,0,1)';
		this.hp = 1;
		this.user = user;
		this.range = 400;
		this.speed = 10;
		this.radius = 5;
		this.type = type;
	}


	use() {
		this.stage.addActor(new Rope(this.stage, 
			this.x, this.y, this.angle, this.speed, this.range,this.type,this.user));

	}

}


class Build extends Weapon {
	//health as the number of bullets (implement later)
	//use method to create bullet
	constructor(stage, x, y,item ,user) {
		super(stage, x, y);
		this.angle = null;
		this.colour = 'rgba(0,0,0,1)';
		this.hp = 0;
		this.user = user;
		this.range = 120;
		this.speed = 10;
		this.radius = 5;
		this.item = item;
	}


	use() {
        var tmpX = this.x+Math.cos(this.angle * Math.PI/180)*this.range; 
        var tmpY = this.y-Math.sin(this.angle * Math.PI/180)*this.range;
		if (this.hp > 0 && !this.stage.isHit(tmpX,tmpY,this.item.radius)) {
			this.stage.addActor(new this.item(this.stage, 
				tmpX, tmpY,0));
			this.hp--;
		}	

	}
}