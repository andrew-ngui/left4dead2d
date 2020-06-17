class Mass extends Actor {
	constructor(stage, x, y) {
		super(stage, x, y);
		this.colour = 'rgba(0,200,0,1)';
		this.radius = 30;
		this.hp = 2;

		var rockSprite = new Image();
		rockSprite.src = '../img/rock.png';
		var treeSprite = new Image();
		treeSprite.src = '../img/tree.png';
		this.image = [rockSprite, treeSprite];
		this.imgChoice = randint(2);
	}

	isHit(x,y,d) {
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {
			return true;
		}
		return false;
	}

	bounceOff(player) {
		var x = player.nextMove().x;
		var y = player.nextMove().y;
		var dx = (x-this.x);
		var dy = (y-this.y);
		var s = (this.radius+player.radius)/Math.sqrt(dx**2+dy**2)+0.01;
		return {"x":this.x+s*dx,"y":this.y+s*dy};
	}

	draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x,this.y);
		if (this.imgChoice == 0) {
			context.translate(-75,-75); // move half length back of rock sprite
		} else if (this.imgChoice == 1) {
			context.translate(-150, -108); // move half length back of tree sprite
		}
	
		context.drawImage(this.image[this.imgChoice],0,0);
		context.fill(); 
		context.closePath();
		context.restore();
	}

}

class Wall extends Mass {
	constructor(stage, x, y,w,h) {
		super(stage, x, y);
		this.colour = 'rgba(0,200,0,1)';
		this.hp = 100;
		this.w = w;
		this.h = h;
		this.radius = Math.max(this.w,this.h)/2;
	}

	isHit(x,y,d) {
		if (x+d>=this.x-this.w/2 && x-d<=this.x+this.w/2 && 
			y-d<=this.y+this.h/2 && y+d>=this.y-this.h/2){

			return true;
		}
		return false;
	}

	bounceOff(player) {
		var x = player.x;
		var y = player.y;
		var dx = 0;
		var dy = 0;

		if (!this.isHit(player.x,player.nextMove().y,player.radius)){
			y = player.y + player.dy * player.speed;
		 }  else {
				if (Math.abs(player.y-this.y)<=this.h/2) {
					dy = 0
				} else {
					dy = (player.radius + this.h/2 + 0.01)-Math.abs(player.y-this.y);
					dy *= Math.sign(player.y-this.y);
				}
			y = y+dy;
		}
		if (!this.isHit(player.nextMove().x,player.y,player.radius)){
			x = player.x + player.dx * player.speed;
		} else {
			if (Math.abs(player.x-this.x)<=this.w/2) {
				dx = 0
			} else {
				dx = (player.radius + this.w/2 + 0.01)-Math.abs(player.x-this.x);
				dx *= Math.sign(player.x-this.x);
			}
			x = x+dx;
		}
		return {"x":x,"y":y};
	}

	draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x-this.w/2,this.y+this.h/2);
		context.fillStyle = "rgba(0,0,0)";
		context.fillRect(0,0,this.w,-this.h);
		context.closePath();
		context.restore();
	}
}	

class House extends Mass {
	constructor(stage, x, y, w, h,type) {
		super(stage, x, y);
		this.colour = 'rgba(0,200,0,1)';
		this.hp = 100;
		this.w = w;
		this.h = h;
		this.radius = Math.max(this.w,this.h)/2;
		this.walls = this.buildWalls(stage,x,y,w,h,type);
		this.floor = new Floor(stage,x,y,w-10,h-10);
	}

	buildWalls(stage,x, y, w, h, type){
		var walls = [new Wall(stage,x,y-h/2,w,10),
			new Wall(stage,x+w/2,y,10,h),
			new Wall(stage,x,y+h/2,w,10),
			new Wall(stage,x-w/2,y,10,h)
		];
		if (type == 4) {
			for (var i=0;i<4;i++){
				this.buildDoor(stage,x, y, w, h, walls, i);
			}
			walls.splice(0,4);
		} else {
			this.buildDoor(stage,x, y, w, h, walls, type);
			walls.splice(type,1);
		}

		return walls;
	}

	buildDoor(stage,x, y, w, h, walls, type) {
		
		if (type % 2 == 0){
			walls.push(new Wall(stage,x-w/2+w/8,walls[type].y,w/4,10));
			walls.push(new Wall(stage,x+w/2-w/8,walls[type].y,w/4,10));
		} else {
			walls.push(new Wall(stage,walls[type].x,y-h/2+h/8,10,h/4));
			walls.push(new Wall(stage,walls[type].x,y+h/2-h/8,10,h/4));
		}
	}

	isHit(x,y,d) {
	
		this.floor.isHit();
		for (var i = 0; i<this.walls.length;i++) {
			if (this.walls[i].isHit(x,y,d)) {
				return true;
			}
		}
		return false;

	}


	bounceOff(player) {
		for (var i = 0; i<this.walls.length;i++) {
			if (this.walls[i].isHit(player.nextMove().x,player.nextMove().y,player.radius)) {
				return this.walls[i].bounceOff(player);
			}
		}
		return {"x":player.x,"y":player.y};
	}

	draw(context){
		for (var i = 0; i<this.walls.length;i++) {
			this.walls[i].draw(context);
		}
		this.floor.draw(context);
	}

}

class Floor extends Actor {
	constructor(stage, x, y,w,h) {
		super(stage, x, y);
		this.colour = 'rgba(100,100,100,1)';
		this.hp = 1;
		this.w = w;
		this.h = h;
	}

	isHit() {
		var x = this.stage.player.x;
		var y = this.stage.player.y;
		var d = this.stage.player.radius;
		if (x+d>=this.x-this.w/2 && x-d<=this.x+this.w/2 && 
			y-d<=this.y+this.h/2 && y+d>=this.y-this.h/2){
			this.colour = 'rgba(100,100,100,0.2)';
			return true;
		}
		this.colour = 'rgba(100,100,100,1)';
		return false;
	}

	draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x-this.w/2,this.y+this.h/2);
		context.fillStyle = this.colour;
		context.fillRect(0,0,this.w,-this.h);
		context.closePath();
		context.restore();
	}


}