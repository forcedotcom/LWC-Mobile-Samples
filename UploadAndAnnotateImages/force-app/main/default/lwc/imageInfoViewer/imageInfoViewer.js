import { LightningElement, api } from "lwc";
import { debug, getComputedHeight } from "c/utilsImageCapture";

export default class ImageInfoViewer extends LightningElement {
  _maxHeight;
  @api
  get maxHeight() {
    return this._maxHeight;
  }
  set maxHeight(value) {
    this._maxHeight = value;

    // Set a default maximum height for the info section
    this.maxInfoHeight = value / 2.5;

    if (this.rendered) {
      debug("rendered");
      this.setElementsSize();
    }
  }

  @api
  maxWidth;

  @api
  imageToPreview;

  get imageData() {
    return this.imageToPreview.data;
  }

  get fileName() {
    return (
      this.imageToPreview.editedImageInfo?.fileName ||
      this.imageToPreview.metadata?.fileName
    );
  }

  get description() {
    return (
      this.imageToPreview.editedImageInfo?.description ||
      this.imageToPreview.description
    );
  }

  showViewMoreButton = true;
  get viewMoreButtonClass() {
    return this.showViewMoreButton ? "" : "hidden";
  }

  detailedMode = false;
  get moreOrLess() {
    return this.detailedMode ? "Less" : "More";
  }

  maxInfoHeight;

  get mainContainer() {
    return this.template.querySelector('[data-id="main-container"]');
  }

  get image() {
    return this.template.querySelector('[data-id="image"]');
  }

  get infoContainer() {
    return this.template.querySelector('[data-id="info-container"]');
  }

  get fileNameContainer() {
    return this.template.querySelector('[data-id="file-name"]');
  }

  get descriptionContainer() {
    return this.template.querySelector('[data-id="description"]');
  }

  get viewMoreButton() {
    return this.template.querySelector('[data-id="view-more"]');
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
      debug(
        "First renderedCallback in imageInfoViewer, maxHeight=" + this.maxHeight
      );
      this.setElementsSize();
      this.dispatchEvent(new CustomEvent("rendered"));
      this.firstRenderDone = true;
    }
  }

  setElementsSize() {
    debug("setElementsSize");

    // First, set maximum width to the info container
    this.infoContainer.style.maxWidth = this.maxWidth + "px";

    // Then, check if there is a text overflow and we need to display the "View more" button
    const isShowingViewMoreButton = this.showViewMoreButton;
    if (this.hasAnyTextOverflow() || this.detailedMode) {
      this.showViewMoreButton = true;
    } else {
      this.showViewMoreButton = false;
    }

    if (isShowingViewMoreButton !== this.showViewMoreButton) {
      // Value was changed, need to wait for render
      this.runAfterRender.push(() => {
        this.setElementsSizeCallback();
      });
    } else {
      // Value is the same, perform calculation now
      this.setElementsSizeCallback();
    }
  }

  setElementsSizeCallback() {
    debug("setElementsSizeCallback, max height = " + this.maxHeight);
    this.mainContainer.style.height = this.maxHeight + "px";
    this.mainContainer.style.maxHeight = this.maxHeight + "px";

    // First set the max height to the info container
    this.infoContainer.style.maxHeight = this.maxInfoHeight + "px";

    // Then calculate info container's height
    let infoHeight = this.getActualInfoContainerHeight();
    if (infoHeight > this.maxInfoHeight) {
      infoHeight = this.maxInfoHeight;
    }
    this.infoContainer.style.height = infoHeight + "px";
    debug("info height = " + infoHeight);

    // Finally, set the remaining height for the image
    const imageHeight = this.maxHeight - infoHeight;
    debug("image height = " + imageHeight);
    this.image.style.maxHeight = imageHeight + "px";
  }

  getActualInfoContainerHeight() {
    // Get elements height, add 1 because these values are integers
    const fileNameHeight = this.fileNameContainer.offsetHeight + 1;
    const descriptionHeight = this.descriptionContainer.offsetHeight + 1;
    const viewMoreButtonHeight = this.showViewMoreButton
      ? this.viewMoreButton.clientHeight + 1
      : 0;

    // Get the vertical padding of the container
    const paddingTop = parseFloat(
      this.infoContainer.style.paddingTop.replace("px", "")
    );
    const paddingBottom = parseFloat(
      this.infoContainer.style.paddingBottom.replace("px", "")
    );

    // Sum all together
    return (
      fileNameHeight +
      descriptionHeight +
      viewMoreButtonHeight +
      paddingTop +
      paddingBottom
    );
  }

  // Checks text overflow on the file name or description
  hasAnyTextOverflow() {
    return (
      this.hasTextOverflow(this.fileNameContainer) ||
      this.hasTextOverflow(this.descriptionContainer)
    );
  }

  // Checks text overflow on the given element
  hasTextOverflow(element) {
    if (!element) {
      return false;
    }
    return element.scrollWidth > element.clientWidth;
  }

  handleViewMoreClicked() {
    debug("handleViewMoreClicked");

    // Check if image height is small so we have more space to add to the maxInfoHeight
    const imageHeight = getComputedHeight(this.image);
    if (imageHeight + this.maxInfoHeight < this.maxHeight) {
      this.maxInfoHeight = this.maxHeight - imageHeight;
    }

    this.toggleDetailedMode();
    this.setElementsSize();
  }

  // Enables or disables text overflow on file name and description
  toggleDetailedMode() {
    this.detailedMode = !this.detailedMode;
    if (this.detailedMode) {
      this.fileNameContainer.style.textOverflow = null;
      this.fileNameContainer.style.whiteSpace = null;
      this.fileNameContainer.style.overflow = null;

      this.descriptionContainer.style.textOverflow = null;
      this.descriptionContainer.style.whiteSpace = null;
      this.descriptionContainer.style.overflow = null;
    } else {
      this.fileNameContainer.style.textOverflow = "ellipsis";
      this.fileNameContainer.style.whiteSpace = "nowrap";
      this.fileNameContainer.style.overflow = "hidden";

      this.descriptionContainer.style.textOverflow = "ellipsis";
      this.descriptionContainer.style.whiteSpace = "nowrap";
      this.descriptionContainer.style.overflow = "hidden";
    }
  }
}
