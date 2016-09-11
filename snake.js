var init = 0;

var canvas1 = document.getElementById('snakeCanvas');
var snakeCanvas = canvas1.getContext('2d');
var cWidth = canvas1.width;
var cHeight = canvas1.height;

var canvas2 = document.getElementById('gridCanvas');
var gridCanvas = canvas2.getContext('2d');

var canvas3 = document.getElementById('explosionCanvas');
var explosionCanvas = canvas3.getContext('2d');

var canvas4 = document.getElementById('controlCanvas');
var controlBoardCanvas = canvas4.getContext('2d');

var gridCount = 40;
var cellWidth = cWidth/gridCount;
var cellCenter = cellWidth/2;
var segmentRadius = cellCenter;

var snakeX = new Array();
var snakeY = new Array();
var segmentDirection = [];
var direction = rand(0,3);

var level = 1;

var snakeLength = 30;
var lengthCountMax = 50;
var lengthCount = 0;

var delayMax
var delay = 100; //milliseconds
var delayCountMax = 5;
var delayCount = delayCountMax;

var collisionDetected = false;
var collisionX;
var collisionY;

var pct = 1/7;
var expRadius = 5;
var expRadiusMax = 100;
var expCenterX;
var expCenterY;
var expRed1Color = 'rgba(128, 0, 0, 1)'; //Maroon
var expRed1Pct = pct*7;
var expRed2Color = 'rgba(255, 0, 0, 1)'; // Red
var expRed2Pct = pct*6;
var expOrange1Color = 'rgba(204, 102, 0, .90)'; // Dark Orange
var expOrange1Pct = pct*5;
var expOrange2Color = 'rgba(255, 153, 0, .90)'; // Orange
var expOrange2Pct = pct*4;
var expYellow1Color = 'rgba(255, 255, 0, .80)'; // Yellow
var expYellow1Pct = pct*3;
var expYellow2Color = 'rgba(255, 255, 153, .80)'; // Light Yellow
var expYellow2Pct = pct*2;
var expWhiteColor = 'rgba(255, 255, 255, .70)'; // white
var expWhitePct = pct;
var expPhase = 1;

var slElement = document.getElementById('snakeLength');
var collisionElement = document.getElementById('collision');

var backColor = '#ffff00';
var snakeColor = '#008000';
var gridColor = '#101010';

var keyboard = new KeyboardState();

snakeCanvas.fillStyle = backColor;
snakeCanvas.fillRect(0,0,cWidth,cHeight);

drawGrid();
initSnake();
drawControlBoard();

setInterval(drawScreen, 1);

function drawControlBoard(){
	controlBoardCanvas.fillStyle = "grey";
	controlBoardCanvas.fillRect(0,0,400,400);
	controlBoardCanvas.font = '30px Arial';
	controlBoardCanvas.fillStyle = 'black';
	controlBoardCanvas.fillText('Level', 10, 50);
	controlBoardCanvas.fillText('Snake Length', 10, 100)
}
			
function drawGrid() {
			
	gridCanvas.beginPath();
	gridCanvas.lineWidth = 1;
	var gridX = 0;
	for (i=0; i<gridCount; i++){
		gridCanvas.moveTo(gridX,0);
		gridCanvas.lineTo(gridX,cHeight);
		gridX += cellWidth;
	}
	var gridY = 0;
	for(i=0; i<gridCount; i++){
		gridCanvas.moveTo(0,gridY);
		gridCanvas.lineTo(cHeight,gridY);
		gridY += cellWidth;
	}
	gridCanvas.strokeStyle = gridColor;
	gridCanvas.stroke();
}

function rand(randMin,randMax) {
	return Math.floor(Math.random() * (randMax - randMin + 1)) + randMin;
}

function cellCenterX(x) {
	var leftCornerX = (x - 1) * cellWidth;
	return leftCornerX + cellCenter;
}

function cellCenterY(y) {
	var leftCornerY = (y - 1) * cellWidth;
	return leftCornerY + cellCenter;
}

