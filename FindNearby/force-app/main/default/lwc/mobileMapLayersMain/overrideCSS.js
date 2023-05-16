export default `body {
    overflow: hidden;
}

body, div, button, input, optgroup, select, textarea, p, ul, li {
    font-family: var(--lwc-fontFamily) !important;
}

.confirm-modal-container lightning-modal {
    display: flex;
    justify-content: center;
}

.confirm-modal-container .confirm-modal-header .slds-modal__header {
    border: none;
    padding: 16px 16px 0 16px;
    height: 48px;
    width: 320px;
    margin-bottom: 4px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    line-height: 21px;
}

.confirm-modal-container .confirm-modal-body .slds-modal__content {
    height: 44px;
    width: 320px;
    min-height: 0 !important;
    margin-bottom: 24px;
    padding: 0 16px;
    font-size: 16px;
    line-height: 22px;
    display: flex;
    align-items: center;
}

.confirm-modal-container .confirm-modal-footer .slds-modal__footer {
    border: none;
    height: 64px;
    width: 320px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px 16px 16px;
    border-radius: 12px;
}

.confirm-modal-container .confirm-modal-footer .slds-button { 
    height: 48px;
    width: 140px;
    border-radius: 12px;
    background-color: #0D7FA8;
    color: white;
}

.confirm-modal-container .slds-modal__close { 
    display: none;
}

.find-nearby-main-container .slds-map_container {
    padding: 0;
}

.find-nearby-main-container lightning-tile {
    width: calc(100% - 44px);
    margin: 0 8px;
}

.find-nearby-main-container lightning-tile h3 {
    margin-bottom: 4px;
}

.find-nearby-main-container lightning-tile h3 a {
    color: #181818;
    cursor: default;
    font-size: 18px;
    line-height: 21px;
}

.find-nearby-main-container lightning-tile h3 a:hover {
    text-decoration: none;
    color: #181818;
    cursor: default;
}

.find-nearby-main-container lightning-tile h3 a:focus {
    text-decoration: none;
    color: #181818;
    cursor: default;
}

.find-nearby-main-container lightning-tile h3 a:active {
    text-decoration: none;
    color: #181818;
    cursor: default;
}

.find-nearby-main-container .header .slds-item {
    padding: 0 !important;
}

.find-nearby-main-container lightning-tile .slds-tile__detail {
    font-size: 14px;
    line-height: 18px;
    color: #444444;
}

.find-nearby-main-container .title-tile .slds-tile__detail {
    font-size: 18px;
    line-height: 21px;
    color: #444444;
}

.find-nearby-main-container .slds-has-divider_top-space {
    margin: 0 !important;
    padding: 0 !important;
}

.find-nearby-main-container legend.slds-form-element__legend.slds-form-element__label {
    display: none;
}

.find-nearby-main-container .slds-radio {
    height: 56px;
}

.find-nearby-main-container .slds-radio [type=radio]:checked+.slds-radio__label .slds-radio_faux {
    width: 24px;
    height: 24px;
    border: 2px #0D7FA8 solid;
}

.find-nearby-main-container .slds-radio [type=radio]:checked+.slds-radio__label .slds-radio_faux:after {
    background-color: #0D7FA8;
}

.find-nearby-main-container .slds-radio .slds-radio_faux {
    width: 24px;
    height: 24px;
    border: 2px #9FAAB5 solid;
}

.find-nearby-main-container .slds-radio .slds-form-element__label {
    font-size: 16px;
    line-height: 22px;
    color: black;
}

.find-nearby-main-container input.slds-input, .find-nearby-main-container button.slds-combobox__input {
    border-radius: 12px;
    width: calc(100vw - 32px);
}

.find-nearby-main-container lightning-datepicker {
    flex: 1;
}

.find-nearby-main-container lightning-timepicker {
    flex: 1;
}

.find-nearby-main-container .boolean-input-frame .slds-checkbox_toggle {
    display: flex;
    justify-content: space-between;
}`;
