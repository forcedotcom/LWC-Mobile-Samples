import { api, LightningElement } from "lwc";
import {
  log,
  debug,
  IMAGE_MIME_TYPE,
  Shapes,
  Colors,
  isRunningOnAndroid,
  getComputedHeight,
  getComputedWidth,
  getComputedTop,
  getComputedLeft
} from "c/utilsImageCapture";

export default class ImagePainter extends LightningElement {
  _imageData = null;
  @api
  get imageData() {
    return this._imageData;
  }
  set imageData(value) {
    this._imageData = value;
    this.setImageOnCanvas();
  }

  _selectedShape;
  @api
  get selectedShape() {
    return this._selectedShape;
  }
  set selectedShape(value) {
    this._selectedShape = value;

    if (this.firstRenderDone && this.isTextSelected) {
      this.displayEmptyTextAtTheCenter();
    }
  }

  @api
  maxComponentHeight;

  @api
  reset(originalImageData) {
    debug("Parent asked to reset");

    // Set right on this._imageData (and not this.imageData) to avoid calling the setter
    this._imageData = originalImageData;
    this.freeDrawPath = [];
    this.freeDrawPathLenDraw = 0;
    this.displayTextEditor = false;

    if (this.isTextSelected) {
      this.runAfterCanvasRender.push(() => {
        this.displayEmptyTextAtTheCenter();
      });
    }

    this.recreateAndPopulateCanvasObjects();
  }

  @api
  save() {
    debug("Parent asked to save");

    if (this.isTextSelected && this.displayTextEditor) {
      // There is a text displayed on the screen, save it
      this.drawTextOnCanvas();
    }

    return this.imgCanvas.toDataURL(IMAGE_MIME_TYPE);
  }

  selectedColor = Colors.Red;
  selectedThickness = 3;
  MIN_THICKNESS = 1;
  MAX_THICKNESS = 5;

  get contentContainer() {
    return this.template.querySelector('[data-id="content-container"]');
  }

  get canvasContainer() {
    return this.template.querySelector('[data-id="canvas-container"]');
  }

  imgCanvas;
  imgContext;
  overlayCanvas;
  overlayContext;
  isDown = false;
  moved = false;
  startX = 0;
  startY = 0;
  pointerX = 0;
  pointerY = 0;
  freeDrawPath = [];
  freeDrawPathLenDraw = 0;

  displayTextEditor = false;
  textIncludeBg = false;

  get isTextSelected() {
    return this.selectedShape === Shapes.Text;
  }

  get textEditor() {
    return this.template.querySelector('[data-id="text-editor"]');
  }

  get textEditorClass() {
    var cls = "text-editor ";
    cls +=
      this.selectedShape !== Shapes.Text || !this.displayTextEditor
        ? "text-editor-hidden"
        : "";
    return cls;
  }

  get contentContainerPaddingTop() {
    const contentContainerStyle = getComputedStyle(this.contentContainer);
    return parseFloat(contentContainerStyle.paddingTop);
  }

  get contentContainerPaddingLeft() {
    const contentContainerStyle = getComputedStyle(this.contentContainer);
    return parseFloat(contentContainerStyle.paddingLeft);
  }

  connectedCallback() {
    this.createNewCanvasObjects();

    // Set body dimensions to avoid screen resize when keyboard is shown
    document.body.style.height = window.innerHeight;
    document.body.style.width = window.innerWidth;
  }

  createNewCanvasObjects() {
    this.imgCanvas = document.createElement("canvas");
    this.imgCanvas.classList.add("img-canvas");
    this.imgContext = this.imgCanvas.getContext("2d");

    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.classList.add("overlay-canvas");
    this.overlayCanvas.onpointerdown = (event) => {
      this.handlePointerDown(event);
    };
    this.overlayCanvas.onpointermove = (event) => {
      this.handlePointerMove(event);
    };
    this.overlayCanvas.onpointerup = (event) => {
      this.handlePointerUp(event);
    };
    this.overlayCanvas.onpointerout = (event) => {
      this.handlePointerOut(event);
    };
    this.overlayContext = this.overlayCanvas.getContext("2d");

    this.disableDragOnCanvasObjects();
    this.setCanvasStyles();
  }

