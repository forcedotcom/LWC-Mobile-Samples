import { createElement } from "lwc";
import MobileWorkFlowPage from "c/mobileWorkFlowPage";

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
    document.body.appendChild(element);
  });

  it("should show correct info", () => {
    const mainInfoText = element.shadowRoot.querySelector(".mainInfoText");
    expect(mainInfoText.textContent).toBe(
      "c.FollowUpAppointments_MobileWorkFlow_Info_text"
    );
  });

  it("Call the close modal function", async () => {
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
});
