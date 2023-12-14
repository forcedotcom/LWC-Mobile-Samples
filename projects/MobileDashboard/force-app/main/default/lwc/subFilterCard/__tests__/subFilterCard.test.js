/* eslint-disable @lwc/lwc/prefer-custom-event */
import { createElement } from "lwc";
import SubFilterCard from "c/subFilterCard";

let element;
describe("c-sub-filter-card", () => {
  beforeEach(() => {
    element = createElement("c-sub-filter-card", {
      is: SubFilterCard
    });

    element.index = 0;
    element.objectValue = "Account";
    element.filter = {
      key: "xtao8a",
      field: "Status",
      fieldDisplay: "Status",
      fieldType: "PICKLIST",
      operator: "eq",
      value: "Completed",
      label: "Completed",
      icon: "utility: like",
      color: "#3DBA63"
    };
    element.fieldsOptions = [
      { label: "A", value: "a" },
      { label: "B", value: "b" }
    ];
    element.layout = "SIDE";
    element.updateSubFilter = jest.fn();
    element.duplicateSubFilter = jest.fn();
    element.deleteSubFilter = jest.fn();

    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Label and color are correct", () => {
    const inputs = element.shadowRoot.querySelectorAll("lightning-input");
    const label = inputs[0];
    const color = inputs[1];
    expect(label.value).toBe("Completed");
    expect(color.value).toBe("#3DBA63");
  });

  it("should call duplicateSubFilter when duplicate clicked", async () => {
    const action = element.shadowRoot.querySelectorAll(
      "lightning-menu-item"
    )[0];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.duplicateSubFilter).toHaveBeenCalled();
    });
  });

  it("should call deleteSubFilter when delete clicked", async () => {
    const action = element.shadowRoot.querySelectorAll(
      "lightning-menu-item"
    )[1];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.deleteSubFilter).toHaveBeenCalled();
    });
  });

  it("should call updateSubFilter when change label", async () => {
    const inputs = element.shadowRoot.querySelectorAll("lightning-input");
    const label = inputs[0];
    label.value = "a";
    label.dispatchEvent(new Event("change"));
    return Promise.resolve().then(() => {
      expect(element.updateSubFilter).toHaveBeenCalled();
    });
  });

  it("should call updateSubFilter when change icon", async () => {
    const inputs = element.shadowRoot.querySelectorAll("lightning-input");
    const icon = inputs[1];
    icon.value = "utility:error";
    icon.dispatchEvent(new Event("change"));
    return Promise.resolve().then(() => {
      expect(element.updateSubFilter).toHaveBeenCalled();
    });
  });

  it("return false from checkValidation when fields are valid", async () => {
    const input = element.shadowRoot.querySelector(".label-input");
    input.validity = { valid: false };

    const basic = element.shadowRoot.querySelector("c-basic-filter");
    basic.checkValidation = () => false;

    const isValid = element.checkValidation();
    expect(isValid).toBeFalsy();
  });
});
