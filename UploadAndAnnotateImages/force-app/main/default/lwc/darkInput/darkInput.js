import { api, LightningElement } from "lwc";

export default class DarkInput extends LightningElement {
  @api
  label;

  @api
  placeholder;

  @api
  required;

  @api
  multiline;

  // You must specify "multiline=true" when changing the number of rows
  @api
  rows = 1;

  _maxCharacters;
  @api
  get maxCharacters() {
    return this._maxCharacters;
  }
  set maxCharacters(value) {
    this._maxCharacters = parseInt(value, 10);
  }

  @api
  get value() {
    return this.inputText;
  }
  set value(value) {
    this.inputText = value;

    if (this.rendered) {
      this.inputElement.value = value;
    }
  }

  _inputText = "";
  get inputText() {
    return this._inputText;
  }
  set inputText(value) {
    this._inputText = value;
    this.charactersCount = this.inputText?.length || 0;
    this.dispatchEvent(
      new CustomEvent("change", { detail: { value: this.inputText } })
    );
  }

  get displayCharactersCount() {
    return this.maxCharacters && this.isFocus;
  }

  charactersCount = 0;
  isFocus = false;

  rendered = false;
  renderedCallback() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;

    this.inputElement.value = this.inputText;
  }

  get inputElement() {
    return this.template.querySelector('[data-id="input"]');
  }

  handleInputChange(event) {
    if (
      this.maxCharacters &&
      this.inputElement.value.length > this.maxCharacters &&
      event.inputType.startsWith("insert")
    ) {
      this.inputElement.value = this.inputText;
      return;
    }
    this.inputText = this.inputElement.value;
  }

  handleInputFocus() {
    this.isFocus = true;
  }

  handleInputBlur() {
    this.isFocus = false;
  }
}
