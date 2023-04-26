import { LightningElement } from "lwc";
import { Colors } from "c/utilsImageCapture";

export default class ColorsPicker extends LightningElement {
  selectedColor = Colors.Red;

  connectedCallback() {
    this.notifyColorChanged();
  }

  notifyColorChanged() {
    this.dispatchEvent(
      new CustomEvent("colorchanged", {
        detail: this.selectedColor
      })
    );
  }

  get isRedSelected() {
    return this.selectedColor === Colors.Red;
  }

  selectColorRed() {
    this.selectedColor = Colors.Red;
    this.notifyColorChanged();
  }

  get isGreenSelected() {
    return this.selectedColor === Colors.Green;
  }

  selectColorGreen() {
    this.selectedColor = Colors.Green;
    this.notifyColorChanged();
  }

  get isWhiteSelected() {
    return this.selectedColor === Colors.White;
  }

  selectColorWhite() {
    this.selectedColor = Colors.White;
    this.notifyColorChanged();
  }

  get isBlackSelected() {
    return this.selectedColor === Colors.Black;
  }

  selectColorBlack() {
    this.selectedColor = Colors.Black;
    this.notifyColorChanged();
  }
}
