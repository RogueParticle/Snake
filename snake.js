var init = 0;

var snakeGrid = new grid(40,"#A9A9A9");
snakeGrid.draw();

var snake = new snake();
snake.init();

var col = new collision();

var level = 1;

var controlPanel = new panel();
//controlPanel.init();
controlPanel.lengthDisplay.update(snake.length);
controlPanel.levelDisplay.update(level);

var delayMax = 80;
var delay = delayMax; //milliseconds
var speed = delayMax - delay;
var delayCountMax = 5;
var delayCount = delayCountMax;
controlPanel.speedDisplay.update(speed);

var keyboard = new KeyboardState();

var intervalValue = setInterval(drawScreen, 1);
			
function rand(randMin,randMax) {
	return Math.floor(Math.random() * (randMax - randMin + 1)) + randMin;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		var newDate = (new Date().getTime() - start);
		if (newDate > milliseconds){
			break;
		}
	}
}

function kbdUpdate() {

	keyboard.update();

	if ( keyboard.down("left") && (snake.direction == 0 || snake.direction == 2)){
		snake.direction = 3;
		snake.segmentDirection[0] = 3;
	}
	if ( keyboard.down("right") && (snake.direction == 0 || snake.direction == 2)){
		snake.direction = 1;
		snake.segmentDirection[0] = 1;
	}
	if ( keyboard.down("up") && (snake.direction == 3 || snake.direction == 1)){
		snake.direction = 0;
		snake.segmentDirection[0] = 0;
	}
	if ( keyboard.down("down") && (snake.direction == 3 || snake.direction == 1)){
		snake.direction = 2;
		snake.segmentDirection[0] = 2;
	}
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function grid(gridCount,gridColor) {
	this.canvas = document.getElementById('gridCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.gridCount = gridCount;
	this.center = this.gridCount/2;
	this.cWidth = this.canvas.width;
	this.cHeight = this.canvas.height;
	this.cellWidth = this.cWidth/this.gridCount;
	this.cellCenter = this.cellWidth/2;
	this.gridColor = gridColor;
	
	this.draw = function(){
		this.ctx.beginPath();
		this.lineWidth = 1;
		var gridX = 0;
		for (i=0; i<gridCount; i++){
			this.ctx.beginPath();
			this.ctx.moveTo(gridX,0);
			this.ctx.lineTo(gridX,this.cHeight);
			var iMod = i%10;
			if (iMod == 0) {
				this.ctx.strokeStyle = 'black';
			} else {
				this.ctx.strokeStyle = gridColor;
			}
			this.ctx.stroke();
			gridX += this.cellWidth;
		}
		var gridY = 0;
		for(i=0; i<gridCount; i++){
			this.ctx.beginPath();
			this.ctx.moveTo(0,gridY);
			this.ctx.lineTo(this.cHeight,gridY);
			iMod = i%10
			if (iMod == 0) {
				this.ctx.strokeStyle = 'black';
			} else {
				this.ctx.strokeStyle = gridColor;
			}

			this.ctx.stroke();
			gridY += this.cellWidth;
		}
	}
	
	this.cellEdges = function (x,y) {
		var c = new Array(18);
	
		c[0] = ((x - 1) * this.cellWidth); // top left corner x
		c[1] = ((y - 1) * this.cellWidth); // top left corner y
		c[2] = c[0] + this.cellCenter;  // top center x
		c[3] = c[1]; // top center y
		c[4] = c[2] + this.cellCenter; // top right x
		c[5] = c[1]; // top right y
	
		c[6] = c[4]; // right center x
		c[7] = c[5] + this.cellCenter; // right center y
		c[8] = c[4]; // bottom right x
		c[9] = c[7] + this.cellCenter; // bottom right y
	
		c[10] = c[2]; // bottom center x
		c[11] = c[9]; // bottom center y
		c[12] = c[0]; // bottom left x
		c[13] = c[9]; // bottom left y
	
		c[14] = c[0]; // left center x
		c[15] = c[7]; // left center y
		c[16] = c[2]; // center x
		c[17] = c[7]; // center y
	
		return c;
	}
}

function snake() {
	this.canvas = document.getElementById('snakeCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.segmentRadius = snakeGrid.cellCenter;

	this.snakeX = new Array();
	this.snakeY = new Array();
	this.segmentDirection = [];
	this.direction = rand(0,3);
	this.directionCountMax = 20;
	this.directionCount = rand(this.directionCountMax - 10,this.directionCountMax);
	
	this.length = 35;
	this.lengthCountMax = 30;
	this.lengthCount = 0;

	this.collisionDetected = false;
	this.collisionX;
	this.collisionY;

	this.backColor = '#ffff00';
	this.snakeColor = '#008000';
	this.ctx.fillStyle = this.backColor;
	this.ctx.fillRect(0,0,snakeGrid.cWidth,snakeGrid.cHeight);

	this.init = function () {
		this.snakeX[0] = rand(snakeGrid.center - 5, snakeGrid.center + 5);
		this.snakeY[0] = rand(snakeGrid.center - 5, snakeGrid.center + 5);
		this.segmentDirection[0] = this.direction;
		this.drawHead();

		for (i = 1; i < this.length; i++ ) {
			if (this.direction == 0) { // up
				this.snakeX[i] = this.snakeX[i - 1];
				this.snakeY[i] = this.snakeY[i - 1] + 1;
				if (this.snakeY[i] > snakeGrid.gridCount - 1) {
					this.snakeY[i] = snakeGrid.gridCount - 1;
					this.changeDirection();
				}
			} else if(this.direction == 1) { // right
				this.snakeX[i] = this.snakeX[i - 1] - 1;
				this.snakeY[i] = this.snakeY[i - 1];
				if (this.snakeX[i] < 2) {
					this.snakeX[i] = 2;
					this.changeDirection();
				}
			} else if(this.direction == 2) { // down
				this.snakeX[i] = this.snakeX[i - 1];
				this.snakeY[i] = this.snakeY[i - 1] - 1;
				if (this.snakeY[i] < 2) {
					this.snakeY[i] = 2;
					this.changeDirection();
				}
			} else if(this.direction == 3) { // left
				this.snakeX[i] = this.snakeX[i - 1] + 1;
				this.snakeY[i] = this.snakeY[i - 1];
				if (this.snakeX[i] > snakeGrid.gridCount - 1) {
					this.snakeX[i] = snakeGrid.gridCount -1;
					this.changeDirection();
				}
			}
			this.segmentDirection[i] = this.direction;
			this.drawSegment(this.snakeX[i], this.snakeY[i], this.snakeColor,true);
			this.directionCount--;
			if (this.directionCount == 0) {
				this.changeDirection();
			}
		}		
		this.drawTail();
		this.directon = this.segmentDirection[0];
	}

	this.changeDirection = function () {
		if( this.direction == 0 || this.direction == 2) { // if up or down, change to right or left
			if( rand(0,1) == 0 ) {
				this.direction = 1;
			} else {
				this.direction = 3;
			}
		} else if ( this.direction == 1 || this.direction == 3) { // if left or right, change to up or down
			if( rand(0,1) == 0) {
				this.direction = 2;
			} else {
				this.direction = 0;
			}
		}
		this.directionCount = rand(this.directionCountMax - 10,this.directionCountMax);
	}
	
	this.moveSnake = function () {
	
		this.grow();
	
		this.x;
		this.y;

		this.direction = this.segmentDirection[0]; // get current head direction.
		
		//erase old head and tail
		this.eraseCell(this.snakeX[0], this.snakeY[0]);
		this.eraseCell(this.snakeX[this.length - 1], this.snakeY[this.length - 1]);

		//update snake body
		for (i = this.length - 1; i > 0; i--) {
			this.snakeX[i] = this.snakeX[i - 1];
			this.snakeY[i] = this.snakeY[i - 1];
			this.drawSegment(this.snakeX[i], this.snakeY[i], this.snakeColor, false);
			this.segmentDirection[i] = this.segmentDirection[i - 1];
		}

		//calculate head
		if ( this.direction == 0) {
			this.snakeY[0]--;
		} else if (this.direction == 1) {
			this.snakeX[0]++;
		} else if (this.direction == 2) {
			this.snakeY[0]++;
		} else {
			this.snakeX[0]--;
		}
		//if (this.snakeY[0] < 2) this.changeDirection(); // this.snakeY[0] = snakeGrid.gridCount;
		//if (this.snakeY[0] > snakeGrid.gridCount - 1) this.changeDirection() //this.snakeY[0] = 1;
		//if (this.snakeX[0] < 2) this.snakeX[0] = snakeGrid.gridCount;
		//if (this.snakeX[0] > snakeGrid.gridCount) this.snakeX[0] = 1;
	
		this.segmentDirection[0] = this.direction;
	
		this.drawTail();
		if (this.checkCollision(this.snakeX[0], this.snakeY[0])) this.collisionDetected = true;
		this.drawHead();

		return true;
	}
	
	this.drawHead = function () {
		var x = this.snakeX[0];
		var y = this.snakeY[0];
	
		var edges = snakeGrid.cellEdges(x,y);
		var point1x, point1y, point2x, point2y, point3x, point3y, point4x, point4y, point5x, point5y;
	
		if ( this.direction == 0 ) {	//up
			point1x = edges[2]; //nose x
			point1y = edges[3]; //nose y
			point2x = edges[6]; //right cheek x
			point2y = edges[7]; //right cheek y
			point3x = edges[8]; //right jaw x
			point3y = edges[9]; //right jaw y
			point4x = edges[12]; //left jaw x
			point4y = edges[13]; //left jaw y
			point5x = edges[14]; //left cheek x
			point5y = edges[15]; //left cheek y
		} else if (this.direction == 1 ) { // right
			point1x = edges[6]; //nose x
			point1y = edges[7]; //nose y
			point2x = edges[10]; //right cheek x
			point2y = edges[11]; //right cheek y
			point3x = edges[12]; //right jaw x
			point3y = edges[13]; //right jaw y
			point4x = edges[0]; //left jaw x
			point4y = edges[1]; //left jaw y
			point5x = edges[2]; //left cheek x
			point5y = edges[3]; //left cheek y
		} else if (this.direction == 2) { // down
			point1x = edges[10]; //nose x
			point1y = edges[11]; //nose y
			point2x = edges[14]; //right cheek x
			point2y = edges[15]; //right cheek y
			point3x = edges[0]; //right jaw x
			point3y = edges[1]; //right jaw y
			point4x = edges[4]; //left jaw x
			point4y = edges[5]; //left jaw y
			point5x = edges[6]; //left cheek x
			point5y = edges[7]; //left cheek y
		} else if (this.direction == 3) { // left
			point1x = edges[14]; //nose x
			point1y = edges[15]; //nose y
			point2x = edges[2]; //right cheek x
			point2y = edges[3]; //right cheek y
			point3x = edges[4]; //right jaw x
			point3y = edges[5]; //right jaw y
			point4x = edges[8]; //left jaw x
			point4y = edges[9]; //left jaw y
			point5x = edges[10]; //left cheek x
			point5y = edges[11]; //left cheek y
		}
	
		this.ctx.beginPath();
		this.ctx.moveTo(point1x, point1y);
		this.ctx.lineTo(point2x, point2y);
		this.ctx.lineTo(point3x, point3y);
		this.ctx.lineTo(point4x, point4y);
		this.ctx.lineTo(point5x, point5y);
		this.ctx.fillStyle = this.snakeColor;
		this.ctx.fill();
		this.ctx.closePath();
	
		return true;
	}
	
	this.drawTail = function() {
	
		var x = this.snakeX[this.length - 1];
		var y = this.snakeY[this.length - 1];
		var tailDirection = this.segmentDirection[this.length - 1];
	
		//erase new tail square to make room for new tail
		this.eraseCell(x,y);
		
		//draw new tail
		var point1x, point1y, point2x, point2y, point3x, point3y;
	
		var edges = snakeGrid.cellEdges(x,y);
	
		if ( tailDirection == 0 ) { // up
			point1x = edges[0]; //top left corner
			point1y = edges[1];
			point2x = edges[4] //top right corner
			point2y = edges[5];
			point3x = edges[10]; // bottom center
			point3y = edges[11];
		} else if (tailDirection == 1) { // right
			point1x = edges[4]; // top right corner
			point1y = edges[5];
			point2x = edges[8]; // bottom right corner
			point2y = edges[9];
			point3x = edges[14]; // left center
			point3y = edges[15];
		} else if (tailDirection == 2) { // down
			point1x = edges[8]; // bottom right corner
			point1y = edges[9];
			point2x = edges[12]; // bottom left corner
			point2y = edges[13];
			point3x = edges[2]; //top center
			point3y = edges[3];
		} else if (tailDirection == 3) { // left
			point1x = edges[12]; // bottom left corner
			point1y = edges[13];
			point2x = edges[0]; // top left corner
			point2y = edges[1];
			point3x = edges[6]; // right center
			point3y = edges[7];
		}
	
		this.ctx.beginPath();
		this.ctx.moveTo(point1x, point1y);
		this.ctx.lineTo(point2x, point2y);
		this.ctx.lineTo(point3x, point3y);
		this.ctx.fillStyle = this.snakeColor;
		this.ctx.fill();
		this.ctx.closePath();

		return true;
	}

	this.drawSegment = function (x,y,color, init) {
		
		if ( this.checkCollision(x,y) && init) {
			
			this.changeDirection();
			
		} else {
		
			var edges = snakeGrid.cellEdges(x,y);
		
			this.ctx.beginPath();
			this.ctx.arc(edges[16], edges[17], this.segmentRadius, 0, 2*Math.PI);
			this.ctx.fillStyle = color;
			this.ctx.fill();
			this.ctx.closePath();
		}
	}

	this.eraseCell = function (x,y) {
		
		var edges = snakeGrid.cellEdges(x,y); 
	
		this.ctx.beginPath();
		this.ctx.rect(edges[0], edges[1], snakeGrid.cellWidth,snakeGrid.cellWidth);
		this.ctx.fillStyle = this.backColor;
		this.ctx.fill();
		this.ctx.closePath();
	}
	
	this.checkCollision = function (x,y){
		var collision = false;
	
		var edges = snakeGrid.cellEdges(x,y);
	
		data = this.ctx.getImageData(edges[16], edges[17], 1, 1).data;
		var color = rgbToHex(data[0], data[1], data[2]);
	
		if ( color == this.snakeColor || x == snakeGrid.gridCount || x == 1 || y == snakeGrid.gridCount || y == 1){
			collision = true;
			this.collisionX = edges[16];
			this.collisionY = edges[17];
		} else {
			collision = false;
		}
	
		return collision
	}

	this.grow = function(){

		this.lengthCount++;
		if ( this.lengthCount > this.lengthCountMax ) {
		
			this.length++;
			controlPanel.lengthDisplay.update(this.length);
			this.lengthCount = 0;
		
			delayCount--;
			if ( delayCount < 0) {
				delay--;
				speed = delayMax - delay;
				controlPanel.speedDisplay.update(speed);
				delayCount = delayCountMax;
				//when delay is evenly divisable by 10, bump the level
				var delayMod = delay % 10;
				if ( delayMod == 0) {
					level++;
					controlPanel.levelDisplay.update(level);
				}
			}
		}
	}	
}

function collision() {
	
	this.canvas = document.getElementById('explosionCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.cWidth = this.canvas.width;
	this.cHeight = this.canvas.height;

	this.pct = 1/7;
	this.expRadius = 5;
	this.expRadiusMax = 100;
	this.expCenterX;
	this.expCenterY;
	this.expRed1Color = 'rgba(128, 0, 0, 1)'; //Maroon
	this.expRed1Pct = this.pct*7;
	this.expRed2Color = 'rgba(255, 0, 0, 1)'; // Red
	this.expRed2Pct = this.pct*6;
	this.expOrange1Color = 'rgba(204, 102, 0, .90)'; // Dark Orange
	this.expOrange1Pct = this.pct*5;
	this.expOrange2Color = 'rgba(255, 153, 0, .90)'; // Orange
	this.expOrange2Pct = this.pct*4;
	this.expYellow1Color = 'rgba(255, 255, 0, .80)'; // Yellow
	this.expYellow1Pct = this.pct*3;
	this.expYellow2Color = 'rgba(255, 255, 153, .80)'; // Light Yellow
	this.expYellow2Pct = this.pct*2;
	this.expWhiteColor = 'rgba(255, 255, 255, .70)'; // white
	this.expWhitePct = this.pct;
	this.expPhase = 1;

	this.explosion = function() {
		this.expCenterX = snake.collisionX;
		this.expCenterY = snake.collisionY;
		this.ctx.clearRect(0,0,this.cWidth,this.cHeight);
		this.grd = this.ctx.createRadialGradient(this.expCenterX,this.expCenterY,1,this.expCenterX,this.expCenterY,this.expRadius);
		this.grd.addColorStop(this.expWhitePct,this.expWhiteColor);
		this.grd.addColorStop(this.expYellow2Pct,this.expYellow2Color);
		this.grd.addColorStop(this.expYellow1Pct,this.expYellow1Color);
		this.grd.addColorStop(this.expOrange2Pct,this.expOrange2Color);
		this.grd.addColorStop(this.expRed2Pct,this.expRed2Color);
		this.grd.addColorStop(this.expRed1Pct,this.expRed1Color);
	
		this.ctx.beginPath();
		this.ctx.arc( this.expCenterX, this.expCenterY, this.expRadius, 0, 2*Math.PI );
		this.ctx.fillStyle = this.grd;
		this.ctx.fill();
		this.ctx.closePath();
	
		if (this.expPhase == 1) {
			this.expRadius++
			if(this.expRadius > this.expRadiusMax) {
				this.expPhase = 2;
			}
		} else if (this.expPhase == 2){
			sleep(50);
			this.expRadius--
			if (this.expRadius < snake.segmentRadius) {
				this.expPhase = 3;
				this.ctx.clearRect(0,0,this.cWidth,this.cHeight);
			} 
		} else {
			return;
		}
	}
}

function panel() {

	this.canvas = document.getElementById('controlCanvas');
	this.ctx = this.canvas.getContext('2d');
	
	this.ctx.fillStyle = '#a9a9a9';
	this.ctx.fillRect(0,0,400,400);
	
	this.offset = 50;
	this.ctx.font = '30px Arial';
	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = 'left';
	this.ctx.fillText('Level', 10, this.offset);
	this.ctx.fillText('Snake Length', 10, this.offset * 2)
	this.ctx.fillText('Speed', 10, this.offset * 3);
	
	this.lengthDisplay = new display(2,this.ctx, this.offset);
	this.levelDisplay = new display(1,this.ctx, this.offset);
	this.speedDisplay = new display(3,this.ctx, this.offset);
		
	function display(displayNumber, ctx, offset) {
		this.x = 380;
		this.offset = offset;
		this.y = (displayNumber * this.offset);
		this.ctx = ctx;
		
		this.lineWidth = 1;

		this.ctx.beginPath();
		this.ctx.moveTo(this.x-91,this.y-16);
		this.ctx.lineTo(this.x+11,this.y-16);
		this.ctx.lineTo(this.x+11,this.y+16);
		this.ctx.strokeStyle = '#333333';
		this.ctx.stroke();
		this.ctx.closePath();
		
		this.ctx.beginPath();
		this.ctx.moveTo(this.x-91,this.y-16);
		this.ctx.lineTo(this.x-91,this.y+16);
		this.ctx.lineTo(this.x+11,this.y+16);
		this.ctx.strokeStyle = '#f2f2f2';
		this.ctx.stroke();
		this.ctx.closePath();
		
		this.update = function(text) {
			this.ctx.font = '30px Ariel';
			this.ctx.fillStyle = 'blue';
			this.ctx.textAlign = 'right';
			this.ctx.clearRect(this.x-90, this.y-15, 100, 30);
			this.ctx.fillText(text.toString(), this.x, this.y+ 10 );
			
		}
	}

}

function drawScreen(){

	if (!snake.collisionDetected){
		kbdUpdate();
		sleep(delay)
		snake.moveSnake();
		//manageLevel();
		//controlPanel.update();
	} else {
		col.explosion();
		return;
	}
}
