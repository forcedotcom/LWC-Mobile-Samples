import { createElement } from "lwc";
import DashboardSettingsCard from "c/dashboardSettingsCard";

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
describe("c-dashboard-settings-card", () => {
  beforeEach(() => {
    element = createElement("c-dashboard-settings-card", {
      is: DashboardSettingsCard
    });

    element.index = 0;
    element.card = {
      index: 1,
      title: "card title",
      object: { label: "Account" },
      filter: {
        conditionLogic: "AND",
        subFilters: [
          {
            key: "rwn1ft",
            fieldDisplay: "Time Sheet End Date",
            value: "",
            unitDisplay: "days",
            quantity: "14",
            operatorDisplay: "last"
          },
          {
            key: "131fda",
            fieldDisplay: "Time Sheet Start Date",
            value: "",
            unitDisplay: "weeks",
            quantity: "1",
            operatorDisplay: "last"
          }
        ]
      },
      subFilters: [
        {
          key: "rwn1fa",
          fieldDisplay: "Time Sheet End Date",
          value: "",
          unitDisplay: "days",
          quantity: "14",
          operatorDisplay: "last"
        },
        {
          key: "131fdb",
          fieldDisplay: "Time Sheet Start Date",
          value: "",
          unitDisplay: "weeks",
          quantity: "1",
          operatorDisplay: "last"
        }
      ],
      layout: "SIDE"
    };
    element.handleEditCardClick = jest.fn();
    element.moveCardUp = jest.fn();
    element.moveCardDown = jest.fn();
    element.duplicateCard = jest.fn();
    element.deleteCard = jest.fn();

    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should have correct title", () => {
    const title = element.shadowRoot.querySelector(".title");
    expect(title.textContent).toBe(`1card title`);
  });

  it("should have correct criteria text", () => {
    const filterSection =
      element.shadowRoot.querySelectorAll(".details-section")[1];
    const text = filterSection.textContent
      .replace("c.MobileDashboard_card_filter_title", "Filter")
      .replace("c.MobileDashboard_settings_card_display_logic_and", "AND");
    expect(text).toBe(
      `FilterTime Sheet End Date  last  14 daysAND\u00A0\u00A0\u00A0Time Sheet Start Date  last  1 weeks`
    );
  });

  it("should call moveCardUp when edit clicked", async () => {
    const actionGroup = element.shadowRoot.querySelectorAll(
      "lightning-button-group"
    )[0];
    const action = actionGroup.querySelectorAll("lightning-button-icon")[0];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.moveCardUp).toHaveBeenCalled();
    });
  });

  it("should call moveCardDown when edit clicked", async () => {
    const actionGroup = element.shadowRoot.querySelectorAll(
      "lightning-button-group"
    )[0];
    const action = actionGroup.querySelectorAll("lightning-button-icon")[1];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.moveCardDown).toHaveBeenCalled();
    });
  });

  it("should call handleEditCardClick when edit clicked", async () => {
    const actionGroup = element.shadowRoot.querySelectorAll(
      "lightning-button-group"
    )[1];
    const action = actionGroup.querySelector("lightning-button");
    action.click();
    return Promise.resolve().then(() => {
      expect(element.handleEditCardClick).toHaveBeenCalled();
    });
  });

  it("should call duplicateCard when duplicate clicked", async () => {
    const action = element.shadowRoot.querySelectorAll(
      "lightning-menu-item"
    )[0];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.duplicateCard).toHaveBeenCalled();
    });
  });

  it("should call deleteCard when delete clicked", async () => {
    const action = element.shadowRoot.querySelectorAll(
      "lightning-menu-item"
    )[1];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.deleteCard).toHaveBeenCalled();
    });
  });
});
