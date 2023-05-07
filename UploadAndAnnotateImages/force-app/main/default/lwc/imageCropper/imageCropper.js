/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api } from "lwc";
import {
  log,
  debug,
  IMAGE_MIME_TYPE,
  Cropper,
  getComputedPropertyFloat
} from "c/utilsImageCapture";

export default class ImageCropper extends LightningElement {
  @api
  imageData;

  @api
  maxComponentHeight;

  @api
  reset(originalImageData) {
    debug("Parent asked to reset");
    this.showLoading();

    // Perform the reset with a little bit of delay to allow the loading spinner to appear
    setTimeout(() => {
      this.createNewCropperWith(originalImageData);
      this.hideLoading();
    }, 10);
  }

  @api
  save() {
    debug("Parent asked to save");
    return this.cropper.getCroppedCanvas().toDataURL(IMAGE_MIME_TYPE);
  }

  imageContainer;
  imageToCrop;
  cropper;
  cropperOptions = Object.freeze({
    viewMode: 1,
    dragMode: "move",
    autoCropArea: 1.0,
    background: false,
    movable: false,
    scalable: true,
    zoomable: false,
    toggleDragModeOnDblclick: false,
    minContainerWidth: 50,
    minContainerHeight: 50
  });

  connectedCallback() {
    this.showLoading();
  }

  rendered = false;
  renderedCallback() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;

    // Render the initial screen with a little bit of delay to allow the loading spinner to appear
    setTimeout(this.initialRender.bind(this), 10);
  }

  initialRender() {
    const entirePage = this.template.querySelector('[data-id="page"]');
    const contentArea = this.template.querySelector('[data-id="content"]');
    const footerArea = this.template.querySelector('[data-id="footer"]');
    this.imageContainer = this.template.querySelector(
      '[data-id="image-container"]'
    );

    entirePage.style.maxHeight = this.maxComponentHeight + "px";

    const contentPaddingRem = 0.75; // slds-var-p-around_small
    const contentPaddingPx = this.convertRemToPixels(contentPaddingRem);

    contentArea.style.padding = contentPaddingRem + "rem";
    contentArea.style.maxHeight =
      this.maxComponentHeight - footerArea.clientHeight + "px";
    contentArea.style.height = contentArea.style.maxHeight;

    this.imageContainer.style.maxHeight =
      this.maxComponentHeight -
      footerArea.clientHeight -
      2 * contentPaddingPx +
      "px";
    this.imageContainer.style.height = this.imageContainer.style.maxHeight;

    this.imageToCrop = this.getImageToCrop(this.imageData);
    this.imageContainer.appendChild(this.imageToCrop);

    log("Loading CropperJs, this may take a while");
    this.cropper = new Cropper(this.imageToCrop, this.cropperOptions);
    log("Done loading CropperJs");

    this.hideLoading();
  }

  showLoading() {
    this.dispatchEvent(new CustomEvent("loading"));
  }

  hideLoading() {
    this.dispatchEvent(new CustomEvent("ready"));
  }

  convertRemToPixels(rem) {
    return (
      rem * getComputedPropertyFloat(document.documentElement, "font-size")
    );
  }

  notifyImageEdit() {
    this.dispatchEvent(new CustomEvent("edit"));
  }

  rotateClicked() {
    log("Rotating image...");
    this.showLoading();

    // Perform the rotate with a little bit of delay to allow the loading spinner to appear
    setTimeout(() => {
      this.notifyImageEdit();
      this.rotateImage(-90);
      this.hideLoading();
    }, 10);
  }

  rotateImage(degree) {
    const img = this.imageToCrop;

    // Create a temp canvas to rotate the image in it
    const tmpCanvas = document.createElement("canvas");

    var context = tmpCanvas.getContext("2d");
    var destinationX = 0;
    var destinationY = 0;

    // Calculate new canvas size and x/y coorditates for image
    var canvasWidth = img.naturalHeight;
    var canvasHeight = img.naturalWidth;
    switch (degree) {
      case 90:
        destinationY = -img.naturalHeight;
        break;
      case -90:
        destinationX = -img.naturalWidth;
        break;
      default:
        break;
    }

    // Rotate image
    tmpCanvas.setAttribute("width", canvasWidth);
    tmpCanvas.setAttribute("height", canvasHeight);
    context.rotate((degree * Math.PI) / 180);
    context.drawImage(img, destinationX, destinationY);

    // Get the rotated image from the canvas
    let rotatedImageData = tmpCanvas.toDataURL(IMAGE_MIME_TYPE);

    // Create a new cropper object for the rotated image
    this.createNewCropperWith(rotatedImageData);
  }

  createNewCropperWith(imageData) {
    this.cropper.destroy();
    this.imageToCrop = this.getImageToCrop(imageData);
    this.imageContainer.replaceChild(
      this.imageToCrop,
      this.imageContainer.childNodes[0]
    );

    log("Loading CropperJs, it might take a while");
    this.cropper = new Cropper(this.imageToCrop, this.cropperOptions);
    log("Done loading CropperJs");
  }

  getImageToCrop(imageData) {
    const img = new Image();
    img.addEventListener("cropstart", () => {
      this.notifyImageEdit();
    });
    img.src = imageData;
    return img;
  }
}
