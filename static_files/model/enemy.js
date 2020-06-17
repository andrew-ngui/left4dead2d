class Enemy extends Player {
	constructor(stage, x, y, player) {
		super(stage, x, y);
		this.fireRate = 70;
		this.colour = 'rgba(50,0,0,1)';
		this.cooldown = this.fireRate;
		this.player = player; // reference to player so the ai can track them
		this.hp = 10;
		this.speed = 1;
		var type = randint(4);
		var item = getItem(type,stage, x, y);
		this.items = [item];
		this.weapons = [new Gun(this.stage, this.x, this.y, this)];
		this.fireRange = 300;
		this.stopRange = 200;
		var zombieSprite = new Image();
		zombieSprite.src = '../img/zombie.png'; // default zombie image
		this.image = zombieSprite;
		var sound = new Audio('../sound/zombie.wav');
		this.zombieSound = sound;

	}
	step() {
		super.step();
		var chance = randint(200); // 0.5% chance for zombie sound per step
		if (chance == 0) {
			this.zombieSound.play();
		}
	}	

	isDead() {
		if (this.hp <= 0) {
			this.stage.removeActor(this);
			for (var i = 0; i<this.items.length;i++) {
				this.items[i].x = this.x;
				this.items[i].y = this.y;
				var chance = randint(5); // a 20% chance of dropping the item it holds
				if (chance == 4 && this.items[i] != null) {
					this.stage.addActor(this.items[i]);
				}
			}
			this.player.kills++; // increment kills
			return true;
		}
		return false;
	}


	nextMove() {
		if (this.hasMove == true){
			this.headTo(this.player.x, this.player.y);
			this.dx = Math.cos(this.angle * Math.PI/180);
			this.dy = -Math.sin(this.angle * Math.PI/180);
		}
		var a = this.x - this.player.x;
		var b = this.y - this.player.y;
		var dist = Math.sqrt( a*a + b*b );

		if (dist < this.stopRange && this.hasMove == true) {
			this.dx = 0;
			this.dy = 0;
		}
		if (dist < this.fireRange) {
			if(this.cooldown > 0) {
				this.cooldown--;
			} else {
				if (this.weapons[0] != null)this.weapons[0].use();
				this.cooldown = this.fireRate;
			}
		}

		var x=this.x+this.dx*this.speed;
		var y=this.y+this.dy*this.speed;



		return {"x":x,"y":y};

	}
}

class Zombie extends Enemy {
	constructor(stage, x, y, player) {
		super(stage, x, y, player);
		this.fireRate = 50;
		this.cooldown = this.fireRate;
		this.colour = 'rgba(0,50,0,1)';
		this.hp = 5;
		this.normalSpeed = 0.5;
		this.weapons = [new Punch(this.stage, this.x, this.y, this)];
	}

	nextMove() {
		if (this.hasMove == true){
			this.headTo(this.player.x, this.player.y);
			this.dx = Math.cos(this.angle * Math.PI/180);
			this.dy = -Math.sin(this.angle * Math.PI/180);
		}
		var a = this.x - this.player.x;
		var b = this.y - this.player.y;
		var dist = Math.sqrt( a*a + b*b );

		if (dist < this.fireRange && this.hasMove == true) {
			this.speed = this.normalSpeed*10;
		} else if (dist >= this.fireRange && this.hasMove == true) {
			this.speed = this.normalSpeed;
		}
	

		if (dist < this.player.radius && this.hasMove == true) {
			this.dx = 0;
			this.dy = 0;
		}
		if (dist < this.player.radius + this.radius + 5 ) {
			if(this.cooldown > 0) {
				this.cooldown--;
			} else {
				if (this.weapons[0] != null)this.weapons[0].use();
				this.animeIndex = 0;
				this.cooldown = this.fireRate;
			}
		}
		var x=this.x+this.dx*this.speed;
		var y=this.y+this.dy*this.speed;
		return {"x":x,"y":y};

	}
}

class Boomer extends Zombie {
	constructor(stage, x, y, player) {
		super(stage, x, y,player);
		//this.colour = '#BDA55D';
		this.normalSpeed = 0.4;
		this.weapons = [new Punch(this.stage, this.x, this.y, this)];
		var boomerSprite = new Image();
		boomerSprite.src = '../img/boomer.png';
		this.image = boomerSprite;
	}


