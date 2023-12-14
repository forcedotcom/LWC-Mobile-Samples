import { api } from "lwc";
import LightningModal from "lightning/modal";

export default class ConfirmModal extends LightningModal {
  @api content;
  @api header;
  @api okButtonText;
  @api cancelButtonText;

  handleOk() {
    this.close(true);
  }

  handleCancel() {
    this.close(false);
  }
}
