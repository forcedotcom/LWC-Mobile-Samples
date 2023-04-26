import { LightningElement, api } from "lwc";
import LightningConfirm from "lightning/confirm";
import { log, Shapes } from "c/utilsImageCapture";

export default class ImageAnnotate extends LightningElement {
  @api
  imageInfo;

  contentHeight;
  pageWidth;

  isLoading = false;
  showMoreActions = false;

  originalImageData;
  editedImageData;
  editedImageInfo = {};
  imageWasEverEdited = false;
  get imageWasNeverEdited() {
    return !this.imageWasEverEdited;
  }

  // This variable indicates whether the image was edited in the current mode
  imageWasRecentlyEdited = false;

  Modes = Object.freeze({
    Init: Symbol("Init"),
    View: Symbol("View"),
    Crop: Symbol("Crop"),
    Draw: Symbol("Draw")
  });

  currentMode = this.Modes.Init;

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

  get isTextSelected() {
    return this.isDrawing && this.selectedShape === Shapes.Text;
  }

  // Get the latest image data available, i.e - if the image was edited already,
  // get the edited data, otherwise - get the original image data
  get imageData() {
    if (this.editedImageData != null) {
      return this.editedImageData;
    }
    return this.imageInfo.data;
  }

  get imageInfoEditor() {
    return this.template.querySelector('[data-id="image-info-editor"]');
  }

  get editorComponent() {
    return this.template.querySelector('[data-id="editor-component"]');
  }

  get cropperClass() {
    return this.getClassesForSelectableButton(this.isCropping);
  }

  get freeDrawClass() {
    return this.getClassesForSelectableButton(this.isFreeDrawing);
  }

  get textClass() {
    return this.getClassesForSelectableButton(this.isTextSelected);
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
    this.editedImageInfo = this.imageInfo.editedImageInfo;
  }

  rendered = false;
  renderedCallback() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;

    this.readContentHeight();
    this.pageWidth = window.innerWidth;
    this.currentMode = this.Modes.View;
  }

  handleImageInfoEditorRendered() {
    this.imageInfoEditor.style.maxWidth = this.pageWidth + "px";
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
    const footer = this.template.querySelector('[data-id="footer"]');
    this.contentHeight = window.innerHeight - footer.offsetHeight;
  }

  askEditorComponentToSave() {
    // If the current mode is view, there's no editor component to ask
    if (this.currentMode === this.Modes.View) {
      this.imageWasRecentlyEdited = false;
      return;
    }

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

    // Toggle free draw
    if (this.isFreeDrawing) {
      this.currentMode = this.Modes.View;
    } else {
      this.currentMode = this.Modes.Draw;
      this.selectedShape = Shapes.Free;
    }
  }

  textClicked() {
    this.readContentHeight();
    this.askEditorComponentToSave();

    // Toggle text
    if (this.isTextSelected) {
      this.currentMode = this.Modes.View;
    } else {
      this.currentMode = this.Modes.Draw;
      this.selectedShape = Shapes.Text;
    }
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
        detail: {
          imageData: this.imageData,
          editedImageInfo: this.editedImageInfo
        }
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

  performReset() {
    // Reset state parameters
    this.editedImageData = null;
    this.editedImageInfo = this.imageInfo.editedImageInfo;
    this.imageWasEverEdited = false;

    // If the current mode is view, there's no editor component to reset so we are done
    if (this.currentMode === this.Modes.View) {
      return;
    }

    // Reset editor component
    log("Asking child component to reset...");
    this.editorComponent.reset(this.originalImageData);
    log("Done resetting!");
  }

  async handleResetClicked() {
    const result = await LightningConfirm.open({
      message: "Resetting the image deletes all your changes.",
      variant: "header",
      label: "Reset image?",
      theme: "error"
    });

    if (result) {
      this.performReset();
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

  handleInfoEdited(event) {
    this.editedImageInfo = event.detail;
    this.handleImageEdited();
  }
}
