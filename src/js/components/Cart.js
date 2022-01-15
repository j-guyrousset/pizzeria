import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart: ', thisCart);
    //console.log('Cart wrapper: ', thisCart.dom.wrapper);
    //console.log('Cart toggle trigger: ', thisCart.dom.toggleTrigger);

  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
      console.log('submit clicked');
    });
  }

  remove(cartProduct){
    const thisCart = this;

    const domToRemove = cartProduct.dom.amountWidget.parentElement;
    domToRemove.remove();
    const cartProductIndex = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(cartProductIndex,1);
    thisCart.update();
  }

  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    //console.log('adding product: ', menuProduct);
    //console.log('products of this cart: ', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;

    let deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for(let product of thisCart.products){
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }
    if (subtotalPrice !==0){
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    } else {
      deliveryFee = 0;
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    for (let elem of thisCart.dom.totalPrice){
      elem.innerHTML = thisCart.totalPrice;
    }

  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {};
    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.dom.totalPrice[0].innerHTML;
    payload.subtotalPrice = thisCart.dom.subtotalPrice.innerHTML;
    payload.totalNumber = thisCart.dom.totalNumber.innerHTML;
    payload.deliveryFee = thisCart.dom.deliveryFee.innerHTML;
    payload.products = [];

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log('payload to send: ', payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

  }

}

export default Cart;
