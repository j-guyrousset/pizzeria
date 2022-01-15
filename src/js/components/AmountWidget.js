import {settings, select} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor argument: ', element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    const minVal = settings.amountWidget.defaultMin;
    const maxVal = settings.amountWidget.defaultMax;
    //console.log('new value: ', value);
    //console.log('value is a number: ', !isNaN(newValue));


    if(newValue !== thisWidget.value && !isNaN(newValue)){
      if(newValue <= maxVal && newValue >= minVal){
        thisWidget.value = newValue;
        thisWidget.annoounce();
      } else {
        console.log(newValue + ': this number is out of range');
      }
    } else {
      console.log(value + ': this is not a number');
    }

    thisWidget.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  annoounce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
