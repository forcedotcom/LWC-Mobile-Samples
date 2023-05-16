import { LightningElement, api } from "lwc";

export default class SignaturePad extends LightningElement {
  _enableNameSigning = true;
  _enableSignatureDrawing = true;
  _strokeThickness = 1;
  _penColor = "black";
  _padColor = "white";

  isDrawingSignature = false;
  inputText = "";
  drawingSections = [];
  canvas;
  context2d;

  @api
  get enableNameSigning() {
    return this._enableNameSigning;
  }

  set enableNameSigning(value) {
    const parsed = this.parseBool(value);
    if (parsed !== undefined) {
      this._enableNameSigning = parsed;
    }
  }

  @api
  get enableSignatureDrawing() {
    return this._enableSignatureDrawing;
  }

  set enableSignatureDrawing(value) {
    const parsed = this.parseBool(value);
    if (parsed !== undefined) {
      this._enableSignatureDrawing = parsed;
    }
  }

  @api
  get strokeThickness() {
    return this._strokeThickness;
  }

  set strokeThickness(value) {
    if (typeof value === "number") {
      this._strokeThickness = value;
    }
  }

  @api
  get penColor() {
    return this._penColor;
  }

  set penColor(value) {
    if (this.isValidColor(value)) {
      this._penColor = value;
    }
  }

  @api
  get padColor() {
    return this._padColor;
  }

  set padColor(value) {
    if (this.isValidColor(value)) {
      this._padColor = value;
    }
  }

  @api font = null;
  @api nameInputLabel = null;
  @api padLabel = null;

  @api getSignature(includePadColor = false, onlyInkedArea = true) {
    let cv = document.createElement("canvas");
    let ctx = cv.getContext("2d");
    let startX = 0;
    let startY = 0;

    cv.width = this.canvas.width;
    cv.height = this.canvas.height;

    // If we're asked to return only the area with drawn pixels
    // then we need to find the dirty region first.
    if (onlyInkedArea) {
      const { x1, y1, x2, y2 } = this.getDirtyRegion();
      if (x1 > x2 || y1 > y2) {
        return null;
      }

      cv.width = x2 - x1 + 1;
      cv.height = y2 - y1 + 1;

      startX = x1;
      startY = y1;
    }

    if (includePadColor === true) {
      ctx.fillStyle = this.padColor;
      ctx.fillRect(0, 0, cv.width, cv.height);
    }

    ctx.drawImage(
      this.canvas,
      startX,
      startY,
      cv.width,
      cv.height,
      0,
      0,
      cv.width,
      cv.height
    );
    return cv.toDataURL("image/png");
  }

  @api clearSignature() {
    this.imgSrc = null;
    this.inputText = "";
    this.drawingSections = [];
    this.refreshCanvas(true);
  }

  renderedCallback() {
    if (!this.canvas) {
      this.canvas = this.template.querySelector("canvas");
      this.context2d = this.canvas.getContext("2d");
      this.context2d.font = this.font;
      this.addEventListeners();
      this.refreshCanvas(true);
    }
  }

  addEventListeners() {
    if (this.enableSignatureDrawing) {
      // Capture mouse events to use for drawing signature
      this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
      this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
      this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
      this.canvas.addEventListener("mouseout", this.onMouseOut.bind(this));

      // Capture touch events to use for drawing signature
      this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
      this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
      this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
    }

    // Capture window resize for resizing & refreshing the signature pad
    window.addEventListener("resize", this.refreshCanvas.bind(this));
  }

  onMouseDown(event) {
    event.preventDefault();
    this.recordPointer(event, true);
    this.isDrawingSignature = true;
  }

  onMouseMove(event) {
    if (this.isDrawingSignature) {
      this.recordPointer(event, false);
    }
  }

  onMouseUp() {
    this.isDrawingSignature = false;
  }

  onMouseOut() {
    this.isDrawingSignature = false;
  }

  onTouchStart(event) {
    // Only process single-touch not multi-touch
    if (event.targetTouches.length === 1) {
      this.recordPointer(event, true);
      this.isDrawingSignature = true;
    }
  }

  onTouchMove(event) {
    if (this.isDrawingSignature) {
      // Prevent page from scrolling horizontally/vertically as the user is drawing
      event.preventDefault();
      this.recordPointer(event, false);
    }
  }

