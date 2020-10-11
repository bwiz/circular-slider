// JS Code
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const center = {};
const currentLocation = {};
let steps = [];

const step = 50;
const minValue = 500;
const maxValue = 1500;

let sliderHold = false;

// degrees to radians with -90 degree offset as circle begins at 3 o'clock
const degree2Radian = degrees => (degrees - 90) * (Math.PI / 180);
const radians2Degrees = radians => {
  let degrees = (radians + (Math.PI / 2)) * (180 / Math.PI); // Include offset
  return degrees;
};

document.addEventListener('click', e => handleMouseEvent(e));
document.addEventListener('mousedown', e => handleMouseEvent(e) ? sliderHold = true : sliderHold = false);
document.addEventListener('mouseup', _ => sliderHold = false);
document.addEventListener('mousemove', e => sliderHold ? handleMouseEvent(e) : undefined);

function handleMouseEvent(e) {
  if(isInCircle({ x: e.layerX, y: e.layerY }, center, 300, 20)) {
    currentLocation.x = e.layerX;
    currentLocation.y = e.layerY;
    return true;
  }
  return false;
}

window.addEventListener('load', _ => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  center.x = canvas.width / 2;
  center.y = canvas.height / 2;

  window.requestAnimationFrame(render);
})

function render() {
  steps = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Angle between center and current position in rad
  const theta = Math.atan2(currentLocation.y - center.y, currentLocation.x - center.x);
  const gap = (step * 360) / (maxValue - minValue);

  for(let i = 0; i <= 360; i += gap) {

    ctx.beginPath();
    ctx.arc(center.x, center.y, 300, degree2Radian(i), degree2Radian(i + (gap - 1)));
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 40;
    ctx.stroke();
    ctx.closePath();

    steps.push(degree2Radian(i));
  }

  ctx.beginPath();
  ctx.arc(center.x, center.y, 300, degree2Radian(0), getClosestStep(steps, theta));
  ctx.strokeStyle = "green";
  ctx.lineWidth = 40;
  ctx.stroke();

  const cx = Math.cos(getClosestStep(steps, theta)) * 300;
  const cy = Math.sin(getClosestStep(steps, theta)) * 300;
  ctx.beginPath();
  ctx.arc(center.x + cx, center.y + cy, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();

  // Texts
  ctx.beginPath();
  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Value: ${getValue(getClosestStep(steps, theta), maxValue)};`, center.x, center.y);
  
  window.requestAnimationFrame(render);
}

function getValue(theta, maxValue) {
  let degrees = radians2Degrees(theta); // -180 because of the initial offset

  // console.log(degrees);
  return (degrees * (maxValue - minValue)) / 360 + minValue;
}

function isInCircle(currentLocation, center, distance, distanceDelta) {
  if(!currentLocation) {
    return;
  }

  const mouseToCenter = Math.sqrt(Math.pow(currentLocation.y - center.y, 2) + Math.pow(currentLocation.x - center.x, 2));
  const diff = Math.abs(mouseToCenter - distance);

  if(diff <= distanceDelta) {
    return true;
  }
  return false;
}

function getClosestStep(steps, theta) {
  if(isNaN(theta)) {
    return;
  }

  let minValue = 10;
  let closestStep = theta;

  steps.forEach(step => {
    if(theta < (-1 * (Math.PI / 2))) {
      theta = Math.PI + Math.abs(Math.PI + theta);
    }

    const newMinValue = Math.abs(theta - step);
    if(newMinValue < minValue) {
      minValue = newMinValue;
      closestStep = step; 
    }
  });

  return closestStep;
}