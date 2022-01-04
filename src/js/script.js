/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();

      console.log('new Product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;
      /*generate text based on template (but not understood as HTML code)*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /*create element understood as HTML using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu at this point only the created template gets active*/
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.active = thisProduct.element.querySelectorAll(select.all.menuProductsActive);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }

    initAccordion(){
      const thisProduct = this;
      /*find the clickable trigger (element that should react to click)*/
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /*START: add event listener to clickable element on event click*/
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /*prevent from default action on event*/
        event.preventDefault();
        /*find active products (that have active class)*/
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /*if there's an active product and it's not thisProduct.element, removeclass active from it*/
        for (let product of activeProducts){
          const productClass = product.getAttribute('class');
          if (productClass.indexOf('active') > -1 && product !== thisProduct.element) {
            product.classList.remove('active');
          }
        }
        /*toggle active class on thisProduct.element*/
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm(){
      const thisProduct = this;
      console.log('function initOrderForm called', thisProduct.formInputs);
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let formInput of thisProduct.formInputs){
        formInput.addEventListener('change', function(event){
          event.preventDefault();
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });


    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);  // we know what has been chosen on the form
      console.log('The form data looks like: ', formData);
      console.log('function ProcessOrder called on:', thisProduct.id);

      //set price to default defaultValue
      let price = thisProduct.data.price;
      console.log('default price: ', price);

      for(let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        console.log('parameter ID: ', paramId);
        console.log('parameter: ', param);  //the table which name is paramId

        let elementHTML = '';
        if (param.type !== 'select'){
          for(let optionId in param.options){
            const option = param.options[optionId];
            const imageClass = paramId + '-' + optionId;
            const imageHTML = thisProduct.imageWrapper.getElementsByClassName(imageClass);
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
      }

      price = price*formData.amount;
      console.log('Total price ', price);

    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products){
        new Product (productData, thisApp.data.products[productData]);
        console.log('And the productData is... : ', productData);
        console.log('which contains : ', thisApp.data.products[productData].description);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
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
    },
  };

  app.init();
}