  disableDragOnCanvasObjects() {
    this.imgCanvas.addEventListener("touchstart", function (event) {
      event.preventDefault();
    });
    this.imgCanvas.addEventListener("touchmove", function (event) {
      event.preventDefault();
    });
    this.imgCanvas.addEventListener("touchend", function (event) {
      event.preventDefault();
    });
    this.imgCanvas.addEventListener("touchcancel", function (event) {
      event.preventDefault();
    });

    this.overlayCanvas.addEventListener("touchstart", function (event) {
      event.preventDefault();
    });
    this.overlayCanvas.addEventListener("touchmove", function (event) {
      event.preventDefault();
    });
    this.overlayCanvas.addEventListener("touchend", function (event) {
      event.preventDefault();
    });
    this.overlayCanvas.addEventListener("touchcancel", function (event) {
      event.preventDefault();
    });
  }

  setCanvasStyles() {
    this.imgContext.lineCap = "round";
    this.overlayContext.lineCap = "round";

    this.imgContext.lineJoin = "round";
    this.overlayContext.lineJoin = "round";
  }

  runAfterRender = [];
  firstRenderDone = false;
  renderedCallback() {
    if (this.runAfterRender) {
      debug(`Calling ${this.runAfterRender.length} render callbacks`);
      for (const callback of this.runAfterRender) {
        callback();
      }
      this.runAfterRender = [];
    }

    if (!this.firstRenderDone) {
      this.firstRenderDone = true;
      debug("First renderedCallback in imagePainter");

      if (this.isTextSelected) {
        this.runAfterCanvasRender.push(() => {
          this.displayEmptyTextAtTheCenter();
        });
      }

      this.populateCanvasObjects();
    }
  }

  recreateAndPopulateCanvasObjects() {
    this.createNewCanvasObjects();
    this.populateCanvasObjects();
  }

  populateCanvasObjects() {
    this.setMaxHeightToCanvasObjects();
    this.populateCanvasContainer();
    this.setImageOnCanvas();
  }

  setMaxHeightToCanvasObjects() {
    const footerArea = this.template.querySelector('[data-id="footer"]');
    const contentContainerStyle = getComputedStyle(this.contentContainer);
    const contentVerticalPadding =
      parseFloat(contentContainerStyle.paddingTop) +
      parseFloat(contentContainerStyle.paddingBottom);

    this.imgCanvas.style.maxHeight =
      this.maxComponentHeight -
      footerArea.clientHeight -
      contentVerticalPadding +
      "px";
    this.overlayCanvas.style.maxHeight = this.imgCanvas.style.maxHeight;
  }

  populateCanvasContainer() {
    const canvasContainer = this.canvasContainer;
    canvasContainer.replaceChildren();
    canvasContainer.appendChild(this.imgCanvas);
    canvasContainer.appendChild(this.overlayCanvas);

    canvasContainer.style.minWidth = this.imageWidth;
    canvasContainer.style.minHeight = this.imageHeight;
  }

  drawTextOnCanvas() {
    const textEditor = this.textEditor;
    const text = textEditor.getUserText();

    if (!text && !this.textIncludeBg) {
      // There is nothing to draw on the image
      return;
    }

    // Calculate text editor's corners
    const topLeft = {
      x: getComputedLeft(textEditor),
      y: getComputedTop(textEditor)
    };
    const bottomRight = {
      x: topLeft.x + getComputedWidth(textEditor),
      y: topLeft.y + getComputedHeight(textEditor)
    };

    // Since imgCanvas is located inside the canvasContainer, and canvasContainer
    // always takes 100% width, we need to fix the x values of the corners
    const imgCanvas = this.imgCanvas;
    topLeft.x -= imgCanvas.offsetLeft - this.contentContainerPaddingLeft;
    bottomRight.x -= imgCanvas.offsetLeft - this.contentContainerPaddingLeft;

    // Draw the background if needed
    const imgContext = this.imgContext;
    if (this.textIncludeBg) {
      const rectWidth = bottomRight.x - topLeft.x;
      const rectHeight = bottomRight.y - topLeft.y;
      imgContext.fillStyle = "#FFFFFF";
      imgContext.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);
    }

    // Set context values as a preparation to draw the text
    const fontSize = textEditor.getFontSize();
    imgContext.font = fontSize + "px Arial";
    imgContext.fillStyle = this.selectedColor.description;
    imgContext.textAlign = "left";
    imgContext.textBaseline = "middle";

