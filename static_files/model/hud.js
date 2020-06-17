class HUD {
    constructor(player, stage) {
        // reference to necessary game objects
        this.player = player;
        this.stage = stage;
        this.canvas = this.stage.canvas;
        this.actors = this.stage.actors;
        this.hp = this.player.hp;
        this.maxHp = this.player.maxHp;
        this.ammo = [this.player.weapons[0].hp,
                    this.player.weapons[2].hp,
                    this.player.weapons[3].hp
                ];
        this.mag = this.player.weapons[0].mag;
        this.magMax = this.player.weapons[0].magMax;
        this.maxAmmo = this.player.weapons[0].maxHp;
        this.bulletLevel = this.player.weapons[0].bulletLevel;
        this.weaponIndex = this.player.weaponIndex;
        this.isReloading = this.player.weapons[0].isReloading;

        // hud constants 
        this.barWidth = 30;
        this.barLengthScale = 20;
        this.colorBlack = "rgba(0,0,0)";
        this.colorGray = "rgba(100,100,100)";
        this.colorWhite = "rgba(255,255,255,1)";
        this.colorRed = "rgba(207,0,15,1)";
        // gray, blue, purple, gold
        this.rarities = ["rgba(100,100,100)", "rgba(56,156,255,1)", "rgba(159,56,255,1)", "rgba(245,192,0,1)"];

        // hud images
        var gunIcon = new Image();
		gunIcon.src = '../img/gun.png';
        var hookIcon = new Image();
		hookIcon.src = '../img/hook.png';
        var grenadeIcon = new Image();
        grenadeIcon.src = '../img/grenadeIcon.png';
        var mineIcon = new Image();
		mineIcon.src = '../img/mineIcon.png';
        this.icons = [gunIcon, hookIcon, grenadeIcon,mineIcon];

        // for timer
        var clockIcon = new Image();
        clockIcon.src = '../img/clock.png';
        this.clockIcon = clockIcon;

        // for kill count
        var killsIcon = new Image();
        killsIcon.src = '../img/skull.png';
        this.killsIcon = killsIcon;

        // minimap images
        var zombieIcon = new Image();
        zombieIcon.src = '../img/mmZombie.jpg';
        this.zombieIcon = zombieIcon;
        var grassIcon = new Image();
        grassIcon.src = '../img/mmGrass.png';
        this.grassIcon = grassIcon;
        var playerIcon = new Image();
        playerIcon.src = '../img/mmPlayer.png';
        this.playerIcon = playerIcon;
        
        
    }


    step(){
        // check our ammo/health from the player, update the values here
        this.hp = this.player.hp;
        this.ammo[0] = this.player.weapons[0].hp;
        this.ammo[1] = this.player.weapons[2].hp;
        this.ammo[2] = this.player.weapons[3].hp;
        this.bulletLevel = this.player.weapons[0].bulletLevel;
        this.mag = this.player.weapons[0].mag;
        this.magMax = this.player.weapons[0].magMax;
        this.weaponIndex = this.player.weaponIndex;
        this.isReloading = this.player.weapons[0].isReloading;


        
        // check the canvas from the stage, update what is visible
        
    }

    draw(context){
        // draw the hud display in static spots on the screen
        context.save();
        context.beginPath();
        context.translate(this.player.x-150,this.player.y-150);
        this.writeGameOver(context);
        context.closePath();
        context.restore();


        context.save();
        context.beginPath();

        context.translate(this.player.x - (this.canvas.width/2)+50,this.player.y - (this.canvas.height/2)+25);
        if (this.stage.boss != null) {
            this.drawHp(context,this.stage.boss);
        }
        
        // go to spot for hp and draw
        context.translate(0, 2*(this.canvas.height/2)-75);
        this.drawHp(context,this.player);


        // go to spot for ammo and draw
        context.translate(this.canvas.width-450,-40); // 200 away from the end of the screen
        this.drawAmmo(context); 

        // go to spot for minimap and draw
        context.resetTransform();
        context.translate(50, 65);
        this.drawMinimap(context);

        // cleanup
        context.closePath();
        context.restore();
    }

    drawHp(context,actor){        
        // draw the backing in gray
        context.fillStyle = this.colorGray;
        var barLengthScale = Math.min(this.stage.width/2/actor.maxHp,this.barLengthScale);
        context.fillRect(0, 0, actor.maxHp*barLengthScale,
             this.barWidth);
        context.fill();

        // draw the outline
        context.strokeStyle = this.colorBlack;
        context.lineWidth = 3;
        context.strokeRect(0, 0, actor.maxHp*barLengthScale,
            this.barWidth); 
        
        // transition health to red as it gets lower
        var r = 255 - (255/actor.maxHp)*actor.hp;
        var g = (255/actor.maxHp)*actor.hp*2;
        context.fillStyle = "rgba("+r+","+g+",0,1)";
        context.fillRect(0, 0, Math.max(actor.hp*barLengthScale,0),30);
        context.fill(); 
    }
    
    drawAmmo(context){

        // make this a loop?
        this.drawHudWeapon(context, this.rarities[this.bulletLevel], 0);
        this.writeAmmo(context, 0);
        if (this.weaponIndex == 0) {
            context.translate(0, -30);
            this.writeBullets(context);
            context.translate(0, 30);
        }

        context.translate(100, 0);
        this.drawHudWeapon(context, this.colorGray, 1);

        context.translate(100, 0);
        this.drawHudWeapon(context, this.colorGray, 2);
        this.writeAmmo(context, 1);

        context.translate(100, 0);
        this.drawHudWeapon(context, this.colorGray, 3);
        this.writeAmmo(context, 2);


        context.translate(-30,-this.canvas.height+100);
        this.writeTime(context);
        context.translate(5, 40);
        this.writeKills(context);
        
		context.closePath();
        context.restore();
    }

    // for displaying weapons on hud
    drawHudWeapon(context, color, weapon) {
        context.fillStyle = color;
        context.fillRect(0, 0, 70, 70);
        context.fill();
        context.drawImage(this.icons[weapon],0,0);

        if (weapon == this.weaponIndex) {
            context.strokeStyle = this.colorWhite;
        } else {
            context.strokeStyle = this.colorBlack;
        }
        context.lineWidth = 3;
        context.strokeRect(0, 0, 70, 70);
    }

    // 0 for gun, 2 for grenades
    writeAmmo(context, weapon) {
        context.fillStyle = this.colorWhite;
		context.font = "20px Arial";
        context.fillText(this.ammo[weapon], 3, 20); 
    }

    writeBullets(context) {
        context.fillStyle = this.colorWhite;
        context.font = "20px Arial";
        context.fillText(this.mag + '/' + this.magMax, 0, 20); 
        if (this.isReloading) {
            context.fillText('Reloading....', 50, 20); 
        }  

    }

    writeTime(context) {
        context.drawImage(this.clockIcon,0,0);
        context.fillStyle = this.colorWhite;
		context.font = "30px Arial";
        context.fillText(Math.floor(this.stage.time/50), 50, 30); 
    }

    writeGameOver(context){
        var msg;
        if (this.stage.isGameOver() && this.stage.endGame <= 50) {
            if (this.player.isDead()) {
                msg = "YOU DIED";
            } else {
                msg = "YOU WIN";
            }
            context.fillStyle = this.colorWhite;
            context.font = "50px Permanent Marker";
            var msg;
            context.fillText(msg, 50, 20); 
        }

    }
    
    writeKills(context) {
        context.drawImage(this.killsIcon,0,0);
        context.fillStyle = this.colorWhite;
		context.font = "30px Arial";
        context.fillText(this.player.kills, 45, 30); 
    }

    drawMinimap(context) {
        // draw the game world at 10% scale
        context.save();
        context.globalAlpha = 0.5;
        var x = stage.width*0.1;
        var y = stage.height*0.1;
        context.drawImage(this.grassIcon, 0, 0);
        context.strokeStyle = this.colorWhite; // outline
        context.strokeRect(0, 0, x, y);
        
        context.fillStyle = this.colorGray;
        context.fillRect(x/2-10,y/2-10, 20, 20);
        

        for(var i=0;i<this.actors.length;i++){
			if (this.actors[i] instanceof Enemy) {
                var enemy = this.actors[i];
                context.drawImage(this.zombieIcon, enemy.x*0.1 - 10, enemy.y*0.1 -10);
            } else if (this.actors[i] instanceof Player) {
                var player = this.actors[i];
                context.drawImage(this.playerIcon, player.x*0.1 - 10, player.y*0.1 -10);
            }
        }
        context.restore(); 
    }




}