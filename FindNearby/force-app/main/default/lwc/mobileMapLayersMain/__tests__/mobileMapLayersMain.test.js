import { createElement } from "lwc";
import MobileMapLayersMain from "c/mobileMapLayersMain";

jest.mock(
  "@salesforce/apex/MobileMapLayersService.getAssignedResourceLocation",
  () => {
    return {
      default: jest.fn(() => ["10", "10"])
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/MobileMapLayersService.retrieveAllObjFields",
  () => {
    return {
      default: jest.fn(() => [
        { value: "field1", label: "field 1", type: "STRING" }
      ])
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/MobileMapLayersService.retrieveObjInfo",
  () => {
    return {
      default: jest.fn(() => ({
        Label: "Work Order",
        Plural: "Work Orders",
        IconUrl: ""
      }))
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/MobileMapLayersService.getObjectLocations",
  () => {
    return {
      default: jest.fn(() => [
        {
          Id: "123",
          Latitude: "1.1",
          Longitude: "2.2",
          TitleField: "the name",
          DetailField: "detail"
        }
      ])
    };
  },
  { virtual: true }
);

describe("c-mobile-map-layers-main", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should contain all 3 components", () => {
    const element = createElement("c-mobile-map-layers-main", {
      is: MobileMapLayersMain
    });

    document.body.appendChild(element);

    const mapFilters = element.shadowRoot.querySelector("c-map-filters");
    expect(mapFilters).not.toBeNull();
    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    expect(mobileMap).not.toBeNull();
    const locationsList = element.shadowRoot.querySelector("c-locations-list");
    expect(locationsList).not.toBeNull();
  });

  it("should call filter query when field filter is active", () => {
    const element = createElement("c-mobile-map-layers-main", {
      is: MobileMapLayersMain
    });

    document.body.appendChild(element);

    const mapFilters = element.shadowRoot.querySelector("c-map-filters");
    expect(mapFilters).not.toBeNull();
    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    expect(mobileMap).not.toBeNull();
    const locationsList = element.shadowRoot.querySelector("c-locations-list");
    expect(locationsList).not.toBeNull();
  });
});
