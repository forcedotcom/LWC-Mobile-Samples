/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api } from "lwc";
import customLabels from "./labels";

export default class MobileWorkFlowPreviewScreen extends LightningElement {
  @api currentScreen;
  LABELS = customLabels;
  @api handleEditButtonClickEvent;
  @api screenTitle =
    this.LABELS.FollowUpAppointments_preview_appointmentDateTime_title;
  @api screenSubTitle = "Step 1 of 4";
  fieldListArray = [];
  @api footerTitle = this.LABELS.FollowUpAppointments_preview_step_not_editable;
  @api appointmentDetailTitle =
    this.LABELS.FollowUpAppointments_preview_appointmentDetails_title;
  @api mobileWorkerText =
    this.LABELS.FollowUpAppointments_preview_mobileWorker_title;

  SUN = "SUN";
  MON = "MON";
  TUE = "TUE";
  WED = "WED";
  THU = "THU";
  FRI = "FRI";
  SAT = "SAT";

  @api get screenno() {
    return this.currentScreen;
  }
  set screenno(value) {
    console.log("screen no value is : " + value);
    if (value) {
      this.currentScreen = value;
    }
  }

  @api get screensubtitle() {
    return this.screenSubTitle;
  }
  set screensubtitle(value) {
    this.screenSubTitle = value;
  }
}
