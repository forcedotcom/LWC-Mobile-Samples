import { api, LightningElement } from "lwc";
import { ToastTypes } from "c/utilsImageCapture";

export default class ToastMessage extends LightningElement {
  @api
  message;

  @api
  type;

  get typeName() {
    return this.type.description;
  }

  get iconHref() {
    switch (this.type) {
      case ToastTypes.Success: {
        return "/_slds/icons/utility-sprite/svg/symbols.svg#success";
      }
      case ToastTypes.Error: {
        return "/_slds/icons/utility-sprite/svg/symbols.svg#error";
      }
      case ToastTypes.Warning: {
        return "/_slds/icons/utility-sprite/svg/symbols.svg#warning";
      }
      default: {
        return "/_slds/icons/utility-sprite/svg/symbols.svg#info_alt";
      }
    }
  }

  get iconContainerClass() {
    var cls = "slds-icon_container slds-var-m-right_small ";
    switch (this.type) {
      case ToastTypes.Success: {
        cls += "slds-icon-utility-success";
        break;
      }
      case ToastTypes.Error: {
        cls += "slds-icon-utility-error";
        break;
      }
      case ToastTypes.Warning: {
        cls += "slds-icon-utility-warning";
        break;
      }
      default: {
        break;
      }
    }
    return cls;
  }

  get toastMessageClass() {
    var cls = "toast-message slds-notify slds-notify_alert ";
    switch (this.type) {
      case ToastTypes.Success: {
        cls += "slds-theme_success";
        break;
      }
      case ToastTypes.Error: {
        cls += "slds-theme_error";
        break;
      }
      case ToastTypes.Warning: {
        cls += "slds-theme_warning";
        break;
      }
      default: {
        break;
      }
    }
    return cls;
  }

  handleCloseClicked() {
    this.dispatchEvent(new CustomEvent("close"));
  }
}
