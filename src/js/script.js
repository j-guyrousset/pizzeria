/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 0,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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

      console.log('new Product: ', thisProduct);
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
      console.log('function initOrderForm called', thisProduct.dom.formInputs);
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
      console.log('The selected data are the following: ', formData);
      console.log('function ProcessOrder called on:', thisProduct.id);

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
        /*
        let elementHTML = '';
        if (param.type !== 'select'){
          for(let optionId in param.options){ //iteration through all the options of a given parameter
            const option = param.options[optionId];
            const imageClass = paramId + '-' + optionId;
            const imageHTML = thisProduct.dom.imageWrapper.getElementsByClassName(imageClass);
            console.log('imageHTML: ', imageHTML);
            console.log('corresponding image class: ', imageClass);
            console.log('option ID: ', optionId + ': ' + option.price);
            //console.log('option: ', option);  //the table which name is optionId
            elementHTML = document.getElementById(optionId);
            const visibleImage = classNames.menuProduct.imageVisible;

            if(elementHTML.checked && imageHTML[0]){
              imageHTML[0].classList.add(visibleImage);
            } else if(!elementHTML.checked && imageHTML[0]){
              imageHTML[0].classList.remove(visibleImage);
            }

            if(option.default && elementHTML.checked){
              price += 0;
            }
            if(option.default && !(elementHTML.checked)){
              price -= option.price;
            }
            if(!option.default && elementHTML.checked){
              price += option.price;
            }
          }
          console.log('updated price: ', price);
        } else {
          const elem = document.querySelector('select');
          const elementHTMLs = elem.querySelectorAll('option');
          for (let optionElement of elementHTMLs){
            elementHTML = optionElement;
            const optionPrice = param.options[elementHTML.value].price;

            if(elementHTML.value == 'standard' && (elementHTML.selected)){
              price += 0;
            } else if(elementHTML.value == 'standard' && !(elementHTML.selected)){
              price -= optionPrice;
            } else if(!(elementHTML.value == 'standard') && elementHTML.selected){
              price += optionPrice;
            }
          }
          console.log('updated price: ', price);
        }
        */
      }

      //price = price*formData.amount;
      //console.log('Total price ', price);
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      console.log('amount: ' + thisProduct.amountWidget.value + ' - updated price: ' + price);
      console.log('default price :', thisProduct.data.price);
      console.log('price per single product :', thisProduct.priceSingle);
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

      app.cart.add(thisProduct.prepareCartProduct());
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
      console.log('product summary: ', productSummary);

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
      console.log('product cart params: ', cartProductParams);
      return cartProductParams;
    }


  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor argument: ', element);
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
      console.log('new value: ', value);
      console.log('value is a number: ', !isNaN(newValue));


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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart: ', thisCart);
      console.log('Cart wrapper: ', thisCart.dom.wrapper);
      console.log('Cart toggle trigger: ', thisCart.dom.toggleTrigger);

    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      console.log('cart generatedHTM ', generatedHTML);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      console.log('cart generatedDOM ', generatedDOM);
      console.log(thisCart.dom.productList);
      thisCart.dom.productList.appendChild(generatedDOM);

      console.log('adding product: ', menuProduct);
    }

  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products){
        new Product (productData, thisApp.data.products[productData]);
        //console.log('And the productData is... : ', productData);
      //  console.log('which contains : ', thisApp.data.products[productData].description);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
