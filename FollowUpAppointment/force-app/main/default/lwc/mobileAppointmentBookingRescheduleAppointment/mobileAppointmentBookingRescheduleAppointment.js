import { LightningElement, api } from 'lwc';
import customLabels from './labels';
export default class MobileAppointmentBookingRescheduleAppointment extends LightningElement {
  LABELS = customLabels;
  beforeScheduling = true;
  showSpinner = false;
  scheduleSuccess = false;
  mainTitle = this.LABELS.FollowUpAppointments_new_appointment_msg;
  rescheduleBtnTitle = this.LABELS.FollowUpAppointments_accept_new_appointment_button;
  successTitle = this.LABELS.FollowUpAppointments_bottom_sheet_success;
  failureTitle = this.LABELS.FollowUpAppointments_bottom_sheet_failure_title;
  failurBody = this.LABELS.FollowUpAppointments_bottom_sheet_failure_body;
  confirmAndCloseBtn = this.LABELS.FollowUpAppointments_OK;
  @api workTypeName;
  @api newAppointmentDate;
  @api contactName;
  @api assignToName;
  @api newRecordNumber;

  handleCloseModal() {
    // close the modal without scheduling
    const customEvent = new CustomEvent('closeslotmodal');
    this.dispatchEvent(customEvent);
  }

  handleConfirmBtnClose() {
    // close the modal window after scheduling success of fail
    document.body.style.overflow = 'auto';
    const customEvent = new CustomEvent('scheduleclosewindow');
    this.dispatchEvent(customEvent);
  }

  handleConfirm() {
    // press on Book Appointment button to schedule the SA
    this.showSpinner = true;
    const customEvent = new CustomEvent('scheduleconfirmed');
    this.dispatchEvent(customEvent);
  }

  @api handleSchedulingResponse(response) {
    // calls at the end of scheduling process
    this.beforeScheduling = false;
    this.showSpinner = false;
    this.scheduleSuccess = response;
    document.body.style.overflow = 'hidden';
  }
}
