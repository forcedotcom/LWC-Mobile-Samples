import { LightningElement, api, wire } from "lwc";
import ID_FIELD from "@salesforce/schema/ServiceAppointment.Id";
import WORK_TYPE_FIELD from "@salesforce/schema/ServiceAppointment.WorkTypeId";
import SCHED_END_FIELD from "@salesforce/schema/ServiceAppointment.SchedEndTime";
import SCHED_START_FIELD from "@salesforce/schema/ServiceAppointment.SchedStartTime";
import APPOINTMENT_NUMBER_FIELD from "@salesforce/schema/ServiceAppointment.AppointmentNumber";
import DURATION from "@salesforce/schema/ServiceAppointment.Duration";
import Id from "@salesforce/user/Id";
import overrideCSS from "./overrideCSS";

export default class MobileAppointmentBookingSettingsContainer extends LightningElement {
  userId = Id;
  enableAssignToMe = true;
  enableAssignToEveryAvailable = true;
  recommendedScore = 80;
  _serviceAppointmentId;

  @api operatingHours = "";
  @api schedulingPolicy = "";

  @api schedulingHorizonUnit = "Months";
  @api schedulingHorizonValue = "3";
  @api showExactArrivalTime = false;
  @api maxDaysToGetAppointmentSlots = 10;

  @api set recordId(recordId) {
    if (recordId !== this._serviceAppointmentId) {
      this._serviceAppointmentId = recordId;
    }
  }

  get recordId() {
    return this._serviceAppointmentId;
  }

  currentAppointmentDefaultFieldNames = [
    ID_FIELD,
    WORK_TYPE_FIELD,
    SCHED_END_FIELD,
    SCHED_START_FIELD,
    APPOINTMENT_NUMBER_FIELD,
    DURATION
  ];

  connectedCallback() {
    //this.showExactArrivalTime = true;
    const myStyle = document.createElement("style");
    myStyle.innerHTML = overrideCSS;
    document.head.appendChild(myStyle);
  }
}
