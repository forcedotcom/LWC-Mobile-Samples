import { createElement } from "lwc";
import InfoEditorPrompt from "c/infoEditorPrompt";

describe("c-info-editor-prompt", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays only file name input when there is no description", () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);

    // Assert
    const fileNameInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="filename-input"]'
    );
    expect(fileNameInput).not.toBeNull();
    expect(fileNameInput.value).toBe("file1");
    const descriptionButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__content > button"
    );
    expect(descriptionButton).not.toBeNull();
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    expect(descriptionInput).toBeNull();
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeTruthy();
  });

  it("displays edited file name in the input", () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = { fileName: "newFile1" };
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);

    // Assert
    const fileNameInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="filename-input"]'
    );
    expect(fileNameInput).not.toBeNull();
    expect(fileNameInput.value).toBe("newFile1");
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    expect(descriptionInput).toBeNull();
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeTruthy();
  });

  it("displays edited description in the input", () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = { description: "newDescription1" };
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);

    // Assert
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    expect(descriptionInput).not.toBeNull();
    expect(descriptionInput.value).toBe("newDescription1");
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeTruthy();
  });

  it("displays both file name and description inputs when there is description", () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);

    // Assert
    const fileNameInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="filename-input"]'
    );
    expect(fileNameInput).not.toBeNull();
    expect(fileNameInput.value).toBe("file1");
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    expect(descriptionInput).not.toBeNull();
    expect(descriptionInput.value).toBe("description1");
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeTruthy();
  });

  it("displays empty description input when clicking on description button", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);
    let descriptionButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__content > button"
    );
    descriptionButton.click();
    await Promise.resolve();

    // Assert
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    expect(descriptionInput).not.toBeNull();
    expect(descriptionInput.value).toBe("");
    descriptionButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__content > button"
    );
    expect(descriptionButton).toBeNull();
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeTruthy();
  });

  it("enables save button when editing file name", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);
    const fileNameInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="filename-input"]'
    );
    fileNameInput.value += "a";
    await Promise.resolve();

    // Assert
    expect(fileNameInput.value).toBe("file1a");
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeFalsy();
  });

  it("disables save button when file name is empty", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);
    const fileNameInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="filename-input"]'
    );
    fileNameInput.value = "";
    await Promise.resolve();

    // Assert
    expect(fileNameInput.value).toBe("");
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeTruthy();
  });

  it("enables save button when adding a description", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);
    const descriptionButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__content > button"
    );
    descriptionButton.click();
    await Promise.resolve();
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    descriptionInput.value += "a";
    await Promise.resolve();

    // Assert
    expect(descriptionInput.value).toBe("a");
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeFalsy();
  });

  it("enables save button when editing the description", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };

    // Act
    document.body.appendChild(infoEditorPrompt);
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    descriptionInput.value += "a";
    await Promise.resolve();

    // Assert
    expect(descriptionInput.value).toBe("description1a");
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBeFalsy();
  });

  it("dispatches empty event when closing", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };
    const finishHandler = jest.fn();
    infoEditorPrompt.addEventListener("finish", finishHandler);

    // Act
    document.body.appendChild(infoEditorPrompt);
    const closeButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__header > span"
    );
    closeButton.click();

    // Assert
    expect(finishHandler).toHaveBeenCalled();
    expect(finishHandler.mock.calls[0][0].detail).toBeNull();
  });

  it("dispatches event with data when saving", async () => {
    // Arrange
    const infoEditorPrompt = createElement("c-info-editor-prompt", {
      is: InfoEditorPrompt
    });
    infoEditorPrompt.editedImageInfo = {};
    infoEditorPrompt.imageInfo = {
      id: 111,
      description: "description1",
      metadata: { fileName: "file1", ext: "jpeg", edited: false }
    };
    const finishHandler = jest.fn();
    infoEditorPrompt.addEventListener("finish", finishHandler);

    // Act
    document.body.appendChild(infoEditorPrompt);
    const fileNameInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="filename-input"]'
    );
    fileNameInput.value += "a";
    await Promise.resolve();
    const descriptionInput = infoEditorPrompt.shadowRoot.querySelector(
      '[data-id="description-input"]'
    );
    descriptionInput.value += "b";
    await Promise.resolve();
    const saveButton = infoEditorPrompt.shadowRoot.querySelector(
      ".slds-modal__footer > button"
    );
    saveButton.click();

    // Assert
    expect(finishHandler).toHaveBeenCalled();
    expect(finishHandler.mock.calls[0][0].detail).toEqual({
      fileName: "file1a",
      description: "description1b"
    });
  });
});
