import { LightningElement, api, track } from 'lwc';

export default class DashboardToastMessage extends LightningElement {
  @track toastList = [];
  @track toastId = 0;
  @api timeout = 3000;
  @api sticky = false;

  @api showToast(type, message) {
    const toast = {
      type,
      headerMessage: type,
      message,
      id: this.toastId,
      iconName: `utility:${type}`,
      headerClass: `slds-notify slds-notify_toast slds-theme_${type}`,
    };
    this.toastId += 1;
    this.toastList.push(toast);

    if (!this.sticky) {
      setTimeout(() => {
        this.closeModal();
      }, this.timeout);
    }
  }

  closeModal() {
    const index = this.toastId - 1;
    if (index != -1) {
      this.toastList.splice(index, 1);
      this.toastId -= 1;
    }
  }

  handleClose(event) {
    const index = event.target.dataset.index;
    if (index != -1) {
      this.toastList.splice(index, 1);
      this.toastId -= 1;
    }
  }
}
