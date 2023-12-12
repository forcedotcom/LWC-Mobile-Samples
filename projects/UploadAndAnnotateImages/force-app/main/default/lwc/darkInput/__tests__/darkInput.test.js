import { createElement } from "lwc";
import DarkInput from "c/darkInput";

describe("c-dark-input", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays asterix for required field", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.label = "Input Label";
    darkInput.required = true;

    // Act
    document.body.appendChild(darkInput);

    // Assert
    const label = darkInput.shadowRoot.querySelector('label[data-id="label"]');
    expect(label.textContent).toBe("* Input Label");
  });

  it("does not display asterix for optional field", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.label = "Input Label";
    darkInput.required = false;

    // Act
    document.body.appendChild(darkInput);

    // Assert
    const label = darkInput.shadowRoot.querySelector('label[data-id="label"]');
    expect(label.textContent).toBe("Input Label");
  });

  it("displays input element for single-line input", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.multiline = false;

    // Act
    document.body.appendChild(darkInput);

    // Assert
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    expect(input.constructor.name).toBe("HTMLInputElement");
  });

  it("displays textarea element for multi-line input", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.multiline = true;

    // Act
    document.body.appendChild(darkInput);

    // Assert
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    expect(input.constructor.name).toBe("HTMLTextAreaElement");
  });

  it("does not display characters count without setting maxCharacters", async () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.focus();
    await Promise.resolve();

    // Assert
    const charactersCount = darkInput.shadowRoot.querySelector(
      '[data-id="characters-count"]'
    );
    expect(charactersCount).toBeNull();
  });

  it("does not display characters count without focus", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.maxCharacters = 10;

    // Act
    document.body.appendChild(darkInput);

    // Assert
    const charactersCount = darkInput.shadowRoot.querySelector(
      '[data-id="characters-count"]'
    );
    expect(charactersCount).toBeNull();
  });

  it("displays characters count when focused", async () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.maxCharacters = 10;

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.focus();
    await Promise.resolve();

    // Assert
    const charactersCount = darkInput.shadowRoot.querySelector(
      '[data-id="characters-count"]'
    );
    expect(charactersCount).not.toBeNull();
    expect(charactersCount.textContent).toBe("0 / 10");
  });

  it("displays correct characters count when adding text", async () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.maxCharacters = 10;

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.value = "Hello";
    input.dispatchEvent(new CustomEvent("input"));
    input.focus();
    await Promise.resolve();

    // Assert
    const charactersCount = darkInput.shadowRoot.querySelector(
      '[data-id="characters-count"]'
    );
    expect(charactersCount).not.toBeNull();
    expect(charactersCount.textContent).toBe("5 / 10");
  });

  it("returns the value from single-line input", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.multiline = false;

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.value = "Hello";
    input.dispatchEvent(new CustomEvent("input"));

    // Assert
    expect(darkInput.value).toBe("Hello");
  });

  it("returns the value from multi-line input", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.multiline = true;

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.value = "Hello";
    input.dispatchEvent(new CustomEvent("input"));

    // Assert
    expect(darkInput.value).toBe("Hello");
  });

  it("dispatches event when editing single-line input", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.multiline = false;
    const changeHandler = jest.fn();
    darkInput.addEventListener("change", changeHandler);

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.value = "Hello";
    input.dispatchEvent(new CustomEvent("input"));

    // Assert
    expect(changeHandler).toHaveBeenCalled();
    expect(changeHandler.mock.calls[0][0].detail).toEqual({ value: "Hello" });
  });

  it("dispatches event when editing multi-line input", () => {
    // Arrange
    const darkInput = createElement("c-dark-input", {
      is: DarkInput
    });
    darkInput.multiline = true;
    const changeHandler = jest.fn();
    darkInput.addEventListener("change", changeHandler);

    // Act
    document.body.appendChild(darkInput);
    const input = darkInput.shadowRoot.querySelector('[data-id="input"]');
    input.value = "Hello";
    input.dispatchEvent(new CustomEvent("input"));

    // Assert
    expect(changeHandler).toHaveBeenCalled();
    expect(changeHandler.mock.calls[0][0].detail).toEqual({ value: "Hello" });
  });
});
