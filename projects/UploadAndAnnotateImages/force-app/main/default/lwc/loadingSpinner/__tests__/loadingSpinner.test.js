import { createElement } from "lwc";
import LoadingSpinner from "c/loadingSpinner";

describe("c-loading-spinner", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the provided message", () => {
    // Arrange
    const loadingSpinner = createElement("c-loading-spinner", {
      is: LoadingSpinner
    });
    loadingSpinner.loadingMessage = "this is a test";

    // Act
    document.body.appendChild(loadingSpinner);

    // Verify displayed message
    const span = loadingSpinner.shadowRoot.querySelector(".spinner-text span");
    expect(span.textContent).toBe("this is a test");
  });
});
