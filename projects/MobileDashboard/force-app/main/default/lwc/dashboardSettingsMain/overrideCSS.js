export default `
.dashboard-settings-page-main-container .slds-card__header, 
.dashboard-settings-page-main-container .slds-card__body,
.edit-card-modal-container .slds-card__header, 
.edit-card-modal-container .slds-card__body {
    padding: 0;
    margin: 0;
}

.dashboard-settings-page-main-container .slds-var-m-left_x-small,
.edit-card-modal-container .slds-var-m-left_x-small {
    margin-left: 0;
}

.dashboard-settings-page-main-container .slds-form-element__row,
.edit-card-modal-container .slds-form-element__row {
    margin: 0;
}

.dashboard-settings-page-main-container c-basic-filter .slds-checkbox__label,
.edit-card-modal-container c-basic-filter .slds-checkbox__label {
    display: flex;
    flex-direction: column-reverse;
}

.dashboard-settings-page-main-container c-basic-filter .slds-checkbox_faux,
.edit-card-modal-container c-basic-filter .slds-checkbox_faux {
    height: 32px;
    width: 32px;
}

.edit-card-modal-container c-dashboard-icons-picker button.slds-button {
    color: black;
}

.alert-message-container .slds-modal__content {
    display: flex;
    justify-content: center;
    align-items: center;
}`;
