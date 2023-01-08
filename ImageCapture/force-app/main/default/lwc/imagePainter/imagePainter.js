import { api, LightningElement } from 'lwc';
import { log, IMAGE_MIME_TYPE, Shapes, Colors } from "c/utilsImageCapture";

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

    @api
    selectedShape;

    @api
    contentHeight;

    @api
    reset(originalImageData) {
        log("Parent asked to reset");

        // Set right on this._imageData (and not this.imageData) to avoid calling the setter
        this._imageData = originalImageData;
        
        this.createNewCanvasObjects();
        this.populateCanvasObjects();
        this.freeDrawPath = [];
    }

    @api
    save() {
        log("Parent asked to save");
        return this.imgCanvas.toDataURL(IMAGE_MIME_TYPE);
    }

    selectedColor = Colors.Red;
    selectedThickness = 3;
    MIN_THICKNESS = 1;
    MAX_THICKNESS = 5;

    get scaledThickness() {
        return this.selectedThickness * (this.overlayCanvas.width / this.overlayCanvas.getBoundingClientRect().width);
    }

    canvasContainer;
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
    freeDrawPath = []; // TODO - maybe remove and draw right on the imgCanvas

    connectedCallback() {
        this.createNewCanvasObjects();
    }

    createNewCanvasObjects() {
        this.imgCanvas = document.createElement("canvas");
        this.imgCanvas.classList.add('imgCanvas');
        this.imgContext = this.imgCanvas.getContext("2d");

        this.overlayCanvas = document.createElement("canvas");
        this.overlayCanvas.classList.add('overlayCanvas');
        this.overlayCanvas.onpointerdown = (event) => { this.handlePointerDown(event) };
        this.overlayCanvas.onpointermove = (event) => { this.handlePointerMove(event) };
        this.overlayCanvas.onpointerup = (event) => { this.handlePointerUp(event) };
        this.overlayCanvas.onpointerout = (event) => { this.handlePointerOut(event) };
        this.overlayContext = this.overlayCanvas.getContext("2d");

        this.disableDragOnCanvasObjects();
        this.setCanvasStyles();
    }

    disableDragOnCanvasObjects() {
        this.imgCanvas.addEventListener("touchstart",  function(event) {event.preventDefault()});
        this.imgCanvas.addEventListener("touchmove",   function(event) {event.preventDefault()});
        this.imgCanvas.addEventListener("touchend",    function(event) {event.preventDefault()});
        this.imgCanvas.addEventListener("touchcancel", function(event) {event.preventDefault()});

        this.overlayCanvas.addEventListener("touchstart",  function(event) {event.preventDefault()});
        this.overlayCanvas.addEventListener("touchmove",   function(event) {event.preventDefault()});
        this.overlayCanvas.addEventListener("touchend",    function(event) {event.preventDefault()});
        this.overlayCanvas.addEventListener("touchcancel", function(event) {event.preventDefault()});
    }

    setCanvasStyles() {
        this.imgContext.lineCap = 'round';
        this.overlayContext.lineCap = 'round';

        this.imgContext.lineJoin = 'round';
        this.overlayContext.lineJoin = 'round';
    }

    rendered = false;
    renderedCallback() {
        if (this.rendered) { return; }
        this.rendered = true;

        this.populateCanvasObjects();
    }

    populateCanvasObjects() {
        this.setMaxHeightToCanvasObjects();
        this.addCanvasObjectsToContainer();
        this.setImageOnCanvas();
    }

    setMaxHeightToCanvasObjects() {
        const footerArea = this.template.querySelector('[data-id="footer"]');

        this.imgCanvas.style.maxHeight = (this.contentHeight - footerArea.clientHeight) + "px";
        this.overlayCanvas.style.maxHeight = this.imgCanvas.style.maxHeight;
    }

    addCanvasObjectsToContainer() {
        this.canvasContainer = this.template.querySelector('[data-id="canvasContainer"]');
        this.canvasContainer.replaceChildren();
        this.canvasContainer.appendChild(this.imgCanvas);
        this.canvasContainer.appendChild(this.overlayCanvas);

        this.canvasContainer.style.minWidth = this.imageWidth;
        this.canvasContainer.style.minHeight = this.imageHeight;
    }

    setImageOnCanvas() {
        if (!this.rendered) { return; }
        
        const imageObj = new Image();
        imageObj.src = this.imageData;

        imageObj.parent = this;
        imageObj.onload = function() {
            // Set canvas sizes
            this.parent.imgCanvas.width = imageObj.width;
            this.parent.imgCanvas.height = imageObj.height;
            this.parent.overlayCanvas.width = imageObj.width;
            this.parent.overlayCanvas.height = imageObj.height;

            this.parent.imgContext.drawImage(this, 0, 0);
        };
    }

    notifyImageEdit() {
        this.dispatchEvent(new CustomEvent('edit'));
    }

    handlePointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
      
        // save the starting x/y
        const pointerPos = this.getPointerPos(e);
        this.startX = pointerPos.x;
        this.startY = pointerPos.y;
      
        // set a flag indicating the drag has begun
        this.isDown = true;

        // save the first point for free drawing
        if (this.selectedShape === Shapes.Free) {
            this.freeDrawPath = [];
            this.freeDrawPath.push({x: this.startX, y: this.startY});
        }
    }

    handlePointerUp(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // the drag is over, clear the dragging flag
        this.isDown = false;

        // if the pointer wasn't moved - don't draw anything
        if (!this.moved) { return; }

        // set the selected color and thickness
        this.imgContext.strokeStyle = this.selectedColor.description;
        this.imgContext.lineWidth = this.scaledThickness;

        switch (this.selectedShape) {
            case Shapes.Rectangle: {
                const width = this.pointerX - this.startX;
                const height = this.pointerY - this.startY;
                this.imgContext.strokeRect(this.startX, this.startY, width, height);
                break;
            }
            case Shapes.Oval: {
                // TODO: duplicate logic from handlePointerMove
                this.imgContext.save();
                this.imgContext.beginPath();
        
                const scalex = (this.pointerX - this.startX) / 2;
                const scaley = (this.pointerY - this.startY) / 2;
                this.imgContext.scale(scalex, scaley);
        
                const centerx = (this.startX / scalex) + 1;
                const centery = (this.startY / scaley) + 1;
                this.imgContext.arc(centerx, centery, 1, 0, 2 * Math.PI);
        
                this.imgContext.restore();
                this.imgContext.stroke();
                break;
            }
            case Shapes.Line: {
                this.imgContext.beginPath();
                this.imgContext.moveTo(this.startX, this.startY);
                this.imgContext.lineTo(this.pointerX, this.pointerY);
                this.imgContext.stroke();
                break;
            }
            case Shapes.Free: {
                this.drawFreeShapeOn(this.imgContext);
                this.freeDrawPath = [];
                break;
            }
            default: {
                log("ERROR! Undefined shape: " + this.selectedShape);
                break;
            }
        }

        // mark the pointer wasn't moved for next drawing
        this.moved = false;

        this.notifyImageEdit();
    }

    handlePointerOut(e) {
        e.preventDefault();
        e.stopPropagation();
      
        // the drag is over, clear the dragging flag
        this.isDown = false;
    }

    handlePointerMove(e) {
        e.preventDefault();
        e.stopPropagation();
      
        // if we're not dragging, just return
        if (!this.isDown) {
          return;
        }

        // mark that the pointer was moved
        this.moved = true;
      
        // get the current pointer position
        const pointerPos = this.getPointerPos(e);
        this.pointerX = pointerPos.x;
        this.pointerY = pointerPos.y;
      
        // clear the canvas
        this.overlayContext.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        // set the selected color and thickness
        this.overlayContext.strokeStyle = this.selectedColor.description;
        this.overlayContext.lineWidth = this.scaledThickness;
      
        switch (this.selectedShape) {
            case Shapes.Rectangle: {
                const width = this.pointerX - this.startX;
                const height = this.pointerY - this.startY;

                // draw a new rect from the start position to the current pointer position
                this.overlayContext.strokeRect(this.startX, this.startY, width, height);
                break;
            }
            case Shapes.Oval: {
                this.overlayContext.save();
                this.overlayContext.beginPath();
        
                const scaleX = (this.pointerX - this.startX) / 2;
                const scaleY = (this.pointerY - this.startY) / 2;
                this.overlayContext.scale(scaleX, scaleY);
        
                const centerX = (this.startX / scaleX) + 1;
                const centerY = (this.startY / scaleY) + 1;
                this.overlayContext.arc(centerX, centerY, 1, 0, 2*Math.PI);
        
                this.overlayContext.restore();
                this.overlayContext.stroke();
                break;
            }
            case Shapes.Line: {
                this.overlayContext.beginPath();
                this.overlayContext.moveTo(this.startX, this.startY);
                this.overlayContext.lineTo(this.pointerX, this.pointerY);
                this.overlayContext.stroke();
                break;
            }
            case Shapes.Free: {
                this.freeDrawPath.push({x: this.pointerX, y: this.pointerY});
                this.drawFreeShapeOn(this.overlayContext);
                break;
            }
            default: {
                log("ERROR! Undefined shape: " + this.selectedShape);
                break;
            }
        }
    }

    getPointerPos(evt) {
        var canvas = this.imgCanvas;
        var rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }

    drawFreeShapeOn(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.freeDrawPath[0].x, this.freeDrawPath[0].y);
        for (let i = 1; i < this.freeDrawPath.length; i++) {
            let point = this.freeDrawPath[i];
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
        ctx.closePath();
    }

    get isRedSelected() {
        return this.selectedColor === Colors.Red;
    }

    selectColorRed() {
        this.selectedColor = Colors.Red;
    }

    get isGreenSelected() {
        return this.selectedColor === Colors.Green;
    }

    selectColorGreen() {
        this.selectedColor = Colors.Green;
    }

    get isWhiteSelected() {
        return this.selectedColor === Colors.White;
    }

    selectColorWhite() {
        this.selectedColor = Colors.White;
    }

    get isBlackSelected() {
        return this.selectedColor === Colors.Black;
    }

    selectColorBlack() {
        this.selectedColor = Colors.Black;
    }

    get decreaseThicknessClass() {
        var cls = "slds-button slds-button_icon thickness_button";
        if (this.selectedThickness === this.MIN_THICKNESS + 1) {
            cls += " half";
        }
        return cls;
    }

    decreaseThickness() {
        this.selectedThickness--;
    }

    get increaseThicknessClass() {
        var cls = "slds-button slds-button_icon thickness_button";
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
}