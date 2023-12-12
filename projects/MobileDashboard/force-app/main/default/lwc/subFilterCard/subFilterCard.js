import { LightningElement, api } from "lwc";
import customLabels from "./labels";

export default class SubFilterCard extends LightningElement {
  @api index;
  @api objectValue;
  @api filter;
  @api fieldsOptions;
  @api layout;
  @api updateSubFilter;
  @api duplicateSubFilter;
  @api deleteSubFilter;
  LABELS = customLabels;

  tempFilter;
  dragDivider;
  canBeDragged = false;

  connectedCallback() {
    this.tempFilter = { ...this.filter };
  }

  renderedCallback() {
    this.dragDivider = this.template.querySelector(".drag-divider");
  }

  // eslint-disable-next-line no-unused-vars
  allowDrag = (e) => {
    this.canBeDragged = true;
  };

  // eslint-disable-next-line no-unused-vars
  @api disableDrag = (e) => {
    this.canBeDragged = false;
  };

  @api removeDragDivider() {
    this.dragDivider.classList.remove("drag-divider-active");
  }

  @api addDragDivider() {
    this.dragDivider.classList.add("drag-divider-active");
  }

  @api checkValidation() {
    let isValid = true;

    // check name
    const input = this.template.querySelector(".label-input");
    if (!input.validity.valid) {
      input.focus();
      input.blur();
      input.classList.add("slds-has-error");
      isValid = false;
    }

    // check the basic filter
    const basicFilter = this.template.querySelector("c-basic-filter");
    if (!basicFilter.checkValidation()) {
      isValid = false;
    }

    return isValid;
  }

  get colorPickerValue() {
    return this.tempFilter?.color;
  }

  set colorPickerValue(color) {
    this.tempFilter = { ...this.tempFilter, color };
  }

  get label() {
    return this.tempFilter?.label;
  }

  set label(label) {
    this.tempFilter = { ...this.tempFilter, label };
  }

  get icon() {
    return this.tempFilter?.icon;
  }

  setIcon = (icon) => {
    this.tempFilter = { ...this.tempFilter, icon };
    this.updateSubFilter(this.index, { icon });
  };

  onColorChange = (e) => {
    this.colorPickerValue = e.target.value;
    this.updateSubFilter(this.index, { color: this.colorPickerValue });
  };

  onLabelChange = (e) => {
    this.label = e.target.value;
    this.updateSubFilter(this.index, { label: this.label });
  };

  handleDuplicateFilterClick = () => {
    this.duplicateSubFilter(this.index);
  };

  handleDeleteFilterClick = () => {
    this.deleteSubFilter(this.index);
  };
}
