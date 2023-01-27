import { createElement } from "lwc";
import ImageSelector from "c/imageSelector";

describe("c-image-selector", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the initial screen (with the image icon) when there are no images", () => {
    // Arrange
    const imageSelector = createElement("c-image-selector", {
      is: ImageSelector
    });
    imageSelector.allImagesData = [];

    // Act
    document.body.appendChild(imageSelector);

    // Assert
    const imageIcon = imageSelector.shadowRoot.querySelector(
      ".slds-icon-utility-image"
    );
    expect(imageIcon).not.toBeNull();
    const uploadButton = imageSelector.shadowRoot.querySelector("button");
    expect(uploadButton).toBeNull();
  });

  it("displays the screen with the previews when there are images", () => {
    // Arrange
    const imageSelector = createElement("c-image-selector", {
      is: ImageSelector
    });
    imageSelector.allImagesData = [
      { data: "data1", id: 1 },
      { data: "data2", id: 2 }
    ];

    // Act
    document.body.appendChild(imageSelector);

    // Assert
    const imageIcon = imageSelector.shadowRoot.querySelector(
      ".slds-icon-utility-image"
    );
    expect(imageIcon).toBeNull();
    const uploadButton = imageSelector.shadowRoot.querySelector("button");
    expect(uploadButton).not.toBeNull();
  });

  it("dispatches an event when clicking on image", async () => {
    // Arrange
    const imageSelector = createElement("c-image-selector", {
      is: ImageSelector
    });
    imageSelector.allImagesData = [
      { data: "data1", id: 111 },
      { data: "data2", id: 222 }
    ];
    const annotateImageHandler = jest.fn();
    imageSelector.addEventListener("annotateimage", annotateImageHandler);

    // Act
    document.body.appendChild(imageSelector);
    const firstImage =
      imageSelector.shadowRoot.querySelector('img[data-id="111"]');
    firstImage.click();
    await Promise.resolve();

    // Assert
    expect(annotateImageHandler).toHaveBeenCalled();
    expect(annotateImageHandler.mock.calls[0][0].detail).toBe("111");
  });
});
