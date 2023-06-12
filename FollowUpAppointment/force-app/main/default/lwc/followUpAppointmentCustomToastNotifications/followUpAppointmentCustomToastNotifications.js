/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from "lwc";

export default class FollowUpAppointmentCustomToastNotifications extends LightningElement {
  @track toastList = [];
  @api toastId = 0;
  @api timeout = 3000;
  @api sticky = false;

  @api showToast(type, message) {
    let toast = {
      type: type,
      headerMessage: type,
      message: message,
      id: this.toastId,
      iconName: "utility:" + type,
      headerClass: "slds-notify slds-notify_toast slds-theme_" + type
    };

    this.toastId = this.toastId + 1;
    this.toastList.push(toast);

    if (this.sticky === false) {
      setTimeout(() => {
        this.closeModal();
      }, this.timeout);
    }
  }

  @api closeModal() {
    let index = this.toastId - 1;
    if (index !== -1) {
      this.toastList.splice(index, 1);
      this.toastId = this.toastId - 1;
    }
  }
  @api handleClose(event) {
    let index = event.target.dataset.index;
    if (index !== -1) {
      this.toastList.splice(index, 1);
      this.toastId = this.toastId - 1;
    }
  }
}
