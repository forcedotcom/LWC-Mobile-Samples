import { createElement } from "lwc";
import DashboardIconsPicker from "c/dashboardIconsPicker";

let element;
describe("c-dashboard-icons-picker", () => {
  beforeEach(() => {
    element = createElement("c-dashboard-icons-picker", {
      is: DashboardIconsPicker
    });

    element.setIcon = jest.fn();
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("calls setIcon when an icon selected", async () => {
    element.selectedIcon = "";
    document.body.appendChild(element);

    const action = element.shadowRoot.querySelector("lightning-menu-item");
    action.click();
    return Promise.resolve().then(() => {
      expect(element.setIcon).toHaveBeenCalledWith("utility:info");
    });
  });
});
