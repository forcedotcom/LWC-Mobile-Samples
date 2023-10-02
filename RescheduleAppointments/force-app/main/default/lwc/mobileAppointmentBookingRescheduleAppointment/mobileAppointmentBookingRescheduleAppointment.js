import { LightningElement, api } from "lwc";
import customLabels from "./labels";
export default class MobileAppointmentBookingRescheduleAppointment extends LightningElement {
  LABELS = customLabels;
  beforeScheduling = true;
  showSpinner = false;
  scheduleSuccess = false;
  mainTitle = this.LABELS.Reschedule_Appointment_new_appointment_msg;
  rescheduleBtnTitle =
    this.LABELS.Reschedule_Appointment_accept_new_appointment_button;
  successTitle = this.LABELS.Reschedule_Appointment_bottom_sheet_success;
  failureTitle = this.LABELS.Reschedule_Appointment_bottom_sheet_failure_title;
  failurBody = this.LABELS.Reschedule_Appointment_bottom_sheet_failure_body;
  confirmAndCloseBtn = this.LABELS.Reschedule_Appointment_OK;
  @api workTypeName;
  @api newAppointmentDate;
  @api appointmentNumber;
  @api assignToName;

  handleConfirmBtnClose(event) {
    event.stopPropagation();
    const customEvent = new CustomEvent("rescheduleclosewindow");
    this.dispatchEvent(customEvent);
  }

  handleConfirm(event) {
    event.stopPropagation();
    this.showSpinner = true;

    const customEvent = new CustomEvent("rescheduleconfirmed");
    this.dispatchEvent(customEvent);
  }

  @api handleSchedulingResponse(response) {
    this.beforeScheduling = false;
    this.showSpinner = false;
    this.scheduleSuccess = response;
  }
}
