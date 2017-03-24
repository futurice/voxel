const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const viewport = {
  length: 6,
  distance: 3,
};

const camera = {
  x: 3,
  y: 3,
}

const pixelSize = 10;
const width = 400;
const height = 400;

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
  const foo = (x0, y0, x1, y1) => {
    const res = [];
    const deltax = x1 - x0;
    const deltay = y1 - y0;
    if (deltax === 0) {
      const x = Math.floor(x1);
      const ay0 = Math.floor((y0 - y1) > 0 ? y1 : y0);
      const ay1 = Math.floor((y0 - y1) > 0 ? y0 : y1);
      for (let y = ay0; y < ay1; y++) {
        res.push({ x, y });
      }
    } else {
      const deltaerr = Math.abs(deltay / deltax);
      let error = deltaerr - 0.5;
      let y = Math.floor(y0);
      if (x0 < x1) {
        for (let x = x0; x < x1; x++) {
          res.push({ x, y });
          error = error + deltaerr
          if (error >= 0.5) {
            y = (y1 - y0) > 0 ? y + 1 : y - 1;
            error = error - 1.0
          }
        }
      } else if (x0 > x1) {
        for (let x = x0; x > x1; x--) {
          console.log(x1, x0, x)
          res.push({ x, y });
          error = error + deltaerr
          if (error >= 0.5) {
            y = (y1 - y0) > 0 ? y + 1 : y - 1;
            error = error - 1.0
          }
        }
      }
    }
    return res;
  }

  if (Math.abs(x0 - x1) > Math.abs(y0 - y1)) {
    return foo(x0, y0, x1, y1);
  } else {
    return foo(y0, x0, y1, x1).map(({x, y}) => { return { x: y, y: x} });
  }
}

const setViewport = (pixelMap) => {
  const pm = pixelMap.slice()
  console.log(camera.x, camera.y, height / (pixelSize * 2), width / (pixelSize * 2))
  for (let lineCoords of line(camera.x, camera.y, height / (pixelSize * 2), width / (pixelSize * 2))) {
    pm[lineCoords.y][lineCoords.x] = 1;
  }
  return pm;
}

const update = () => {
  draw(setCamera(setViewport(generateCanvas(width, height))));
}

update();

document.onkeydown = (event) => {
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
  update();
}
