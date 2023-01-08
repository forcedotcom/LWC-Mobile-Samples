import { LightningElement, api } from 'lwc';
import LightningConfirm from 'lightning/confirm';

export default class ImageSelector extends LightningElement {
    @api
    allImagesData;

    get totalSelectedImages() {
        return this.allImagesData.length;
    }

    get areImagesSelected() {
        return this.totalSelectedImages > 0;
    }

    get imageText() {
        return this.totalSelectedImages > 1 ? "images" : "image";
    }

    handleImageSelectedForAnnotation(event) {
        const selectedId = event.target.dataset.id;
        this.dispatchEvent(new CustomEvent('annotateimage', {
            detail: selectedId
        }));
    }

    async handleFilesSelected(event) {
        const files = event.target.files;
        this.dispatchEvent(new CustomEvent('selectimages', {
            detail: files
        }));
    }

    async handleUploadClicked() {
        const result = await LightningConfirm.open({
            message: "After uploading the images you can't edit them.",
            variant: 'header',
            label: 'Add images to record?',
            theme: 'success',
        });

        if (result) {
            this.dispatchEvent(new CustomEvent('uploadrequest'));
        }
    }
}