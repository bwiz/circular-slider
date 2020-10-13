/**
 * Trigonometry class for static trigonometry methods
 */
class Trigonometry {
  // degrees to radians and the other way around with -90 degree offset as circle begins at 3 o'clock
  static degree2Radian = degrees => (degrees - 90) * (Math.PI / 180);
  static radians2Degrees = radians => (radians + (Math.PI / 2)) * (180 / Math.PI);
}

class ComponentOptions {
  baseSlider;
  sliderButton;
  decimals;

  constructor(componentOptions) {
    this.setDefaults();
    this.updateDefaults(componentOptions);
  }

  updateDefaults(componentOptions) {
    if(!componentOptions) { return; }

    this.#updateOptionIfExists(this.baseSlider, componentOptions.baseSlider);
    this.#updateOptionIfExists(this.sliderButton, componentOptions.sliderButton);
    this.#updateOptionIfExists(this.decimals, componentOptions.decimals);
  }

  setDefaults() {
    this.baseSlider = {
      gap: 1,
      color: '#bfc1c2',
      sliderColorAlpha: 0.7,
      thickness: 40,
      margin: 10
    };
    this.sliderButton = {
      radius: (this.baseSlider.thickness / 2) + 5,
      fill: '#fff',
      stroke: '#bfc1c2',
      strokeWidth: 2
    };
    this.decimals = 0;
  }

