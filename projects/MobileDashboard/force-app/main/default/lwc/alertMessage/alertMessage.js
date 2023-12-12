import { api } from "lwc";
import LightningModal from "lightning/modal";
import customLabels from "./labels";

export default class AlertMessage extends LightningModal {
  @api modalTitle;
  @api message;
  @api discardButtonText;
  @api isDeleteMsg;

  LABELS = customLabels;

  handleDiscardClick = () => {
    this.close();
  };

  handleDeleteClick = () => {
    this.close(true);
  };
}
