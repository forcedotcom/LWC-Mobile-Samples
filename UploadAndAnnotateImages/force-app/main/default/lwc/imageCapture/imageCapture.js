/* eslint-disable no-await-in-loop */
import { LightningElement, api, track } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { processImage } from "lightning/mediaUtils";
import getContentDocumentId from "@salesforce/apex/ImageCaptureController.getContentDocumentId";
import getContentVersionId from "@salesforce/apex/ImageCaptureController.getContentVersionId";
import createContentDocumentLink from "@salesforce/apex/ImageCaptureController.createContentDocumentLink";
import {
  log,
  IMAGE_EXT,
  isNullOrEmpty,
  waitMillis,
  ToastTypes
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
    log(`Working on ${this.objectApiName} with Id '${this.recordId}'`);
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
        metadata: metadata
      });
    }

    this.isReading = false;
  }

  // Read image data from a file selected in a browser
  // This is standard JavaScript, not unique to LWC
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

      log(`Metadata for '${fullFileName}': ${JSON.stringify(metadata)}`);
      resolve(metadata);
    });
  }

  handleAnnotateImage(event) {
    const selectedIndex = parseInt(event.detail, 10);
    log(`Annotating image #${selectedIndex}`);

    for (const item of this.allImagesData) {
      if (item.id === selectedIndex) {
        this.selectedImageInfo = item;
        break;
      }
    }
  }

  handleSaveAnnotatedImage(event) {
    log("Saving annotated image!");
    const annotatedImageData = event.detail;
    for (const item of this.allImagesData) {
      if (item.id === this.selectedImageInfo.id) {
        item.data = annotatedImageData;
        item.metadata.edited = true;
        break;
      }
    }
    this.selectedImageInfo = null;
  }

  handleImageDiscarded() {
    log("Discarded annotated image!");
    this.selectedImageInfo = null;
  }

  handleDeleteImage(event) {
    const idToDelete = event.detail;
    this.deleteImageById(idToDelete);
    this.selectedImageInfo = null;
  }

  deleteImageById(id) {
    var index = 0;
    log(`Deleteing image #${id}`);

    for (const item of this.allImagesData) {
      if (item.id === id) {
        this.allImagesData.splice(index, 1);
        break;
      }
      index++;
    }
  }

  async handleUploadRequested() {
    this.toastType = null;
    this.isUploading = true;

    try {
      // Upload
      await this.uploadAllPhotos();
    } catch (e) {
      log("Failed to upload photos: " + JSON.stringify(e));

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
      await this.uploadData(fullFileName, item.id, item.data, this.recordId);

      this.numSuccessfullyUploadedPhotos++;

      // Remove photo from this.allImagesData, so we won't upload it again in case of a failure
      this.deleteImageById(item.id);
    }
  }

  getFullFileName(item) {
    const ext = item.metadata.edited ? IMAGE_EXT : item.metadata.ext;
    var fullFileName = item.metadata.fileName;
    if (!isNullOrEmpty(ext)) {
      fullFileName += `.${ext}`;
    }
    return fullFileName;
  }

  // Use LDS createRecord function to upload file to a ContentVersion object.
  // ContentVersion is the standard representation of an uploaded file in Salesforce.
  async uploadData(fileName, fileId, data, recordId) {
    const now = Date.now();
    const uniqueCvId = `${now}_${fileId}_${recordId}`;

    log(`Uploading '${fileName}' with uniqueCvId '${uniqueCvId}'...`);
    const contentVersion = await createRecord({
      apiName: "ContentVersion",
      fields: {
        Title: fileName,
        PathOnClient: fileName,
        VersionData: data.split(",")[1], // extract base64 part of data
        Origin: "H",
        ReasonForChange: uniqueCvId
      }
    });

    // Create a ContentDocumentLink (CDL) to associate the uploaded file
    // to the Files Related List of a record, like a Work Order.
    await this.getIdsAndCreateCdl(contentVersion, recordId, uniqueCvId);
  }

  async getIdsAndCreateCdl(contentVersion, recordId, uniqueCvId) {
    // First, get the Id of the created ContentVersion
    var contentVersionId = await this.getContentVersionId(
      contentVersion,
      uniqueCvId
    );

    // Now, get the Id of the ContentDocument associated with the ContentVersion object
    var contentDocumentId = await this.getContentDocumentId(contentVersionId);

    await this.createCdl(recordId, contentDocumentId);
  }

  async getContentVersionId(contentVersion, uniqueCvId) {
    var contentVersionId = contentVersion.id;

    // If we got a draft (which is expected on the Field Service app),
    // wait for the draft to be uploaded to the server
    if ("drafts" in contentVersion) {
      contentVersionId = await this.waitForDraftToUpload(uniqueCvId);
    }

    if (isNullOrEmpty(contentVersionId)) {
      throw new Error("Failed to retrieve ContentVersion ID!");
    }

    log(`File uploaded, got ContentVersion Id: ${contentVersionId}`);
    return contentVersionId;
  }

  async waitForDraftToUpload(uniqueCvId) {
    var contentVersionId = "";
    const MAX_RETRIES = 30;
    const SEC_TO_WAIT = 1;
    log(
      `Querying the org up to ${MAX_RETRIES} times with ${SEC_TO_WAIT} sec between each call, waiting for the draft to get there...`
    );

    for (let i = 0; i < MAX_RETRIES; i++) {
      let receivedId = "";
      await getContentVersionId({ uniqueCvId: uniqueCvId })
        .then((res) => {
          if (res != null && res.length > 0) {
            receivedId = res[0].Id;
          }
        })
        .catch((e) => {
          log(`(waitForDraftToUpload) Promise Rejected: ${JSON.stringify(e)}`);
        });

      if (!isNullOrEmpty(receivedId)) {
        contentVersionId = receivedId;
        break;
      }

      await waitMillis(SEC_TO_WAIT * 1000);
    }

    return contentVersionId;
  }

  async getContentDocumentId(contentVersionId) {
    var contentDocumentId = "";

    await getContentDocumentId({ contentVersionId: contentVersionId })
      .then((res) => {
        if (res != null && res.length > 0) {
          contentDocumentId = res[0].ContentDocumentId;
        }
      })
      .catch((e) => {
        log(`Failed to retrieve ContentDocument ID: ${JSON.stringify(e)}`);
      });

    if (isNullOrEmpty(contentDocumentId)) {
      throw new Error(
        `Failed to retrieve ContentDocument ID for ContentVersion ID ${contentVersionId}!`
      );
    }

    log(`Got ContentDocument Id: ${contentDocumentId}`);
    return contentDocumentId;
  }

  async createCdl(recordId, contentDocumentId) {
    log("Creating a CDL...");

    await createContentDocumentLink({
      contentDocumentId: contentDocumentId,
      recordId: recordId
    })
      .then(() => {
        log("Successfully created a CDL!");
      })
      .catch((e) => {
        log(`Failed to create a CDL: ${JSON.stringify(e)}`);
        throw e;
      });
  }
}
