import { LightningElement, api } from "lwc";
import customLabels from "./labels";

const assignmentMethod = {
  ASSIGN_TO_ME: "assignToMe",
  ASSIGN_TO_ANY_AVIALABLE: "assignToAnyAvailable"
};
export default class MobileAppointmentBookingSlotsContainer extends LightningElement {
  LABELS = customLabels;
  timeSlotDateWise = [];
  timeSlotsForCurrentMobileWorker = [];
  timeSlotsForAllMobileWorkers = [];
  currentTimeSlotsObj = this.timeSlotsForCurrentMobileWorker;
  slotsData = {};
  @api formattedTimeSlotArray = [];
  @api formattedTimeSlotArrayTemp = [];
  @api formattedRecommendedSlotsArray = [];
  @api timeSlotArrayByDate = [];
  _selectedDate;
  _showExactArrivalTime;
  @api maxValidCalendarDate;
  _pageTitle;
  timeSlotTitle;
  nonAvailableDateArray = [];
  _noOfDaysBeforeAfterWeek = 2;
  firstDayOfTheWeek;
  lastDayOfTheWeek;
  firstSlotDate;
  @api hideNonAvailableAppointments;
  _previousSelectedSlot;
  displayNoSlotsMsg;
  _showMobileWorkerChoice;
  noSlotsBody;
  @api recommendedScore;

  MONTHNAME = [
    this.LABELS.Appointment_ReBooking_MonthName_January,
    this.LABELS.Appointment_ReBooking_MonthName_February,
    this.LABELS.Appointment_ReBooking_MonthName_March,
    this.LABELS.Appointment_ReBooking_MonthName_April,
    this.LABELS.Appointment_ReBooking_MonthName_May,
    this.LABELS.Appointment_ReBooking_MonthName_June,
    this.LABELS.Appointment_ReBooking_MonthName_July,
    this.LABELS.Appointment_ReBooking_MonthName_August,
    this.LABELS.Appointment_ReBooking_MonthName_September,
    this.LABELS.Appointment_ReBooking_MonthName_October,
    this.LABELS.Appointment_ReBooking_MonthName_November,
    this.LABELS.Appointment_ReBooking_MonthName_December
  ];

  DAYNAME = [
    this.LABELS.Appointment_ReBooking_WeekDayLong_Sunday,
    this.LABELS.Appointment_ReBooking_WeekDayLong_Monday,
    this.LABELS.Appointment_ReBooking_WeekDayLong_Tuesday,
    this.LABELS.Appointment_ReBooking_WeekDayLong_Wednesday,
    this.LABELS.Appointment_ReBooking_WeekDayLong_Thursday,
    this.LABELS.Appointment_ReBooking_WeekDayLong_Friday,
    this.LABELS.Appointment_ReBooking_WeekDayLong_Saturday
  ];

  @api get selectedDate() {
    return this._selectedDate;
  }
  set selectedDate(value) {
    if (value) {
      this._selectedDate = this.getDateWithoutTime(Date.parse(value));
      console.log("Selected Date in timeSlot : " + this._selectedDate);
      this.firstDayOfTheWeek = this.getFirstDayOfWeek(this._selectedDate, 0);
      this.lastDayOfTheWeek = this.getLastDayOfWeek(this._selectedDate, 0);

      this.handleTimeSlotTitle();
      this.handleDateSelectEvent(this._selectedDate);
      this.afterDateSelection(this._selectedDate);
      this.executeScroll(this.formatTitle(this._selectedDate));
    }
  }

  @api get timeSlotObject() {
    return this.currentTimeSlotsObj;
  }
  set timeSlotObject(value) {
    let updatedData;
    if (!value) {
      this.formattedTimeSlotArray = [];
      this.formattedRecommendedSlotsArray = [];
      this.displayNoSlotsMsg = true;
    } else {
      this.lockScrolling();
      if (value.length > 0) {
        this.updateSlotData(value);
      }
      updatedData = Object.values(
        this.slotsData[this.slotsData.currentAssignmentMethodRef]
      );
      this.handleTimeSlotUpdateEvent(updatedData);
    }
  }

  @api get showExactArrivalTime() {
    return this._showExactArrivalTime;
  }
  set showExactArrivalTime(value) {
    this._showExactArrivalTime = value;
  }
  isWeekUpdated = false;

  @api onWeekUpdated(date) {
    let slotsData;

    this.isWeekUpdated = true;
    console.log("Week change in parent class " + date);
    this.firstDayOfTheWeek = this.getFirstDayOfWeek(date, 0);
    this.lastDayOfTheWeek = this.getLastDayOfWeek(date, 0);
    this.selectedDate = date;
    slotsData = Object.values(
      this.slotsData[this.slotsData.currentAssignmentMethodRef]
    );
    this.handleTimeSlotUpdateEvent(slotsData);
  }

