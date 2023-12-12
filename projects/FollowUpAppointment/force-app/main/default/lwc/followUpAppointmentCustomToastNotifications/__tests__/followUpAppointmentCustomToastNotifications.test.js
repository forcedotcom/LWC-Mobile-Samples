import { createElement } from "lwc";
import FollowUpAppointmentCustomToastNotifications from "c/followUpAppointmentCustomToastNotifications";

let element;
describe("c-follow-up-appointment-custom-toast-notifications", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  beforeEach(() => {
    element = createElement(
      "c-follow-up-appointment-custom-toast-notifications",
      {
        is: FollowUpAppointmentCustomToastNotifications
      }
    );

    element.timeout = 3000;
    element.sticky = true;
    element.toastId = 0;

    document.body.appendChild(element);
  });

  it("Should dismiss toast", async () => {
    element.showToast("success", "message1"); // show the first toast
    element.showToast("success", "message2"); // show the second toast

    return Promise.resolve().then(() => {
      expect(element.toastId).toBe(2); // should have shown two toast messages

      const action = element.shadowRoot.querySelector("lightning-button-icon");
      action.click();

      expect(element.toastId).toBe(1); // should have removed one of the toast messages
    });
  });

  it("Should show toast", async () => {
    const methodNameFake = jest.spyOn(element, "showToast");
    element.showToast("success", "message");
    expect(methodNameFake).toHaveBeenCalledTimes(1);
    expect(element.toastId).toBe(1);
  });
});
