import { api, LightningElement } from "lwc";
import {
  log,
  debug,
  getComputedPropertyFloat,
  getComputedWidth,
  getComputedHeight,
  getNetWidth
} from "c/utilsImageCapture";

export default class ImageTextEditor extends LightningElement {
  _selectedColor;
  @api
  get selectedColor() {
    return this._selectedColor;
  }
  set selectedColor(value) {
    this._selectedColor = value;
    if (this.firstRenderDone) {
      this.textArea.style.color = this.selectedColor.description;
    }
  }

  @api
  includeBackground;

  @api
  reset() {
    debug("Resetting text editor");
    this.textArea.value = "";
    this.resizeTextEditor(this.DEFAULT_HEIGHT_PX, this.DEFAULT_WIDTH_PX);
  }

  @api
  resizeTextEditor(newHeight, newWidth) {
    const resizeableBox = this.resizeableBox;
    const textArea = this.textArea;

    resizeableBox.style.height = newHeight + "px";
    resizeableBox.style.width = newWidth + "px";
    textArea.style.height = newHeight + "px";
    textArea.style.width = newWidth + "px";

    this.resizeFont();
  }

  @api
  textEditorWasPlaced() {
    // Calculate initial font size
    this.resizeFont();

    // After a short delay, focus the text editor to show the keyboard
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.textArea.focus();
    }, 700);
  }

  @api
  getUserText() {
    return this.textArea.value;
  }

  @api
  getFontSize() {
    return parseFloat(this.textArea.style.fontSize.replace("px", ""));
  }

  @api
  getLineHeight() {
    return getComputedPropertyFloat(this.textArea, "line-height");
  }

  @api
  getTextPadding() {
    return getComputedPropertyFloat(this.textArea, "padding");
  }

  @api
  getTextAreaNetWidth() {
    return getNetWidth(this.textArea);
  }

  @api
  getDefaultDimensions() {
    return { height: this.DEFAULT_HEIGHT_PX, width: this.DEFAULT_WIDTH_PX };
  }

  Corners = Object.freeze({
    TopLeft: Symbol("TopLeft"),
    TopRight: Symbol("TopRight"),
    BottomLeft: Symbol("BottomLeft"),
    BottomRight: Symbol("BottomRight")
  });

  get textArea() {
    return this.template.querySelector('[data-id="main-text-area"]');
  }

  get resizeableBox() {
    return this.template.querySelector('[data-id="resizeable-box"]');
  }

  get resizeableBoxClass() {
    let cls = "resizable";
    if (this.includeBackground) {
      cls += " with-bg";
    }
    return cls;
  }

  DEFAULT_HEIGHT_PX = 30;
  DEFAULT_WIDTH_PX = 120;
  MIN_SIZE_PX = 30;
  FONT_SIZE_STEP = 0.3;
  MIN_FONT_SIZE_PX = 8;

  // Auxiliary objects
  textWidthCanvas;
  countLinesTextArea;

  selectedCorner;
  originalWidth = 0;
  originalHeight = 0;
  originalX = 0;
  originalY = 0;
  originalMouseX = 0;
  originalMouseY = 0;
  lastNotifyMouseX = 0;
  lastNotifyMouseY = 0;

  firstRenderDone = false;
  renderedCallback() {
    if (this.firstRenderDone) {
      return;
    }

    this.firstRenderDone = true;
    debug(`First renderedCallback in ImageTextEditor`);

    this.createAuxiliaryObjects();

    this.cornerTopLeft = this.template.querySelector('[data-id="top-left"]');
    this.cornerTopLeft.onpointerdown = (event) => {
      this.handleCornerPointerDown(event, this.Corners.TopLeft);
    };

    this.cornerTopRight = this.template.querySelector('[data-id="top-right"]');
    this.cornerTopRight.onpointerdown = (event) => {
      this.handleCornerPointerDown(event, this.Corners.TopRight);
    };

    this.cornerBottomLeft = this.template.querySelector(
      '[data-id="bottom-left"]'
    );
    this.cornerBottomLeft.onpointerdown = (event) => {
      this.handleCornerPointerDown(event, this.Corners.BottomLeft);
    };

    this.cornerBottomRight = this.template.querySelector(
      '[data-id="bottom-right"]'
    );
    this.cornerBottomRight.onpointerdown = (event) => {
      this.handleCornerPointerDown(event, this.Corners.BottomRight);
    };

    const textArea = this.textArea;
    textArea.style.color = this._selectedColor.description;

    this.resizeTextEditor(this.DEFAULT_HEIGHT_PX, this.DEFAULT_WIDTH_PX);
  }

  createAuxiliaryObjects() {
    // Create canvas to calculate text width
    this.textWidthCanvas = document.createElement("canvas");

    // Create textarea to count lines
    this.countLinesTextArea = document.createElement("textarea");
    this.countLinesTextArea.style.border = "none";
    this.countLinesTextArea.style.height = "0";
    this.countLinesTextArea.style.overflow = "hidden";
    this.countLinesTextArea.style.padding = "0";
    this.countLinesTextArea.style.position = "absolute";
    this.countLinesTextArea.style.left = "0";
    this.countLinesTextArea.style.top = "0";
    this.countLinesTextArea.style.zIndex = "-1";
    document.body.appendChild(this.countLinesTextArea);
  }

  resizeFontOnInputChange(event) {
    this.resizeFont();

    if (event.inputType?.startsWith("insert")) {
      // If the user added text, we need to re-calculate font size because the
      // previous calculation may cause it to reduce the number of lines
      this.resizeFont();
    }
  }

  resizeFont() {
    const resizeableBox = this.resizeableBox;
    const boxWidth = getComputedWidth(resizeableBox) || this.DEFAULT_WIDTH_PX;
    const boxHeight =
      getComputedHeight(resizeableBox) || this.DEFAULT_HEIGHT_PX;

    const userText = this.getUserText();
    const totalPadding = this.getTextPadding() * 2;

    const lines = this.countTextAreaLines(this.textArea);
    const fontSizeByHeight = (boxHeight - totalPadding) / lines;

    const widthForText = boxWidth - totalPadding - 10; /* buffer */
    const fontSizeByWidth =
      userText.trim() !== ""
        ? this.getMaxFontSizeToFitWidth(userText, widthForText)
        : Number.MAX_SAFE_INTEGER;

    this.textArea.style.fontSize =
      Math.min(fontSizeByHeight, fontSizeByWidth) + "px";
  }

  countTextAreaLines(textarea) {
    const computedStyle = getComputedStyle(textarea);
    const paddingLeft = parseInt(computedStyle.paddingLeft, 10);
    const paddingRight = parseInt(computedStyle.paddingRight, 10);

    let lineHeight = parseInt(computedStyle.lineHeight, 10);
    if (isNaN(lineHeight)) {
      // lineHeight may be 'normal', which means line height = font size.
      lineHeight = parseInt(computedStyle.fontSize, 10);
    }

    // Copy properties
    this.countLinesTextArea.style.width =
      textarea.clientWidth - paddingLeft - paddingRight + "px";
    this.countLinesTextArea.style.font = computedStyle.font;
    this.countLinesTextArea.style.letterSpacing = computedStyle.letterSpacing;
    this.countLinesTextArea.style.whiteSpace = computedStyle.whiteSpace;
    this.countLinesTextArea.style.wordBreak = computedStyle.wordBreak;
    this.countLinesTextArea.style.wordSpacing = computedStyle.wordSpacing;
    this.countLinesTextArea.style.wordWrap = computedStyle.wordWrap;
    this.countLinesTextArea.value = textarea.value;

    // Calculate lines
    let lines = Math.floor(this.countLinesTextArea.scrollHeight / lineHeight);
    if (lines === 0) lines = 1;
    return lines;
  }

  getMaxFontSizeToFitWidth(text, width) {
    const context = this.textWidthCanvas.getContext("2d");
    let maxFontSize = Number.MAX_SAFE_INTEGER;

    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") {
        continue;
      }

      let lineMaxFontSize = this.MIN_FONT_SIZE_PX - 1;
      let metrics;
      do {
        lineMaxFontSize += this.FONT_SIZE_STEP;
        context.font = `${lineMaxFontSize}px Arial`;
        metrics = context.measureText(line);
      } while (metrics.width < width);
      maxFontSize = Math.min(maxFontSize, lineMaxFontSize);
    }

    return maxFontSize;
  }

  notifyNewWantedValues(topDiff, leftDiff, newWidth, newHeight, event) {
    this.dispatchEvent(
      new CustomEvent("changevalues", {
        detail: {
          topDiff: topDiff,
          leftDiff: leftDiff,
          newWidth: newWidth,
          newHeight: newHeight
        }
      })
    );

    this.lastNotifyMouseX = event.pageX;
    this.lastNotifyMouseY = event.pageY;
  }

  handleTextAreaPointerDown(event) {
    this.lastNotifyMouseX = event.pageX;
    this.lastNotifyMouseY = event.pageY;

    window.addEventListener("pointermove", this.handleTextAreaMove);
    window.addEventListener("pointerup", this.stopTextAreaMove);
  }

  stopTextAreaMove = () => {
    debug(`ImageTextEditor stopTextAreaMove`);
    window.removeEventListener("pointermove", this.handleTextAreaMove);
    window.removeEventListener("pointerup", this.stopTextAreaMove);
  };

  handleTextAreaMove = (event) => {
    const resizeableBox = this.resizeableBox;
    const topDiff = event.pageY - this.lastNotifyMouseY;
    const leftDiff = event.pageX - this.lastNotifyMouseX;
    this.notifyNewWantedValues(
      topDiff,
      leftDiff,
      getComputedWidth(resizeableBox),
      getComputedHeight(resizeableBox),
      event
    );
  };

  handleCornerPointerDown(event, corner) {
    this.selectedCorner = corner;
    debug(
      `ImageTextEditor handleCornerPointerDown (${this.selectedCorner.toString()})`
    );

    event.preventDefault();

    const resizeableBox = this.resizeableBox;
    this.originalWidth = getComputedWidth(resizeableBox);
    this.originalHeight = getComputedHeight(resizeableBox);
    this.originalX = resizeableBox.getBoundingClientRect().left;
    this.originalY = resizeableBox.getBoundingClientRect().top;
    this.originalMouseX = event.pageX;
    this.originalMouseY = event.pageY;
    this.lastNotifyMouseX = event.pageX;
    this.lastNotifyMouseY = event.pageY;

    window.addEventListener("pointermove", this.handleCornerResize);
    window.addEventListener("pointerup", this.stopCornerResize);
  }

  stopCornerResize = () => {
    debug(`ImageTextEditor stopCornerResize`);
    window.removeEventListener("pointermove", this.handleCornerResize);
    window.removeEventListener("pointerup", this.stopCornerResize);
  };

  handleCornerResize = (event) => {
    const resizeableBox = this.resizeableBox;
    let topDiff = 0,
      leftDiff = 0;
    let newWidth = resizeableBox.style.width,
      newHeight = resizeableBox.style.height;
    switch (this.selectedCorner) {
      case this.Corners.TopLeft: {
        const width = this.originalWidth - (event.pageX - this.originalMouseX);
        const height =
          this.originalHeight - (event.pageY - this.originalMouseY);
        if (width > this.MIN_SIZE_PX) {
          newWidth = width;
          leftDiff = event.pageX - this.lastNotifyMouseX;
        }
        if (height > this.MIN_SIZE_PX) {
          newHeight = height;
          topDiff = event.pageY - this.lastNotifyMouseY;
        }
        break;
      }
      case this.Corners.TopRight: {
        const width = this.originalWidth + (event.pageX - this.originalMouseX);
        const height =
          this.originalHeight - (event.pageY - this.originalMouseY);
        if (width > this.MIN_SIZE_PX) {
          newWidth = width;
        }
        if (height > this.MIN_SIZE_PX) {
          newHeight = height;
          topDiff = event.pageY - this.lastNotifyMouseY;
        }
        break;
      }
      case this.Corners.BottomLeft: {
        const height =
          this.originalHeight + (event.pageY - this.originalMouseY);
        const width = this.originalWidth - (event.pageX - this.originalMouseX);
        if (height > this.MIN_SIZE_PX) {
          newHeight = height;
        }
        if (width > this.MIN_SIZE_PX) {
          newWidth = width;
          leftDiff = event.pageX - this.lastNotifyMouseX;
        }
        break;
      }
      case this.Corners.BottomRight: {
        const width = this.originalWidth + (event.pageX - this.originalMouseX);
        const height =
          this.originalHeight + (event.pageY - this.originalMouseY);
        if (width > this.MIN_SIZE_PX) {
          newWidth = width;
        }
        if (height > this.MIN_SIZE_PX) {
          newHeight = height;
        }
        break;
      }
      default: {
        log(`ERROR! Undefined corner: ${this.selectedCorner.toString()}`);
        break;
      }
    }

    this.notifyNewWantedValues(topDiff, leftDiff, newWidth, newHeight, event);
  };
}
