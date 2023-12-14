import { createElement } from "lwc";
import MobileMapLayersMain from "c/mobileMapLayersMain";
import { graphql } from "lightning/uiGraphQLApi";
import { getObjectInfos } from "lightning/uiObjectInfoApi";

let element;
const getObjectInfosResponse = require("./data/getObjectInfosResponse.json");

describe("c-mobile-map-layers-main", () => {
  beforeEach(() => {
    element = createElement("c-mobile-map-layers-main", {
      is: MobileMapLayersMain
    });

    document.body.appendChild(element);

    graphql.emit({
      uiapi: {
        query: {
          ServiceResource: {
            edges: [
              {
                node: {
                  Id: "0HnB00000002TLwKAM",
                  LastKnownLatitude: {
                    value: 32.4
                  },
                  LastKnownLongitude: {
                    value: 34.9
                  }
                }
              }
            ]
          }
        }
      }
    });

    getObjectInfos.emit(getObjectInfosResponse);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should contain all 3 components", () => {
    const mapFilters = element.shadowRoot.querySelector("c-map-filters");
    expect(mapFilters).not.toBeNull();
    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    expect(mobileMap).not.toBeNull();
    const locationsList = element.shadowRoot.querySelector("c-locations-list");
    expect(locationsList).not.toBeNull();
  });
});
