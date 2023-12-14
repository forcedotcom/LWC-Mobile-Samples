import { createElement } from "lwc";
import DashboardToastMessage from "c/dashboardToastMessage";

let element;
describe("c-dashboard-toast-message", () => {
  beforeEach(() => {
    element = createElement("c-dashboard-toast-message", {
      is: DashboardToastMessage
    });

    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("adds and removes a message to DOM", async () => {
    jest.useFakeTimers();
    element.showToast("error", "the message");
    return Promise.resolve().then(async () => {
      let toasts = element.shadowRoot.querySelectorAll(".slds-notify_toast");
      expect(toasts).toHaveLength(1);

      jest.runAllTimers();
      return Promise.resolve().then(() => {
        toasts = element.shadowRoot.querySelectorAll(".slds-notify_toast");
        expect(toasts).toHaveLength(0);
      });
    });
  });

  it("removes the message on close click", async () => {
    element.showToast("error", "the message");
    return Promise.resolve().then(async () => {
      const close = element.shadowRoot.querySelector("lightning-button-icon");
      close.click();
      return Promise.resolve().then(() => {
        const toasts =
          element.shadowRoot.querySelectorAll(".slds-notify_toast");
        expect(toasts).toHaveLength(0);
      });
    });
  });
});
