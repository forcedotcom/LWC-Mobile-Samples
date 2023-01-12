import { LightningElement, api, track } from 'lwc';

export default class Modal extends LightningElement {
    @api showModal;

    @api get modalIsOpen(){
        return this.showModal === 1;
    }

    closeModal(event){
        event.preventDefault();

        console.log("dispatching close modal::: " + this.showModal);
        this.dispatchEvent(new CustomEvent('closemodal', {
            composed: true,
            bubbles: true
        }));

    }
}