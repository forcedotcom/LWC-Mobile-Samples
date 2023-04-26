import { createElement } from "lwc";
import ColorsPicker from "c/colorsPicker";

describe("c-colors-picker", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("selects the red color by default", () => {
    // Arrange
    const colorsPicker = createElement("c-colors-picker", {
      is: ColorsPicker
    });

    // Act
    document.body.appendChild(colorsPicker);

    // Assert
    const selectedColorSpan = colorsPicker.shadowRoot.querySelector(
      'span[class="dot-selection-ring is-selected"]'
    );
    expect(selectedColorSpan).not.toBeNull();
    expect(selectedColorSpan.parentElement.children[0].className).toBe(
      "dot red"
    );
  });

  it("switches to a different color with click", async () => {
    // Arrange
    const colorsPicker = createElement("c-colors-picker", {
      is: ColorsPicker
    });

    // Act
    document.body.appendChild(colorsPicker);
    const whiteButtonSpan = colorsPicker.shadowRoot.querySelector(
      'span[class="dot white"]'
    );
    whiteButtonSpan.parentElement.click();
    await Promise.resolve();

    // Assert red is not selected
    const redColorSpan = colorsPicker.shadowRoot.querySelector(
      'span[class="dot red"]'
    );
    expect(redColorSpan.parentElement.children[1].className).toBe(
      "dot-selection-ring"
    );

    // Assert white is selected
    const selectedColorSpan = colorsPicker.shadowRoot.querySelector(
      'span[class="dot-selection-ring is-selected"]'
    );
    expect(selectedColorSpan).not.toBeNull();
    expect(selectedColorSpan.parentElement.children[0].className).toBe(
      "dot white"
    );
  });
});
