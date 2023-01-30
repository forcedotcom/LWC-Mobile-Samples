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

const formatAppointmentDateandHourRange = (startDate, endDate) => {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let formatedStr =
    DAYNAME[start.getDay()] +
    "," +
    "  " +
    MONTHNAME[start.getMonth()] +
    " " +
    start.getDate() +
    ", " +
    getFormattedTime(start) +
    " - ";

  if (start.getDate() == end.getDate()) {
    //Assumes same day
    formatedStr = formatedStr + getFormattedTime(end);
  } else {
    //If more than one day
    formatedStr =
      formatedStr +
      DAYNAME[end.getDay()] +
      "," +
      "  " +
      MONTHNAME[end.getMonth()] +
      " " +
      end.getDate() +
      ", " +
      getFormattedTime(end);
  }
  return formatedStr;
};

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

const convertDateUTCtoLocal = (date) => {
  if (date && date !== "null") {
    return new Date(date.replace(/ /g, "T") + ".000Z");
  } else {
    return "";
  }
};

export { formatAppointmentDateandHourRange, convertDateUTCtoLocal };