	isHit(x,y,d) {
		if (this.stage.player.isHit(this.x,this.y,this.radius+10)) {
			this.hp = 0;
			this.isDead();
		}
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {

			return true;
		}
		return false;
	}


	isDead() {
		if (this.hp <= 0) {
			var mine = new Mine(this.stage, this.x, this.y,0);
			this.stage.addActor(mine);
			mine.isHit(this.x,this.y,this.radius);
			this.stage.removeActor(this);
			for (var i = 0; i<this.items.length;i++) {
				this.items[i].x = this.x;
				this.items[i].y = this.y;
				this.stage.addActor(this.items[i]);
			}
			
			return true;
		}
		return false;
	}

}

class Smoker extends Zombie {
	constructor(stage, x, y, player) {
		super(stage, x, y,player);
		this.colour = '#rgba(100,100,100,1)';
		this.normalSpeed = 0.4;
		this.weapons = [new Hook(this.stage, this.x, this.y, 0,this),
			new Punch(this.stage, this.x, this.y, this)];
		var smokerSprite = new Image();
		smokerSprite.src = '../img/smoker.png';
		this.image = smokerSprite;
		this.weapons[0].colour = 'rgba(0,0,0,1)';
	}
	nextMove() {
		if (this.hasMove == true){
			this.headTo(this.player.x, this.player.y);
			this.dx = Math.cos(this.angle * Math.PI/180);
			this.dy = -Math.sin(this.angle * Math.PI/180);
		}
		var a = this.x - this.player.x;
		var b = this.y - this.player.y;
		var dist = Math.sqrt( a*a + b*b );

		if (dist < 300  && this.hasMove == true) {
			this.dx = 0;
			this.dy = 0;
			if(this.cooldown > 0) {
				this.cooldown--;
			} else {
				if (this.weapons[0] != null)this.weapons[0].use();
				this.cooldown = this.fireRate*10;
			}
		}
		if (dist < this.player.radius + this.radius + 5 ) {
			Math.min(this.cooldown,this.fireRate);
			if(this.cooldown > 0) {
				this.cooldown--;
			} else {
				if (this.weapons[1] != null)this.weapons[1].use();
				this.cooldown = this.fireRate;
				this.animeIndex = 0;
			}
		}

		var x=this.x+this.dx*this.speed;
		var y=this.y+this.dy*this.speed;



		return {"x":x,"y":y};

	}


}

class Hunter extends Zombie {
	constructor(stage, x, y, player) {
		super(stage, x, y, player);
		this.fireRate = 40;
		this.cooldown = this.fireRate;
		this.colour = 'rgba(0,0,150,1)';
		this.hp = 5;
		this.speed = 1.5;
		this.weapons = [new Punch(this.stage, this.x, this.y, this),
			new Hook(this.stage, this.x, this.y,1, this)];

		var hunterSprite = new Image();
		hunterSprite.src = '../img/hunter.png';
		this.image = hunterSprite;
	}

	nextMove() {
		if (this.hasMove == true){
			this.headTo(this.player.x, this.player.y);
			this.dx = Math.cos(this.angle * Math.PI/180);
			this.dy = -Math.sin(this.angle * Math.PI/180);
		}
		var a = this.x - this.player.x;
		var b = this.y - this.player.y;
		var dist = Math.sqrt( a*a + b*b );

		if (dist < 300 && dist > 100  && this.hasMove == true) {
			if(this.cooldown > 0) {
				this.cooldown--;
			} else {
				if (this.weapons[1] != null)this.weapons[1].use();
				this.cooldown = this.fireRate*10;
			}
		}

		if (dist < this.player.radius && this.hasMove == true) {
			this.dx = 0;
			this.dy = 0;
		}
		if (dist < this.player.radius + this.radius + 5 ) {
			Math.min(this.cooldown,this.fireRate);
			if(this.cooldown > 0) {
				this.cooldown--;
			} else {
				if (this.weapons[0] != null)this.weapons[0].use();
				this.cooldown = this.fireRate;
				this.animeIndex = 0;
			}
		}

		var x=this.x+this.dx*this.speed;
		var y=this.y+this.dy*this.speed;



		return {"x":x,"y":y};

	}


}


