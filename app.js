// JS Code
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const center = {};

window.addEventListener('load', _ => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  center.x = canvas.width / 2;
  center.y = canvas.height / 2;

  window.requestAnimationFrame(render);
})

function render() {

  ctx.beginPath();
  ctx.arc(center.x, center.y, 300, 0, 2 * Math.PI);
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 40;
  ctx.stroke();
  ctx.closePath();
}