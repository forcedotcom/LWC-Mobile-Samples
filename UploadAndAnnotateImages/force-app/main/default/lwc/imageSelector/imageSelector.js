import { LightningElement, api } from "lwc";
import LightningConfirm from "lightning/confirm";
import { debug, getComputedHeight } from "c/utilsImageCapture";

export default class ImageSelector extends LightningElement {
  @api
  allImagesData;

  previewImage = null;
  maxHeightForPreview;
  pageWidth;

  get totalSelectedImages() {
    return this.allImagesData.length;
  }

  get noImagesSelected() {
    return this.totalSelectedImages === 0 && !this.isPreviewingImage;
  }

  get someImagesSelected() {
    return this.totalSelectedImages > 0 && !this.isPreviewingImage;
  }

  get isPreviewingImage() {
    return this.previewImage !== null;
  }

  get imageText() {
    return this.totalSelectedImages > 1 ? "images" : "image";
  }

  get previewContainer() {
    return this.template.querySelector('[data-id="preview-container"]');
  }

  get imagesListContainer() {
    return this.template.querySelector('[data-id="images-list-container"]');
  }

  get imageInfoViewer() {
    return this.template.querySelector('[data-id="image-info-viewer"]');
  }

  handleImageSelectedForPreview(event) {
    const selectedId = parseInt(event.currentTarget.dataset.id, 10);
    for (const item of this.allImagesData) {
      if (item.id === selectedId) {
        this.previewImage = item;
        break;
      }
    }

    // Use the height of the images list container as the max height for the preview
    this.maxHeightForPreview = getComputedHeight(this.imagesListContainer);

    this.pageWidth = window.innerWidth;
  }

  handlePreviewScreenRendered() {
    debug("Preview container max height = " + this.maxHeightForPreview);
    this.previewContainer.style.maxHeight = this.maxHeightForPreview + "px";
    this.imageInfoViewer.style.maxWidth =
      this.previewContainer.offsetWidth + "px";
  }

  backToPreviewAllImages() {
    this.previewImage = null;
  }

  async handleRemoveClicked() {
    const result = await LightningConfirm.open({
      message: "Removing the image deletes it from your uploaded images.",
      variant: "header",
      label: "Remove image?",
      theme: "error"
    });

    if (result === true) {
      this.dispatchEvent(
        new CustomEvent("delete", {
          detail: this.previewImage.id
        })
      );

      this.previewImage = null;
    }
  }

  handleImageSelectedForAnnotation() {
    const selectedId = this.previewImage.id;
    this.dispatchEvent(
      new CustomEvent("annotateimage", {
        detail: selectedId
      })
    );
  }

  async handleFilesSelected(event) {
    const files = event.target.files;
    this.dispatchEvent(
      new CustomEvent("selectimages", {
        detail: files
      })
    );
  }

  async handleUploadClicked() {
    const result = await LightningConfirm.open({
      message: "After uploading the images you can't edit them.",
      variant: "header",
      label: "Add images to record?",
      theme: "success"
    });

    if (result) {
      this.dispatchEvent(new CustomEvent("uploadrequest"));
    }
  }
}
