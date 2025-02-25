document.addEventListener('contextmenu', event => event.preventDefault());
//scale of individual grids.
const gridsize = 100;
//actual grid set size = islandSize*islandSize.
let islandSize = 9;
//a float between 0-1. the angle at which the camera veiws the island.
let angle = 0.1;

let rotation = 0;
let iHat = [1,0];
let jHat = [0,.5];

let tiles =[];
class Tile{
    constructor(){
        this.x = 0;
        this.y = 0;
        //types should include: land,water,elevation,slope
        this.type = "land";
    }
    draw(){
        let g = gridsize/2;
        let a = Matrix(this.x-g,this.y-g);
        let b = Matrix(this.x-g,this.y+g);
        let c = Matrix(this.x+g,this.y+g);
        let d = Matrix(this.x+g,this.y-g);
        if (this.type=="water"){

        } else {
            push();
            noStroke();
            fill(20,120,50);
            quad(a[0],a[1], a[0],a[1]+(1-angle)*gridsize, d[0],d[1]+(1-angle)*gridsize, d[0],d[1]);
            quad(a[0],a[1], a[0],a[1]+(1-angle)*gridsize, b[0],b[1]+(1-angle)*gridsize, b[0],b[1]);
            quad(c[0],c[1], c[0],c[1]+(1-angle)*gridsize, d[0],d[1]+(1-angle)*gridsize, d[0],d[1]);
            quad(c[0],c[1], c[0],c[1]+(1-angle)*gridsize, b[0],b[1]+(1-angle)*gridsize, b[0],b[1]);
            stroke(this.mouseHover() ? [255, 255, 0] : [20, 220, 50]);
            fill(this.mouseHover() ? [255, 255, 0] : [20, 220, 50]);
            quad(a[0],a[1], b[0],b[1], c[0],c[1], d[0],d[1]);
            fill(255,0,0);
            pop();
        }
    }
    mouseHover() {
        let mx = mouseX - width / 2;
        let my = mouseY - height / 2;
        let [tx, ty] = reverseMatrix(mx, my);
        return (
            tx >= this.x - gridsize / 2 &&
            tx <= this.x + gridsize / 2 &&
            ty >= this.y - gridsize / 2 &&
            ty <= this.y + gridsize / 2
        );
    }
}
function Matrix(x,y){
    let r = [x*iHat[0] + y*jHat[0], x*iHat[1] + y*jHat[1]];
    return r;
}
function reverseMatrix(x, y) {
    let det = iHat[0] * jHat[1] - iHat[1] * jHat[0]; 
    return det === 0 ? [0, 0] : [(x * jHat[1] - y * jHat[0]) / det, (-x * iHat[1] + y * iHat[0]) / det];
}
function genTiles(){
    let c = 0;
    for(let i = 0; i < (islandSize * islandSize); i++){
        tiles[i] = new Tile();
        if (i % islandSize == 0 && i !== 0) {
            c++;
        }
        let xOffset = (islandSize - 1) * gridsize / 2;
        let yOffset = (islandSize - 1) * gridsize / 2; 
        
        tiles[i].x = (i % islandSize) * gridsize - xOffset;
        tiles[i].y = c * gridsize - yOffset;
    }
}
function rotateIsland(speed){
    if (keyIsDown(65)) {
        rotation -= speed;
    }
      if (keyIsDown(68)) {
        rotation += speed;
    }
    iHat = [cos(radians(rotation)),sin(radians(rotation))*angle];
    jHat = [-sin(radians(rotation)),cos(radians(rotation))*angle];
    tiles.sort((a, b) => {
        let ay = Matrix(a.x, a.y)[1];
        let by = Matrix(b.x, b.y)[1];
        return ay - by;
    });
    let angularSpeed = 0.01;
    if (keyIsDown(87)&& angle <= 1-angularSpeed) {
        angle += angularSpeed;
    }
    if (keyIsDown(83)&& angle > 0+2*angularSpeed) {
        angle -= angularSpeed;
    }
}
function setup(){
    genTiles();
    createCanvas(windowWidth, windowHeight);
}
function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}
function draw(){
    translate(width/2,height/2);
    background(92,181,225);
    rotateIsland(2);
    for(let i = 0; i < tiles.length; i++){
        tiles[i].draw();
    }
}