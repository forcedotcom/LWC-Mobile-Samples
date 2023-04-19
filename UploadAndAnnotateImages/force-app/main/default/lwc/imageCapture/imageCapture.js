/* eslint-disable no-await-in-loop */
import { LightningElement, api, track } from "lwc";
import {
  createRecord,
  unstable_createContentDocumentAndVersion
} from "lightning/uiRecordApi";
import { processImage } from "lightning/mediaUtils";
import {
  log,
  debug,
  IMAGE_EXT,
  isNullOrEmpty,
  ToastTypes,
  dataURLtoFile
} from "c/utilsImageCapture";

export default class ImageCapture extends LightningElement {
  // This allows the component to be placed on a record page, or other record
  // context, and receive the record's ID when it runs
  @api
  recordId;

  @api
  objectApiName;

  @track
  allImagesData = [];

  compressionOptions = {
    compressionEnabled: true,
    resizeMode: "contain",
    resizeStrategy: "reduce",
    targetWidth: 2048,
    targetHeight: 2048,
    compressionQuality: 0.75,
    imageSmoothingEnabled: true,
    preserveTransparency: false,
    backgroundColor: "white"
  };

  nextId = 0;

  isReading = false;
  selectedImageInfo;

  get isImageSelected() {
    return this.selectedImageInfo != null;
  }

  isUploading = false;
  toastType = null;
  numPhotosToUpload = 0;
  numSuccessfullyUploadedPhotos = 0;

  get numFailedUploadPhotos() {
    return this.numPhotosToUpload - this.numSuccessfullyUploadedPhotos;
  }

  get shouldShowToast() {
    return this.toastType == null ? false : true;
  }

  hideToast() {
    this.toastType = null;
  }

  get toastMessage() {
    switch (this.toastType) {
      case ToastTypes.Success: {
        const imageString =
          this.numPhotosToUpload > 1 ? "images were" : "image was";
        return `${this.numPhotosToUpload} ${imageString} added to the record.`;
      }
      case ToastTypes.Error: {
        return "We couldn't add the images to the record. Try again.";
      }
      case ToastTypes.Warning: {
        return `We couldn't add ${this.numFailedUploadPhotos}/${this.numPhotosToUpload} images to the record. Try again or contact your admin for help.`;
      }
      default: {
        return "";
      }
    }
  }

  connectedCallback() {
    debug(`Working on ${this.objectApiName} with Id '${this.recordId}'`);
  }

  async handleImagesSelected(event) {
    const files = event.detail;
    const numFiles = files.length;
    const compressionEnabled = this.compressionOptions.compressionEnabled;
    log(
      `Reading ${
        compressionEnabled ? "and compressing " : ""
      }${numFiles} images`
    );

    this.isReading = true;
    this.hideToast();

    try {
      for (let i = 0; i < numFiles; i++) {
        let file = files[i];

        let blob;
        if (compressionEnabled) {
          // Compress the image when reading it, so we work with smaller files in memory
          blob = await processImage(file, this.compressionOptions);
        } else {
          blob = file;
        }

        let data = await this.readFile(blob);
        let metadata = await this.readMetadata(file);

        this.allImagesData.push({
          id: this.nextId++,
          data: data,
          description: "",
          editedImageInfo: {},
          metadata: metadata
        });
      }
    } finally {
      this.isReading = false;
    }
  }

  // Read image data from a file selected in a browser.
  // This is standard JavaScript, not unique to LWC.
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (ev) => {
        resolve(ev.target.result);
      };
      reader.onerror = () => {
        reject(
          `There was an error reading file: '${file.name}', error: ${reader.error}`
        );
      };