class Spitter extends Enemy {
	constructor(stage, x, y, player) {
		super(stage, x, y,player);
		this.fireRate = 1000;
		this.colour = '#9ACD32';
		this.speed = 0.8;
		this.weapons = [new Throw(this.stage, this.x, this.y, Cocktail,this)];
		this.weapons[0].range = 600;
		this.weapons[0].hp = 5;
		this.fireRange = 600;
		this.stopRange = 600;
		var spitterSprite = new Image();
		spitterSprite.src = '../img/spitter.png';
		this.image = spitterSprite;
	}

}

class ZombieKing extends Zombie {
	constructor(stage, x, y, player) {
		super(stage, x, y, player);
		this.fireRate = 200;
		this.cooldown = this.fireRate;
		this.teleportRate = 1000
		this.teleportCooldown = this.teleportRate;
		this.colour = 'rgba(0,0,150,1)';
		this.hp = 100;
		this.maxHp = this.hp;
		this.speed = 1.5;
		this.radius = 40;
		this.weapons = [new Punch(this.stage, this.x, this.y, this)];
		var kingSprite = new Image();
		kingSprite.src = '../img/king.png';
		this.image = kingSprite;
	}


	nextMove() {
		if (this.hasMove == true){
			this.headTo(this.player.x, this.player.y);
			this.dx = Math.cos(this.angle * Math.PI/180);
			this.dy = -Math.sin(this.angle * Math.PI/180);
		}
		var a = this.x - this.player.x;
		var b = this.y - this.player.y;
		var dist = Math.sqrt( a*a + b*b );

		if (this.hp >0.25*this.maxHp){
			if (dist < 800 && this.hasMove == true) {
				this.dx = 0;
				this.dy = 0;
			}
			if (dist < 800) {
				if(this.cooldown > 0) {
					this.cooldown--;
				} else {
					this.spawn(4);
					this.cooldown = this.fireRate;
				}
			}
	
			if (this.hp < 0.75*this.maxHp) {
				if(this.teleportCooldown > 0) {
					this.teleportCooldown--;
				} else {
					this.teleport();
					this.teleportCooldown = this.teleportRate;
				}
			}
		} else {
			if (dist < 400 && this.hasMove == true) {
				this.speed = this.player.speed*0.9;
			}
		
	
			if (dist < this.player.radius && this.hasMove == true) {
				this.dx = 0;
				this.dy = 0;
			}
			if (dist < this.player.radius + this.radius + 5 ) {
				if(this.cooldown > 0) {
					this.cooldown--;
				} else {
					if (this.weapons[0] != null)this.weapons[0].use();
					this.cooldown = this.fireRate;
				}
			}
		}



		var x=this.x+this.dx*this.speed;
		var y=this.y+this.dy*this.speed;



		return {"x":x,"y":y};

	}

	spawn(n) {
		var trial = 10;
		while (n>0 && trial > 0) {
			var x=Math.max(this.x+Math.floor((Math.random()*this.radius*8))-this.radius*4,20); 
			var y=Math.max(this.y+Math.floor((Math.random()*this.radius*8))-this.radius*4,20);
			var enemy = new Zombie(this.stage, x, y, this.player);
			if (!this.stage.isHit(x,y,enemy.radius)) {
				this.stage.addActor(enemy);
				n--;
			}
			trial--;
		}

	}

	teleport() {
		var trial = 10;
		while (trial > 0) {
			var x=this.stage.width/4+Math.floor((Math.random()*this.stage.width/2)); 
			var y=this.stage.height/4+Math.floor((Math.random()*this.stage.height/2)); 
			if (!this.stage.isHit(x,y,this.radius)) {
				this.x = x;
				this.y = y;
				return;
			}
			trial--;
		}
	}

	isHit(x,y,d) {
		if (this.hp<=0.25*this.maxHp && this.stage.player.isHit(this.x,this.y,this.radius+10)) {
			this.hp = 0;
			this.isDead();
		}
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {

			return true;
		}
		return false;
	}

	isDead() {
		if (this.hp <= 0) {
			if (this.mine == null){
				this.mine = new Mine(this.stage, this.x, this.y,0);
				this.mine.damage = 100;
				this.stage.addActor(this.mine);
				this.mine.isHit(this.x,this.y,this.radius);
				this.stage.removeActor(this);
				for (var i = 0; i<this.items.length;i++) {
					this.items[i].x = this.x;
					this.items[i].y = this.y;
					this.stage.addActor(this.items[i]);
				}
			}

			
			return true;
		}
		return false;
	}

	



}