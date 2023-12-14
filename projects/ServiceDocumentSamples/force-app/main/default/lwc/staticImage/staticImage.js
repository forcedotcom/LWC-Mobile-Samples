import { LightningElement, api } from "lwc";
import SALESFORCE_LOGO from "@salesforce/contentAssetUrl/salesforce";
export default class DemoSalesforceLogo extends LightningElement {
  @api width;
  @api height;
  // Expose the static resource URL for use in the template
  get salesforceUrl() {
    return SALESFORCE_LOGO;
  }
  get inlineStyle() {
    return `width: ${this.width}px;height: ${this.height}px`;
  }
}
