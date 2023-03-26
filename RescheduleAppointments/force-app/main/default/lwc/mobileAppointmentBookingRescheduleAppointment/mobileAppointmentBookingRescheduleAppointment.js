import { LightningElement, api } from "lwc";
import customLabels from "./labels";
export default class MobileAppointmentBookingRescheduleAppointment extends LightningElement {
  LABELS = customLabels;
  beforeScheduling = true;
  showSpinner = false;
  scheduleSuccess = false;
  mainTitle = this.LABELS.Appointment_ReBooking_new_appointment_msg;
  rescheduleBtnTitle =
    this.LABELS.Appointment_ReBooking_accept_new_appointment_button;
  successTitle = this.LABELS.Appointment_ReBooking_bottom_sheet_success;
  failureTitle = this.LABELS.Appointment_ReBooking_bottom_sheet_failure_title;
  failurBody = this.LABELS.Appointment_ReBooking_bottom_sheet_failure_body;
  confirmAndCloseBtn = this.LABELS.Appointment_ReBooking_OK;
  @api workTypeName;
  @api newAppointmentDate;
  @api appointmentNumber;
  @api assignToName;

  handleConfirmBtnClose() {
    const customEvent = new CustomEvent("rescheduleclosewindow");
    this.dispatchEvent(customEvent);
  }

  handleConfirm() {
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
