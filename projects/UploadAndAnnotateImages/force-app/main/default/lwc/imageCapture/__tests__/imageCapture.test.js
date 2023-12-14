import { createElement } from "lwc";
import ImageCapture from "c/imageCapture";

describe("c-image-capture", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays imageSelector by default", () => {
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

  it("switches to imageAnnotate when receives an annotateimage event", async () => {
    // Arrange
    const imageCapture = createElement("c-image-capture", {
      is: ImageCapture
    });

    // Mock FileReader's "readAsDataURL" to call "onloadend" with given file's data
    jest.spyOn(global, "FileReader").mockImplementation(function () {
      this.readAsDataURL = jest.fn().mockImplementation((file) => {
        this.onloadend({ target: { result: file.data } });
      });
    });

    // Act
    document.body.appendChild(imageCapture);

    // Load 1 image
    let imageSelector =
      imageCapture.shadowRoot.querySelector("c-image-selector");
    imageSelector.dispatchEvent(
      new CustomEvent("selectimages", {
        detail: [
          {
            name: "my-file-name.jpeg",
            data: "my-file-data"
          }
        ]
      })
    );

    await Promise.resolve(); // Wait for the event to be processed
    await Promise.resolve(); // Wait for the readFile promise
    await Promise.resolve(); // Wait for the readMetadata promise

    // Fire annotateimage event with the first ID
    imageSelector.dispatchEvent(
      new CustomEvent("annotateimage", {
        detail: 0
      })
    );
    await Promise.resolve();

    // Assert
    imageSelector = imageCapture.shadowRoot.querySelector("c-image-selector");
    expect(imageSelector).toBeNull();
    const imageAnnotate =
      imageCapture.shadowRoot.querySelector("c-image-annotate");
    expect(imageAnnotate).not.toBeNull();
  });
});
