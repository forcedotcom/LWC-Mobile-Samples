import { api, LightningElement } from "lwc";

export default class InfoEditorPrompt extends LightningElement {
  @api
  imageInfo;

  @api
  editedImageInfo;

  initialFilename = "";
  currentFilename = "";

  initialDescription = "";
  currentDescription = "";
  userExpandedDescription = false;

  get hasDescription() {
    return (
      this.currentDescription ||
      this.imageInfo.description ||
      this.editedImageInfo?.description
    );
  }

  get showDescriptionInput() {
    return this.hasDescription || this.userExpandedDescription;
  }

  get enableSaveButton() {
    const hasFilename = this.currentFilename || false;
    const filenameChanged = this.currentFilename !== this.initialFilename;
    const descriptionChanged =
      this.currentDescription !== this.initialDescription;
    return hasFilename && (filenameChanged || descriptionChanged);
  }

  get disableSaveButton() {
    return !this.enableSaveButton;
  }

  get filenameInput() {
    return this.template.querySelector('[data-id="filename-input"]');
  }

  get descriptionTextarea() {
    return this.template.querySelector('[data-id="description-input"]');
  }

  connectedCallback() {
    // Save initial filename
    if (this.editedImageInfo?.fileName) {
      this.initialFilename = this.editedImageInfo.fileName;
    } else {
      this.initialFilename = this.imageInfo.metadata.fileName;
    }

    // Save initial description
    if (this.editedImageInfo?.description) {
      this.initialDescription = this.editedImageInfo.description;
    } else {
      this.initialDescription = this.imageInfo.description;
    }
  }

  rendered = false;
  renderedCallback() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;

    // Load initial values
    this.filenameInput.value = this.initialFilename;
    if (this.showDescriptionInput) {
      this.descriptionTextarea.value = this.initialDescription;
    }
  }

  expandDescription() {
    this.userExpandedDescription = true;
  }

  handleFilenameChange(event) {
    this.currentFilename = event.detail.value.trim();
  }

  handleDescriptionChange(event) {
    this.currentDescription = event.detail.value.trim();
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent("finish"));
  }

  handleSave() {
    this.dispatchEvent(
      new CustomEvent("finish", {
        detail: {
          fileName: this.currentFilename,
          description: this.currentDescription
        }
      })
    );
  }
}
