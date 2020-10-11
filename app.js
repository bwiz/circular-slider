// JS Code
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const center = {};
const step = 50;
const maxValue = 1000;

const degree2Radian = degrees => degrees * (Math.PI / 180);

window.addEventListener('load', _ => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  center.x = canvas.width / 2;
  center.y = canvas.height / 2;

  window.requestAnimationFrame(render);
})

function render() {

  const gap = (step * 360) / maxValue;

  for(let i = 0; i < 360; i += gap) {

    ctx.beginPath();
    ctx.arc(center.x, center.y, 300, degree2Radian(i), degree2Radian(i + (gap - 1)));
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 40;
    ctx.stroke();
    ctx.closePath();
  }
  
}