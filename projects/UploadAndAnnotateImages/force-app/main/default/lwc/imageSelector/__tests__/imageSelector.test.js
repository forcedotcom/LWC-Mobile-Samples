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
    const imageInfoViewer = imageSelector.shadowRoot.querySelector(
      "c-image-info-viewer"
    );
    expect(imageInfoViewer).toBeNull();
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
    const imageInfoViewer = imageSelector.shadowRoot.querySelector(
      "c-image-info-viewer"
    );
    expect(imageInfoViewer).toBeNull();
    const uploadButton = imageSelector.shadowRoot.querySelector("button");
    expect(uploadButton).not.toBeNull();
  });

  it("previews image when clicking on it", async () => {
    // Arrange
    const imageSelector = createElement("c-image-selector", {
      is: ImageSelector
    });
    imageSelector.allImagesData = [
      { data: "data1", id: 111 },
      { data: "data2", id: 222 }
    ];

    // Act
    document.body.appendChild(imageSelector);
    const firstImage =
      imageSelector.shadowRoot.querySelector('div[data-id="111"]');
    firstImage.click();
    await Promise.resolve();

    // Assert
    const imageInfoViewer = imageSelector.shadowRoot.querySelector(
      "c-image-info-viewer"
    );
    expect(imageInfoViewer).not.toBeNull();
  });

  it("dispatches an event when clicking on edit image", async () => {
    // Arrange
    const imageSelector = createElement("c-image-selector", {
      is: ImageSelector
    });
    imageSelector.allImagesData = [
      {
        id: 111,
        data: "data1",
        description: "description1",
        editedImageInfo: {},
        metadata: { fileName: "file1", ext: "jpeg", edited: false }
      },
      {
        id: 222,
        data: "data2",
        description: "description2",
        editedImageInfo: {},
        metadata: { fileName: "file2", ext: "jpeg", edited: false }
      }
    ];
    const annotateImageHandler = jest.fn();
    imageSelector.addEventListener("annotateimage", annotateImageHandler);

    // Act
    document.body.appendChild(imageSelector);
    const firstImage =
      imageSelector.shadowRoot.querySelector('div[data-id="111"]');
    firstImage.click();
    await Promise.resolve();
    const editButton = imageSelector.shadowRoot.querySelector(
      ".slds-button_stretch"
    );
    editButton.click();
    await Promise.resolve();

    // Assert
    expect(annotateImageHandler).toHaveBeenCalled();
    expect(annotateImageHandler.mock.calls[0][0].detail).toBe(111);
  });
});