  @api get showNoOfDaysBeforeAfterWeek() {
    return this._noOfDaysBeforeAfterWeek;
  }
  set showNoOfDaysBeforeAfterWeek(value) {
    if (value) {
      this._noOfDaysBeforeAfterWeek = value;
    }
  }

  @api get maxValidDate() {
    return this.maxValidCalendarDate;
  }

  set maxValidDate(value) {
    if (value) {
      this.maxValidCalendarDate = value;
    }
  }

  @api
  get pageTitle() {
    return this._pageTitle;
  }

  set pageTitle(value) {
    this._pageTitle = value;
  }

  @api get showMobileWorkerChoice() {
    return this._showMobileWorkerChoice;
  }
  set showMobileWorkerChoice(value) {
    this._showMobileWorkerChoice = value;
  }

  constructor() {
    super();

    this.slotsData = {
      slotsForCurrentMobileWorker: {},
      slotsForAllMobileWorkers: {},
      currentAssignmentMethodRef: "slotsForCurrentMobileWorker"
    };
    this.displayNoSlotsMsg = true;
  }

  handleTimeSlotTitle() {
    if (this.selectedDate) this.timeSlotTitle = "Date : " + this.selectedDate;
  }

  formatTimeSlots(timeSlotArray) {
    var formattedSlotArr = [];
    console.log("---------- Time slots ----------");
    let currentDate = new Date();
    for (let i = 0; i < timeSlotArray.length; i++) {
      let array = [];
      array.dateTime = timeSlotArray[i];
      console.log("Time slot : " + timeSlotArray[i]);
      let timeSlot = timeSlotArray[i].split("#");
      let timeSlotDate = new Date(timeSlot[1].replace(/-/g, "/"));
      array.grade = timeSlot[2];
      if (timeSlotDate > currentDate) {
        if (this.showExactArrivalTime) {
          // SHOW ONLY ARRIVAL TIME INSTEAD OF WINDOW
          array.time = this.getTimeFromDate(timeSlot[0]);
        } else {
          // SHOW ARRIVAL WINDOW IF FALSE
          array.time =
            this.getTimeFromDate(timeSlot[0]) +
            "-" +
            this.getTimeFromDate(timeSlot[1]);
        }
        array.date = this.getDateWithoutTime(Date.parse(timeSlotDate));
        array.dateInMiliSec = this.getDateWithoutTime(
          Date.parse(timeSlotDate)
        ).getTime();
        formattedSlotArr.push(array);
      }
    }
    console.log("---------- Time slots ----------");
    return this.formatUniqueArray(formattedSlotArr);
  }

  formatUniqueArray(timeSlotArray) {
    let tempArrayMain = [];
    let timeSlotNewArray = [];
    let datesArray = [];

    // create array with unique dates
    for (let i = 0; i < timeSlotArray.length; i++) {
      if (!(tempArrayMain.indexOf(timeSlotArray[i].dateInMiliSec) > -1)) {
        tempArrayMain.push(timeSlotArray[i].dateInMiliSec);
        datesArray.push(new Date(timeSlotArray[i].dateInMiliSec));
      }
    }
    // add all time slot to the dates
    for (let j = 0; j < tempArrayMain.length; j++) {
      let arr = [];
      let date = tempArrayMain[j];
      // Check if the date is within MaxValid Date
      let maxDate = Date.parse(this.maxValidCalendarDate);
      if (date <= maxDate) {
        // get the date of the first slot from today
        if (this.firstSlotDate == null) {
          this.firstSlotDate = new Date(date);
        }
        arr.date = datesArray[j];
        arr.title = this.formatTitle(date);
        let tempArray = [];
        for (let k = 0; k < timeSlotArray.length; k++) {
          let timeDateArray = [];
          if (date === timeSlotArray[k].dateInMiliSec) {
            timeDateArray.label = timeSlotArray[k].time;
            timeDateArray.fullValue = timeSlotArray[k].dateTime;
            timeDateArray.grade = timeSlotArray[k].grade;
            timeDateArray.isRecomended =
              timeSlotArray[k].grade > this.recommendedScore ? true : false;
            tempArray.push(timeDateArray);
          }
        }
        arr.timeArray = tempArray;
        timeSlotNewArray.push(arr);
      }
    }

    return timeSlotNewArray;
  }

