import { LightningElement, api } from "lwc";

export default class SubFilterSummaryComponent extends LightningElement {
  @api counter;
  @api icon;
  @api label;
  @api color;
  @api layout;

  renderedCallback() {
    const text = this.template.querySelector(".sub-label");
    if (text) text.style.color = this.color;
    const icon = this.template.querySelector(".icon");
    if (icon) {
      icon.setAttribute(
        "style",
        `--lwc-colorTextIconDefault: ${this.color};
                --sds-c-icon-color-foreground-default: ${this.color}`
      );
    }
  }

  get noData() {
    return !this.label;
  }

  get mainContainerClass() {
    return `main-container ${this.layout === "SIDE" ? "side" : "stack"}`;
  }

  get counterDisplay() {
    return this.counter.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  get displayPlus() {
    return this.counter === 2000;
  }
}