      try {
        reader.readAsDataURL(file);
      } catch (err) {
        reject(new Error("Unable to read the input data."));
      }
    });
  }

  readMetadata(file) {
    return new Promise((resolve) => {
      const fullFileName = file.name;
      const ext = fullFileName.slice(
        (Math.max(0, fullFileName.lastIndexOf(".")) || Infinity) + 1
      );
      const fileNameWithoutExt = fullFileName.substring(
        0,
        fullFileName.length - ext.length - (ext ? 1 : 0)
      );

      const metadata = {
        fileName: fileNameWithoutExt,
        ext: ext,
        edited: false
      };

      debug(`Metadata for '${fullFileName}': ${JSON.stringify(metadata)}`);
      resolve(metadata);
    });
  }

  handleAnnotateImage(event) {
    const selectedIndex = parseInt(event.detail, 10);
    debug(`Annotating image #${selectedIndex}`);

    for (const item of this.allImagesData) {
      if (item.id === selectedIndex) {
        this.selectedImageInfo = item;
        break;
      }
    }
  }

  handleSaveAnnotatedImage(event) {
    debug("Saving annotated image!");
    const savedData = event.detail;
    this.selectedImageInfo.data = savedData.imageData;
    this.selectedImageInfo.editedImageInfo = savedData.editedImageInfo;
    this.selectedImageInfo.metadata.edited = true;
    this.selectedImageInfo = null;
  }

  handleImageDiscarded() {
    debug("Discarded annotated image!");
    this.selectedImageInfo = null;
  }

  handleDeleteImage(event) {
    const idToDelete = event.detail;
    this.deleteImageById(idToDelete);
    this.selectedImageInfo = null;
  }

  deleteImageById(id) {
    debug(`Deleteing image #${id}`);

    let index = 0;
    for (const item of this.allImagesData) {
      if (item.id === id) {
        this.allImagesData.splice(index, 1);
        break;
      }
      index++;
    }
  }

  async handleUploadRequested() {
    this.hideToast();
    this.isUploading = true;

    try {
      await this.uploadAllPhotos();
    } catch (e) {
      if (e.message) {
        log(`Failed to upload photos: ${e.message}`);
        debug(`Stacktrace:\n${e.stack}`);
      } else {
        log(`Failed to upload photos: ${JSON.stringify(e)}`);
        console.dir(e);
      }

      // Display the error toast message
      if (
        this.numPhotosToUpload > 1 &&
        this.numSuccessfullyUploadedPhotos > 0
      ) {
        this.toastType = ToastTypes.Warning;
      } else {
        this.toastType = ToastTypes.Error;
      }

      return;
    } finally {
      this.isUploading = false;
    }

    // Empty allImagesData to display the initial screen
    this.allImagesData = [];

    // Show success toast message
    this.toastType = ToastTypes.Success;

    log(`Successfully uploaded ${this.numPhotosToUpload} photos!`);
  }

  async uploadAllPhotos() {
    this.numPhotosToUpload = this.allImagesData.length;
    this.numSuccessfullyUploadedPhotos = 0;

    log(`Uploading ${this.numPhotosToUpload} photos...`);

    // Make a copy of allImagesData to loop over it, because we modify allImagesData
    let allImagesCopy = [...this.allImagesData];

    for (const item of allImagesCopy) {
      const fullFileName = this.getFullFileName(item);
      const description = item.editedImageInfo.description || item.description;
      await this.uploadData(
        fullFileName,
        description,
        item.data,
        this.recordId
      );

      this.numSuccessfullyUploadedPhotos++;

      // Remove photo from this.allImagesData, so we won't upload it again in case of a failure
      this.deleteImageById(item.id);
    }
  }

  getFullFileName(item) {
    const ext = item.metadata.edited ? IMAGE_EXT : item.metadata.ext;
    var fullFileName = item.editedImageInfo.fileName || item.metadata.fileName;
    if (!isNullOrEmpty(ext)) {
      fullFileName += `.${ext}`;
    }

    // Replace whitespaces with underscores
    fullFileName = fullFileName.replaceAll(" ", "_");

    return fullFileName;
  }

  // Use LDS createContentDocumentAndVersion function to upload file to a ContentVersion object.
  // This method creates drafts for ContentDocument and ContentVersion objects.
  async uploadData(fileName, description, fileData, recordId) {
    log(`Uploading '${fileName}'...`);
    let fileObject = dataURLtoFile(fileData, fileName);
    const contentDocumentAndVersion =
      await unstable_createContentDocumentAndVersion({
        title: fileName,
        description: description,
        fileData: fileObject
      });

    const contentDocumentId = contentDocumentAndVersion.contentDocument.id;

    // Create a ContentDocumentLink (CDL) to associate the uploaded file
    // to the Files Related List of a record, like a Work Order.
    await this.createCdl(recordId, contentDocumentId);
  }

  async createCdl(recordId, contentDocumentId) {
    debug("Creating a CDL...");

    await createRecord({
      apiName: "ContentDocumentLink",
      fields: {
        LinkedEntityId: recordId,
        ContentDocumentId: contentDocumentId,
        ShareType: "V"
      }
    })
      .then(() => {
        debug("Successfully created a CDL!");
      })
      .catch((e) => {
        log(`Failed to create a CDL: ${JSON.stringify(e)}`);
        throw e;
      });
  }
}
