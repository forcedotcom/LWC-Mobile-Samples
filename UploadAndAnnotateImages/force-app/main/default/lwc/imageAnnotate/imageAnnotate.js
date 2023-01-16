import { LightningElement, api } from "lwc";
import LightningConfirm from "lightning/confirm";
import { log, Shapes } from "c/utilsImageCapture";

export default class ImageAnnotate extends LightningElement {
  @api
  imageInfo;

  isLoading = false;
  showMoreActions = false;
  contentHeight;

  originalImageData;
  editedImageData;
  imageWasEverEdited = false;
  get imageWasNeverEdited() {
    return !this.imageWasEverEdited;
  }

  // This variable indicates whether the image was edited in the current mode
  imageWasRecentlyEdited = false;

  Modes = Object.freeze({
    View: Symbol("View"),
    Crop: Symbol("Crop"),
    Draw: Symbol("Draw")
  });

  currentMode = this.Modes.View;

  get isShowingImage() {
    return this.currentMode === this.Modes.View;
  }

  get isCropping() {
    return this.currentMode === this.Modes.Crop;
  }

  get isDrawing() {
    return this.currentMode === this.Modes.Draw;
  }
  selectedShape;

  get isFreeDrawing() {
    return this.isDrawing && this.selectedShape === Shapes.Free;
  }

  // Get the latest image data available, i.e - if the image was edited already,
  // get the edited data, otherwise - get the original image data
  get imageData() {
    if (this.editedImageData != null) {
      return this.editedImageData;
    }
    return this.imageInfo.data;
  }

  get editorComponent() {
    return this.template.querySelector('[data-id="editorComponent"]');
  }

  get cropperClass() {
    return this.getClassesForSelectableButton(this.isCropping);
  }

  get freeDrawClass() {
    return this.getClassesForSelectableButton(this.isFreeDrawing);
  }

  get drawSquareClass() {
    return this.getDropdownClassFor(Shapes.Rectangle);
  }

  get drawCircleClass() {
    return this.getDropdownClassFor(Shapes.Oval);
  }

  get drawLineClass() {
    return this.getDropdownClassFor(Shapes.Line);
  }

  getDropdownClassFor(shape) {
    var cls = "white-dropdown-item";
    if (this.isDrawing && this.selectedShape === shape) {
      cls += " selected-dropdown-item";
    }
    return cls;
  }

  getClassesForSelectableButton(isSelected) {
    var cls = "slds-button slds-button_outline-brand slds-button_stateful ";
    cls += isSelected
      ? "slds-is-selected-clicked selected-button"
      : "slds-not-selected";
    return cls;
  }

  connectedCallback() {
    this.originalImageData = this.imageData;
  }

  showLoading() {
    this.isLoading = true;
  }

  hideLoading() {
    this.isLoading = false;
  }

  toggleMoreActions() {
    this.showMoreActions = !this.showMoreActions;
  }

  readContentHeight() {
    const content = this.template.querySelector('[data-id="content"]');
    this.contentHeight = content.offsetHeight;
  }

  askEditorComponentToSave() {
    if (!this.imageWasRecentlyEdited) {
      log("Image was not edited in the current mode, nothing to save...");
      return;
    }

    log("Image was recently edited, saving...");
    this.editedImageData = this.editorComponent.save();
    log("Done saving!");

    this.imageWasRecentlyEdited = false;
  }

  cropClicked() {
    this.readContentHeight();
    this.askEditorComponentToSave();

    // Toggle crop
    if (this.currentMode === this.Modes.Crop) {
      this.currentMode = this.Modes.View;
    } else {
      this.currentMode = this.Modes.Crop;
    }
  }

  freeDrawClicked() {
    this.readContentHeight();
    this.askEditorComponentToSave();

    // If we are already on free drawing, switch back to view mode
    if (this.isFreeDrawing) {
      this.currentMode = this.Modes.View;
      return;
    }

    this.selectedShape = Shapes.Free;
    this.currentMode = this.Modes.Draw;
  }

  drawLineClicked() {
    this.readContentHeight();
    this.askEditorComponentToSave();

    this.selectedShape = Shapes.Line;
    this.currentMode = this.Modes.Draw;
    this.showMoreActions = false;
  }

  drawCircleClicked() {
    this.readContentHeight();
    this.askEditorComponentToSave();

    this.selectedShape = Shapes.Oval;
    this.currentMode = this.Modes.Draw;
    this.showMoreActions = false;
  }

  drawSquareClicked() {
    this.readContentHeight();
    this.askEditorComponentToSave();

    this.selectedShape = Shapes.Rectangle;
    this.currentMode = this.Modes.Draw;
    this.showMoreActions = false;
  }

  handleImageEdited() {
    this.imageWasEverEdited = true;
    this.imageWasRecentlyEdited = true;
  }

  handleSaveClicked() {
    this.askEditorComponentToSave();

    this.dispatchEvent(
      new CustomEvent("save", {
        detail: this.imageData
      })
    );
  }

  async handleCancelClicked() {
    var shouldCancel = true;

    if (this.imageWasEverEdited) {
      shouldCancel = await LightningConfirm.open({
        message:
          "Tapping OK deletes all your changes and takes you back to image selection.",
        variant: "header",
        label: "Discard changes?",
        theme: "error"
      });
    }

    if (shouldCancel === true) {
      this.dispatchEvent(new CustomEvent("discard"));
    }
  }

  askEditorComponentToReset() {
    if (this.currentMode === this.Modes.View) {
      return;
    }

    log("Asking child component to reset...");
    this.editorComponent.reset(this.originalImageData);
    log("Done resetting!");

    this.editedImageData = null;
    this.imageWasEverEdited = false;
  }

  async handleResetClicked() {
    const result = await LightningConfirm.open({
      message: "Resetting the image deletes all your changes.",
      variant: "header",
      label: "Reset image?",
      theme: "error"
    });

    if (result) {
      this.askEditorComponentToReset();
    }
  }

  async handleDeleteClicked() {
    this.showMoreActions = false;

    const result = await LightningConfirm.open({
      message: "Removing the image deletes it from your uploaded images.",
      variant: "header",
      label: "Remove image?",
      theme: "error"
    });

    if (result === true) {
      this.dispatchEvent(
        new CustomEvent("delete", {
          detail: this.imageInfo.id
        })
      );
    }
  }
}
