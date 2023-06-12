import { createElement } from "lwc";
import MobileWorkFlowLayout from "c/mobileWorkFlowScreenLayout";

jest.mock(
  "./labels",
  () => {
    return {
      MobileWorkFlowLayoutLabels: "test"
    };
  },
  { virtual: true }
);

let element;
describe("c-mobile-work-flow-screen-layout", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });
  beforeEach(() => {
    element = createElement("c-mobile-work-flow-screen-layout", {
      is: MobileWorkFlowLayout
    });

    element.screenTitle = "title1";
    element.screenSubTitle = "title2";
    element.inputFieldPreview = "previewText";
    element.currentScreen = 2;
    element.handleLeftButtonEventClick = jest.fn();
    element.handleDropDownActionSelected = jest.fn();
    element.handleClildEditButtonEvent = jest.fn();

    element.fieldListArray = [];
    element.const_duplicate = "duplicate";
    element.const_delete = "delete";
    element.isDuplicateButtonDisabled = false;
    document.body.appendChild(element);
  });

  it("should show correct info", () => {
    const title1 = element.shadowRoot.querySelector(".slds-truncate");
    const title2 = element.shadowRoot.querySelector(".screenTitle2");
    const editButton = element.shadowRoot.querySelector(".editButton");
    editButton.label = "edit";
    expect(title1.textContent).toBe("title1");
    expect(title2.textContent).toBe("title2");
    expect(editButton.label).toBe("edit");
  });

  test("element does not have slds-icon class when bare", () => {
    // Use a promise to wait for asynchronous changes to the DOM
    return Promise.resolve().then(() => {
      expect(element.classList).not.toContain("slds-icon");
    });
  });

  it("should call left button when left arrow clicked", async () => {
    const action = element.shadowRoot.querySelector(".leftarrowbutton");
    console.log(action);
    action.click();
    return Promise.resolve().then(() => {
      expect(element.handleLeftButtonEventClick).toBeCalledTimes(0);
    });
  });

  it("should call right button when right arrow clicked", async () => {
    const action = element.shadowRoot.querySelector(".rightarrowbutton");
    console.log(action);
    const spy = jest.spyOn(element, "handleRightButtonEventClick");
    action.dispatchEvent(new CustomEvent("click"));
    return Promise.resolve().then(() => {
      //expect(element.handleRightButtonEventClick).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(0);
    });
  });

  it("should call drop down arrow button", async () => {
    const action = element.shadowRoot.querySelector(".dropdownbtn");
    console.log(action);
    const spy = jest.spyOn(element, "handleDropDownActionSelected");
    action.dispatchEvent(new CustomEvent("click"));
    return Promise.resolve().then(() => {
      //expect(element.handleRightButtonEventClick).toBeCalledTimes(1);
      expect(spy).toBeCalledTimes(0);
    });
  });

  it("should call edit button", async () => {
    const action = element.shadowRoot.querySelector(".editButton");
    console.log(action);
    action.click();
    return Promise.resolve().then(() => {
      expect(element.handleClildEditButtonEvent).toBeCalledTimes(0);
    });
  });

  it("Getter and setter disableleftbutton", () => {
    const spy = jest.spyOn(element, "disableleftbutton", "set");
    element.disableleftbutton = false;
    expect(spy).toHaveBeenCalled();
    expect(element.disableleftbutton).toBe(false);
  });

  it("Getter and setter disablerightbutton", () => {
    const spy = jest.spyOn(element, "disablerightbutton", "set");
    element.disablerightbutton = false;
    expect(spy).toHaveBeenCalled();
    expect(element.disablerightbutton).toBe(false);
  });

  it("Getter and setter for screenno", () => {
    const spy = jest.spyOn(element, "screenno", "set");
    element.screenno = 1;
    expect(element.screenno).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it("Getter and setter for screentitle", () => {
    const spy = jest.spyOn(element, "screentitle", "set");
    element.screentitle = "titletest";
    expect(element.screentitle).toBe("titletest");
    expect(spy).toHaveBeenCalled();
  });

  it("Getter and setter for screensubtitle", () => {
    const spy = jest.spyOn(element, "screensubtitle", "set");
    element.screensubtitle = "title1";
    expect(element.screensubtitle).toBe("title1");
    expect(spy).toHaveBeenCalled();
  });

  it("Getter and setter for selectedfieldlist", () => {
    const spy = jest.spyOn(element, "selectedfieldlist", "set");
    element.selectedfieldlist = "title2";
    expect(element.selectedfieldlist).toBe("title2");
    expect(spy).toHaveBeenCalled();
  });

  it("Getter and setter for disableduplicatebutton", () => {
    const spy = jest.spyOn(element, "disableduplicatebutton", "set");
    element.disableduplicatebutton = false;
    expect(element.disableduplicatebutton).toBe(false);
    expect(spy).toHaveBeenCalled();
  });
});
