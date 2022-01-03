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
      thisProduct.active = thisProduct.element.querySelector(select.all.menuProductsActive);
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
      console.log('function ProcessOrder called on:', thisProduct.id);
      const formData = utils.serializeFormToObject(thisProduct.form);  // we know what has been chosen on the form
      console.log('form data: ', formData);
      console.log('the options choosed in the form are:');


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
            console.log('option ID: ', optionId);
            console.log('option: ', option);  //the table which name is optionId
            console.log('price of the option: ', option.price);
            //const optionPrice = option.price;

            elementHTML = document.getElementById(optionId);
            console.log('elmt HTML: ', elementHTML);

            if(option.default && elementHTML.checked){
              console.log('default and checked');
              price += 0;
            }
            if(option.default && !(elementHTML.checked)){
              console.log('default and NOT checked');
              price -= option.price;
            }
            if(!option.default && elementHTML.checked){
              console.log('NOT default and checked');
              price += option.price;
            }
          }
        } else {
          const elem = document.querySelector('select');
          console.log('select element: ', elem);
          const elementHTMLs = elem.querySelectorAll('option');
          for (let optionElement of elementHTMLs){
            elementHTML = optionElement;
            console.log('other elmt HTML: ', optionElement);
            const optionPrice = param.options[elementHTML.value].price;
            console.log('option price for the element: ', optionPrice);

            if(elementHTML.value == 'standard' && (elementHTML.selected)){
              console.log('default: ', elementHTML.value == 'standard');
              console.log('selected: ', elementHTML.selected);
              console.log('price =  ' + price + '+' + 0);
              price += 0;
              console.log('updated price: ', price);
            } else if(elementHTML.value == 'standard' && !(elementHTML.selected)){
              console.log('default: ', elementHTML.value == 'standard');
              console.log('selected: ', elementHTML.selected);
              console.log('price =  ' + price + '+' - optionPrice);
              price -= optionPrice;
              console.log('updated price: ', price);
            } else if(!(elementHTML.value == 'standard') && elementHTML.selected){
              console.log('default: ', elementHTML.value == 'standard');
              console.log('selected: ', elementHTML.selected);
              console.log('price =  ' + price + '+' + optionPrice);
              price += optionPrice;
              console.log('updated price: ', price);
            } else {
              console.log('default: ', elementHTML.value == 'standard');
              console.log('selected: ', elementHTML.selected);
              console.log('price =  ' + price + '+' + 0);
              price += 0;
              console.log('updated price: ', price);
            }
          }
        }
      }

      price = price*formData.amount;
      console.log('price ', price);

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
