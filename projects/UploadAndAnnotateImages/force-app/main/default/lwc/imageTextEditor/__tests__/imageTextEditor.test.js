import { createElement } from "lwc";
import { Colors } from "c/utilsImageCapture";
import ImageTextEditor from "c/imageTextEditor";

describe("c-image-text-editor", () => {
  let originalCreateElement;

  beforeEach(() => {
    // Mock canvas and context to override default jest implementation
    // that returns the string length as the width for "measureText"
    const mockCanvas = document.createElement("canvas");
    const mockContext = mockCanvas.getContext("2d");
    mockContext.measureText.mockImplementation((text) => {
      const fontSize = parseFloat(
        mockCanvas.getContext("2d").font.split("px")[0]
      );
      return { width: text.length * fontSize };
    });

    // Mock "document.createElement" to return the mock canvas
    originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn().mockImplementation((tagName) => {
      switch (tagName) {
        case "canvas":
          return mockCanvas;
        default:
          return originalCreateElement(tagName);
      }
    });
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    // Restore original "document.createElement" method
    document.createElement = originalCreateElement;
  });

  it("displays the textarea", () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.Black;

    // Act
    document.body.appendChild(imageTextEditor);

    // Assert
    const textArea = imageTextEditor.shadowRoot.querySelector(
      '[data-id="main-text-area"]'
    );
    expect(textArea).not.toBeNull();
  });

  it("displays the background if needed", () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.Black;
    imageTextEditor.includeBackground = true;

    // Act
    document.body.appendChild(imageTextEditor);

    // Assert
    const resizeableBox = imageTextEditor.shadowRoot.querySelector(
      '[data-id="resizeable-box"]'
    );
    expect(resizeableBox.classList).toContain("with-bg");
  });

  it("does not display the background if needed", () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.Black;
    imageTextEditor.includeBackground = false;

    // Act
    document.body.appendChild(imageTextEditor);

    // Assert
    const resizeableBox = imageTextEditor.shadowRoot.querySelector(
      '[data-id="resizeable-box"]'
    );
    expect(resizeableBox.classList).not.toContain("with-bg");
  });

  it("returns the correct text", async () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.Black;

    // Act
    document.body.appendChild(imageTextEditor);
    const textArea = imageTextEditor.shadowRoot.querySelector(
      '[data-id="main-text-area"]'
    );
    textArea.value = "Hello";
    textArea.dispatchEvent(new CustomEvent("input"));
    await Promise.resolve();

    // Assert
    expect(imageTextEditor.getUserText()).toEqual("Hello");
  });

  it("sets the correct text color", () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.White;

    // Act
    document.body.appendChild(imageTextEditor);

    // Assert
    const textArea = imageTextEditor.shadowRoot.querySelector(
      '[data-id="main-text-area"]'
    );
    expect(textArea.style.color).toEqual("rgb(255, 255, 255)");
  });

  it("changes the text color", async () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.Red;

    // Act
    document.body.appendChild(imageTextEditor);
    await Promise.resolve();
    imageTextEditor.selectedColor = Colors.Black;
    await Promise.resolve();

    // Assert
    const textArea = imageTextEditor.shadowRoot.querySelector(
      '[data-id="main-text-area"]'
    );
    expect(textArea.style.color).toEqual("rgb(0, 0, 0)");
  });

  it("clears the text on reset", async () => {
    // Arrange
    const imageTextEditor = createElement("c-image-text-editor", {
      is: ImageTextEditor
    });
    imageTextEditor.selectedColor = Colors.Red;

    // Act
    document.body.appendChild(imageTextEditor);
    const textArea = imageTextEditor.shadowRoot.querySelector(
      '[data-id="main-text-area"]'
    );
    textArea.value = "Hello";
    textArea.dispatchEvent(new CustomEvent("input"));
    await Promise.resolve();
    imageTextEditor.reset();
    await Promise.resolve();

    // Assert
    expect(imageTextEditor.getUserText()).toEqual("");
  });
});