  formatTitle(value) {
    var date = new Date(value);
    var title =
      this.DAYNAME[date.getDay()] +
      "," +
      "  " +
      this.MONTHNAME[date.getMonth()] +
      " " +
      date.getDate();
    if (date.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)) {
      title = title + " , " + this.LABELS.Appointment_ReBooking_today_text;
    }
    return title;
  }

  handleDateSelectEvent(date) {
    this.timeSlotArrayByDate = [];
  }

  /**
   * CALL THIS METHOD WHEN TIMESLOT OBJECT IS UPDATED;
   */
  handleTimeSlotUpdateEvent(dateWiseSlotArray) {
    this.formattedTimeSlotArrayTemp = this.formatTimeSlots(dateWiseSlotArray);
    this.formattedTimeSlotArray = this.sortTimeSlotAccordingToWeekSelected(
      this.formattedTimeSlotArrayTemp
    );
    this.formattedRecommendedSlotsArray = this.filterRecommededSlots(
      this.formattedTimeSlotArray
    );
    if (this.formattedTimeSlotArray && this.formattedTimeSlotArray.length > 0) {
      this.displayNoSlotsMsg = false;
    } else {
      this.displayNoSlotsMsg = true;
    }
    this.allowScrolling();
    this.callCustomEvent("updateNonAvailableDates", this.nonAvailableDateArray);
  }

  sortTimeSlotAccordingToWeekSelected(dateWiseSlotArray) {
    var newSortedArray = [];

    for (let i = 0; i < dateWiseSlotArray.length; i++) {
      let date = new Date(dateWiseSlotArray[i].date);
      if (this.lastDayOfTheWeek >= date && this.firstDayOfTheWeek <= date) {
        newSortedArray.push(dateWiseSlotArray[i]);
      }
    }

    return this.addNonAvailableSlotsToList(newSortedArray);
  }

  addNonAvailableSlotsToList(newSortedArray) {
    this.nonAvailableDateArray = [];
    let loopDate = new Date(this.firstDayOfTheWeek);
    let currDate = this.getDateWithoutTime(Date.parse(new Date()));

    while (loopDate <= this.lastDayOfTheWeek) {
      let newDate = new Date(loopDate);
      let isIntheList = this.isInArray(newSortedArray, newDate);

      if (!isIntheList) {
        let arr = [];
        arr.date = newDate;
        arr.title = this.formatTitle(newDate);
        arr.noSlots = true;
        // hide the dates till first slot
        if (!(this.firstSlotDate == null) && newDate < this.firstSlotDate) {
          arr.hideFromView = true;
        }
        if (loopDate >= currDate) {
          newSortedArray.push(arr);
        }
        this.nonAvailableDateArray.push(newDate);
      }
      newDate = loopDate.setDate(loopDate.getDate() + 1);
      loopDate = new Date(newDate);
    }

    newSortedArray.sort(function (a, b) {
      var c = new Date(a.date);
      var d = new Date(b.date);
      return c - d;
    });

    this.nonAvailableDateArray = Array.from(
      new Set(this.nonAvailableDateArray)
    );
    return newSortedArray;
  }

  isInArray(array, value) {
    for (let i = 0; i < array.length; i++) {
      let dateT = new Date(array[i].date).setHours(0, 0, 0, 0);
      if (value.getTime() === new Date(dateT).getTime()) {
        return true;
      }
    }
    return false;
  }

  afterDateSelection(selectedDate) {
    var isDateAdded = false;
    if (this.formattedTimeSlotArrayTemp.length > 0) {
      // APPROACH 2 : CHECK FOR EACH DATE IF ADDED IN THE CACHE ARRAY
      for (let i = 0; i < this.formattedTimeSlotArrayTemp.length; i++) {
        let date = new Date(this.formattedTimeSlotArrayTemp[i].date);
        console.log("After Selected Date in loop is : " + date);
        console.log("After Selected date : " + selectedDate);
        if (selectedDate.getTime() === date.getTime()) {
          isDateAdded = true;
          console.log("After Selected date is true: " + selectedDate);
          break;
        }
      }
    }
    if (!isDateAdded) {
      console.log("Run apex class for query ");
      this.callCustomEvent("trigergetslotapi", selectedDate);
    }
  }

  callCustomEvent(name, value) {
    const customEvent = new CustomEvent("customeventcalled", {
      detail: { value: value, name: name }
    });
    this.dispatchEvent(customEvent);
  }

  getTimeFromDate(date) {
    var tempDate = new Date(date.replace(/ /g, "T"));
    var hours = tempDate.getHours();
    var minutes = tempDate.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  }

  getDateWithoutTime(date) {
    var d;
    if (typeof val === "string") {
      d = new Date(date.replace(/-/g, "/")); // replace method is use to support time in safari
    } else {
      d = new Date(date);
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  handleTimeSlotClickEvent(event) {
    var selectedSlot = event.target.title;
    var startEndTimeArray = selectedSlot.split("#");
    console.log("Selected slot is : " + selectedSlot);
    if (startEndTimeArray.length > 1) {
      let startTime = this.getDateFromString(startEndTimeArray[0]);
      let endTime = this.getDateFromString(startEndTimeArray[1]);
      const customEvent = new CustomEvent("slotselection", {
        detail: { startDate: startTime, endDate: endTime }
      });
      this.dispatchEvent(customEvent);
    }
  }

  getDateFromString(date) {
    if (date && date !== "null") {
      return new Date(date.replace(/ /g, "T"));
    }
    return "";
  }

  convertAMPMto24(time) {
    let hours = Number(time.match(/^(\d+)/)[1]);
    let minutes = Number(time.match(/:(\d+)/)[1]);
    let AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM === "PM" && hours < 12) hours = hours + 12;
    if (AMPM === "AM" && hours === 12) hours = hours - 12;
    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    return sHours + ":" + sMinutes;
  }

  handleFilterClickEvent(event) {
    console.log("Filter selected is : " + event.target.title);
  }

  getFirstDayOfWeek(date, index) {
    let start = index >= 0 ? index : 0;
    let d = new Date(date);
    let day = d.getDay();
    let diff = d.getDate() - day + (start > day ? start - 7 : start);
    d.setDate(diff);
    console.log("First day of week is : " + d.getDate());
    let newDate = new Date(
      d.setDate(d.getDate() - this.showNoOfDaysBeforeAfterWeek)
    ).setHours(0, 0, 0, 0);
    return newDate;
  }

  getLastDayOfWeek(date, index) {
    let start = index >= 0 ? index : 0;
    let d = new Date(date);
    let day = d.getDay();
    let diff = d.getDate() - day + (start > day ? start - 1 : 6 + start);
    d.setDate(diff);
    let newDate = new Date(
      d.setDate(d.getDate() + this.showNoOfDaysBeforeAfterWeek)
    ).setHours(0, 0, 0, 0);
    return newDate;
  }

  parentPosition;
  @api onPositionUpdated(te) {}

  previousElement;
  executeScroll(selectedDate) {
    let temp = '"' + selectedDate + '"';
    let dataId = "[data-id=" + temp + "]";
    console.log("Data is is : " + dataId);
    let elementToShow = this.template.querySelector(dataId);
    if (elementToShow) {
      try {
        if (this.previousElement) {
          this.previousElement.classList.remove("headerBold");
          this.previousElement.classList.add("header");
        }
        if (!this.isWeekUpdated) {
          elementToShow.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
        this.previousElement = elementToShow;
      } catch (e) {
        console.log("Error is : " + e);
      }
    }
    this.isWeekUpdated = false;
  }

  @api clearSlotsAfterAssignmentMethodChange(updatedAssignmentMethod) {
    let slotsData;
    this.formattedTimeSlotArray = [];
    this.formattedRecommendedSlotsArray = [];
    this.displayNoSlotsMsg = true;

    if (updatedAssignmentMethod === assignmentMethod.ASSIGN_TO_ME) {
      this.slotsData.currentAssignmentMethodRef = "slotsForCurrentMobileWorker";
    } else {
      this.slotsData.currentAssignmentMethodRef = "slotsForAllMobileWorkers";
    }

    slotsData = Object.values(
      this.slotsData[this.slotsData.currentAssignmentMethodRef]
    );
    this.handleTimeSlotUpdateEvent(slotsData);
  }

  filterRecommededSlots(AllFormattedSlots) {
    let filteredSlotsObj = [];
    AllFormattedSlots.forEach((itDate) => {
      if (itDate.timeArray) {
        let updatedSlot = {};
        let updatedTimeArray = [];
        updatedSlot.date = itDate.date;
        updatedSlot.title = itDate.title;

        itDate.timeArray.forEach((slot) => {
          if (slot.isRecomended === true) {
            updatedTimeArray.push({
              label: slot.label,
              fullValue: slot.fullValue,
              grade: slot.grade,
              isRecomended: slot.isRecomended
            });
          }
        });
        updatedSlot.timeArray = updatedTimeArray;
        if (updatedTimeArray.length > 0) {
          filteredSlotsObj.push(updatedSlot);
        }
      }
    });
    return filteredSlotsObj;
  }

  updateSlotData(newSlots) {
    let currentRef;
    let updatedData;
    //grouped by individual slots

    currentRef = this.slotsData.currentAssignmentMethodRef;
    updatedData = JSON.parse(JSON.stringify(this.slotsData[currentRef]));

    newSlots.forEach((slot) => {
      let slotInfoToArr = slot.split("#");
      let slotStart = new Date(slotInfoToArr[0]);
      let slotKey = slotStart.getTime();

      //Insert or Update incoming slot
      updatedData[slotKey] = slot;
    });

    this.slotsData[currentRef] = updatedData;
  }

  allowScrolling() {
    document.body.style.overflow = "auto";
    this.showDataSpinner = false;
  }
  lockScrolling() {
    document.body.style.overflow = "hidden";
    this.showDataSpinner = true;
  }
}
