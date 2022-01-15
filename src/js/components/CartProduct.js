import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    //console.log('cart product (instance of its class) created: ', thisCartProduct);
  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove(){
    const thisCartProduct = this;
    const event = new CustomEvent('remove',{
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.prevent();

    });

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
      //console.log('thiscart has been removed: ', thisCartProduct);
    });
  }

  getData(){
    const thisCartProduct = this;
    const cartProductData = {};

    cartProductData.id = thisCartProduct.id;
    cartProductData.amount = thisCartProduct.amount;
    cartProductData.price = thisCartProduct.price;
    cartProductData.priceSingle = thisCartProduct.priceSingle;
    cartProductData.name = thisCartProduct.name;
    cartProductData.params = thisCartProduct.params;

    return cartProductData;

  }

}

export default CartProduct;
