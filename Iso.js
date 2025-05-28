document.addEventListener('contextmenu', event => event.preventDefault());
//scale of individual grids.
const startingDudeAmount=10;
const numberOfCaptains = 1;
const gridsize = 100;
const characterSize = 20;
//actual grid set size = islandSize*islandSize.
let islandSize = 9;
// Width of water surrounding the land
let weight = 40;
let waterWidth = 1;
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
        this.height = 0;
        this.type = "water";
        this.noise = 0;
    }
    draw() {
        let g = gridsize / 2;
        let a = Matrix(this.x - g, this.y - g);
        let b = Matrix(this.x - g, this.y + g);
        let c = Matrix(this.x + g, this.y + g);
        let d = Matrix(this.x + g, this.y - g);

        if (this.type === "water") {
            this.noise = noise(frameCount*(weight/500)+this.x+this.y)*weight;
            this.height = (1 - angle) * -((gridsize * 0.1)+this.noise);
            push();
            stroke(54, 141, 197);
            fill(54, 141, 197);
            quad(a[0], a[1] - this.height, a[0], a[1] + (1 - angle) * gridsize - this.height,
                d[0], d[1] + (1 - angle) * gridsize - this.height, d[0], d[1] - this.height);
            quad(a[0], a[1] - this.height, a[0], a[1] + (1 - angle) * gridsize - this.height,
                b[0], b[1] + (1 - angle) * gridsize - this.height, b[0], b[1] - this.height);
            quad(c[0], c[1] - this.height, c[0], c[1] + (1 - angle) * gridsize - this.height,
                d[0], d[1] + (1 - angle) * gridsize - this.height, d[0], d[1] - this.height);
            quad(c[0], c[1] - this.height, c[0], c[1] + (1 - angle) * gridsize - this.height,
                b[0], b[1] + (1 - angle) * gridsize - this.height, b[0], b[1] - this.height);
            quad(a[0], a[1] - this.height, b[0], b[1] - this.height, c[0], c[1] - this.height, d[0], d[1] - this.height);
            pop();
        } else {
            push();
            noStroke();
            fill(20, 120, 50);
            quad(a[0], a[1] + this.height, a[0], a[1] + (1 - angle) * gridsize + this.height,
                d[0], d[1] + (1 - angle) * gridsize + this.height, d[0], d[1] + this.height);
            quad(a[0], a[1] + this.height, a[0], a[1] + (1 - angle) * gridsize + this.height,
                b[0], b[1] + (1 - angle) * gridsize + this.height, b[0], b[1] + this.height);
            quad(c[0], c[1] + this.height, c[0], c[1] + (1 - angle) * gridsize + this.height,
                d[0], d[1] + (1 - angle) * gridsize + this.height, d[0], d[1] + this.height);
            quad(c[0], c[1] + this.height, c[0], c[1] + (1 - angle) * gridsize + this.height,
                b[0], b[1] + (1 - angle) * gridsize + this.height, b[0], b[1] + this.height);
            stroke(this.mouseHover() ? [255, 255, 0] : [20, 220, 50]);
            fill(this.mouseHover() ? [255, 255, 0] : [20, 220, 50]);
            quad(a[0], a[1] + this.height, b[0], b[1] + this.height, c[0], c[1] + this.height, d[0], d[1] + this.height);

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
let dudes =[];
class Dude {
    constructor() {
        this.x = 100;
        this.y = 300;
        this.captain = false;
        this.enemy = false;
        this.type = "base";
        this.isSelected = false;
        this.isClicked = false; // New property
    }

    draw() {
        let m = Matrix(this.x, this.y);
        let size = characterSize;
        let h = 2 - angle;

        push();
        stroke("black");
        fill("black");
        ellipse(m[0], m[1], size, size * (angle));
        // Base color
        let baseColor;
        if (this.type === "base" && !this.captain && !this.enemy) {
            baseColor = color(0, 128, 0); // Green
        } else if (this.type === "base" && this.captain && !this.enemy) {
            baseColor = color(0, 0, 255); // Blue
        } else if (this.type === "base" && !this.captain && this.enemy) {
            baseColor = color(255, 0, 0); // Red
        } else if (this.type === "base" && this.captain && this.enemy) {
            baseColor = color(255, 165, 0); // Orange
        } else {
            baseColor = color(0); // Default black
        }
        if (this.isClicked) {
            baseColor = color(
                red(baseColor) + 50,
                green(baseColor) + 50,
                blue(baseColor) + 50
            );
        }

        fill(baseColor);
        ellipse(m[0], m[1] - (20 * (1 - angle)), size, size * h);
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
function genDudes() {
    let occupiedTiles = []; // Keep track of occupied tiles

    for (let i = 0; i < startingDudeAmount; i++) {
        let dude = new Dude();
        
        // Set the first 'numberOfCaptains' dudes as captains
        if (i < numberOfCaptains) {
            dude.captain = true;
        }

        let validPosition = false;
        while (!validPosition) {
            // Generate random positions within the island bounds
            let randomRow = Math.floor(Math.random() * islandSize);
            let randomCol = Math.floor(Math.random() * islandSize);

            // Calculate the actual position on the grid
            let x = (randomCol + waterWidth) * gridsize - (gridSizeWithWater - 1) * gridsize / 2;
            let y = (randomRow + waterWidth) * gridsize - (gridSizeWithWater - 1) * gridsize / 2;

            // Check if the position is already occupied
            let positionKey = `${x},${y}`;
            if (!occupiedTiles.includes(positionKey)) {
                dude.x = x;
                dude.y = y;
                occupiedTiles.push(positionKey); // Mark this tile as occupied
                validPosition = true;
            }
        }

        dudes.push(dude); // Add the Dude to the array
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
    if (keyIsDown(83)&& angle > 2*angularSpeed) {
        angle -= angularSpeed;
    }
}
function mousePressed() {
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;

    // Find the clicked tile
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].mouseHover()) {
            let clickedTile = tiles[i];

            // Check if any dude is on the clicked tile
            let dudeOnTile = dudes.find(dude => dude.x === clickedTile.x && dude.y === clickedTile.y);

            if (dudeOnTile && !dudeOnTile.enemy) {
                // If a non-enemy dude is on the tile, select that dude
                for (let j = 0; j < dudes.length; j++) {
                    dudes[j].isClicked = false; // Deselect all dudes
                }
                dudeOnTile.isClicked = true; // Select the dude on the clicked tile
            } else if (!dudeOnTile) {
                // If no dude is on the tile, move the selected dude to this tile
                let selectedDude = dudes.find(dude => dude.isClicked && !dude.enemy);
                if (selectedDude) {
                    selectedDude.x = clickedTile.x;
                    selectedDude.y = clickedTile.y;
                    selectedDude.isClicked = false; // Unselect the dude after moving
                }
            }
            break; // Stop checking other tiles
        }
    }
}
function drawOcean() {
    let h = (angle/0.5)*(height)
    push();
    noStroke();
    rectMode(CORNERS);
    fill(54, 141, 197);
    rect(-width/2,-h,width/2,height/2);

    pop();
}
function setup(){
    genTiles();
    genDudes();
    createCanvas(windowWidth, windowHeight);
}
function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    translate(width / 2, height / 2);
    background(135, 206, 235);
    drawOcean();
    rotateIsland(2);

    // Draw tiles
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].draw();
    }

    // Sort dudes by their screen-space y position (closest ones first)
    dudes.sort((a, b) => {
        let ay = Matrix(a.x, a.y)[1];
        let by = Matrix(b.x, b.y)[1];
        return ay - by;
    });

    // Draw dudes
    for (let i = 0; i < dudes.length; i++) {
        dudes[i].draw();
    }
}