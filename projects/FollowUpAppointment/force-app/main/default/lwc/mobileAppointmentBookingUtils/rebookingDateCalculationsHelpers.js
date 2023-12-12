// eslint-disable-next-line no-unused-vars
const SCHEDULING_UNIT_DAY = "Days";
const SCHEDULING_UNIT_WEEK = "Weeks";
const SCHEDULING_UNIT_MONTH = "Months";

const calculateMaxValidHorizonDate = (
  schedulingHorizonValue,
  selectedHorizonUnit,
  serviceAppointmentDueDate
) => {
  if (schedulingHorizonValue && selectedHorizonUnit) {
    let currentDate = new Date();
    let targetDate;
    switch (selectedHorizonUnit) {
      case SCHEDULING_UNIT_WEEK:
        targetDate = new Date(
          currentDate.setDate(
            currentDate.getDate() + schedulingHorizonValue * 7
          )
        );
        break;
      case SCHEDULING_UNIT_MONTH:
        targetDate = new Date(
          currentDate.setMonth(currentDate.getMonth() + schedulingHorizonValue)
        );
        break;
      default: //this.SCHEDULING_UNIT_DAY
        targetDate = new Date(
          currentDate.setDate(currentDate.getDate() + schedulingHorizonValue)
        );
    }

    console.log("Scheduling horizon unit : new date is  : " + targetDate);

    if (serviceAppointmentDueDate < targetDate)
      return serviceAppointmentDueDate;

    return targetDate;
  }
  return serviceAppointmentDueDate;
};

const convertDateUTCtoLocal = (date) => {
  if (date && date !== "null") {
    return new Date(date.replace(/ /g, "T") + ".000Z");
  }
  return "";
};

export { calculateMaxValidHorizonDate, convertDateUTCtoLocal };
