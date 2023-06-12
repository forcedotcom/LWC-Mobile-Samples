import { LightningElement, api } from 'lwc';
import customLabels from './labels';

export default class MobileAppointmentBookingCompactAppointmentInfo extends LightningElement {
  LABELS = customLabels;
  serviceAppointmentObjectFieldsList;
  _serviceAppointmentObject;

  @api assignToName;
  @api contactName;
  workTypeName = '';
  appointmentNumber = '';
  endDate;
  startDate;
  // appointmentDateTime = "";
  _compactInfoObj;

  connectedCallback() {
    this.showCustomFields = false;
  }

  @api get compactInfoObj() {
    return this._compactInfoObj;
  }
  set compactInfoObj(value) {
    if (value) {
      this._compactInfoObj = value;
      this.workTypeName = value.workTypeName && value.workTypeName;
      this.appointmentNumber = value.appointmentNumber && value.appointmentNumber;
      // this.createAppointmrntDateTimeDisplayInfo(value.startDate, value.endDate);
    }
  }

  //    createAppointmrntDateTimeDisplayInfo(startDate, endDate) {
  //         if (this.isNotNullOrUndefined(startDate) && this.isNotNullOrUndefined(endDate)){
  //             this.appointmentDateTime = formatAppointmentDateandHourRange(startDate,endDate);
  //         } else if(this.isNotNullOrUndefined(startDate)){
  //             this.appointmentDateTime = formatAppointmentDateandHourRange(startDate,null);
  //         } else {
  //             this.appointmentDateTime = "";
  //         }
  //     }

  isNotNullOrUndefined(value) {
    return value && value !== 'null';
  }
}
