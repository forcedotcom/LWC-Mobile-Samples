import { LightningElement, api, track } from "lwc";
import customLabels from "./labels";
import {
  formatAppointmentDateandHourRange,
  convertDateUTCtoLocal
} from "c/mobileAppointmentBookingUtils";

export default class MobileAppointmentBookingCompactAppointmentInfo extends LightningElement {
  LABELS = customLabels;
  serviceAppointmentObjectFieldsList;
  _serviceAppointmentObject;
  @api showDefaultFields;
  @api showCustomFields;
  @api showModal;

  connectedCallback() {
    this.showCustomFields = false;
  }

  @api
  get appointmentNumber() {
    return (
      this.serviceAppointmentObject &&
      this.serviceAppointmentObject["AppointmentNumber"]
    );
  }

  @api
  get appointmentDateTime() {
    let dateTimeStr;

    if (
      this.serviceAppointmentObject &&
      this.isNotNullOrUndefined(
        this.serviceAppointmentObject["ArrivalWindowStartTime"]
      ) &&
      this.isNotNullOrUndefined(
        this.serviceAppointmentObject["ArrivalWindowEndTime"]
      )
    ) {
      let startDate = convertDateUTCtoLocal(
        this.serviceAppointmentObject["ArrivalWindowStartTime"]
      );
      let endDate = convertDateUTCtoLocal(
        this.serviceAppointmentObject["ArrivalWindowEndTime"]
      );

      dateTimeStr = formatAppointmentDateandHourRange(startDate, endDate);
    } else if (
      this.serviceAppointmentObject &&
      this.isNotNullOrUndefined(
        this.serviceAppointmentObject["SchedStartTime"]
      ) &&
      this.isNotNullOrUndefined(this.serviceAppointmentObject["SchedEndTime"])
    ) {
      let startDate = convertDateUTCtoLocal(
        this.serviceAppointmentObject["SchedStartTime"]
      );
      let endDate = convertDateUTCtoLocal(
        this.serviceAppointmentObject["SchedEndTime"]
      );

      dateTimeStr = formatAppointmentDateandHourRange(startDate, endDate);
    } else {
      dateTimeStr = "";
    }
    return dateTimeStr;
  }

  isNotNullOrUndefined(value) {
    return value && value != "null";
  }

  @api
  get appointmentWorkType() {
    return (
      this.serviceAppointmentObject &&
      this.serviceAppointmentObject["WorkTypeName"]
    );
  }

  @api
  get appointmentArrivalStart() {
    return (
      this.serviceAppointmentObject &&
      this.serviceAppointmentObject["ArrivalWindowStartTime"]
    );
  }

  @api
  get appointmentArrivalEnd() {
    return (
      this.serviceAppointmentObject &&
      this.serviceAppointmentObject["ArrivalWindowEndTime"]
    );
  }

  @api
  get appointmentSchedStart() {
    return (
      this.serviceAppointmentObject &&
      this.serviceAppointmentObject["SchedStartTime"]
    );
  }

  @api
  get appointmentSchedEnd() {
    return (
      this.serviceAppointmentObject &&
      this.serviceAppointmentObject["SchedEndTime"]
    );
  }

  @api
  get serviceAppointmentObject() {
    return this._serviceAppointmentObject;
  }

  set serviceAppointmentObject(value) {
    let updatedValue = value ? Object.values(value) : [];

    if (
      updatedValue &&
      updatedValue.length > 0 &&
      JSON.stringify(this.serviceAppointmentObjectFieldsList) !==
        JSON.stringify(updatedValue)
    ) {
      this.serviceAppointmentObjectFieldsList = updatedValue;
      this._serviceAppointmentObject = value;
    }
  }

  openModal(event) {
    event.preventDefault();

    console.log("dispatching open modal::: " + this.showModal);
    this.dispatchEvent(
      new CustomEvent("openmodal", {
        composed: true,
        bubbles: true
      })
    );
  }
}
