class BaseWidget {
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;

  }

  get value(){ // is runn each time ve try to read the properties value of a widget
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){ //executed each time we try to set a the property value of a widget
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.annoounce();
    }

    thisWidget.renderValue();
  }

  setValue(value){  // this is przekierowanie do setter
    const thisWidget = this;

    thisWidget.value = value;  // here we execute the setter method set value
  }


  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.correctValue;
  }

  annoounce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
