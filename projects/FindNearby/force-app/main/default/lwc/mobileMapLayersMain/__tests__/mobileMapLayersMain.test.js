import { createElement } from "lwc";
import MobileMapLayersMain from "c/mobileMapLayersMain";
import { graphql } from "lightning/uiGraphQLApi";
import { getObjectInfos } from "lightning/uiObjectInfoApi";

let element;
const getObjectInfosResponse = require("./data/getObjectInfosResponse.json");

// Flush pending microtasks so the async addAllObjectsLocations() ->
// refreshMarkers() -> updateFilteredMarkers() chain settles before assertions.
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// Builds one ServiceAppointment graphql node. Field order mirrors
// buildQueryForObject so the component's Object.values() mapping lines up.
// `title` overrides AppointmentNumber (the titleField) so a re-emit can
// simulate the same record coming back with changed values.
const saNode = (id, { title } = {}) => ({
  node: {
    Id: id,
    Latitude: { value: 32.4 },
    Longitude: { value: 34.9 },
    AppointmentNumber: { value: title ?? `SA-${id}` },
    Subject: { value: "Subject" },
    Status: { value: "New" },
    DurationInMinutes: { value: 60 }
  }
});

// Builds one ServiceResource graphql node. Field order mirrors that object's
// config entry (Name is the titleField).
const srNode = (id, { title } = {}) => ({
  node: {
    Id: id,
    LastKnownLatitude: { value: 32.4 },
    LastKnownLongitude: { value: 34.9 },
    Name: { value: title ?? `SR-${id}` },
    ResourceType: { value: "Technician" },
    IsActive: { value: true },
    Description: { value: "Desc" }
  }
});

// Composes a GetObjectLocations graphql payload from per-object edge lists.
const buildLocations = ({
  serviceAppointments = [],
  serviceResources = []
}) => ({
  uiapi: {
    query: {
      ServiceAppointment: { edges: serviceAppointments },
      ServiceResource: { edges: serviceResources }
    }
  }
});

// Convenience for the common single-object (ServiceAppointment) case.
const buildServiceAppointmentLocations = (ids) =>
  buildLocations({ serviceAppointments: ids.map((id) => saNode(id)) });

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

  // Overwrite semantics: re-adding the same record must replace its marker
  // with the new field values, not just keep the count stable.
  it("overwrites a marker when the same record re-emits with new values", async () => {
    graphql.emit(
      buildLocations({
        serviceAppointments: [saNode("08p001", { title: "SA-OLD" })]
      })
    );
    await flushPromises();

    // Same Id, changed title (AppointmentNumber) — simulates updated data.
    graphql.emit(
      buildLocations({
        serviceAppointments: [saNode("08p001", { title: "SA-NEW" })]
      })
    );
    await flushPromises();

    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    // Still one marker for the record...
    expect(mobileMap.filteredMarkers).toHaveLength(1);
    // ...and it carries the latest values, not the stale ones.
    expect(mobileMap.filteredMarkers[0].value.titleFieldValue).toBe("SA-NEW");
  });

  // The dedup key is `${objectApiName}:${recordId}`, so two records of
  // different objects that happen to share a record id must both survive as
  // separate markers (the object-name half of the key prevents collision).
  it("keeps markers of different objects that share a record id", async () => {
    graphql.emit(
      buildLocations({
        serviceAppointments: [saNode("SHARED")],
        serviceResources: [srNode("SHARED")]
      })
    );
    await flushPromises();

    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    const mapFilters = element.shadowRoot.querySelector("c-map-filters");

    // Default filter is ServiceAppointment: the SHARED record shows as the SA
    // marker (no ServiceAppointments come from beforeEach, so this is the one).
    expect(mobileMap.filteredMarkers).toHaveLength(1);
    expect(mobileMap.filteredMarkers[0].value.value).toBe("ServiceAppointment");
    expect(mobileMap.filteredMarkers[0].value.id).toBe("SHARED");

    // Switch the active object to ServiceResource via the public callback the
    // parent hands to c-map-filters.
    mapFilters.setCurrentObjectFilter({ value: "ServiceResource" });
    await flushPromises();

    // A ServiceResource marker for the same id survives independently — the
    // SA:SHARED entry did not overwrite the SR:SHARED entry.
    const sharedResource = mobileMap.filteredMarkers.find(
      (m) => m.value.id === "SHARED"
    );
    expect(sharedResource).toBeDefined();
    expect(sharedResource.value.value).toBe("ServiceResource");
  });

  // Distinct records of multiple objects all coexist across the marker set.
  it("accumulates markers for multiple object types", async () => {
    graphql.emit(
      buildLocations({
        serviceAppointments: [saNode("08p001"), saNode("08p002")],
        serviceResources: [srNode("0Hn001")]
      })
    );
    await flushPromises();

    const mobileMap = element.shadowRoot.querySelector("c-mobile-map");
    const mapFilters = element.shadowRoot.querySelector("c-map-filters");

    // Two ServiceAppointments under the default filter.
    expect(mobileMap.filteredMarkers.map((m) => m.value.id).sort()).toEqual([
      "08p001",
      "08p002"
    ]);

    // The ServiceResource record coexists under its own filter (alongside the
    // resource-location marker that beforeEach's ServiceResource emit creates).
    mapFilters.setCurrentObjectFilter({ value: "ServiceResource" });
    await flushPromises();
    expect(mobileMap.filteredMarkers.map((m) => m.value.id)).toContain(
      "0Hn001"
    );
  });

  // Error path: when the location graphql query returns errors, they are
  // routed to handleError rather than thrown. (handleError logs via console.)
  it("routes graphql query errors to handleError", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    graphql.emitErrors([{ message: "query failed" }]);
    await flushPromises();

    expect(logSpy).toHaveBeenCalledWith([{ message: "query failed" }]);
    logSpy.mockRestore();
  });
});
