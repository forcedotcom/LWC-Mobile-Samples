import { LightningElement, api } from "lwc";

export default class DashboardAddButton extends LightningElement {
  @api label;
  @api handleAddClick;
  @api disabled;
}
