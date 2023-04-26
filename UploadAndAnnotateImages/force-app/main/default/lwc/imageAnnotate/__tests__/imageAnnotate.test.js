import { createElement } from "lwc";
import ImageAnnotate from "c/imageAnnotate";
import LightningConfirm from "lightning/confirm";
jest.mock("lightning/confirm");

describe("c-image-annotate", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the image-info-editor when enters the screen", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };

    // Act
    document.body.appendChild(imageAnnotate);
    await Promise.resolve();

    // Assert
    const imageInfoEditor = imageAnnotate.shadowRoot.querySelector(
      "c-image-info-editor"
    );
    expect(imageInfoEditor).not.toBeNull();
    const imageCropper =
      imageAnnotate.shadowRoot.querySelector("c-image-cropper");
    expect(imageCropper).toBeNull();
    const imagePainter =
      imageAnnotate.shadowRoot.querySelector("c-image-painter");
    expect(imagePainter).toBeNull();
  });

  it("displays imageCropper when crop is clicked", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };

    // Act
    document.body.appendChild(imageAnnotate);
    const cropButton = imageAnnotate.shadowRoot.querySelector(
      'button[title="Crop"]'
    );
    cropButton.click();
    await Promise.resolve();

    // Assert
    const previewImage = imageAnnotate.shadowRoot.querySelector("img");
    expect(previewImage).toBeNull();
    const imageCropper =
      imageAnnotate.shadowRoot.querySelector("c-image-cropper");
    expect(imageCropper).not.toBeNull();
    const imagePainter =
      imageAnnotate.shadowRoot.querySelector("c-image-painter");
    expect(imagePainter).toBeNull();
  });

  it("displays imagePainter when draw is clicked", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };

    // Act
    document.body.appendChild(imageAnnotate);
    const drawButton = imageAnnotate.shadowRoot.querySelector(
      'button[title="Draw"]'
    );
    drawButton.click();
    await Promise.resolve();

    // Assert
    const previewImage = imageAnnotate.shadowRoot.querySelector("img");
    expect(previewImage).toBeNull();
    const imageCropper =
      imageAnnotate.shadowRoot.querySelector("c-image-cropper");
    expect(imageCropper).toBeNull();
    const imagePainter =
      imageAnnotate.shadowRoot.querySelector("c-image-painter");
    expect(imagePainter).not.toBeNull();
  });

  it("displays imagePainter when add square is clicked", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };

    // Act
    document.body.appendChild(imageAnnotate);
    const showMoreButton = imageAnnotate.shadowRoot.querySelector(
      'button[title="More Actions"]'
    );
    showMoreButton.click();
    await Promise.resolve();
    const addSquareButton = imageAnnotate.shadowRoot.querySelector(
      'span[title="Add Square"]'
    );
    addSquareButton.click();
    await Promise.resolve();

    // Assert
    const previewImage = imageAnnotate.shadowRoot.querySelector("img");
    expect(previewImage).toBeNull();
    const imageCropper =
      imageAnnotate.shadowRoot.querySelector("c-image-cropper");
    expect(imageCropper).toBeNull();
    const imagePainter =
      imageAnnotate.shadowRoot.querySelector("c-image-painter");
    expect(imagePainter).not.toBeNull();
  });

  it("displays imagePainter when add circle is clicked", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };

    // Act
    document.body.appendChild(imageAnnotate);
    const showMoreButton = imageAnnotate.shadowRoot.querySelector(
      'button[title="More Actions"]'
    );
    showMoreButton.click();
    await Promise.resolve();
    const addCircleButton = imageAnnotate.shadowRoot.querySelector(
      'span[title="Add Circle"]'
    );
    addCircleButton.click();
    await Promise.resolve();

    // Assert
    const previewImage = imageAnnotate.shadowRoot.querySelector("img");
    expect(previewImage).toBeNull();
    const imageCropper =
      imageAnnotate.shadowRoot.querySelector("c-image-cropper");
    expect(imageCropper).toBeNull();
    const imagePainter =
      imageAnnotate.shadowRoot.querySelector("c-image-painter");
    expect(imagePainter).not.toBeNull();
  });

  it("displays imagePainter when add line is clicked", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };

    // Act
    document.body.appendChild(imageAnnotate);
    const showMoreButton = imageAnnotate.shadowRoot.querySelector(
      'button[title="More Actions"]'
    );
    showMoreButton.click();
    await Promise.resolve();
    const addLineButton = imageAnnotate.shadowRoot.querySelector(
      'span[title="Add Line"]'
    );
    addLineButton.click();
    await Promise.resolve();

    // Assert
    const previewImage = imageAnnotate.shadowRoot.querySelector("img");
    expect(previewImage).toBeNull();
    const imageCropper =
      imageAnnotate.shadowRoot.querySelector("c-image-cropper");
    expect(imageCropper).toBeNull();
    const imagePainter =
      imageAnnotate.shadowRoot.querySelector("c-image-painter");
    expect(imagePainter).not.toBeNull();
  });

  it("dispatches an event when remove is clicked", async () => {
    // Arrange
    const imageAnnotate = createElement("c-image-annotate", {
      is: ImageAnnotate
    });
    imageAnnotate.imageInfo = { data: "someData", id: 123 };
    const removeHandler = jest.fn();
    imageAnnotate.addEventListener("delete", removeHandler);
    // Mock LightningConfirm to return true (OK clicked)
    LightningConfirm.open = jest.fn().mockResolvedValue(true);

    // Act
    document.body.appendChild(imageAnnotate);
    const showMoreButton = imageAnnotate.shadowRoot.querySelector(
      'button[title="More Actions"]'
    );
    showMoreButton.click();
    await Promise.resolve();
    const removeButton = imageAnnotate.shadowRoot.querySelector(
      'span[title="Remove"]'
    );
    removeButton.click();
    await Promise.resolve(); // Wait for the click
    await Promise.resolve(); // Wait for LightningConfirm.open
    await Promise.resolve(); // Wait for the event to be dispatched

    // Assert
    expect(removeHandler).toHaveBeenCalled();
    expect(LightningConfirm.open.mock.calls).toHaveLength(1);
  });
});
