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
      wrapperActive: '.active',
      imageVisible: '.active',
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
      thisProduct.initAccordion();

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

    initAccordion(){
      const thisProduct = this;

      /*find the clickable trigger (element that should react to click)*/
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /*START: add event listener to clickable element on event click*/
      clickableTrigger.addEventListener('click', function(event) {
        /*prevent from default action on event*/
        event.preventDefault();

        /*find active products (that have active class)*/
        const activeProducts = document.querySelectorAll('article' + classNames.menuProduct.wrapperActive);

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
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products){
        new Product (productData, thisApp.data.products[productData]);
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
