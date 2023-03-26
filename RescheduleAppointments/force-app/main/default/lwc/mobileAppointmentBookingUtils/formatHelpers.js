import customLabels from "./constantsLabels";

const MONTHNAME = [
  customLabels.Appointment_ReBooking_MonthName_January,
  customLabels.Appointment_ReBooking_MonthName_February,
  customLabels.Appointment_ReBooking_MonthName_March,
  customLabels.Appointment_ReBooking_MonthName_April,
  customLabels.Appointment_ReBooking_MonthName_May,
  customLabels.Appointment_ReBooking_MonthName_June,
  customLabels.Appointment_ReBooking_MonthName_July,
  customLabels.Appointment_ReBooking_MonthName_August,
  customLabels.Appointment_ReBooking_MonthName_September,
  customLabels.Appointment_ReBooking_MonthName_October,
  customLabels.Appointment_ReBooking_MonthName_November,
  customLabels.Appointment_ReBooking_MonthName_December
];

const DAYNAME = [
  customLabels.Appointment_ReBooking_WeekDayLong_Sunday,
  customLabels.Appointment_ReBooking_WeekDayLong_Monday,
  customLabels.Appointment_ReBooking_WeekDayLong_Tuesday,
  customLabels.Appointment_ReBooking_WeekDayLong_Wednesday,
  customLabels.Appointment_ReBooking_WeekDayLong_Thursday,
  customLabels.Appointment_ReBooking_WeekDayLong_Friday,
  customLabels.Appointment_ReBooking_WeekDayLong_Saturday
];

const getFormattedTime = (date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
};

const formatDateWithTime = (date) => {
  let d = new Date(date);
  let formatedStr =
    DAYNAME[d.getDay()] +
    "," +
    "  " +
    MONTHNAME[d.getMonth()] +
    " " +
    d.getDate() +
    ", " +
    getFormattedTime(d);

  return formatedStr;
};

const formatAppointmentDateandHourRange = (startDate, endDate) => {
  let formatedStr = "";
  if (startDate && endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    formatedStr = formatDateWithTime(startDate);
    if (start.getDate() === end.getDate()) {
      //Assumes same day
      if (!(start.getTime() === end.getTime())) {
        formatedStr = formatedStr + " - " + getFormattedTime(end);
      }
    } else {
      //If more than one day
      formatedStr = formatedStr + +" - " + formatDateWithTime(end);
    }
  } else if (startDate) {
    formatedStr = formatDateWithTime(startDate);
  }

  return formatedStr;
};

const convertDateUTCtoLocal = (date) => {
  if (date && date !== "null") {
    let utcDate = new Date(date);
    utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
    return utcDate;
  }
  return "";
};

const getDateWithoutTime = (date) => {
  var d;
  if (typeof val === "string") {
    d = new Date(date.replace(/-/g, "/")); // replace method is use to support time in safari
  } else {
    d = new Date(date);
  }
  d.setHours(0, 0, 0, 0);
  return d;
};

export {
  formatAppointmentDateandHourRange,
  convertDateUTCtoLocal,
  getDateWithoutTime
};
