const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const viewport = {
  length: 6,
  distance: 3,
};

const camera = {
  x: 3,
  y: 0,
}

const pixelSize = 10;
const width = 800;
const height = 800;

function generateCanvas(width, height) {
  let array = new Array(height)
  for(var y = 0; y < height; y++){
    array[y] = new Array(width)
    for (var x=0; x < width; x++) {
      array[y][x] = 0;
    }
  }
  return array;
}

const pixelMap = generateCanvas(width, height);

const toColor = (value) => {
  if (value === 1) {
    return 'rgb(0,0,0)';
  } else if (value === 2) {
    return 'rgb(230,0,0)';
  } else if (value === 3) {
    return 'rgb(0,0,230)';
  }
  return 'rgb(230,230,230)';
}

const draw = (pixels) => {
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      context.fillStyle = toColor(pixels[y][x]);
      context.fillRect(x * pixelSize, y * pixelSize,  pixelSize,  pixelSize);
    }
  }
}

const setCamera = (pixelMap) => {
  const pm = pixelMap.slice()
  pm[camera.y][camera.x] = 2;
  return pm;
}

const line = (x0, y0, x1, y1) => {
  const res = [];
  const deltax = x1 - x0;
  const deltay = y1 - y0;
  const deltaerr = Math.abs(deltay / deltax);
  const error = deltaerr - 0.5;
  let y = Math.floor(y0);
  for (let x = x0; x0 < x1; x++) {
    res.push({ x, y });
    let error = error + deltaerr
    if (error >= 0.5) {
      y = y + 1
      error = error - 1.0
    }
  }
}

const setViewport = (pixelMap) => {
  const pm = pixelMap.slice()
  console.log(line(viewport.x, viewport.y, ));
  return pm;
}

const update = () => {
  draw(setCamera(pixelMap));
}

update();
