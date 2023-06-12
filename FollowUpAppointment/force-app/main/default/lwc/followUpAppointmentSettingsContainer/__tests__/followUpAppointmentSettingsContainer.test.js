import { createElement } from "lwc";
import followUpAppointmentSettingsContainer from "c/followUpAppointmentSettingsContainer";

let element;
describe("c-follow-up-appointment-settings-container", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  beforeEach(() => {
    element = createElement("c-follow-up-appointment-settings-container", {
      is: followUpAppointmentSettingsContainer
    });

    element.showDeleteDialogBox = true;
    element.handleSaveEvent = jest.fn();
    element.handleCancelEvent = jest.fn();
    document.body.appendChild(element);
  });

  it("should show correct info", () => {
    const fieldServiceLabel =
      element.shadowRoot.querySelector(".fieldservicelabel");
    expect(fieldServiceLabel.textContent).toBe(
      "c.FollowUpAppointments_field_service_title"
    );

    const mainTitleElement =
      element.shadowRoot.querySelector(".followupmaintitle");
    expect(mainTitleElement.textContent).toBe(
      "c.FollowUpAppointments_setting_page_title"
    );

    const pageTitle = element.shadowRoot.querySelector(".pageTitle");
    expect(pageTitle.textContent).toBe(
      "c.FollowUpAppointments_setting_sub_title"
    );

    const pageDescription =
      element.shadowRoot.querySelector(".pageDescription");
    expect(pageDescription.textContent).toBe(
      "c.FollowUpAppointments_setting_description_text"
    );
  });

  it("test on save button", async () => {
    console.log("Element is : " + element.shadowRoot);
    const action = element.shadowRoot.querySelector('[data-id="saveBtn"]');
    console.log("Action is : " + action);
    const spy = jest.spyOn(element, "handleSaveEvent");
    console.log(spy);
    action.dispatchEvent(new CustomEvent("click"));

    return Promise.resolve().then(() => {
      expect(spy).toBeCalledTimes(0);
    });
  });

  it("test on cancel button event", async () => {
    console.log("Element is : " + element.shadowRoot);
    const action = element.shadowRoot.querySelector('[data-id="cancelBtn"]');
    console.log("Action is : " + action);
    const spy = jest.spyOn(element, "handleCancelEvent");
    console.log(spy);
    action.dispatchEvent(new CustomEvent("click"));

    return Promise.resolve().then(() => {
      expect(spy).toBeCalledTimes(0);
    });
  });
});
