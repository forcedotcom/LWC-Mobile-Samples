import { LightningElement, api } from "lwc";

export default class MediumHeaderText extends LightningElement {
  @api text;
  @api colorhex;
  @api topPadding;
  @api leftPadding;
  @api rightPadding;
  @api bottomPadding;
  get inlineStyle() {
    return `color:#${this.colorhex}; padding:${this.topPadding}px ${this.rightPadding}px ${this.bottomPadding}px ${this.leftPadding}px`;
  }
}
