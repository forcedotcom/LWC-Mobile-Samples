import { createElement } from "lwc";
import ToastMessage from "c/toastMessage";
import { ToastTypes } from "c/utilsImageCapture";

describe("c-toast-message", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays the provided message", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Success;

    // Act
    document.body.appendChild(toastMessage);

    // Verify displayed message
    const message = toastMessage.shadowRoot.querySelector("h2");
    expect(message.textContent).toBe("this is a test");
  });

  it("dispatches an event on close clicked", async () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Success;
    const closeHandler = jest.fn();
    toastMessage.addEventListener("close", closeHandler);

    // Act
    document.body.appendChild(toastMessage);
    const closeButton = toastMessage.shadowRoot.querySelector("button");
    closeButton.click();
    await Promise.resolve();

    // Verify close event was dispatched
    expect(closeHandler).toHaveBeenCalled();
  });

  it("displays the correct icon - success", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Success;

    // Act
    document.body.appendChild(toastMessage);

    // Verify
    const icon = toastMessage.shadowRoot.querySelector(".slds-icon > use");
    expect(icon.attributes[1].value).toContain("symbols.svg#success");
  });

  it("displays the correct icon - error", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Error;

    // Act
    document.body.appendChild(toastMessage);

    // Verify
    const icon = toastMessage.shadowRoot.querySelector(".slds-icon > use");
    expect(icon.attributes[1].value).toContain("symbols.svg#error");
  });

  it("displays the correct icon - warning", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Warning;

    // Act
    document.body.appendChild(toastMessage);

    // Verify
    const icon = toastMessage.shadowRoot.querySelector(".slds-icon > use");
    expect(icon.attributes[1].value).toContain("symbols.svg#warning");
  });

  it("uses the correct theme - success", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Success;

    // Act
    document.body.appendChild(toastMessage);

    // Verify
    const container = toastMessage.shadowRoot.querySelector(
      ".toast-message-container > div"
    );
    expect(container.classList).toContain("slds-theme_success");
  });

  it("uses the correct theme - error", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Error;

    // Act
    document.body.appendChild(toastMessage);

    // Verify
    const container = toastMessage.shadowRoot.querySelector(
      ".toast-message-container > div"
    );
    expect(container.classList).toContain("slds-theme_error");
  });

  it("uses the correct theme - warning", () => {
    // Arrange
    const toastMessage = createElement("c-toast-message", {
      is: ToastMessage
    });
    toastMessage.message = "this is a test";
    toastMessage.type = ToastTypes.Warning;

    // Act
    document.body.appendChild(toastMessage);

    // Verify
    const container = toastMessage.shadowRoot.querySelector(
      ".toast-message-container > div"
    );
    expect(container.classList).toContain("slds-theme_warning");
  });
});
