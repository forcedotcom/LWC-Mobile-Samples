import customLabels from './constantsLabels';

const MONTHNAME = [ customLabels.FollowUpAppointments_MonthName_January,
    customLabels.FollowUpAppointments_MonthName_February,
    customLabels.FollowUpAppointments_MonthName_March,
    customLabels.FollowUpAppointments_MonthName_April,
    customLabels.FollowUpAppointments_MonthName_May,
    customLabels.FollowUpAppointments_MonthName_June,
    customLabels.FollowUpAppointments_MonthName_July,
    customLabels.FollowUpAppointments_MonthName_August,
    customLabels.FollowUpAppointments_MonthName_September,
    customLabels.FollowUpAppointments_MonthName_October,
    customLabels.FollowUpAppointments_MonthName_November,
    customLabels.FollowUpAppointments_MonthName_December];

const DAYNAME = [ customLabels.FollowUpAppointments_WeekDayLong_Sunday,
    customLabels.FollowUpAppointments_WeekDayLong_Monday,
    customLabels.FollowUpAppointments_WeekDayLong_Tuesday,
    customLabels.FollowUpAppointments_WeekDayLong_Wednesday,
    customLabels.FollowUpAppointments_WeekDayLong_Thursday,
    customLabels.FollowUpAppointments_WeekDayLong_Friday,
    customLabels.FollowUpAppointments_WeekDayLong_Saturday ];


    /** Shifted this method up because of lint issues */
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



    /** Shifted this method up because of lint issues */
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
        return "";    // removed else part : lint fixes
        
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