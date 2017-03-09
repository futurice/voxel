const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const camera = {
  width: 200,
  height: 200,
  x: 0,
  y: 0,
};

const pixelSize = 10;
const width = 800;
const height = 800;

function generateCanvas(width, height) {
  let array = new Array(height)
  for(var y = 0; y < height; y++){
    array[y] = new Array(width)
    for (var x=0; x < width; x++){
      let red = 30 + Math.floor(Math.random() * 195);
      let green = 30 + Math.floor(Math.random() * 195);
      let blue = 30 + Math.floor(Math.random() * 195);
      array[y][x] = "rgb("+red+","+green+","+blue+")";
    }
  }
  return array;
}

const pixels = generateCanvas(width, height);


const viewport = () => {
  const rows = pixels.slice(camera.y, camera.height + camera.y);
  if (rows.length === camera.height) {
    const colOutOfBounds = rows.find(row => row.slice(camera.x, camera.width + camera.x).length !== camera.width);
    if (!colOutOfBounds) {
      return rows.map(row => {
        return row.slice(camera.x, camera.width + camera.x);
      });
    }
  }
  return null;
}

const draw = (pixels) => {
  context.clearRect(0, 0, width*pixelSize, height*pixelSize);
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      context.fillStyle = pixels[y][x];
      context.fillRect(x * pixelSize, y * pixelSize,  pixelSize,  pixelSize);
    }
  }
}

draw(viewport());

document.onkeydown = (event) => {
  const prevPositions =  {
    x: camera.x,
    y: camera.y,
  };
  switch(event.keyCode) {
  case 37: { // left
    camera.x -= 1;
    break;
  }
  case 38: { // up
    camera.y -= 1;
    break;
  }
  case 39: { // right
    camera.x += 1;
    break;
  }
  case 40: { // down
    camera.y += 1;
    break;
  }
  }
  const updatedViewport = viewport();
  if (updatedViewport) {
    draw(updatedViewport);
  } else {
    camera.x = prevPositions.x;
    camera.y = prevPositions.y;
  }
}
