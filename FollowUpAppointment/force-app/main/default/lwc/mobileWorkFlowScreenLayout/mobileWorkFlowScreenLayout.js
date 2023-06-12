/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api } from 'lwc';
import customLabels from './labels';

export default class MobileWorkFlowScreenLayout extends LightningElement {
  @api currentScreen;
  LABELS = customLabels;
  @api handleEditButtonClickEvent;
  @api screenTitle;
  @api screenSubTitle;
  @api fieldListArray = [];
  @api const_duplicate = this.LABELS.FollowUpAppointments_duplicate_title;
  @api const_delete = this.LABELS.FollowUpAppointments_delete_title;
  @api isDuplicateButtonDisabled = false;

  @api isLeftButtonDisabled = false;
  @api isRightButtonDisabled = false;

  @api get screenno() {
    return this.currentScreen;
  }
  set screenno(value) {
    console.log('screen no value is : ' + value);
    if (value) {
      this.currentScreen = value;
    }
  }

  @api get disableleftbutton() {
    return this.isLeftButtonDisabled;
  }
  set disableleftbutton(value) {
    this.isLeftButtonDisabled = value;
  }

  @api get disablerightbutton() {
    return this.isRightButtonDisabled;
  }
  set disablerightbutton(value) {
    this.isRightButtonDisabled = value;
  }

  @api get screentitle() {
    return this.screenTitle;
  }
  set screentitle(value) {
    //console.log("Value in clild class : "+value);
    this.screenTitle = value;
  }

  @api get screensubtitle() {
    return this.screenSubTitle;
  }
  set screensubtitle(value) {
    this.screenSubTitle = value;
  }

  @api get selectedfieldlist() {
    return this.fieldListArray;
  }

  set selectedfieldlist(value) {
    this.fieldListArray = value;
  }

  @api get disableduplicatebutton() {
    return this.isDuplicateButtonDisabled;
  }

  set disableduplicatebutton(value) {
    this.isDuplicateButtonDisabled = value;
  }

  // send the event to parent class for edit button
  @api handleClildEditButtonEvent() {
    let ev = new CustomEvent('editevent', { detail: this.currentScreen });
    this.dispatchEvent(ev);
  }

  @api handleDropDownActionSelected(event) {
    console.log('Drop down list selected : ' + event.detail.value);
    let selectedValue = event.detail.value;
    if (selectedValue === this.const_duplicate) {
      // handle duplication of screen

      console.log('Duplicate screen called : ' + this.currentScreen);
      let ev = new CustomEvent('duplicateevent', {
        detail: this.currentScreen,
      });
      this.dispatchEvent(ev);
    } else {
      // Handle delete of screen
      console.log('Delete screen called : ' + this.currentScreen);
      let ev = new CustomEvent('deleteevent', { detail: this.currentScreen });
      this.dispatchEvent(ev);
    }
  }

  @api handleLeftButtonEventClick() {
    console.log('Left button clicked for screen : ' + this.currentScreen);
    let ev = new CustomEvent('leftbuttoneevent', {
      detail: this.currentScreen,
    });
    this.dispatchEvent(ev);
  }

  @api handleRightButtonEventClick() {
    console.log('Right button clicked for screen : ' + this.currentScreen);
    let ev = new CustomEvent('rightbuttoneevent', {
      detail: this.currentScreen,
    });
    this.dispatchEvent(ev);
  }
}
