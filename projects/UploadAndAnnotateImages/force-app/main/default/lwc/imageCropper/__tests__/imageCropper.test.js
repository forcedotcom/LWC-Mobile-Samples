import { createElement } from "lwc";
import ImageCropper from "c/imageCropper";

describe("c-image-cropper", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the image-container div for the CropperJs library", () => {
    // Arrange
    const imageCropper = createElement("c-image-cropper", {
      is: ImageCropper
    });

    // Act
    document.body.appendChild(imageCropper);

    // Assert
    const imageContainer = imageCropper.shadowRoot.querySelector(
      'div[data-id="image-container"]'
    );
    expect(imageContainer).not.toBeNull();
  });
});
