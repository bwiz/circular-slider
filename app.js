/**
 * Trigonometry class for static trigonometry methods
 */
class Trigonometry {
  // degrees to radians and the other way around with -90 degree offset as circle begins at 3 o'clock
  static degree2Radian = degrees => (degrees - 90) * (Math.PI / 180);
  static radians2Degrees = radians => (radians + (Math.PI / 2)) * (180 / Math.PI);
}

/**
 * Class intended for storing one slider options
 */
class CircularSliderOptions {
  #color;
  #minValue;
  #maxValue;
  #step;
  #radius;
  #name;

  #thickness = 40; // TODO: Make as an option

  get name() { return this.#name; }
  get color() { return this.#color; }
  get minValue() { return this.#minValue; }
  get maxValue() { return this.#maxValue; }
  get step() { return this.#step; }
  get radius() { return this.#radius; }
  get thickness() { return this.#thickness; }

  constructor(name, color, minValue, maxValue, step, radius) {
    this.#name = name;
    this.#color = color;
    this.#minValue = minValue;
    this.#maxValue = maxValue;
    this.#step = (step * 360) / maxValue;
    this.#radius = radius - this.#thickness / 2;
  }
}

/**
 * Class for setting up one slider arc logic
 */
class CircularSliderItem {
  // Private members
  #sliderOptions;
  #center;
  #steps;
  #sliderHold;

  constructor(sliderOptions, center) {
    this.#sliderOptions = sliderOptions;
    this.#center = center;
    this.#sliderHold = false;
    this.#steps = [];
  }
}

/**
 * Class intended for component rendering
 */
class CircularSlider {
  #canvas;
  #ctx;
  #sliderOptionList;

  constructor(elementId, sliderOptionsList) {
    this.#canvas = document.getElementById(elementId);
    this.#ctx = this.#canvas.getContext('2d');
    this.#sliderOptionList = sliderOptionsList;
  }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const center = {};
const currentLocation = {};
let steps = [];

const step = 50;
const minValue = 500;
const maxValue = 1500;

let sliderHold = false;

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
  const stepDegrees = (step * 360) / (maxValue - minValue);
  const gap = 1;

  for(let i = 0; i <= 360; i += stepDegrees) {

    ctx.beginPath();
    ctx.arc(center.x, center.y, 300, Trigonometry.degree2Radian(i), Trigonometry.degree2Radian(i + (stepDegrees - gap)));
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 40;
    ctx.stroke();
    ctx.closePath();

    steps.push(Trigonometry.degree2Radian(i));
  }

  ctx.beginPath();
  ctx.arc(center.x, center.y, 300, Trigonometry.degree2Radian(0), getClosestStep(steps, theta));
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
  let degrees = Trigonometry.radians2Degrees(theta);

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