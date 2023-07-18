import { createElement } from "lwc";
import MobileAppointmentBookingCompactAppointmentInfo from "c/mobileAppointmentBookingCompactAppointmentInfo";

let element;
const MOCK_INFO_OBJ = {
  workTypeName: "Maintenance",
  startDate: new Date("03.05.2023 8:00"),
  endDate: new Date("03.05.2023 10:00"),
  appointmentNumber: "SA-0057"
};

describe("c-mobile-appointment-booking-compact-appointment-info", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Verifies Correct Work Type Is presented", () => {
    element = createElement(
      "c-mobile-appointment-booking-compact-appointment-info",
      {
        is: MobileAppointmentBookingCompactAppointmentInfo
      }
    );

    element.compactInfoObj = MOCK_INFO_OBJ;

    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const workTypeElement = element.shadowRoot.querySelector(
        ".appointment-worktype"
      );
      expect(workTypeElement.textContent).toBe(MOCK_INFO_OBJ.workTypeName);
    });
  });

  it("Verifies Correct Appointment Number Is presented", () => {
    element = createElement(
      "c-mobile-appointment-booking-compact-appointment-info",
      {
        is: MobileAppointmentBookingCompactAppointmentInfo
      }
    );

    element.compactInfoObj = MOCK_INFO_OBJ;

    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const aptNoElement = element.shadowRoot.querySelector(
        ".appointment-number"
      );
      expect(aptNoElement.textContent).toBe(MOCK_INFO_OBJ.appointmentNumber);
    });
  });
});
