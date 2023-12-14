import { createElement } from "lwc";
import { Shapes } from "c/utilsImageCapture";
import ImagePainter from "c/imagePainter";

describe("c-image-painter", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the colors-picker", () => {
    // Arrange
    const imagePainter = createElement("c-image-painter", {
      is: ImagePainter
    });

    // Act
    document.body.appendChild(imagePainter);

    // Assert
    const colorsPicker =
      imagePainter.shadowRoot.querySelector("c-colors-picker");
    expect(colorsPicker).not.toBeNull();
  });

  it("displays the canvas-container", () => {
    // Arrange
    const imagePainter = createElement("c-image-painter", {
      is: ImagePainter
    });

    // Act
    document.body.appendChild(imagePainter);

    // Assert
    const canvasContainer = imagePainter.shadowRoot.querySelector(
      '[data-id="canvas-container"]'
    );
    expect(canvasContainer).not.toBeNull();
  });

  it("does not display the image-text-editor when text is not selected", () => {
    // Arrange
    const imagePainter = createElement("c-image-painter", {
      is: ImagePainter
    });
    imagePainter.selectedShape = Shapes.Draw;

    // Act
    document.body.appendChild(imagePainter);

    // Assert
    const imageTextEditor = imagePainter.shadowRoot.querySelector(
      "c-image-text-editor"
    );
    expect(getComputedStyle(imageTextEditor).display).toBe("none");
  });

  it("displays the thickness buttons when text is not selected", () => {
    // Arrange
    const imagePainter = createElement("c-image-painter", {
      is: ImagePainter
    });
    imagePainter.selectedShape = Shapes.Draw;

    // Act
    document.body.appendChild(imagePainter);

    // Assert
    const thicknessButtons = imagePainter.shadowRoot.querySelector(
      ".thickness-button-group"
    );
    expect(thicknessButtons).not.toBeNull();
    const textButtons =
      imagePainter.shadowRoot.querySelector(".text-button-group");
    expect(textButtons).toBeNull();
  });

  it("displays the image-text-editor when text is selected", async () => {
    // Arrange
    const imagePainter = createElement("c-image-painter", {
      is: ImagePainter
    });

    // Act
    document.body.appendChild(imagePainter);
    await Promise.resolve();
    imagePainter.selectedShape = Shapes.Text;
    await Promise.resolve();

    // Assert
    const imageTextEditor = imagePainter.shadowRoot.querySelector(
      "c-image-text-editor"
    );
    expect(getComputedStyle(imageTextEditor).display).not.toBe("none");
  });

  it("displays the text background buttons when text is selected", async () => {
    // Arrange
    const imagePainter = createElement("c-image-painter", {
      is: ImagePainter
    });

    // Act
    document.body.appendChild(imagePainter);
    await Promise.resolve();
    imagePainter.selectedShape = Shapes.Text;
    await Promise.resolve();

    // Assert
    const thicknessButtons = imagePainter.shadowRoot.querySelector(
      ".thickness-button-group"
    );
    expect(thicknessButtons).toBeNull();
    const textButtons =
      imagePainter.shadowRoot.querySelector(".text-button-group");
    expect(textButtons).not.toBeNull();
  });
});