    // Calculate fix for X and Y axes based on the platform
    let xAxisFix;
    let yAxisFix;
    if (isRunningOnAndroid()) {
      // Fix for Android
      xAxisFix = 1 /* pixels */;
      yAxisFix = fontSize / 20 /* pixels */;
    } else {
      // Fix for iOS
      xAxisFix = 1.5 /* pixels */;
      yAxisFix = fontSize / 35 /* pixels */;
    }

    const padding = textEditor.getTextPadding();
    const lineHeight = textEditor.getLineHeight();
    const textEditorNetWidth = textEditor.getTextAreaNetWidth();

    // Text baseline is "middle", so we need to calculate the
    // middle of the first row to start drawing the text
    const middleLeftText = {
      x: topLeft.x + xAxisFix + padding,
      y: topLeft.y + yAxisFix + padding + lineHeight / 2
    };

    this.printAsWordWrap(text, middleLeftText, lineHeight, textEditorNetWidth);

    this.displayTextEditor = false;
    this.notifyImageEdit();
  }

  displayEmptyTextAtTheCenter() {
    this.resetTextEditor();

    const textEditorDimensions = this.textEditor.getDefaultDimensions();
    const canvasRect = this.imgCanvas.getBoundingClientRect();

    const canvasCenter = { x: canvasRect.width / 2, y: canvasRect.height / 2 };
    const textEditorTopLeft = {
      x: canvasCenter.x - textEditorDimensions.width / 2,
      y: canvasCenter.y - textEditorDimensions.height / 2
    };

    this.displayTextEditorAt(textEditorTopLeft.x, textEditorTopLeft.y);
  }

  resetTextEditor() {
    this.textIncludeBg = false;
    this.textEditor.reset();
  }

  displayTextEditorAt(x, y) {
    debug(`Displaying text editor in canvas container at (${x}, ${y})`);

    const textEditor = this.textEditor;
    const topValue = y;

    // Since imgCanvas is located inside the canvas-container, and canvas-container always
    // takes 100% width, we need to calculate the actual left value to place the text editor
    const leftValue =
      x + this.imgCanvas.offsetLeft - this.contentContainerPaddingLeft;

    // Show the text editor
    this.displayTextEditor = true;

    // Wait for render, then place the text editor and notify it was placed
    this.runAfterRender.push(() => {
      textEditor.style.top =
        this.getAllowedTopValueForTextEditor(topValue) + "px";
      textEditor.style.left =
        this.getAllowedLeftValueForTextEditor(leftValue) + "px";
      textEditor.textEditorWasPlaced();
    });

    // Notify image edit, because once the text editor was placed it will be drawn
    this.notifyImageEdit();
  }

  handleTextEditorValuesChange(event) {
    const newValues = event.detail;
    const textEditor = this.textEditor;

    const newTop = getComputedTop(textEditor) + newValues.topDiff;
    const newLeft = getComputedLeft(textEditor) + newValues.leftDiff;
    const newHeight = newValues.newHeight;
    const newWidth = newValues.newWidth;

    const allowedTopValue = this.getAllowedTopValueForTextEditorAndHeight(
      newTop,
      newHeight
    );
    const allowedLeftValue = this.getAllowedLeftValueForTextEditorAndWidth(
      newLeft,
      newWidth
    );

    if (
      newHeight === getComputedHeight(textEditor) &&
      newWidth === getComputedWidth(textEditor)
    ) {
      // We are only moving the text editor
      textEditor.style.top = allowedTopValue + "px";
      textEditor.style.left = allowedLeftValue + "px";
    } else {
      // We are resizing the text editor, and potentially also moving it
      if (newTop !== allowedTopValue || newLeft !== allowedLeftValue) {
        // We tried to perform an illegal move, ignore this change
        return;
      }

      // Update text editor's position
      textEditor.style.top = allowedTopValue + "px";
      textEditor.style.left = allowedLeftValue + "px";

      // Update text editor's size
      textEditor.resizeTextEditor(newHeight, newWidth);
    }
  }

  getAllowedLeftValueForTextEditor(leftValue) {
    return this.getAllowedLeftValueForTextEditorAndWidth(
      leftValue,
      getComputedWidth(this.textEditor)
    );
  }

  getAllowedLeftValueForTextEditorAndWidth(leftValue, textEditorWidth) {
    const imgCanvas = this.imgCanvas;
    const minX = imgCanvas.offsetLeft - this.contentContainerPaddingLeft;
    const maxX = minX + getComputedWidth(imgCanvas);

    if (leftValue < minX) {
      debug(`Left value '${leftValue}' is smaller than minX '${minX}'`);
      return minX;
    }

    if (leftValue + textEditorWidth > maxX) {
      debug(
        `Left value '${leftValue}' plus width '${textEditorWidth}' is larger than maxX '${maxX}'`
      );
      return maxX - textEditorWidth;
    }

    return leftValue;
  }

  getAllowedTopValueForTextEditor(topValue) {
    return this.getAllowedTopValueForTextEditorAndHeight(
      topValue,
      getComputedHeight(this.textEditor)
    );
  }

  getAllowedTopValueForTextEditorAndHeight(topValue, textEditorHeight) {
    const imgCanvas = this.imgCanvas;
    const minY = imgCanvas.offsetTop - this.contentContainerPaddingTop;
    const maxY = minY + getComputedHeight(imgCanvas);

    if (topValue < minY) {
      debug(`Top value '${topValue}' is smaller than minY '${minY}'`);
      return minY;
    }

    if (topValue + textEditorHeight > maxY) {
      debug(
        `Top value '${topValue}' plus height '${textEditorHeight}' is larger than maxY '${maxY}'`
      );
      return maxY - textEditorHeight;
    }

    return topValue;
  }

  runAfterCanvasRender = [];
  setImageOnCanvas() {
    if (!this.firstRenderDone) {
      return;
    }

    const imageObj = new Image();
    imageObj.src = this.imageData;

    imageObj.onload = () => {
      // Set canvas sizes
      this.imgCanvas.width = imageObj.width;
      this.imgCanvas.height = imageObj.height;
      this.overlayCanvas.width = imageObj.width;
      this.overlayCanvas.height = imageObj.height;

      // Draw the image on the image canvas
      this.imgContext.drawImage(imageObj, 0, 0);

      // Scale both canvases
      const canvasDimensionRatio = this.getCanvasDimensionRatio();
      this.imgContext.scale(canvasDimensionRatio, canvasDimensionRatio);
      this.overlayContext.scale(canvasDimensionRatio, canvasDimensionRatio);

      if (this.runAfterCanvasRender) {
        debug(
          `Calling ${this.runAfterCanvasRender.length} post canvas-render callbacks`
        );
        for (const callback of this.runAfterCanvasRender) {
          callback();
        }
        this.runAfterCanvasRender = [];
      }
    };
  }

  notifyImageEdit() {
    this.dispatchEvent(new CustomEvent("edit"));
  }

  handlePointerDown(e) {
    debug(`ImagePainter handlePointerDown`);

    e.preventDefault();
    e.stopPropagation();

    // Save the starting x/y
    const pointerPosition = this.getPosOnCanvasRelativeToWindow(
      e.clientX,
      e.clientY
    );
    this.startX = pointerPosition.x;
    this.startY = pointerPosition.y;

    // Set a flag indicating the drag has begun
    this.isDown = true;

    if (this.selectedShape === Shapes.Free) {
      // Save the first point for free drawing
      this.freeDrawPath = [];
      this.freeDrawPathLenDraw = 0;
      this.freeDrawPath.push(pointerPosition);
    }
  }

  handlePointerUp(e) {
    debug(`ImagePainter handlePointerUp`);

    e.preventDefault();
    e.stopPropagation();

    // The drag is over
    this.isDown = false;

    // If the pointer wasn't moved - don't draw anything
    if (!this.moved) {
      return;
    }

    // Mark the pointer wasn't moved for next drawing
    this.moved = false;

    // If we are in text mode, there's nothing to draw
    if (this.isTextSelected) {
      return;
    }

    // Clear the overlay canvas
    this.overlayContext.clearRect(
      0,
      0,
      this.overlayCanvas.width,
      this.overlayCanvas.height
    );

    this.drawShapeOn(this.imgContext);

    this.freeDrawPath = [];
    this.freeDrawPathLenDraw = 0;

    this.notifyImageEdit();
  }

  handlePointerOut(e) {
    debug(`ImagePainter handlePointerOut`);

    e.preventDefault();
    e.stopPropagation();

    // Clear the dragging flag
    this.isDown = false;
  }

  handlePointerMove(e) {
    debug(`ImagePainter handlePointerMove`);

    e.preventDefault();
    e.stopPropagation();

    // If we're not dragging, just return
    if (!this.isDown) {
      return;
    }

    // If we are in text mode, there's nothing to draw
    if (this.isTextSelected) {
      return;
    }

    // Mark that the pointer was moved
    this.moved = true;

    // Get the current pointer position
    const pointerPos = this.getPosOnCanvasRelativeToWindow(
      e.clientX,
      e.clientY
    );
    this.pointerX = pointerPos.x;
    this.pointerY = pointerPos.y;

    if (this.selectedShape === Shapes.Free) {
      // In free drawing, add current position to the list only if it's
      // far enough from the last point we draw (to smooth the line)
      const path = this.freeDrawPath;
      const last = path[path.length - 1];
      const dx = Math.abs(last.x - pointerPos.x);
      const dy = Math.abs(last.y - pointerPos.y);
      if (dx + dy > 3) {
        this.freeDrawPath.push(pointerPos);
      }
    }

    // Clear the overlay canvas
    this.overlayContext.clearRect(
      0,
      0,
      this.overlayCanvas.width,
      this.overlayCanvas.height
    );

    this.drawShapeOn(this.overlayContext);
  }

  setColorAndThicknessOn(context) {
    context.strokeStyle = this.selectedColor.description;
    context.lineWidth = this.selectedThickness;
  }

  drawShapeOn(context) {
    // Set the selected color and thickness
    this.setColorAndThicknessOn(context);

    // Draw the shape
    switch (this.selectedShape) {
      case Shapes.Rectangle: {
        const width = this.pointerX - this.startX;
        const height = this.pointerY - this.startY;
        context.strokeRect(this.startX, this.startY, width, height);
        break;
      }
      case Shapes.Oval: {
        context.save();
        context.beginPath();

        const scaleX = (this.pointerX - this.startX) / 2;
        const scaleY = (this.pointerY - this.startY) / 2;
        context.scale(scaleX, scaleY);

        const centerX = this.startX / scaleX + 1;
        const centerY = this.startY / scaleY + 1;
        context.arc(centerX, centerY, 1, 0, 2 * Math.PI);

        context.restore();
        context.stroke();
        break;
      }
      case Shapes.Line: {
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.pointerX, this.pointerY);
        context.stroke();
        break;
      }
      case Shapes.Free: {
        this.drawFreeShape();
        break;
      }
      default: {
        log("ERROR! Undefined shape: " + this.selectedShape.toString());
        break;
      }
    }
  }

  getPosOnCanvasRelativeToWindow(x, y) {
    const canvas = this.imgCanvas;
    const rect = canvas.getBoundingClientRect();
    return {
      x: x - rect.left,
      y: y - rect.top
    };
  }

  getCanvasDimensionRatio() {
    const canvas = this.imgCanvas;
    const rect = canvas.getBoundingClientRect();
    return canvas.width / (rect.right - rect.left);
  }

  // We draw the free shape straight on the image canvas (we skip the overlay canvas),
  // because drawing the entire path on the overlay canvas every frame becomes very
  // slow after a certain amount of points
  drawFreeShape() {
    if (!this.isDown) {
      // If the user is not currently touching the screen, we don't need to draw anything.
      // It can happen because we try to re-draw the shape on the image canvas when the
      // user release their touch, but we already draw everything on the image canvas.
      return;
    }

    const path = this.freeDrawPath;
    if (path.length < 2) {
      // At least 2 points are needed
      return;
    }

    if (this.freeDrawPathLenDraw === path.length) {
      // This method is being called for every pixel the user drags. However, there's a logic
      // that decides wether we add a new point to the path or not, so we check wether we
      // have already processed all the points in the path or not.
      return;
    }

    // Set the selected color and thickness
    const ctx = this.imgContext;
    this.setColorAndThicknessOn(ctx);

    ctx.beginPath();
    const oneBeforeLast = path[path.length - 2];
    const last = path[path.length - 1];

    if (path.length >= 3) {
      // If we have more than 3 points, we want to take the last 3 and draw the path
      // (of 2 lines) between them, so the canvas will draw the corners correctly
      const twoBeforeLast = path[path.length - 3];
      ctx.moveTo(twoBeforeLast.x, twoBeforeLast.y);
      ctx.lineTo(oneBeforeLast.x, oneBeforeLast.y);
    } else {
      ctx.moveTo(oneBeforeLast.x, oneBeforeLast.y);
    }

    ctx.lineTo(last.x, last.y);
    ctx.stroke();
    ctx.closePath();

    // Mark we processed the last point successfully
    this.freeDrawPathLenDraw = path.length;
  }

  handleColorChanged(event) {
    this.selectedColor = event.detail;
  }

  get decreaseThicknessClass() {
    var cls = "slds-button slds-button_icon thickness-button";
    if (this.selectedThickness === this.MIN_THICKNESS + 1) {
      cls += " half";
    }
    return cls;
  }

  decreaseThickness() {
    this.selectedThickness--;
  }

  get increaseThicknessClass() {
    var cls = "slds-button slds-button_icon thickness-button";
    if (this.selectedThickness === this.MAX_THICKNESS - 1) {
      cls += " half";
    }
    return cls;
  }

  increaseThickness() {
    this.selectedThickness++;
  }

  get isMinimumThickness() {
    return this.selectedThickness === this.MIN_THICKNESS;
  }

  get isMaximumThickness() {
    return this.selectedThickness === this.MAX_THICKNESS;
  }

  textIncludeBackground() {
    this.textIncludeBg = true;
  }

  textRemoveBackground() {
    this.textIncludeBg = false;
  }

  get textRemoveBackgroundClass() {
    let cls = "bg-button";
    if (!this.textIncludeBg) {
      cls += " is-selected";
    }
    return cls;
  }

  get textIncludeBackgroundClass() {
    let cls = "bg-button";
    if (this.textIncludeBg) {
      cls += " is-selected";
    }
    return cls;
  }

  printAsWordWrap(text, startPosition, lineHeight, fitWidth) {
    const imgContext = this.imgContext;
    const x = startPosition.x;
    const y = startPosition.y;

    let words = this.getWordsListForText(text);
    let currentLine = 0;
    let idx = 1;
    while (words.length > 0 && idx <= words.length) {
      let str = words.slice(0, idx).join("") || "";
      let strWidth = imgContext.measureText(str).width;
      let isNewLine = words[idx - 1] === "\n";
      if (strWidth > fitWidth || isNewLine) {
        if (idx === 1 && words[0].length > 1) {
          let word = words[0];
          let fitWord = word[0],
            i = 1;
          while (imgContext.measureText(fitWord + word[i]).width < fitWidth) {
            fitWord += word[i];
            i++;
          }
          imgContext.fillText(fitWord, x, y + lineHeight * currentLine);
          words[0] = word.substring(i);
        } else {
          const indexToUse = isNewLine ? idx : idx - 1;
          imgContext.fillText(
            words.slice(0, indexToUse).join(""),
            x,
            y + lineHeight * currentLine
          );
          words = words.splice(indexToUse);
        }
        currentLine++;
        if (!isNewLine) {
          // If the last char wasn't a new line, remove all first spaces
          let numOfSpaces = 0;
          while (words[numOfSpaces] === " ") {
            numOfSpaces++;
          }
          if (numOfSpaces > 0) {
            words = words.splice(numOfSpaces);
          }
        }
        idx = 1;
      } else {
        idx++;
      }
    }
    if (idx > 0) {
      imgContext.fillText(words.join(""), x, y + lineHeight * currentLine);
    }
  }

  // Breaks the given string to "pieces" that will be printed on the canvas.
  // Each piece should be treated as a single unit and thus we will try to print
  // it on the same line, unless we encounter a line-break (' ' / '\n' / '-').
  getWordsListForText(text) {
    let words = [];
    let buffer = "";

    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char !== " " && char !== "\n" && char !== "-") {
        buffer += char;
      } else {
        if (buffer) {
          words.push(buffer);
        }
        words.push(char);
        buffer = "";
      }
    }

    if (buffer) {
      words.push(buffer);
    }
    return words;
  }
}