function cellEdges(x,y) {
	var c = new Array(18);
	
	c[0] = ((x - 1) * cellWidth); // top left corner x
	c[1] = ((y - 1) * cellWidth); // top left corner y
	c[2] = c[0] + cellCenter;  // top center x
	c[3] = c[1]; // top center y
	c[4] = c[2] + cellCenter; // top right x
	c[5] = c[1]; // top right y
	
	c[6] = c[4]; // right center x
	c[7] = c[5] + cellCenter; // right center y
	c[8] = c[4]; // bottom right x
	c[9] = c[7] + cellCenter; // bottom right y
	
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

function initSnake(){

	snakeX[0] = rand(1,gridCount);
	snakeY[0] = rand(1,gridCount);
	//drawSegment(snakeX[0], snakeY[0], snakeColor);
	drawHead();

	for (i = 1; i < snakeLength; i++ ) {
		if (direction == 0) { // up
			snakeX[i] = snakeX[i - 1];
			snakeY[i] = snakeY[i - 1] + 1;
			if (snakeY[i] > gridCount) {
				snakeY[i] = 1;
			}
		} else if(direction == 1) { // right
			snakeX[i] = snakeX[i - 1] - 1;
			if (snakeX[i] < 1) {
				snakeX[i] = gridCount;
			}
			snakeY[i] = snakeY[i - 1];
			drawSegment(snakeX[i], snakeY[i], snakeColor);
		} else if(direction == 2) { // down
			snakeX[i] = snakeX[i - 1];
			snakeY[i] = snakeY[i - 1] - 1;
			if (snakeY[i] < 1) {
				snakeY[i] = gridCount;
			}
			drawSegment(snakeX[i], snakeY[i], snakeColor);
		} else if(direction == 3) { // left
			snakeX[i] = snakeX[i - 1] + 1;
			if (snakeX[i] > gridCount) {
				snakeX[i] = 1;
			}
			snakeY[i] = snakeY[i - 1];
			drawSegment(snakeX[i], snakeY[i], snakeColor);
		}
		segmentDirection[i] = direction;
		drawSegment(snakeX[i], snakeY[i], snakeColor);
	}
	
	drawTail();
}

function moveSnake() {
	
	var x;
	var y;
	
	//erase old head and tail
	eraseCell(snakeX[0], snakeY[0]);
	eraseCell(snakeX[snakeLength - 1], snakeY[snakeLength - 1]);

	//update snake body
	for (i = snakeLength - 1; i > 0; i--) {
		snakeX[i] = snakeX[i - 1];
		snakeY[i] = snakeY[i - 1];
		drawSegment(snakeX[i], snakeY[i], snakeColor);
		segmentDirection[i] = segmentDirection[i - 1];
	}

	//calculate head
	if ( direction == 0) {
		snakeY[0]--;
	} else if (direction == 1) {
		snakeX[0]++;
	} else if (direction == 2) {
		snakeY[0]++;
	} else {
		snakeX[0]--;
	}
	if (snakeY[0] < 0) snakeY[0] = gridCount;
	if (snakeY[0] > gridCount) snakeY[0] = 1;
	if (snakeX[0] < 0) snakeX[0] = gridCount;
	if (snakeX[0] > gridCount) snakeX[0] = 1;
	
	segmentDirection[0] = direction;
	
	drawTail();
	if (checkCollision(snakeX[0], snakeY[0])) collisionDetected = true;
	drawHead();

	return true;
}
	
function drawHead() {
	var x = snakeX[0];
	var y = snakeY[0];
	
	var edges = cellEdges(x,y);
	var point1x, point1y, point2x, point2y, point3x, point3y, point4x, point4y, point5x, point5y;
	
	if ( direction == 0 ) {	//up
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
		/*x = snakeX[0];
		y = snakeY[0] - 1;
		if (y < 1) y = gridCount;*/
	} else if (direction == 1 ) { // right
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
		/*x = snakeX[0] + 1;
		if ( x > gridCount) x = 1;
		y = snakeY[0];*/
	} else if (direction == 2) { // down
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
		/*x = snakeX[0];
		y = snakeY[0] + 1;
		if ( y > gridCount ) y = 1;*/
	} else if (direction == 3) { // left
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
		/*x = snakeX[0] - 1;
		if ( x < 1 ) x = gridCount;
		y = snakeY[0];*/
	}
	
	snakeCanvas.beginPath();
    snakeCanvas.moveTo(point1x, point1y);
    snakeCanvas.lineTo(point2x, point2y);
    snakeCanvas.lineTo(point3x, point3y);
	snakeCanvas.lineTo(point4x, point4y);
	snakeCanvas.lineTo(point5x, point5y);
	snakeCanvas.fillStyle = snakeColor;
    snakeCanvas.fill();
	snakeCanvas.closePath();
	
	return true;
}
	
function drawTail() {
	
	var x = snakeX[snakeLength - 1];
	var y = snakeY[snakeLength - 1];
	var tailDirection = segmentDirection[snakeLength - 1];
	
	//erase new tail square to make room for new tail
	eraseCell(x,y);
		
	//draw new tail
	var point1x, point1y, point2x, point2y, point3x, point3y;
	
	var edges = cellEdges(x,y);
	
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
	
	snakeCanvas.beginPath();
    snakeCanvas.moveTo(point1x, point1y);
    snakeCanvas.lineTo(point2x, point2y);
    snakeCanvas.lineTo(point3x, point3y);
	snakeCanvas.fillStyle = snakeColor;
    snakeCanvas.fill();
	snakeCanvas.closePath();

	return true;
}

function drawSegment(x,y,color) {
	xCenter = cellCenterX(x);
	yCenter = cellCenterY(y);
	snakeCanvas.beginPath();
	snakeCanvas.arc(xCenter, yCenter, segmentRadius, 0, 2*Math.PI);
	snakeCanvas.fillStyle = color;
	snakeCanvas.fill();
	snakeCanvas.closePath();
}

function eraseCell(x,y) {
	var edges = cellEdges(x,y); 
	
	var point1x = edges[0];
	var point1y = edges[1];
	
	snakeCanvas.beginPath();
	snakeCanvas.rect(point1x, point1y, cellWidth,cellWidth);
	snakeCanvas.fillStyle = backColor;
	snakeCanvas.fill();
	snakeCanvas.closePath();
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function kbdUpdate() {

	keyboard.update();

	if ( keyboard.down("left") && (direction == 0 || direction == 2))
		direction = 3;
	if ( keyboard.down("right") && (direction == 0 || direction == 2))
		direction = 1;
	if ( keyboard.down("up") && (direction == 3 || direction == 1))
		direction = 0;
	if ( keyboard.down("down") && (direction == 3 || direction == 1))
		direction = 2;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function checkCollision(x,y){
	var collision = false;
	
	x = cellCenterX(x);
	y = cellCenterY(y);
	
	data = snakeCanvas.getImageData(x, y, 1, 1).data;
	var color = rgbToHex(data[0], data[1], data[2]);
	
	if ( color == snakeColor){
		collision = true;
		//collisionElement.innerHTML = collision.toString();
		expCenterX = x;
		expCenterY = y;
	} else {
		collision = false;
	}
	
	return collision
}

function explosionAnimate(){
	explosionCanvas.clearRect(0,0,cWidth,cHeight);
	var grd = explosionCanvas.createRadialGradient(expCenterX,expCenterY,1,expCenterX,expCenterY,expRadius);
	grd.addColorStop(expWhitePct,expWhiteColor);
	grd.addColorStop(expYellow2Pct,expYellow2Color);
	grd.addColorStop(expYellow1Pct,expYellow1Color);
	grd.addColorStop(expOrange2Pct,expOrange2Color);
	//grd.addColorStop(expOrange1Pct,expOrange1Color);
	grd.addColorStop(expRed2Pct,expRed2Color);
	grd.addColorStop(expRed1Pct,expRed1Color);
	
	explosionCanvas.beginPath();
	explosionCanvas.arc( expCenterX, expCenterY, expRadius, 0, 2*Math.PI );
	explosionCanvas.fillStyle = grd;
	explosionCanvas.fill();
	explosionCanvas.closePath();
	
	if (expPhase == 1) {
		expRadius++
		if(expRadius > expRadiusMax) {
			expPhase = 2;
		}
	} else if (expPhase == 2){
		sleep(50);
		expRadius--
		if (expRadius < segmentRadius) {
			expPhase = 3;
			explosionCanvas.clearRect(0,0,cWidth,cHeight);
		} 
	} else {
		return;
	}
}

function manageLevel(){

	lengthCount++;
	if ( lengthCount > lengthCountMax ) {
		
		snakeLength++;
		//slElement.innerHTML = snakeLength.toString();
		lengthCount = 0;
		
		delayCount--;
		if ( delayCount < 0) {
			delay--;
			delayCount = delayCountMax;
			//when delay is evenly divisable by 10, bump the level
			var delayMod = delay % 10;
			if ( delayMod == 0) level++
		}
	}	
	
}

function updateControlPanel(){
	controlBoardCanvas.font = "30px Ariel";
	controlBoardCanvas.fillStyle = "blue";
	controlBoardCanvas.textAlign = "right";
	controlBoardCanvas.clearRect(200,10,100,100);
	controlBoardCanvas.fillText(level.toString(), 300, 50);
	controlBoardCanvas.fillText(snakeLength.toString(), 300, 100)
}

function drawScreen(){

	if (!collisionDetected){
		kbdUpdate();
		sleep(delay)
		moveSnake();
		manageLevel();
		updateControlPanel();
	} else {
		explosionAnimate();
		return;
	}
}
