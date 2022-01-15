import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product: ', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;
    /*generate text based on template (but not understood as HTML code)*/
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /*create element understood as HTML using utils.createElementFromHTML*/
    thisProduct.dom = utils.createDOMFromHTML(generatedHTML);
    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);
    /*add element to menu at this point only the created template gets active*/
    menuContainer.appendChild(thisProduct.dom);
  }

  getElements(){
    const thisProduct = this;
    thisProduct.dom.accordionTrigger = thisProduct.dom.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.dom.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.dom.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.dom.querySelector(select.menuProduct.priceElem);
    thisProduct.active = thisProduct.dom.querySelectorAll(select.all.menuProductsActive);
    thisProduct.dom.imageWrapper = thisProduct.dom.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.dom.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    /*find the clickable trigger (element that should react to click)*/
    //const clickableTrigger = thisProduct.dom.querySelector(select.menuProduct.clickable);
    /*START: add event listener to clickable element on event click*/
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      /*prevent from default action on event*/
      event.preventDefault();
      /*find active products (that have active class)*/
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /*if there's an active product and it's not thisProduct.dom, removeclass active from it*/
      for (let product of activeProducts){
        const productClass = product.getAttribute('class');
        if (productClass.indexOf('active') > -1 && product !== thisProduct.dom) {
          product.classList.remove('active');
        }
      }
      /*toggle active class on thisProduct.dom*/
      thisProduct.dom.classList.toggle('active');
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('function initOrderForm called', thisProduct.dom.formInputs);
    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let formInput of thisProduct.dom.formInputs){
      formInput.addEventListener('change', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });


  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);  // we know what has been chosen on the form
    //console.log('The selected data are the following: ', formData);
    //console.log('function ProcessOrder called on:', thisProduct.id);

    //set price to default defaultValue
    let price = thisProduct.data.price;

    for(let paramId in thisProduct.data.params){ //iteration through all the parameters
      const param = thisProduct.data.params[paramId];
      //console.log('parameter ID: ', paramId);
      //console.log('parameter: ', param);  //the table which name is paramId

      for (let optionId in param.options){
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        const imageClass = paramId + '-' + optionId;
        const imageElement = thisProduct.dom.querySelector('.' + imageClass);
        const visibleImage = classNames.menuProduct.imageVisible;

        if (optionSelected){
          //console.log(optionId + ' of ' + thisProduct.id + ' ' + paramId +  ' is selected');
          if(option.default){
            //console.log(optionId + ' is a default option -> not adding anything');
            price += 0;
          } else {
            //console.log(optionId + ' is not a default option -> adding: ' + option.price);
            price += option.price;
          }
        } else if (!optionSelected){
          //console.log(optionId + ' of ' + thisProduct.id + ' ' + paramId +  ' is not selected');
          if (option.default) {
            //console.log('But ' + optionId + ' is a default option -> taking: ' + option.price);
            price -= option.price;
          } else {
            //console.log(optionId + ' is not a default option, so it is cool -> not changing anything');
            price += 0;
          }
        }

        if (imageElement){
          //console.log(optionId + ' has an image associated');
          if (optionSelected){
            //console.log('switch on this image display');
            imageElement.classList.add(visibleImage);
          } else{
            //console.log('switch off this image display');
            imageElement.classList.remove(visibleImage);
          }
        }

      }
    }

    //price = price*formData.amount;
    //console.log('Total price ', price);
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.dom.priceElem.innerHTML = price;
    //console.log('amount: ' + thisProduct.amountWidget.value + ' - updated price: ' + price);
    //console.log('default price :', thisProduct.data.price);
    //console.log('price per single product :', thisProduct.priceSingle);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.dom.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.priceSingle * productSummary.amount;
    productSummary.params = thisProduct.prepareCartProductParams();
    //console.log('product summary: ', productSummary);

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const cartProductParams = {};

    for (let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      cartProductParams[paramId] = {
        label: param.label,
        options: {}
      };

      for(let optionId in param.options){
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected){
          cartProductParams[paramId].options[optionId] = option.label;
        }
      }
    }
    //console.log('product cart params: ', cartProductParams);
    return cartProductParams;
  }


}

export default Product;
