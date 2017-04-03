const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const viewport = {
  length: 6,
  distance: 3,
};

const camera = {
  x: 1,
  y: 20,
  z: 0,
}

const pixelSize = 10;
const width = 400;
const height = 400;
const depth = 20;

function generateCanvas(width, height) {
  let array = new Array(height)
  for(var y = 0; y < height; y++){
    array[y] = new Array(width)
    for (var x=0; x < width; x++) {
      array[y][x] = 'rgb(230,230,230)';
    }
  }
  return array;
}

const pixelMap = generateCanvas(width, height);

const toColor = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  if (value >= 0) {
    return 'rgb('+(Math.abs(Math.floor(value/depth * 255)))+','+(Math.abs(Math.floor((value/depth * 255))))+',0)';
  }
  return 'rgb(0,'+(Math.abs(Math.floor((value/depth * 255))))+','+(Math.abs(Math.floor(value/depth * 255)))+')';

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
  pm[camera.y][camera.x] = 'rgb(230, 0, 0)';;
  return pm;
}

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
  const max = Math.max(Math.abs(deltaX), Math.abs(deltaY), Math.abs(deltaZ));
  const maxIsX = max === Math.abs(deltaX);
  const maxIsY = max === Math.abs(deltaY);
  const maxIsZ = max === Math.abs(deltaZ);
  const signX = deltaX ? Math.sign(deltaX) : 1;
  const signY = deltaY ? Math.sign(deltaY) : 1;
  const signZ = deltaZ ? Math.sign(deltaZ) : 1;

  if (maxIsX) {
    iterator = bresenham({ a: signX * x0, b: signY * y0, c: signZ * z0 }, { a: signX * x1, b: signY * y1, c: signZ * z1 });
    aAsCoord = 'x'; bAsCoord = 'y'; cAsCoord = 'z';
    aSign = signX * 1; bSign = signY * 1; cSign = signZ * 1;
  } else if (maxIsY) {
    iterator = bresenham({ a: signY * y0, b: signX * x0, c: signZ * z0 }, { a: signY * y1, b: signX * x1, c: signZ * z1 });
    aAsCoord = 'y'; bAsCoord = 'x'; cAsCoord = 'z';
    aSign = signY * 1; bSign = signX * 1; cSign = signZ * 1;
  } else if (maxIsZ) {
    iterator = bresenham({ a: signZ * z0, b: signX * x0, c: signY * y0 }, { a: signZ * z1, b: signX * x1, c: signY * y1 });
    aAsCoord = 'z'; bAsCoord = 'x'; cAsCoord = 'y';
    aSign = signZ * 1; bSign = signX * 1; cSign = signY * 1;
  }
  for (let { a, b, c } of iterator) {
    res.push({ [aAsCoord]: aSign * a, [bAsCoord]: bSign * b, [cAsCoord]: cSign * c });
  }
  return res;
};


const setViewport = (pixelMap) => {
  const pm = pixelMap.slice()
  var z = camera.z;
  for (let lineCoords of line({ x: camera.x, y: camera.y, z: z }, { x : height / (pixelSize * 2), y: width / (pixelSize * 2), z: 0 })) {
    if (!pm[lineCoords.y] || !pm[lineCoords.x]) {
      console.error('Out-of-bounds', lineCoords);
    }
    if (!((z + 1 === lineCoords.z) || (z === lineCoords.z) || (z - 1 === lineCoords.z))) {
      console.log('ops', z, lineCoords.z);
    }
    z = lineCoords.z;
    console.log(lineCoords.z);
    pm[lineCoords.y][lineCoords.x] = lineCoords.z;
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
    case 81: { // q == zoom-out
      if (camera.z <= depth) {
        camera.z += 1;
      }
      break;
    }
    case 69: { // e == zoom-in
      if (camera.z >= -depth) {
        camera.z -= 1;
      }
      break;
    }
  }
  update();
}
