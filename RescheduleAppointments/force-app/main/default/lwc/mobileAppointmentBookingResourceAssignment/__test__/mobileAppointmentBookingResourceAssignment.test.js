import { createElement } from "lwc";
import MobileAppointmentBookingResourceAssignment from "c/MobileAppointmentBookingResourceAssignment";

describe("c-mobile-appointment-booking-resource-assignment", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Displays the correct message when user is excluded", () => {
    const EXPECTED_EXCLUDED_MSG =
      "c.Appointment_ReBooking_cant_select_Mobile_Worker_excluded";
    // Create initial element
    const element = createElement(
      "c-mobile-appointment-booking-resource-assignment",
      {
        is: MobileAppointmentBookingResourceAssignment
      }
    );

    element.showExcludedMsg = true;
    element.isExcluded = true;
    element.showMobileWorkerChoice = true;

    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const excludedMsgElement = element.shadowRoot.querySelector(
        ".mobile-worker-content"
      );

      expect(excludedMsgElement.textContent).toBe(EXPECTED_EXCLUDED_MSG);
    });
  });

  it("Displays lightning radio button with current assignment method", () => {
    const EXPECTED_VALUE = "ASSIGN_TO_ME";
    // Create initial element
    const element = createElement(
      "c-mobile-appointment-booking-resource-assignment",
      {
        is: MobileAppointmentBookingResourceAssignment
      }
    );

    element.showExcludedMsg = false;
    element.isExcluded = false;
    element.showMobileWorkerChoice = true;

    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const excludedMsgElement = element.shadowRoot.querySelector(
        '[data-id="resource-assignment-radio"]'
      );

      expect(excludedMsgElement.value).toBe(EXPECTED_VALUE);
    });
  });
});
