import { LightningElement, api } from "lwc";
import {
  debug,
  getComputedPropertyFloat,
  getComputedWidth
} from "c/utilsImageCapture";

export default class ImageInfoEditor extends LightningElement {
  @api
  imageData;

  @api
  imageInfo;

  _editedImageInfo;
  @api
  get editedImageInfo() {
    return this._editedImageInfo;
  }
  set editedImageInfo(value) {
    this._editedImageInfo = value;

    if (this.firstRenderDone) {
      this.runAfterRender.push(() => {
        this.setElementsSizes();
      });
    }
  }

  @api
  maxWidth;

  _maxHeight;
  @api
  get maxHeight() {
    return this._maxHeight;
  }
  set maxHeight(value) {
    this._maxHeight = value;

    if (this.firstRenderDone) {
      this.runAfterRender.push(() => {
        this.setElementsSizes();
      });
    }
  }

  showInfoEditorPrompt = false;

  get fileName() {
    if (this.editedImageInfo?.fileName) {
      return this.editedImageInfo.fileName;
    }
    return this.imageInfo.metadata?.fileName;
  }

  get description() {
    if (this.editedImageInfo?.description) {
      return this.editedImageInfo.description;
    }
    return this.imageInfo.description;
  }

  get fileNameWasEdited() {
    return (
      this.editedImageInfo?.fileName &&
      this.editedImageInfo?.fileName !== this.imageInfo.metadata?.fileName
    );
  }

  get showBigButton() {
    return !this.description && !this.fileNameWasEdited;
  }

  get page() {
    return this.template.querySelector('[data-id="page"]');
  }

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

  get bigEditButton() {
    return this.template.querySelector('[data-id="big-button-container"]');
  }

  get infoText() {
    return this.template.querySelector('[data-id="info-text"]');
  }

  get smallEditButton() {
    return this.template.querySelector('[data-id="small-button-container"]');
  }

  runAfterRender = [];
  firstRenderDone = false;
  renderedCallback() {
    if (!this.firstRenderDone) {
      debug(
        "first renderedCallback in imageInfoEditor, maxHeight=" + this.maxHeight
      );
      this.setElementsSizes();
      this.dispatchEvent(new CustomEvent("rendered"));
      this.firstRenderDone = true;
    }

    if (this.runAfterRender) {
      debug(`Calling ${this.runAfterRender.length} render callbacks`);
      for (const callback of this.runAfterRender) {
        callback();
      }
      this.runAfterRender = [];
    }
  }

  setElementsSizes() {
    // Set container's width
    debug("set max width = " + this.maxWidth);
    this.infoContainer.style.width = this.maxWidth + "px";
    this.infoContainer.style.maxWidth = this.maxWidth + "px";

    // Set info width
    const smallEditButtonWidth = this.showBigButton
      ? 0
      : getComputedWidth(this.smallEditButton);
    const infoHorizontalPadding =
      getComputedPropertyFloat(this.infoContainer, "padding-left") * 2;
    this.infoText.style.maxWidth =
      this.maxWidth - smallEditButtonWidth - infoHorizontalPadding + "px";

    // Set page's height
    debug("set max height = " + this.maxHeight);
    this.page.style.height = this.maxHeight + "px";
    this.page.style.maxHeight = this.maxHeight + "px";

    // Calculate info height
    let infoHeight = this.getActualInfoContainerHeight();
    this.infoContainer.style.height = infoHeight + "px";
    debug("info height = " + infoHeight);

    // Finally, set the remaining height as the maximum height for the image
    const viewMoreButtonHeight = this.showBigButton
      ? this.bigEditButton.clientHeight + 1
      : 0;
    const imageMaxHeight = this.maxHeight - infoHeight - viewMoreButtonHeight;
    debug("image max height = " + imageMaxHeight);
    this.image.style.maxHeight = imageMaxHeight + "px";
  }

  getActualInfoContainerHeight() {
    // Get elements height, add 1 because these values are integers
    const fileNameHeight = this.fileNameContainer.offsetHeight + 1;
    const descriptionHeight = this.descriptionContainer.offsetHeight + 1;

    // Get the vertical padding of the container
    const paddingTop = getComputedPropertyFloat(
      this.infoContainer,
      "padding-top"
    );
    const paddingBottom = getComputedPropertyFloat(
      this.infoContainer,
      "padding-bottom"
    );

    // Sum all together
    return fileNameHeight + descriptionHeight + paddingTop + paddingBottom;
  }

  handleEditClicked() {
    debug("handleEditClicked");
    this.showInfoEditorPrompt = true;
  }

  handleInfoEditorPromptFinish(event) {
    this.showInfoEditorPrompt = false;
    const editedInfo = event.detail;

    // Check if user clicked "OK" in the editor prompt
    if (editedInfo) {
      this.dispatchEvent(new CustomEvent("edit", { detail: editedInfo }));
    }
  }
}
