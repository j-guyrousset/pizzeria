import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.tableSelected;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    //address examples:
    //http://localhost:3131/booking?date_gte+2019-01-01&date_lte=2019-12-31
    //http://localhost:3131/event?repeat=false&date_gte=2019-01-01&date_lte=2019-12-31
    //http://localhost:3131/event?repeat_ne=false&date_gte+2019-01-01

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),  //elements of table params.booking (dates of beginning and end) are joined wit & between them
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('addresses: ', urls);

    //connecting to API server
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log('bookings: ', bookings);
        //console.log('eventsCurrent: ', eventsCurrent);
        //console.log('eventsRepeat: ', eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){  // We want to know which stool is free at the time someone wants to book a table taking inton account other bookings, and events
    const thisBooking = this;                       // checking it on the fly is very demanding, so we create a cheat sheet of all the reservations

    thisBooking.booked = {};

    for (let item of bookings){
      thisBooking.makeOrder(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent){
      thisBooking.makeOrder(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeOrder(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeOrder(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hour] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }


  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        if (table.classList.contains(classNames.booking.tableSelected)){
          table.classList.remove(classNames.booking.tableSelected);
        }
        table.classList.add(classNames.booking.tableBooked);

      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(generatedDOM);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.plan = thisBooking.dom.wrapper.querySelector(select.booking.plan);
  }

  initTables(tableId){
    const thisBooking = this;

    for (let table of thisBooking.dom.tables){
      thisBooking.tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (table.classList.contains(classNames.booking.tableSelected) || table.classList.contains(classNames.booking.tableBooked)){
        table.classList.remove(classNames.booking.tableSelected);
      } else {
        table.classList.toggle(classNames.booking.tableSelected, tableId == thisBooking.tableId);
      }
    }

    for (let table of thisBooking.dom.tables){
      if (table.classList.contains(classNames.booking.tableSelected)){
        thisBooking.tableSelected = table.getAttribute(settings.booking.tableIdAttribute);
        break;
      } else {
        thisBooking.tableSelected ='';
      }
    }
    console.log('thisBooking.tableSelected: ', thisBooking.tableSelected);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);


    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.plan.addEventListener('click', function(event){
      event.preventDefault();
      const clickedElem = event.target;
      const clickedElemId = clickedElem.getAttribute(settings.booking.tableIdAttribute);

      if (clickedElem.classList.contains(classNames.booking.table)){
        thisBooking.initTables(clickedElemId);
      }

      if (clickedElem.classList.contains(classNames.booking.tableBooked)){
        alert('This table is already booked.');
      }

    });


  }

}


export default Booking;
