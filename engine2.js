const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const viewport = {
  length: 6,
  distance: 3,
};

const camera = {
  x: 3,
  y: 20,
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

// function* bresenham({ a: a0, b: b0 }, { a: a1, b: b1 }) {
//   const deltaA = a1 - a0;
//   const deltaB = b1 - b0;
//   if (deltaA < deltaB) {
//     throw Error(`${a1} - ${a0} = ${deltaA} cannot be than less than ${b1} - ${b0} = ${deltaB}`);
//   }
//   if (deltaA === 0) {
//
//   }
//   const deltaErr = Math.abs(deltaA / deltaB);
//   let error = deltaErr - 0.5;
//   let b = Math.floor(b0);
//   for (let a = a0; a < a1; a++) {
//     yield { a, b };
//     error = error + deltaErr;
//     if (error >= 0.5) {
//       b += 1;
//       error = error - 1.0;
//     }
//   }
// }

// A three-dimensional Bresenham
function* bresenham({ a: a0, b: b0, c: c0 }, { a: a1, b: b1, c: c1 }) {
  const deltaA = a1 - a0;
  const deltaB = b1 - b0;
  const deltaC = c1 - c0;

  if (!(deltaA > 0 && deltaA >= deltaB && deltaA >= deltaC)) {
    throw Error(`Bresenham requires deltaA (${deltaA}) > 0 && deltaA (${deltaA}) >= deltaB (${deltaB}) && deltaA (${deltaA}) >= deltaC (${deltaC}) for a: ${a0} -> ${a1}, b: ${b0} -> ${b1}, c: ${c0} -> ${c1}`);
  }

  const deltaErrAB = Math.abs(deltaB / deltaA);
  const deltaErrAC = Math.abs(deltaC / deltaA);

  let errorAB = deltaErrAB - 0.5;
  let errorAC = deltaErrAC - 0.5;

  let b = Math.floor(b0);
  let c = Math.floor(c0);

  for (let a = a0; a < a1; a++) {
    yield { a, b, c };
    if (deltaA !== 0) {
      if (deltaErrAB !== 0) {
        errorAB = errorAB + deltaErrAB;
        if (errorAB >= 0.5) {
          b += 1;
          errorAB = errorAB - 1.0;
        }
      }
      if (deltaErrAC !== 0) {
        errorAC = errorAC + deltaErrAC;
        if (errorAC >= 0.5) {
          c += 1;
          errorAC = errorAC - 1.0;
        }
      }
    }
  }
  yield { a: a1, b: b1, c: c1 };
}

const line = ({ x: x0, y: y0, z: z0 }, { x: x1, y: y1, z: z1 }) => {
  const res = [];

  const deltaX = x1 - x0;
  const deltaY = y1 - y0;
  const deltaZ = z1 - z0;
  let aAsCoord, bAsCoord, cAsCoord;
  let aSign, bSign, cSign;

  let iterator = null;

  /*
  Octants:
   \2|1/
   3\|/0
  ---+---
   4/|\7
   /5|6\
  */
  // octants. TODO: octagons
  if (deltaX / deltaY >= 1.0 && deltaX >= 0 && deltaY >= 0) {
    console.log('Octant: 3');
    iterator = bresenham({ a: x0, b: y0, c: z0 }, { a: x1, b: y1, c: z1 });
    aAsCoord = 'x'; bAsCoord = 'y'; cAsCoord = 'z';
    aSign = 1; bSign = 1; cSign = 1;
  } else if (deltaX / deltaY < 1.0 && deltaX >= 0 && deltaY >= 0) {
    console.log('Octant: 2');
    iterator = bresenham({ a: y0, b: x0, c: z0 }, { a: y1, b: x1, c: z1 });
    aAsCoord = 'y'; bAsCoord = 'x'; cAsCoord = 'z';
    aSign = 1; bSign = 1; cSign = 1;
  } else if (-deltaX / deltaY <= 1.0 && deltaX <= 0 && deltaY >= 0) {
    console.log('Octant: 1');
    iterator = bresenham({ a: y0, b: -x0, c: z0 }, { a: y1, b: -x1, c: z1 });
    aAsCoord = 'y'; bAsCoord = 'x'; cAsCoord = 'z';
    aSign = 1; bSign = -1; cSign = 1;
  }  else if (-deltaX / deltaY >= 1.0 && deltaX <= 0 && deltaY >= 0) {
    console.log('Octant: 0');
    iterator = bresenham({ a: -x0, b: y0, c: z0 }, { a: -x1, b: y1, c: z1 });
    aAsCoord = 'x'; bAsCoord = 'y'; cAsCoord = 'z';
    aSign = -1; bSign = 1; cSign = 1;
  } else if (deltaX / -deltaY >= 1.0 && deltaX >= 0 && deltaY <= 0) { // <-
    console.log('Octant: 4');
    iterator = bresenham({ a: x0, b: -y0, c: z0 }, { a: x1, b: -y1, c: z1 });
    aAsCoord = 'x'; bAsCoord = 'y'; cAsCoord = 'z';
    aSign = 1; bSign = -1; cSign = 1;
  } else if (deltaX / -deltaY < 1.0 && deltaX >= 0 && deltaY <= 0) {
    console.log('Octant: 5');
    iterator = bresenham({ a: -y0, b: x0, c: z0 }, { a: -y1, b: x1, c: z1 });
    aAsCoord = 'y'; bAsCoord = 'x'; cAsCoord = 'z';
    aSign = -1; bSign = 1; cSign = 1;
  } else if (-deltaX / -deltaY <= 1.0 && deltaX <= 0 && deltaY <= 0) {
    console.log('Octant: 6');
    iterator = bresenham({ a: -y0, b: -x0, c: z0 }, { a: -y1, b: -x1, c: z1 });
    aAsCoord = 'y'; bAsCoord = 'x'; cAsCoord = 'z';
    aSign = -1; bSign = -1; cSign = 1;
  }  else if (-deltaX / -deltaY >= 1.0 && deltaX <= 0 && deltaY <= 0) {
    console.log('Octant: 7');
    iterator = bresenham({ a: -x0, b: -y0, c: z0 }, { a: -x1, b: -y1, c: z1 });
    aAsCoord = 'x'; bAsCoord = 'y'; cAsCoord = 'z';
    aSign = -1; bSign = -1; cSign = 1;
  }
  if (iterator) {
    for (let { a, b, c } of iterator) {
      res.push({ [aAsCoord]: aSign * a, [bAsCoord]: bSign * b, [cAsCoord]: cSign * c });
    }
  }
  return res;
};


const setViewport = (pixelMap) => {
  const pm = pixelMap.slice()
  for (let lineCoords of line({ x: camera.x, y: camera.y, z: 0 }, { x : height / (pixelSize * 2), y: width / (pixelSize * 2), z: 0 })) {
    if (!pm[lineCoords.y] || !pm[lineCoords.x]) {
      console.error('Out-of-bounds', lineCoords);
    }
    pm[lineCoords.y][lineCoords.x] = 1;
  }
  return pm;
}

const update = () => {
  draw(setCamera(setViewport(generateCanvas(width, height))));
}

//console.log(JSON.stringify(line({ x: 0, y: 0, z: 0 }, { x: 5, y: 0, z: 3 })));
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