  onTouchEnd() {
    this.isDrawingSignature = false;
  }

  drawText(event) {
    if (this.enableNameSigning) {
      // Get the text typed in the input box
      this.inputText = event.detail.value;

      // Redraw
      this.refreshCanvas(true);
    }
  }

  recordPointer(event, isNewSection) {
    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;
    const clientRect = this.canvas.getBoundingClientRect();
    const pointX = clientX - clientRect.left;
    const pointY = clientY - clientRect.top;

    if (isNewSection) {
      // Start a new section at this point's coordinates
      this.drawingSections.push([{ x: pointX, y: pointY }]);
    } else {
      if (this.drawingSections.length <= 0) {
        // Start a new section at this point's coordinates
        this.drawingSections.push([{ x: pointX, y: pointY }]);
      } else {
        // Add to the last section
        const lastSectionIdx = this.drawingSections.length - 1;
        const lastSection = this.drawingSections[lastSectionIdx];
        lastSection.push({ x: pointX, y: pointY });
      }
    }

    this.refreshCanvas();
  }

  refreshCanvas(forceFullRedraw = false) {
    let isFullRedraw = forceFullRedraw;

    if (
      this.canvas.width !== this.canvas.clientWidth ||
      this.canvas.height !== this.canvas.clientHeight
    ) {
      // Make the internal texture/buffer dimensions match CSS dimensions.
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      isFullRedraw = true;
    }

    // If we're performing a full redraw, then we should clear the entire canvas first.
    if (isFullRedraw) {
      this.canvas.style.backgroundColor = this.padColor;
      this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (
      this.enableSignatureDrawing &&
      this.drawingSections &&
      this.drawingSections.length > 0
    ) {
      this.context2d.lineCap = "round";
      this.context2d.lineJoin = "round";
      this.context2d.strokeStyle = this.penColor;
      this.context2d.lineWidth = this.strokeThickness;

      if (isFullRedraw) {
        // Draw everything
        this.drawingSections.forEach((section) => {
          if (section.length > 1) {
            this.context2d.beginPath();
            this.context2d.moveTo(section[0].x, section[0].y);
            for (let i = 1; i < section.length; i++) {
              this.context2d.lineTo(section[i].x, section[i].y);
            }
            this.context2d.stroke();
          }
        });
      } else {
        // Draw a line between the last 2 points of the last section
        const lastSection =
          this.drawingSections[this.drawingSections.length - 1];
        const p1 = lastSection[lastSection.length - 2];
        const p2 = lastSection[lastSection.length - 1];
        if (p1 && p2) {
          this.context2d.beginPath();
          this.context2d.moveTo(p1.x, p1.y);
          this.context2d.lineTo(p2.x, p2.y);
          this.context2d.stroke();
        }
      }
    }

    if (this.enableNameSigning && this.inputText && isFullRedraw) {
      const textStartX = 8;
      const textStartY = this.canvas.height / 2;

      this.context2d.font = this.font;
      this.context2d.fillStyle = this.penColor;

      this.context2d.fillText(this.inputText, textStartX, textStartY);
    }
  }

  isValidColor(value) {
    let s = new Option().style;
    s.color = value;
    if (s.color === "") {
      console.error(`SignaturePad - invalid color value: ${value}`);
      return false;
    }

    return true;
  }

  isTransparentColor(color) {
    return color === "transparent" || color === "rgba(0,0,0,0)";
  }

  getDirtyRegion() {
    const imgData = this.context2d.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const pixels = imgData.data;
    let minX = this.canvas.width;
    let minY = this.canvas.height;
    let maxX = -1;
    let maxY = -1;

    // Loop through each pixel to find non-transparent region
    for (let i = 0; i < pixels.length; i += 4) {
      const x = (i / 4) % this.canvas.width;
      const y = Math.floor(i / 4 / this.canvas.width);
      const alpha = pixels[i + 3];

      if (alpha > 0) {
        // Update the bounding box of the dirty region
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  }

  parseBool(value) {
    if (typeof value === "boolean") {
      return value;
    } else if (typeof value === "string") {
      return value.toLowerCase().trim() === "true";
    }
    return undefined;
  }
}
