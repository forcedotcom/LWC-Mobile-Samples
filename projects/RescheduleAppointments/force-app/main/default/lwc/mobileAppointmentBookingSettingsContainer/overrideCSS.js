export default `
.resource-assignment-container legend.slds-form-element__legend.slds-form-element__label {
    display: none;
}
.resource-assignment-container .slds-radio .slds-radio_faux {
    width: 22px;
    height: 22px;
}
.resource-assignment-container .slds-radio{
    margin-top:17px;
    margin-bottom:17px;
}

.resource-assignment-container .slds-radio .slds-form-element__label {
    font-size: 16px;
    line-height: 22px;
    color: black;
}
.slds-spinner_container{
    position: fixed;
}
.slds-modal__container{
    margin: 0;
    padding: var(--lwc-squareIconLargeBoundary,3rem) 0 2rem 0;
    border-radius: 8px;
}
.slds-modal__content{
    border-radius: 8px 8px 0 0;
}

.local-spinner-container .slds-spinner_container{
    position: absolute;
    top: 48px;
}
.changeIconcolor{
    --sds-c-icon-color-foreground-default: #0D7FA8;
}
.slds-button_neutral:active{
    --slds-c-button-color-background-hover: var(--slds-c-button-neutral-color-background, var(--sds-c-button-neutral-color-background, var(--slds-g-color-neutral-base-100, var(--lwc-buttonColorBackgroundPrimary,rgb(255, 255, 255)))));
}
.slds-button_neutral:hover{
    --slds-c-button-color-background-hover: var(--slds-c-button-neutral-color-background, var(--sds-c-button-neutral-color-background, var(--slds-g-color-neutral-base-100, var(--lwc-buttonColorBackgroundPrimary,rgb(255, 255, 255)))));
}
.slds-button_neutral:focus{
    --slds-c-button-color-background-hover: var(--slds-c-button-neutral-color-background, var(--sds-c-button-neutral-color-background, var(--slds-g-color-neutral-base-100, var(--lwc-buttonColorBackgroundPrimary,rgb(255, 255, 255)))));
}
`;
