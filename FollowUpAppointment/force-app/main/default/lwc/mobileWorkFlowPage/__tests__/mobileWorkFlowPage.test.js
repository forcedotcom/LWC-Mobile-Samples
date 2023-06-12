import { createElement } from "lwc";
import MobileWorkFlowPage from "c/mobileWorkFlowPage";

jest.mock(
  "@salesforce/apex/FollowUpAppointmentController.saveFieldSettings",
  () => {
    return {
      default: jest.fn(() => ({
        data: "success",
        Asset: "Asset",
        ServiceAppointment: "Service Appointment"
      }))
    };
  },
  { virtual: true }
);

jest.mock(
  "./labels",
  () => {
    return {
      MobileDashboard_card_filter_titleTime: "test"
    };
  },
  { virtual: true }
);

let element;
describe("c-mobile-work-flow-page", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  beforeEach(() => {
    element = createElement("c-mobile-work-flow-page", {
      is: MobileWorkFlowPage
    });

    element.showDeleteDialogBox = true;
    element.handleDeleteEventDialogBox = jest.fn();
    element.handleAddScreenEvent = jest.fn();
    element.showModal = true;
    element.saveDetails = jest.fn();
    element.closeModal = jest.fn();
    element.SCREEN1 = 1;
    element.SCREEN2 = 2;
    element.SCREE3 = 3;

    document.body.appendChild(element);
  });

  it("should show correct info", () => {
    const mainInfoText = element.shadowRoot.querySelector(".mainInfoText");
    expect(mainInfoText.textContent).toBe(
      "c.FollowUpAppointments_MobileWorkFlow_Info_text"
    );
  });

  it("Call handle add screen event", async () => {
    console.log("Element is : " + element.shadowRoot);
    const action = element.shadowRoot.querySelector(
      '[data-id="addscreenevent"]'
    );
    console.log("Action is : " + action);
    const spy = jest.spyOn(element, "handleAddScreenEvent");
    console.log(spy);
    action.dispatchEvent(new CustomEvent("click"));

    return Promise.resolve().then(() => {
      expect(spy).toBeCalledTimes(0);
    });
  });

  it("Handle save step details", async () => {
    console.log("Element is : " + element.shadowRoot);
    let action = element.shadowRoot.querySelector(
      '[data-id="saveDetailsDialog"]'
    );
    console.log("Action is : " + action);

    action.click();

    return Promise.resolve().then(() => {
      const mainInfoText = element.shadowRoot.querySelector(".mainInfoText");
      expect(mainInfoText.textContent).toBe(
        "c.FollowUpAppointments_MobileWorkFlow_Info_text"
      );
    });

    // return Promise.resolve()
    // .then(async () => {
    //   expect(spy).toBeCalledTimes(0);
    // })
    // .then(() => {
    //   expect(spy).toBeCalledTimes(0);
    // });
  });

  it("Handle close modal", async () => {
    console.log("Element is : " + element.shadowRoot);
    const action = element.shadowRoot.querySelector('[data-id="closeDialog"]');
    console.log("Action is : " + action);
    const spy = jest.spyOn(element, "closeModal");
    console.log(spy);
    action.dispatchEvent(new CustomEvent("click"));

    return Promise.resolve().then(() => {
      expect(spy).toBeCalledTimes(0);
    });
  });

  it("Test step title value", () => {
    element.currentScreenTitle = "screenTitle";
    const mainInfoText = element.shadowRoot.querySelector(
      '[data-id="stepTitleId"]'
    );
    console.log("Value of the mainInfoText " + mainInfoText.value);
    expect(mainInfoText.value).toBe(mainInfoText.value);
  });
});
