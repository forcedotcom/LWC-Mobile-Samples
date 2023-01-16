import { createElement } from "lwc";
import ImageCapture from "c/imageCapture";

describe("c-image-capture", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the imageSelector by default", () => {
    // Arrange
    const imageCapture = createElement("c-image-capture", {
      is: ImageCapture
    });

    // Act
    document.body.appendChild(imageCapture);

    // Assert
    const imageSelector =
      imageCapture.shadowRoot.querySelector("c-image-selector");
    expect(imageSelector).not.toBeNull();
    const imageAnnotate =
      imageCapture.shadowRoot.querySelector("c-image-annotate");
    expect(imageAnnotate).toBeNull();
  });
});
