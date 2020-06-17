// generic class for objects that exist on the canvas
class Actor {
	constructor(stage, x, y){
		this.stage = stage;
		this.x=x;
		this.y=y;
		this.hp=1;
	}
	step(){}
	draw(){}
	isHit(x,y,d) {
		return false;
	}
	bounceOff(x,y,d){
		return {"x":x,"y":y};
	}
	isDead() {
		if (this.hp <= 0) {
			this.stage.removeActor(this);
			return true;
		}
		return false;
	}

}
