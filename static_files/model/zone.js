// Shrinking play area
class Zone extends Actor {
    constructor(stage, x, y,w,h){
        super(stage, x, y);
        this.radius = w/2;
        this.hp=1;
        this.w = w;
        this.h = h;
        this.speed = 0.025;
        this.min = 200;
    }

    
    hit() {
        var x = this.stage.player.x;
		var y = this.stage.player.y;
        var d = this.stage.player.radius;
        // if the player is in the zone, decrease hp
        if (((x-this.x)**2+(y-this.y)**2) > (this.radius+d)**2) {
            this.stage.player.hp -= 1;
        }
    
    }

    step() {
        // reduce size on each step
        if (this.radius > this.min) {
            this.radius -=this.speed;
        }
        
        this.hit();
    }

    draw(context){

        context.save();
        context.beginPath(); 
        context.fillStyle = "rgba(100,100,100,0.2)";
        context.arc(this.x, this.y , this.radius, 0, 2 * Math.PI, false); 
        context.translate(this.x-this.w/2,this.y+this.h/2);
        context.rect(0,0,this.w,-this.h);
        context.fill();
		context.closePath();
        context.restore();
        


    }



}