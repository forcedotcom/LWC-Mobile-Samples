import { createElement } from "lwc";
import MobileMapLayersMain from "c/mobileMapLayersMain";
import { graphql } from "lightning/uiGraphQLApi";
import { getObjectInfos } from "lightning/uiObjectInfoApi";

let element;
const getObjectInfosResponse = require("./data/getObjectInfosResponse.json");

// Flush pending microtasks so the async addAllObjectsLocations() ->
// refreshMarkers() -> updateFilteredMarkers() chain settles before assertions.
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// Builds a GetObjectLocations graphql payload for the default (first) object,
// ServiceAppointment. Field order mirrors buildQueryForObject so the
// component's Object.values() field mapping lines up.
const buildServiceAppointmentLocations = (ids) => ({
  uiapi: {
    query: {
      ServiceAppointment: {
        edges: ids.map((id) => ({
          node: {
            Id: id,
            Latitude: { value: 32.4 },
            Longitude: { value: 34.9 },
            AppointmentNumber: { value: `SA-${id}` },
            Subject: { value: "Subject" },
            Status: { value: "New" },
            DurationInMinutes: { value: 60 }
          }
        }))
      }
    }
  }
});

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

  // Regression test for W-18225881: the location graphql wire can re-emit,
  // which runs addAllObjectsLocations() again for the same records. Markers
  // must be deduped by object+id, not appended, so they never double up.
  it("does not duplicate markers when the location result re-emits", async () => {
    const locations = buildServiceAppointmentLocations(["08p001", "08p002"]);

    // First emit populates two ServiceAppointment markers.
    graphql.emit(locations);
    await flushPromises();

    // Second emit simulates the wire re-firing with the same records.
    graphql.emit(locations);
    await flushPromises();

    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    // Two distinct records must yield exactly two markers, not four.
    expect(mobileMap.filteredMarkers).toHaveLength(2);

    const ids = mobileMap.filteredMarkers.map((m) => m.value.id).sort();
    expect(ids).toEqual(["08p001", "08p002"]);
  });
});