  #updateOptionIfExists(existingItem, newItem) {
    if(typeof(existingItem) === 'object' && existingItem !== null) {
      Object.keys(existingObj).forEach(prop => {
        if(newObj[prop]) {
          existingObj[prop] = newObj[prop];
        }
      });
    } else {
      if(existingItem !== newItem) {
        existingItem = newItem;
      }
    }
  }
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

  get name() { return this.#name; }
  get color() { return this.#color; }
  get minValue() { return this.#minValue; }
  get maxValue() { return this.#maxValue; }
  get step() { return this.#step; }

  set radius(value) { this.#radius = value; }
  get radius() { return this.#radius; }

  // Radius is an optional parameter and when not provided, the value will be calculated automatically
  constructor(name, color, minValue, maxValue, step, radius = undefined) {
    this.#name = name;
    this.#color = color;
    this.#minValue = minValue;
    this.#maxValue = maxValue;
    this.#radius = radius;
    this.#step = (step * 360) / (maxValue - minValue);
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
  #currentLocation;
  #componentOptions;

  get currentLocation() { return this.#currentLocation; }

  constructor(sliderOptions, componentOptions, center) {
    this.#sliderOptions = sliderOptions;
    this.#center = center;
    this.#componentOptions = componentOptions;
    this.#sliderHold = false;

    this.#currentLocation = {};
    this.#steps = [];
    for (let i = 0; i <= 360; i += sliderOptions.step) { 
      this.#steps.push(Trigonometry.degree2Radian(i));
    }

    this.#setMouseEvents();
  }

  drawBaseCircle(ctx) {
    for(let i = 0; i <= 360; i += this.#sliderOptions.step) {
      ctx.beginPath();
      ctx.arc(this.#center.x, this.#center.y, this.#sliderOptions.radius, Trigonometry.degree2Radian(i), Trigonometry.degree2Radian(i + (this.#sliderOptions.step - this.#componentOptions.baseSlider.gap)));
      ctx.strokeStyle = this.#componentOptions.baseSlider.color;
      ctx.lineWidth = this.#componentOptions.baseSlider.thickness;
      ctx.stroke();
      ctx.closePath();
    }
  }

  drawSliderProgress(ctx, theta) {
    // Draw a circle slider
    ctx.beginPath();
    ctx.arc(this.#center.x, this.#center.y, this.#sliderOptions.radius, Trigonometry.degree2Radian(0), this.#getClosestStep(this.#steps, theta));
    ctx.globalAlpha = this.#componentOptions.baseSlider.sliderColorAlpha;
    ctx.strokeStyle = this.#sliderOptions.color;
    ctx.lineWidth = this.#componentOptions.baseSlider.thickness;
    ctx.stroke();

    ctx.globalAlpha = 1.0; // Reset global alpha
  }

  drawSliderButton(ctx, theta) {
    // Slider 
    const cx = Math.cos(this.#getClosestStep(this.#steps, theta)) * this.#sliderOptions.radius;
    const cy = Math.sin(this.#getClosestStep(this.#steps, theta)) * this.#sliderOptions.radius;

    ctx.beginPath();
    ctx.arc(this.#center.x + cx, this.#center.y + cy, this.#componentOptions.sliderButton.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.#componentOptions.sliderButton.fill;
    ctx.strokeStyle = this.#componentOptions.sliderButton.stroke;
    ctx.lineWidth = this.#componentOptions.sliderButton.strokeWidth;
    ctx.fill();
    ctx.stroke();
  }

  getValue(theta) {
    let degrees = Trigonometry.radians2Degrees(this.#getClosestStep(this.#steps, theta));
    const value = (degrees * (this.#sliderOptions.maxValue - this.#sliderOptions.minValue)) / 360 + this.#sliderOptions.minValue;

    return {
      name: this.#sliderOptions.name,
      color: this.#sliderOptions.color,
      value: value.toFixed(0)
    };
  }

  #isInCircle(currentLocation, center, distance, distanceDelta) {
    if(!currentLocation) { return; }
  
    const mouseToCenter = Math.sqrt(Math.pow(currentLocation.y - center.y, 2) + Math.pow(currentLocation.x - center.x, 2));
    const diff = Math.abs(mouseToCenter - distance);
  
    return diff <= distanceDelta;
  }

  #getClosestStep(steps, theta) {
    if(isNaN(theta)) { return; }
  
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

  #setMouseEvents() {
    document.addEventListener('click', e => this.#handleMouseEvent(e));
    document.addEventListener('mousedown', e => this.#handleMouseEvent(e) ? this.#sliderHold = true : this.#sliderHold = false);
    document.addEventListener('mouseup', _ => this.#sliderHold = false);
    document.addEventListener('mousemove', e => this.#sliderHold ? this.#handleMouseEvent(e) : undefined);
  }

  #handleMouseEvent(e) {
    if(this.#isInCircle({ x: e.layerX, y: e.layerY }, this.#center, this.#sliderOptions.radius, this.#componentOptions.baseSlider.thickness / 2)) {
      this.#currentLocation.x = e.layerX;
      this.#currentLocation.y = e.layerY;
      return true;
    }
    return false;
  }
}

/**
 * Class intended for component rendering
 */
class CircularSlider {
  #canvas;
  #ctx;
  #center;
  #sliderItems;
  #previousValueResults;

  #onChangedValues = function(changedValues) {};

  constructor(elementId, sliderOptionsList, componentOptions) {
    this.#canvas = document.getElementById(elementId);
    this.#ctx = this.#canvas.getContext('2d');

    this.#sliderItems = [];
    this.#center = {};

    componentOptions = new ComponentOptions(componentOptions);

    this.#validateSliderOptions(sliderOptionsList, componentOptions);
    this.#setup(sliderOptionsList, componentOptions);
  }

  onChange(changedValues) {
    this.#onChangedValues = changedValues;
  }

  #validateSliderOptions(sliderOptions, componentOptions) {
    // If one entry exists without the radius, all values will be recalculated
    if(sliderOptions.filter(option => option.radius === undefined).length > 0) {

      // The max circle size is 80% of the max width/height, and the lowest 150
      const maxRadius = (this.#canvas.clientWidth / 2) * 0.8;
      const minRadius = 150;

      for(let i = 0; i < sliderOptions.length; i++) {
        const newRadius = maxRadius - (i * (componentOptions.baseSlider.thickness + componentOptions.baseSlider.margin));
        if(newRadius < minRadius) {
          throw "Minimal radius is less than 150. Check values or the amount of items.";
        }

        sliderOptions[sliderOptions.length - 1 - i].radius = newRadius;
      }
    }
  }

  #setup(sliderOptionsList, componentOptions) {
    window.addEventListener('load', _ => {
      this.#canvas.width = this.#canvas.clientWidth;
      this.#canvas.height = this.#canvas.clientHeight; 

      // Slider will always be drawn in the center
      this.#center.x = this.#canvas.width / 2;
      this.#center.y = this.#canvas.height / 2;

      sliderOptionsList.forEach(sliderOptions => {
        this.#sliderItems.push(new CircularSliderItem(sliderOptions, componentOptions, this.#center));
      })
    
      window.requestAnimationFrame(this.#render.bind(this));
    });
  }

  #render() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    const sliderValueResults = [];

    this.#sliderItems.forEach(sliderItem => {

      sliderItem.drawBaseCircle(this.#ctx);

      // Calculate the angle between current and center position.
      let theta = Math.atan2(sliderItem.currentLocation.y - this.#center.y, sliderItem.currentLocation.x - this.#center.x);
      if(isNaN(theta)) {
        theta = Trigonometry.degree2Radian(0);
      }

      sliderItem.drawSliderProgress(this.#ctx, theta);
      sliderItem.drawSliderButton(this.#ctx, theta);

      sliderValueResults.push(sliderItem.getValue(theta));
    });

    // Not the most performant option, but gets the job done
    if(JSON.stringify(sliderValueResults) !== JSON.stringify(this.#previousValueResults)) {
      this.#onChangedValues(sliderValueResults);
      this.#previousValueResults = sliderValueResults;
    }

    this.#drawValues(this.#ctx, sliderValueResults);

    window.requestAnimationFrame(this.#render.bind(this));
  }

  // TODO: Remove temp method
  #drawValues(ctx, sliderValueResults) {
    // Texts
    let offset = 10;
    sliderValueResults.forEach(sliderValueResult => {
      ctx.beginPath();
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(`${sliderValueResult.name}:`, 10, offset + 50);
      ctx.font = 'bold 30px Arial Narrow';
      ctx.fillStyle = sliderValueResult.color;
      ctx.fillText(`$${sliderValueResult.value}`, 150, offset + 50);

      offset += 50;
    });
  }
}

const component = new CircularSlider('canvas', [
  new CircularSliderOptions('Health care', '#ff4043', 0, 1000, 10),
  new CircularSliderOptions('Entertainment', '#ff881f', 0, 1000, 10),
]);

component.onChange(values => {
  console.log(JSON.stringify(values));
})