class Item extends Actor {

    isHit(x,y,d) {
		if (((x-this.x)**2+(y-this.y)**2)<= (this.radius+d)**2) {
			return true;
		}
		return false;
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

// refill box at the center of the house
class Ammunition extends Item {
	constructor(stage, x, y) {
		super(stage, x, y);
		this.colour = 'rgba(200,200,200,1)';
		this.hp = 25;
        this.radius = 20;
        
        var ammoBoxSprite = new Image();
		ammoBoxSprite.src = '../img/ammoBox.png';
		this.image = ammoBoxSprite;
	}
    
	hit(actor) {
        if (actor instanceof Player && !(actor instanceof Enemy)){
            for (var i = 0;i<actor.weapons.length;i++) {
                if (actor.weapons[i] instanceof Gun) {
                    actor.weapons[i].hp = actor.weapons[i].maxHp;
                }	
            }
        }
    }
    
    draw(context){
		context.save();
		context.beginPath(); 
        context.translate(this.x,this.y);
        context.shadowBlur = 5;
        context.shadowColor = "white";
		context.translate(-50,-50); // move half length back of sprite
		context.drawImage(this.image,0,0);
		context.closePath();
		context.restore();
	}


}

class BulletUpgrade extends Item {
	constructor(stage, x, y) {
		super(stage, x, y);
		this.colour = 'rgba(0,0,0,1)';
        this.radius = 5;
        var bulletSprite = new Image();
		bulletSprite.src = '../img/bullet.png';
		this.image = bulletSprite;
    }
    hit(actor) {
        if (actor instanceof Player && !(actor instanceof Enemy)){
            for (var i = 0;i<actor.weapons.length;i++) {
                if (actor.weapons[i] instanceof Gun) {
                    if (actor.weapons[0].bulletLevel != actor.weapons[0].bulletLevelMax) {
                        actor.weapons[i].bulletLevel++;
                        this.stage.removeActor(this);
                    }
                }	
            }	
        }

    }
    
    draw(context){
		context.save();
		context.beginPath(); 
        context.translate(this.x,this.y);
        context.shadowBlur = 5;
        context.shadowColor = "white";
		context.translate(-20,-20); // move half length back of sprite
		context.drawImage(this.image,0,0);
		context.closePath();
		context.restore();
	}
}

class AmmunitionUpgrade extends Item {
	constructor(stage, x, y) {
		super(stage, x, y);
		this.colour = 'rgba(200,200,200,1)';
        this.radius = 5;
        var ammoSprite = new Image();
		ammoSprite.src = '../img/ammo.png';
		this.image = ammoSprite;
    }
    hit(actor) {
        for (var i = 0;i<actor.weapons.length;i++) {
            if (actor.weapons[i] instanceof Gun) {
                // increase total bullets by 10, current bullets by 10
                actor.weapons[i].maxHp+=10;
                actor.weapons[i].hp+=10;
                if (actor.weapons[i].hp > actor.weapons[i].maxHp) {
                    actor.weapons[i].hp = actor.weapons[i].maxHp;
                }
                actor.weapons[i].reloadTime-=500;
                actor.weapons[i].magMax+=3;
                actor.weapons[i].ammoLevel++;
                this.stage.removeActor(this);
            }	
        }	
    }
    draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x,this.y);
        context.shadowBlur = 5;
        context.shadowColor = "white";
		context.translate(-20,-20); // move half length back of sprite
		context.drawImage(this.image,0,0);
		context.closePath();
		context.restore();
	}
}

class HealthPad extends Item {
	constructor(stage, x, y) {
		super(stage, x, y);
		this.colour = 'rgba(0,200,0,1)';
        this.radius = 5;
        var healthSprite = new Image();
		healthSprite.src = '../img/health.png';
		this.image = healthSprite;
        
    }
    hit(actor) {
        if (actor instanceof Player && !(actor instanceof Enemy)){
            actor.hp +=5;
            if (actor.hp > actor.maxHp) {
                actor.hp = actor.maxHp;
            }
            this.stage.removeActor(this);
        }
    }
    
    draw(context){
		context.save();
		context.beginPath(); 
		context.translate(this.x,this.y);
        context.shadowBlur = 5;
        context.shadowColor = "white";
		context.translate(-20,-20); // move half length back of sprite
		context.drawImage(this.image,0,0);
		context.closePath();
		context.restore();
	}
}


function getItem(type,stage, x, y) {
    var item = null;
    var gun = stage.player.weapons[0];
    if (type == 0) {
        item = new Grenade(stage,x,y);
    } else if (type == 1 && (gun.bulletLevel != gun.bulletLevelMax)) {
        item = new BulletUpgrade(stage, x,y);
    } else if (type == 2 && (gun.ammoLevel != gun.ammoLevelMax)) {
        item = new AmmunitionUpgrade(stage, x, y);
    } else {
        item = new HealthPad(stage,x,y);
    }
    return item;
}