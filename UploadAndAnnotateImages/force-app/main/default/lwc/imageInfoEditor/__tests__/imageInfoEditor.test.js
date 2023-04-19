import { createElement } from "lwc";
import ImageInfoEditor from "c/imageInfoEditor";

describe("c-image-info-editor", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays image, file name, and description", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const image = imageInfoEditor.shadowRoot.querySelector('[data-id="image"]');
    expect(image.src).toBe("http://localhost/data1");
    const fileName = imageInfoEditor.shadowRoot.querySelector(
      '[data-id="file-name"]'
    );
    expect(fileName.textContent).toBe("file1");
    const description = imageInfoEditor.shadowRoot.querySelector(
      '[data-id="description"]'
    );
    expect(description.textContent).toBe("description1");
  });

  it("displays edited file name", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.editedImageInfo = { fileName: "newFile1" };
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const fileName = imageInfoEditor.shadowRoot.querySelector(
      '[data-id="file-name"]'
    );
    expect(fileName.textContent).toBe("newFile1");
  });

  it("displays edited description", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.editedImageInfo = { description: "newDescription1" };
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const description = imageInfoEditor.shadowRoot.querySelector(
      '[data-id="description"]'
    );
    expect(description.textContent).toBe("newDescription1");
  });

  it("displays big edit button when nothing was edited", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const bigEditButton =
      imageInfoEditor.shadowRoot.querySelector(".big-edit-button");
    expect(bigEditButton).not.toBeNull();
    const smallEditButton =
      imageInfoEditor.shadowRoot.querySelector(".small-edit-button");
    expect(smallEditButton).toBeNull();
  });

  it("displays info-editor-prompt when clicking on the big edit button", async () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);
    const bigEditButton = imageInfoEditor.shadowRoot.querySelector(
      ".big-edit-button > .edit-button"
    );
    bigEditButton.click();
    await Promise.resolve();

    // Assert
    const infoEditorPrompt = imageInfoEditor.shadowRoot.querySelector(
      "c-info-editor-prompt"
    );
    expect(infoEditorPrompt).not.toBeNull();
  });

  it("displays small edit button when only name was edited", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.editedImageInfo = { fileName: "newFile1" };
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const bigEditButton =
      imageInfoEditor.shadowRoot.querySelector(".big-edit-button");
    expect(bigEditButton).toBeNull();
    const smallEditButton =
      imageInfoEditor.shadowRoot.querySelector(".small-edit-button");
    expect(smallEditButton).not.toBeNull();
  });

  it("displays small edit button when only description was edited", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const bigEditButton =
      imageInfoEditor.shadowRoot.querySelector(".big-edit-button");
    expect(bigEditButton).toBeNull();
    const smallEditButton =
      imageInfoEditor.shadowRoot.querySelector(".small-edit-button");
    expect(smallEditButton).not.toBeNull();
  });

  it("displays small edit button when both file name and description was edited", () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.editedImageInfo = { fileName: "newFile1" };
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);

    // Assert
    const bigEditButton =
      imageInfoEditor.shadowRoot.querySelector(".big-edit-button");
    expect(bigEditButton).toBeNull();
    const smallEditButton =
      imageInfoEditor.shadowRoot.querySelector(".small-edit-button");
    expect(smallEditButton).not.toBeNull();
  });

  it("displays info-editor-prompt when clicking on the small edit button", async () => {
    // Arrange
    const imageInfoEditor = createElement("c-image-info-editor", {
      is: ImageInfoEditor
    });
    imageInfoEditor.imageData = "http://localhost/data1";
    imageInfoEditor.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(imageInfoEditor);
    const smallEditButton = imageInfoEditor.shadowRoot.querySelector(
      ".small-edit-button > .edit-button"
    );
    smallEditButton.click();
    await Promise.resolve();

    // Assert
    const infoEditorPrompt = imageInfoEditor.shadowRoot.querySelector(
      "c-info-editor-prompt"
    );
    expect(infoEditorPrompt).not.toBeNull();
  });
});
