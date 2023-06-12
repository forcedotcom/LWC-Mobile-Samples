/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track } from 'lwc';

const SUCCESS_CLASS = 'slds-notify slds-notify_toast slds-theme_success';
const WARNING_CLASS = 'slds-notify slds-notify_toast slds-theme_warning';
const ERROR_CLASS = 'slds-notify slds-notify_toast slds-theme_error';

export default class MobileAppointmentBookingCustomToast extends LightningElement {
  _variant;
  _title;
  _message;
  @track toastClass;

  connectedCallback() {
    if (this._variant) {
      if (this._variant === 'success') {
        this.toastClass = SUCCESS_CLASS;
      } else if (this._variant === 'warning') {
        this.toastClass = WARNING_CLASS;
      } else if (this._variant === 'error') {
        this.toastClass = ERROR_CLASS;
      }
    }
    //this.showToast = true;
    setTimeout(() => {
      this.handleCloseToastEvent();
    }, 5000);
  }

  @api get variant() {
    return this._variant;
  }

  set variant(value) {
    if (value) {
      this._variant = value;
    }
  }

  @api get title() {
    return this._title;
  }

  set title(value) {
    if (value) {
      this._title = value;
    }
  }

  @api get message() {
    return this._message;
  }

  set message(value) {
    if (value) {
      this._message = value;
    }
  }

  handleCloseToast() {
    this.handleCloseToastEvent();
  }

  handleCloseToastEvent() {
    const customEvent = new CustomEvent('closetoast', {
      detail: {},
    });
    this.dispatchEvent(customEvent);
  }
}
