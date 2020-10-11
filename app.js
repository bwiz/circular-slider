// JS Code
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const center = {};
const currentLocation = {};

const step = 50;
const maxValue = 1000;

// degrees to radians with -90 degree offset as circle begins at 3 o'clock
const degree2Radian = degrees => (degrees - 90) * (Math.PI / 180);

document.addEventListener('click', e => {
  if(isInCircle({ x: e.layerX, y: e.layerY }, center, 300, 20)) {
    currentLocation.x = e.layerX;
    currentLocation.y = e.layerY;
  }
})

window.addEventListener('load', _ => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  center.x = canvas.width / 2;
  center.y = canvas.height / 2;

  window.requestAnimationFrame(render);
})

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Angle between center and current position in rad
  const theta = Math.atan2(currentLocation.y - center.y, currentLocation.x - center.x);
  const gap = (step * 360) / maxValue;

  for(let i = 0; i < 360; i += gap) {

    ctx.beginPath();
    ctx.arc(center.x, center.y, 300, degree2Radian(i), degree2Radian(i + (gap - 1)));
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 40;
    ctx.stroke();
    ctx.closePath();
  }

  ctx.beginPath();
  ctx.arc(center.x, center.y, 300, degree2Radian(0), theta);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 40;
  ctx.stroke();

  const cx = Math.cos(theta) * 300;
  const cy = Math.sin(theta) * 300;
  ctx.beginPath();
  ctx.arc(center.x + cx, center.y + cy, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 5;
  ctx.fill();
  ctx.stroke();
  
  window.requestAnimationFrame(render);
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