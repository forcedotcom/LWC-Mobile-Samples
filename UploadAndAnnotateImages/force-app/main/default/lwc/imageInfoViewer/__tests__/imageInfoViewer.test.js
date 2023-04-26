import { createElement } from "lwc";
import ImageInfoViewer from "c/imageInfoViewer";

describe("c-image-info-viewer", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays image, file name, and description", () => {
    // Arrange
    const imageInfoViewer = createElement("c-image-info-viewer", {
      is: ImageInfoViewer
    });
    imageInfoViewer.imageToPreview = {
      id: 111,
      data: "http://localhost/data1",
      description: "description1",
      editedImageInfo: {},
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoViewer);

    // Assert
    const image = imageInfoViewer.shadowRoot.querySelector('[data-id="image"]');
    expect(image.src).toBe("http://localhost/data1");
    const fileName = imageInfoViewer.shadowRoot.querySelector(
      '[data-id="file-name"]'
    );
    expect(fileName.textContent).toBe("file1");
    const description = imageInfoViewer.shadowRoot.querySelector(
      '[data-id="description"]'
    );
    expect(description.textContent).toBe("description1");
  });
});
