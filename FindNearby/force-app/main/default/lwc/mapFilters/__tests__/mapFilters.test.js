import { createElement } from "lwc";
import MapFilters from "c/mapFilters";

let element;

let objectFilterButton;
let objectSheet;
let objectRadio;
let xButtonObj;

let fieldFilterButton;
let fieldFilterSheet;
let xButtonFieldFilter;
let inputField;
let showResultsButton;

let fieldsListSheet;
let fieldListRadio;
let xButtonFieldsList;

describe("c-map-filters", () => {
  beforeEach(() => {
    element = createElement("c-map-filters", {
      is: MapFilters
    });

    element.mapObjects = [
      {
        value: "ServiceAppointment",
        label: "Service Appointment",
        latField: "Latitude",
        longField: "Longitude",
        titleField: "AppointmentNumber",
        detailField: "Subject",
        fields: [
          { value: "a", label: "A", type: "STRING" },
          { value: "b", label: "B", type: "BOOLEAN" },
          { value: "c", label: "C", type: "DATETIME" }
        ]
      },
      {
        value: "Asset",
        label: "Asset",
        latField: "Latitude",
        longField: "Longitude",
        titleField: "Name",
        detailField: "Quantity"
      }
    ];
    element.currentObjectFilter = {
      value: "ServiceAppointment",
      label: "Service Appointment",
      plural: "",
      iconUrl: "",
      color: ""
    };
    element.currentFieldFilter = {
      isActive: true,
      field: { value: "", label: "", type: "", input: "" }
    };
    element.setCurrentObjectFilter = jest.fn();
    element.setCurrentFieldFilter = jest.fn();
    element.handleError = jest.fn(console.log);

    document.body.appendChild(element);

    objectFilterButton =
      element.shadowRoot.querySelectorAll(".filter-button")[0];
    objectSheet = element.shadowRoot.querySelector(
      ".object-filter-bottom-sheet"
    );
    objectRadio = element.shadowRoot.querySelector(
      ".object-filter-bottom-sheet lightning-radio-group"
    );
    xButtonObj = element.shadowRoot.querySelector(
      ".object-filter-bottom-sheet .x"
    );

    fieldFilterButton =
      element.shadowRoot.querySelectorAll(".filter-button")[1];
    fieldFilterSheet = element.shadowRoot.querySelector(
      ".field-filter-bottom-sheet"
    );
    xButtonFieldFilter = element.shadowRoot.querySelector(
      ".field-filter-bottom-sheet .x"
    );
    showResultsButton = element.shadowRoot.querySelector(
      ".filters-sheet-show-results"
    );

    fieldsListSheet = element.shadowRoot.querySelector(
      ".fields-list-bottom-sheet"
    );
    fieldListRadio = element.shadowRoot.querySelector(
      ".fields-list-bottom-sheet lightning-radio-group"
    );
    xButtonFieldsList = element.shadowRoot.querySelector(
      ".fields-list-bottom-sheet .x"
    );
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("has object filter filled", async () => {
    return Promise.resolve().then(() => {
      const currentObject =
        objectFilterButton.querySelector(".button-text-main");
      expect(currentObject.textContent).toBe("Service Appointment");
    });
  });

  it("has field filter empty", () => {
    const currentField = fieldFilterButton.querySelector(".button-text-main");
    expect(currentField.textContent).toBe("None");
  });

  it("has correct number of options in objects list", () => {
    expect(objectRadio.options).toHaveLength(2);
  });

  it("opens object sheet when object filter button clicked", async () => {
    expect(objectSheet.classList).not.toContain("pt-page-moveToTop");

    objectFilterButton.click();
    return Promise.resolve().then(() => {
      expect(objectSheet.classList).toContain("pt-page-moveToTop");
    });
  });

  it("calls setCurrentObjectFilter when changing object filter", async () => {
    objectFilterButton.click();
    return Promise.resolve().then(async () => {
      objectRadio.value = "Asset";
      objectRadio.dispatchEvent(new Event("change"));
      return Promise.resolve().then(() => {
        expect(element.setCurrentObjectFilter).toHaveBeenCalledWith(
          element.mapObjects[1]
        );
      });
    });
  });

  it("opens field filter sheet when field filter button clicked", async () => {
    expect(fieldFilterSheet.classList).not.toContain("pt-page-moveToTop");

    fieldFilterButton.click();
    return Promise.resolve().then(() => {
      expect(fieldFilterSheet.classList).toContain("pt-page-moveToTop");
    });
  });

  it("opens fields list sheet when field combo clicked", async () => {
    expect(fieldsListSheet.classList).not.toContain("pt-page-moveToTop");

    const fieldCombo = element.shadowRoot.querySelector(".field-combo-cover");
    fieldCombo.click();
    return Promise.resolve().then(() => {
      expect(fieldsListSheet.classList).toContain("pt-page-moveToTop");
    });
  });

  it("closes objects sheet on x click", async () => {
    objectFilterButton.click();
    return Promise.resolve().then(async () => {
      expect(objectSheet.classList).toContain("pt-page-moveToTop");
      xButtonObj.click();
      return Promise.resolve().then(() => {
        expect(objectSheet.classList).not.toContain("pt-page-moveToTop");
      });
    });
  });

  it("closes field filter sheet on x click", async () => {
    fieldFilterButton.click();
    return Promise.resolve().then(async () => {
      expect(fieldFilterSheet.classList).toContain("pt-page-moveToTop");
      xButtonFieldFilter.click();
      return Promise.resolve().then(() => {
        expect(fieldFilterSheet.classList).not.toContain("pt-page-moveToTop");
      });
    });
  });

  it("closes fields list sheet on x click", async () => {
    const fieldCombo = element.shadowRoot.querySelector(".field-combo-cover");
    fieldCombo.click();
    return Promise.resolve().then(async () => {
      expect(fieldsListSheet.classList).toContain("pt-page-moveToTop");
      xButtonFieldsList.click();
      return Promise.resolve().then(() => {
        expect(fieldsListSheet.classList).not.toContain("pt-page-moveToTop");
      });
    });
  });

  describe("c-map-filters field filter", () => {
    describe("basic field filter", () => {
      beforeEach(async () => {
        // open the fields list and select the string field
        fieldListRadio.value = "a";
        fieldListRadio.dispatchEvent(new Event("change"));
        return Promise.resolve().then(async () => {
          inputField = element.shadowRoot.querySelector(
            ".field-input-container lightning-input"
          );
        });
      });

      afterEach(() => {
        while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }
      });

      it("shows correct input component when field selected", async () => {
        expect(inputField).not.toBeNull();
        expect(inputField.type).toBe("STRING");
      });

      it("enables show results button on input change", async () => {
        inputField.value = "text";
        inputField.dispatchEvent(new Event("change"));
        return Promise.resolve().then(() => {
          expect(showResultsButton.disabled).toBe(false);
        });
      });

      it("changes field filter button to active when show results clicked", async () => {
        inputField.value = "text";
        inputField.dispatchEvent(new Event("change"));
        return Promise.resolve().then(async () => {
          showResultsButton.click();
          return Promise.resolve().then(() => {
            const fieldFilterButton =
              element.shadowRoot.querySelectorAll(".filter-button")[1];
            expect(fieldFilterButton.classList).toContain("active-button");
          });
        });
      });
    });

    describe("boolean field filter", () => {
      beforeEach(async () => {
        // open the fields list and select the boolean field
        fieldListRadio.value = "b";
        fieldListRadio.dispatchEvent(new Event("change"));
        return Promise.resolve().then(async () => {
          inputField = element.shadowRoot.querySelector(
            ".field-input-container lightning-input"
          );
        });
      });

      afterEach(() => {
        while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }
      });

      it("shows correct input component when field selected", async () => {
        expect(inputField).not.toBeNull();
        expect(inputField.type).toBe("toggle");
      });

      it("enables show results button even when nothing changes (boolean field can be left unchanged)", async () => {
        expect(showResultsButton.disabled).toBe(false);
      });

      it("enables show results button also when toggle changes", async () => {
        inputField.checked = true;
        inputField.dispatchEvent(new Event("change"));
        return Promise.resolve().then(async () => {
          expect(inputField.checked).toBe(true);
          expect(showResultsButton.disabled).toBe(false);
        });
      });
    });

    describe("date field filter", () => {
      beforeEach(async () => {
        // open the fields list and select the dateTime field
        fieldListRadio.value = "c";
        fieldListRadio.dispatchEvent(new Event("change"));
        return Promise.resolve().then(async () => {
          inputField = element.shadowRoot.querySelector(
            ".field-input-container lightning-input"
          );
        });
      });

      afterEach(() => {
        while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }
      });

      it("shows correct input component when field selected", async () => {
        expect(inputField).not.toBeNull();
        expect(inputField.type).toBe("DATE");
      });
    });
  });
});
