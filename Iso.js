document.addEventListener('contextmenu', event => event.preventDefault());
//scale of individual grids.
const gridsize = 100;
let characteSize = 10;
//actual grid set size = islandSize*islandSize.
let islandSize = 5;
// Width of water surrounding the land
let waterWidth = 5;
// Total size of the grid
let gridSizeWithWater = islandSize + (waterWidth * 2);
//a float between 0-1. the angle at which the camera veiws the island.
let angle = 0.5;
let angularSpeed = 0.02;

let rotation = 0;
let iHat = [1,0];
let jHat = [0,0.5];

let tiles =[];
class Tile {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.height = this.type === "water" ? -gridsize * 0.5 : 0; // Default height for water is slightly lower
        this.type = "water"; // Possible types: land, water, elevation, slope
    }

    draw() {
        let g = gridsize / 2;
        let a = Matrix(this.x - g, this.y - g);
        let b = Matrix(this.x - g, this.y + g);
        let c = Matrix(this.x + g, this.y + g);
        let d = Matrix(this.x + g, this.y - g);

        if (this.type === "water") {
            push();
            stroke(92, 181, 225);
            fill(92, 181, 225);
            // Adjust water height using the `this.height` property
            let waterLevel = this.height + (1 - angle) * gridsize * 0.5;

            quad(a[0], a[1] + waterLevel, a[0], a[1] + (1 - angle) * gridsize + waterLevel,
                d[0], d[1] + (1 - angle) * gridsize + waterLevel, d[0], d[1] + waterLevel);
            quad(a[0], a[1] + waterLevel, a[0], a[1] + (1 - angle) * gridsize + waterLevel,
                b[0], b[1] + (1 - angle) * gridsize + waterLevel, b[0], b[1] + waterLevel);
            quad(c[0], c[1] + waterLevel, c[0], c[1] + (1 - angle) * gridsize + waterLevel,
                d[0], d[1] + (1 - angle) * gridsize + waterLevel, d[0], d[1] + waterLevel);
            quad(c[0], c[1] + waterLevel, c[0], c[1] + (1 - angle) * gridsize + waterLevel,
                b[0], b[1] + (1 - angle) * gridsize + waterLevel, b[0], b[1] + waterLevel);
            quad(a[0], a[1] + waterLevel, b[0], b[1] + waterLevel, c[0], c[1] + waterLevel, d[0], d[1] + waterLevel);

            pop();
        } else {
            push();
            noStroke();
            fill(20, 120, 50);
            
            let landHeight = this.height; // Use height for land adjustments
            
            quad(a[0], a[1] + landHeight, a[0], a[1] + (1 - angle) * gridsize + landHeight,
                d[0], d[1] + (1 - angle) * gridsize + landHeight, d[0], d[1] + landHeight);
            quad(a[0], a[1] + landHeight, a[0], a[1] + (1 - angle) * gridsize + landHeight,
                b[0], b[1] + (1 - angle) * gridsize + landHeight, b[0], b[1] + landHeight);
            quad(c[0], c[1] + landHeight, c[0], c[1] + (1 - angle) * gridsize + landHeight,
                d[0], d[1] + (1 - angle) * gridsize + landHeight, d[0], d[1] + landHeight);
            quad(c[0], c[1] + landHeight, c[0], c[1] + (1 - angle) * gridsize + landHeight,
                b[0], b[1] + (1 - angle) * gridsize + landHeight, b[0], b[1] + landHeight);
            stroke(this.mouseHover() ? [255, 255, 0] : [20, 220, 50]);
            fill(this.mouseHover() ? [255, 255, 0] : [20, 220, 50]);
            quad(a[0], a[1] + landHeight, b[0], b[1] + landHeight, c[0], c[1] + landHeight, d[0], d[1] + landHeight);

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

let characters =[];
class Character{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.captain = false;
        this.enemy = false;
        this.type = "base";
    }
    draw(){
        let m = Matrix(this.x,this.y);
        let size = characterSize;
        let h =
        push();
        stroke();
        fill();
        elipse();
        pop();
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
function genTiles() {
    let c = 0;
    for (let i = 0; i < (gridSizeWithWater * gridSizeWithWater); i++) {
        tiles[i] = new Tile();
        
        // Handle row indexing
        if (i % gridSizeWithWater == 0 && i !== 0) {
            c++;
        }
        
        // Offsets to center the island
        let xOffset = (gridSizeWithWater - 1) * gridsize / 2;
        let yOffset = (gridSizeWithWater - 1) * gridsize / 2;
        
        // Set tile positions
        tiles[i].x = (i % gridSizeWithWater) * gridsize - xOffset;
        tiles[i].y = c * gridsize - yOffset;
        
        // Determine if tile should be land or water
        let row = Math.floor(i / gridSizeWithWater);
        let col = i % gridSizeWithWater;
        
        // Set land to be at the center of the grid
        let startRow = waterWidth;
        let endRow = waterWidth + islandSize;
        let startCol = waterWidth;
        let endCol = waterWidth + islandSize;
        
        // If the tile is within the island area, set as land; otherwise, set as water
        if (row >= startRow && row < endRow && col >= startCol && col < endCol) {
            tiles[i].type = "land";
        } else {
            tiles[i].type = "water";
        }
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
    background("white");
    rotateIsland(2);
    for(let i = 0; i < tiles.length; i++){
        tiles[i].draw();
    }
}