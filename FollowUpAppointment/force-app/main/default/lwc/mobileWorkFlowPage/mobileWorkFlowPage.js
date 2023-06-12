/* eslint-disable no-unused-expressions */
/* eslint-disable guard-for-in */
/* eslint-disable @lwc/lwc/no-leading-uppercase-api-name */
/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, track, api, wire } from "lwc";
import getObjectNames from "@salesforce/apex/FollowUpAppointmentController.getObjectNames";
import getSavedScreenData from "@salesforce/apex/FollowUpAppointmentController.getSavedScreenData";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import getFieldNames from "@salesforce/apex/FollowUpAppointmentController.getFieldNames";
import saveFieldSettings from "@salesforce/apex/FollowUpAppointmentController.saveFieldSettings";
import deleteScreen from "@salesforce/apex/FollowUpAppointmentController.deleteScreen";
import duplicateScreenData from "@salesforce/apex/FollowUpAppointmentController.duplicateScreenData";
import swapScreenLeftRight from "@salesforce/apex/FollowUpAppointmentController.swapScreenLeftRight";
import customLabels from "./labels";

export default class MobileWorkFlowPage extends LightningElement {
  @api showModal = false;
  @api showDeleteDialogBox = false;
  LABELS = customLabels;
  @track fieldLayoutArray = [];
  noOfField = 1;
  @track objectNameList = [];
  fieldNameList = [];
  ObjectArray = [];
  ObjectTempNameArr = [];
  @track selected = "";
  selectedFieldList1 = [];
  selectedFieldList2 = [];
  selectedFieldList3 = [];
  disableAddStepBtn = false;
  @api serviceAppointmentFields = new Map();
  workOrderFields = new Map();
  workOrderLineItemFields = new Map();
  @api isParentcomponentChange = false;

  @api selectedObject1 = "";
  @api selectedObject2 = "";
  @api selectedObject3 = "";

  dataLoaded = true;

  @api SCREEN1 = 1;
  @api SCREEN2 = 2;
  @api SCREEN3 = 3;

  @api screenTitle1;
  @api screenTitle2;
  @api screenTitle3;
  @api currentScreenTitle;

  @api screenSubTitle1 = "";
  @api screenSubTitle2 = "";
  @api screenSubTitle3 = "";
  @api screenSubTitle4 = "";
  @api currentSubTitle;

  @api showScreen1 = false;
  @api showScreen2 = false;
  @api showScreen3 = false;

  @api isLeftButtonDisabled1 = false;
  @api isLeftButtonDisabled2 = false;
  @api isLeftButtonDisabled3 = false;
  @api isRightButtonDisabled1 = false;
  @api isRightButtonDisabled2 = false;
  @api isRightButtonDisabled3 = false;

  showPreviewScreen = true;
  @api currentScreenDisplayed = 0;
  @api screenMaxLimitConst = 3;

  dialgBoxTitle = this.LABELS.FollowUpAppointments_edit_step_text_label;

  @wire(getObjectInfo, { objectApiName: "ServiceAppointment" })
  serviceAppointmentInfo({ error, data }) {
    if (data) {
      console.log("-- got serviceAppointmentInfo -> ", data.fields);
      this.error = undefined;
      for (const field in data.fields) {
        this.serviceAppointmentFields.set(
          `${data.fields[field].apiName}`,
          `${data.fields[field].dataType}`
        );
      }
    } else if (error) {
      console.log("-- error serviceAppointmentInfo -> ", error);
      this.error = error;
      this.objectInfo = undefined;
    }
  }

  @wire(getObjectInfo, { objectApiName: "WorkOrder" })
  workOrderInfo({ error, data }) {
    if (data) {
      console.log("-- got workOrderInfo -> ", data.fields);
      this.error = undefined;
      for (const field in data.fields) {
        this.workOrderFields.set(
          `${data.fields[field].apiName}`,
          `${data.fields[field].dataType}`
        );
      }
    } else if (error) {
      console.log("-- error workOrderInfo -> ", error);
      this.error = error;
      this.objectInfo = undefined;
    }
  }

  @wire(getObjectInfo, { objectApiName: "WorkOrderLineItem" })
  workOrderLineItemInfo({ error, data }) {
    if (data) {
      console.log("-- got workOrderLineItemInfo -> ", data.fields);
      this.error = undefined;
      for (const field in data.fields) {
        this.workOrderLineItemFields.set(
          `${data.fields[field].apiName}`,
          `${data.fields[field].dataType}`
        );
      }
    } else if (error) {
      console.log("-- error workOrderLineItemInfo -> ", error);
      this.error = error;
      this.objectInfo = undefined;
    }
  }

  set isParentComponentChanged(value) {
    console.log("Reload child component called : " + value);
    this.callAPEX();
  }
  @api get isParentComponentChanged() {
    return false;
  }

  handleEditButtonEvent() {
    console.log("Edit button pressed");
    this.showModal = true;
  }

  @api closeModal() {
    console.log("Modal Close event called");
    this.callAPEX();
    this.showModal = false;
  }

  handleScreenTitleEventChange(event) {
    this.currentScreenTitle = event.target.value;
    if (this.currentScreenDisplayed === 1) {
      this.screenTitle1 = event.target.value;
    } else if (this.currentScreenDisplayed === 2) {
      this.screenTitle2 = event.target.value;
    } else if (this.currentScreenDisplayed === 3) {
      this.screenTitle3 = event.target.value;
    }

    if (
      this.currentScreenTitle &&
      this.currentScreenTitle.length > 0 &&
      this.selected &&
      this.selected.length > 0
    ) {
      this.isSaveButtonDisabled = false;
    } else {
      this.isSaveButtonDisabled = true;
    }
  }

  saveDetails() {
    this.showModal = false;
    let arr = [];
    this.dataLoaded = false;
    if (this.currentScreenDisplayed === 1) {
      console.log("Save event called for screen1");
      this.screenTitle1 = this.currentScreenTitle;
      this.selectedFieldList1 = this.selected;
      console.log("Selected fields are : " + this.selectedFieldList1);
    }

    if (this.currentScreenDisplayed === 2) {
      console.log("Save event called for screen2");
      this.screenTitle2 = this.currentScreenTitle;
      this.selectedFieldList2 = this.selected;
    }

    if (this.currentScreenDisplayed === 3) {
      console.log("Save event called for screen3");
      this.screenTitle3 = this.currentScreenTitle;
      this.selectedFieldList3 = this.selected;
    }
    arr.push(this.currentScreenDisplayed); // 0
    arr.push(this.currentScreenTitle); // 1
    let strField = "";
    for (let i = 0; i < this.selected.length; i++) {
      switch (this.selectedObject) {
        case "ServiceAppointment":
          strField =
            strField +
            this.selectedObject +
            "," +
            this.selected[i] +
            "," +
            this.serviceAppointmentFields.get(this.selected[i]) +
            ";";
          break;
        case "WorkOrder":
          strField =
            strField +
            this.selectedObject +
            "," +
            this.selected[i] +
            "," +
            this.workOrderFields.get(this.selected[i]) +
            ";";
          break;
        case "WorkOrderLineItem":
          strField =
            strField +
            this.selectedObject +
            "," +
            this.selected[i] +
            "," +
            this.workOrderLineItemFields.get(this.selected[i]) +
            ";";
          break;
        default:
          break;
      }
    }
    console.log("Selected field string is : " + strField);
    arr.push(strField); // 2
    this.handleSaveFieldDataApexCall(arr);
  }

  handleSaveFieldDataApexCall(arr) {
    saveFieldSettings({ inputArr: arr })
      .then((data) => {
        if (data.error) {
          console.error("Error while creating screen : " + data);
          this.dataLoaded = true;
          throw new Error(data.error);
        } else {
          console.log("saved successfully");
          this.dataLoaded = true;
          if (
            this.dialgBoxTitle ===
            this.LABELS.FollowUpAppointments_new_step_text_label
          ) {
            this.showToastMessages(
              this.LABELS.FollowUpAppointments_settings_createScreenToastMessage.replace(
                "{0}",
                arr[1]
              ),
              true
            );
          } else {
            this.showToastMessages(
              this.LABELS.FollowUpAppointments_settingPage_save_message,
              true
            );
          }
          this.callAPEX();
        }
      })
      .catch((error) => {
        console.error("Error while creating the screen : " + error.message);
        this.dataLoaded = true;
        if (
          this.dialgBoxTitle ===
          this.LABELS.FollowUpAppointments_new_step_text_label
        ) {
          this.showToastMessages(
            this.LABELS.FollowUpAppointments_workflow_addStepFailureMessage,
            false
          );
        } else {
          this.showToastMessages(
            this.LABELS.FollowUpAppointments_settingPage_error_message,
            false
          );
        }
      });
  }

  connectedCallback() {
    this.fieldLayoutArray = [];

    this.callAPEX();

    for (let j = 0; j < 1; j++) {
      let arr = [];

      arr.value = "value";
      arr.key = j;
      this.fieldLayoutArray.push(arr);
    }
    this.filter();
    console.log(
      "Value in fieldLayoutArray is : " + this.fieldLayoutArray.length
    );
  }

  maxPageNoTitle = 4;
  minPageNoTitle = 1;
  callAPEX() {
    console.log("Apex method called ");

    /**
     * GET object list
     */
    this.dataLoaded = false;
    this.ObjectTempNameArr = [];
    this.objectNameList = [];
    getObjectNames()
      .then((data) => {
        if (data.error) {
          this.dataLoaded = true;
          throw new Error(data.error);
        } else {
          this.objectNameList = [];
          for (let i = 0; i < data.length; i++) {
            let arr = [];
            arr.object = data[i];
            arr.fields = [];
            this.ObjectArray.push(arr);
            this.ObjectTempNameArr.push(data[i]);
            this.objectNameList = [
              ...this.objectNameList,
              { value: data[i], label: data[i] }
            ];
            this.dataLoaded = true;
          }
        }
      })
      .catch((error) => {
        console.log("Error while getting object list : " + error);
      });

    /**
     * Function to get saved fields and screen data
     */

    this.dataLoaded = false;
    getSavedScreenData()
      .then((data) => {
        if (data.error) {
          this.dataLoaded = true;
          throw new Error(data.error);
        } else if (data.null) {
          // There is no saved data
        } else {
          this.minPageNoTitle = 0;
          this.currentScreenDisplayed = 0;
          if (
            data.Screen_Title_1__c &&
            data.Screen_Title_1__c.length > 0 &&
            data.Screen_Title_1__c !== "null"
          ) {
            this.screenTitle1 = data.Screen_Title_1__c;
            this.showScreen1 = true;
            let fieldList = data.Fields_To_Show_Page_1__c;
            this.currentScreenDisplayed = this.currentScreenDisplayed + 1;
            console.log("Saved field values are : " + fieldList);
            this.selectedFieldList1 = [];
            if (fieldList && fieldList.length > 0) {
              const myArray = fieldList.split(";"); // split the fields by ';'
              if (myArray.length > 0) {
                for (let i = 0; i < myArray.length; i++) {
                  let objfield = myArray[i];
                  const fieldArray = objfield.split(",");
                  if (fieldArray.length > 0) {
                    if (fieldArray[1] && fieldArray[1].length > 0) {
                      this.selectedObject1 = fieldArray[0];
                      this.selectedFieldList1.push(fieldArray[1]);
                    }
                  }
                }
              }
            }
            this.minPageNoTitle = this.minPageNoTitle + 1;
            this.screenSubTitle1 = this.createStepTitle(
              this.minPageNoTitle,
              this.maxPageNoTitle
            );
          } else {
            this.showScreen1 = false;
          }

          if (
            data.Screen_Title_2__c &&
            data.Screen_Title_2__c.length > 0 &&
            data.Screen_Title_2__c !== "null"
          ) {
            this.screenTitle2 = data.Screen_Title_2__c;
            this.showScreen2 = true;
            this.currentScreenDisplayed = this.currentScreenDisplayed + 1;
            let fieldList2 = data.Fields_To_Show_Page_2__c;
            this.selectedFieldList2 = [];
            if (fieldList2 && fieldList2.length > 0) {
              const myArray = fieldList2.split(";"); // split the fields by ','
              if (myArray.length > 0) {
                for (let i = 0; i < myArray.length; i++) {
                  let objfield = myArray[i];
                  const fieldArray = objfield.split(",");
                  if (fieldArray.length > 0) {
                    if (fieldArray[1] && fieldArray[1].length > 0) {
                      this.selectedObject2 = fieldArray[0];
                      this.selectedFieldList2.push(fieldArray[1]);
                    }
                  }
                }
              }
            }
            this.minPageNoTitle = this.minPageNoTitle + 1;
            this.screenSubTitle2 = this.createStepTitle(
              this.minPageNoTitle,
              this.maxPageNoTitle
            );
          } else {
            this.showScreen2 = false;
          }

          if (
            data.Screen_Title_3__c &&
            data.Screen_Title_3__c.length > 0 &&
            data.Screen_Title_3__c !== "null"
          ) {
            this.screenTitle3 = data.Screen_Title_3__c;
            let fieldList3 = data.Fields_To_Show_Page_3__c;
            this.showScreen3 = true;
            this.currentScreenDisplayed = this.currentScreenDisplayed + 1;
            this.selectedFieldList3 = [];
            if (fieldList3 && fieldList3.length > 0) {
              const myArray = fieldList3.split(";"); // split the fields by ','
              if (myArray.length > 0) {
                for (let i = 0; i < myArray.length; i++) {
                  let objfield = myArray[i];
                  const fieldArray = objfield.split(",");
                  if (fieldArray.length > 0) {
                    if (fieldArray[1] && fieldArray[1].length > 0) {
                      this.selectedObject3 = fieldArray[0];
                      this.selectedFieldList3.push(fieldArray[1]);
                    }
                  }
                }
              }
            }
            this.minPageNoTitle = this.minPageNoTitle + 1;
            this.screenSubTitle3 = this.createStepTitle(
              this.minPageNoTitle,
              this.maxPageNoTitle
            );
          } else {
            this.showScreen3 = false;
          }
          this.minPageNoTitle = this.minPageNoTitle + 1;
          this.screenSubTitle4 = this.createStepTitle(
            this.minPageNoTitle,
            this.maxPageNoTitle
          );
          this.disableAddStepBtn = false;
          if (this.currentScreenDisplayed === this.screenMaxLimitConst) {
            this.disableAddStepBtn = true;
          }
          this.validateLeftRightArrowButtons();
        }
      })
      .catch((error) => {
        console.log("Error while getting object list : " + error);
      });
  }

  validateLeftRightArrowButtons() {
    this.isLeftButtonDisabled1 = false;
    this.isLeftButtonDisabled2 = false;
    this.isLeftButtonDisabled3 = false;

    this.isRightButtonDisabled1 = false;
    this.isRightButtonDisabled2 = false;
    this.isRightButtonDisabled3 = false;

    console.log("Page no displayed are : " + this.minPageNoTitle);
    switch (this.minPageNoTitle) {
      case 2: {
        if (this.showScreen1) {
          this.isLeftButtonDisabled1 = true;
          this.isRightButtonDisabled1 = true;
        } else if (this.showScreen2) {
          this.isLeftButtonDisabled2 = true;
          this.isRightButtonDisabled2 = true;
        } else {
          this.isLeftButtonDisabled3 = true;
          this.isRightButtonDisabled3 = true;
        }
        break;
      }
      case 3: {
        // code for total screen 2

        if (this.showScreen1 && this.showScreen2) {
          this.isLeftButtonDisabled1 = true;
          this.isRightButtonDisabled2 = true;
        } else if (this.showScreen2 && this.showScreen3) {
          this.isLeftButtonDisabled2 = true;
          this.isRightButtonDisabled3 = true;
        } else {
          this.isLeftButtonDisabled1 = true;
          this.isRightButtonDisabled3 = true;
        }
        break;
      }
      case 4: {
        // code for total screen 3
        this.isLeftButtonDisabled1 = true;
        this.isRightButtonDisabled3 = true;
        break;
      }
      default: {
        break;
      }
    }
  }

  selectedObject = "";
  handleObjectNameSelected(event) {
    console.log("On object selected called : " + event.detail.value);
    this.selectedObject = event.detail.value;
    //this.selectedFields =[{label:'', value:''}];
    /**
     * GET field list
     */
    this.selectedFields = [];
    this.selected = "";
    this.dataLoaded = false;
    getFieldNames({ objectName: this.selectedObject })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        } else {
          console.log("Got the field names successfully " + data);
          this.fieldNameList = [];
          for (let i = 0; i < data.length; i++) {
            this.fieldNameList = [
              ...this.fieldNameList,
              { value: data[i], label: data[i] }
            ];
          }
          this.filteredFieldNames = this.fieldNameList;
          this.dataLoaded = true;
        }
      })
      .catch((error) => {
        this.dataLoaded = true;
        console.log("Error while getting object list : " + error);
      });
  }

  handleAddFieldOnClickEvent() {
    this.noOfField = this.noOfField + 1;
    this.fieldLayoutArray = [];
    for (let j = 0; j < this.noOfField; j++) {
      let arr = [];
      arr.value = "value";
      arr.key = j;
      this.fieldLayoutArray.push(arr);
    }
    console.log(
      "Value in fieldLayoutArray is : " + this.fieldLayoutArray.length
    );
  }

  filteredFieldNames = [];
  searchString = "";

  filter(event) {
    let filter = event
      ? new RegExp(
          this.template.querySelector("[data-name='searchfield']").value,
          "ig"
        )
      : {
          test: function () {
            return true;
          }
        };
    console.log("filter event called");
    const selected = new Set(this.selected);
    this.filteredFieldNames = this.fieldNameList.filter(
      (option) => filter.test(option.value) || selected.has(option.value)
    );
  }

  isSaveButtonDisabled = true;
  handleChange(event) {
    this.selected = [...event.target.value];
    this.filter(true);

    this.enableDisableSaveButton();
  }

  @api handleAddScreenEvent() {
    console.log("Add screen event called ");
    this.dialgBoxTitle = this.LABELS.FollowUpAppointments_new_step_text_label;
    this.disableAddStepBtn = false;
    if (this.currentScreenDisplayed < 3) {
      this.currentScreenDisplayed = this.currentScreenDisplayed + 1;
    } else {
      // max screens displayed
    }

    if (this.currentScreenDisplayed === 1) {
      this.showScreen1 = true;
      this.screenSubTitle1 = this.createStepTitle(1, this.maxPageNoTitle);
    }
    if (this.currentScreenDisplayed === 2) {
      if (!this.showScreen1) {
        this.showScreen1 = true;
        this.currentScreenDisplayed = 1;
        this.screenSubTitle1 = this.createStepTitle(1, this.maxPageNoTitle);
      } else {
        this.showScreen2 = true;
        this.screenSubTitle2 = this.createStepTitle(2, this.maxPageNoTitle);
      }
    }
    if (this.currentScreenDisplayed === 3) {
      if (!this.showScreen1) {
        this.showScreen1 = true;
        this.currentScreenDisplayed = 1;
        this.screenSubTitle1 = this.createStepTitle(1, this.maxPageNoTitle);
      } else if (!this.showScreen2) {
        this.showScreen2 = true;
        this.currentScreenDisplayed = 2;
        this.screenSubTitle2 = this.createStepTitle(2, this.maxPageNoTitle);
      } else {
        // run this link in exceptional condition
      }
      this.showScreen3 = true;
      this.disableAddStepBtn = true;
      this.screenSubTitle3 = this.createStepTitle(3, this.maxPageNoTitle);
    }

    // Open the dialog box directly when add step is called
    this.selectedObject = null;
    this.currentScreenTitle = "";
    this.selected = "";
    this.filteredFieldNames = [];
    this.selectedFields = [];
    this.isSaveButtonDisabled = true;
    this.showModal = true;
  }

  selectedFields = [];
  editButtonEventCalledFromChild(event) {
    this.dialgBoxTitle = this.LABELS.FollowUpAppointments_edit_step_text_label;
    console.log("Selected Page is : " + event.detail);
    this.currentScreenDisplayed = event.detail;
    this.showModal = true;

    this.selectedObject = null;
    this.currentScreenTitle = "";
    this.selected = "";
    this.isSaveButtonDisabled = true;
    switch (this.currentScreenDisplayed) {
      case 1: {
        if (this.selectedObject1 && this.screenTitle1) {
          this.selectedObject = this.selectedObject1;
          this.currentScreenTitle = this.screenTitle1;
          this.handleGetFieldNameOnSelectedObject(this.selectedObject);
          this.selectedFields = this.selectedFieldList1;
          this.selected = this.selectedFieldList1;
          this.isSaveButtonDisabled = false;
        }

        break;
      }
      case 2: {
        if (this.selectedObject2 && this.screenTitle2) {
          this.selectedObject = this.selectedObject2;
          this.currentScreenTitle = this.screenTitle2;
          this.handleGetFieldNameOnSelectedObject(this.selectedObject);
          this.selectedFields = this.selectedFieldList2;
          this.selected = this.selectedFieldList2;
          this.isSaveButtonDisabled = false;
        }

        break;
      }
      case 3: {
        if (this.selectedObject3 && this.screenTitle3) {
          this.selectedObject = this.selectedObject3;
          this.currentScreenTitle = this.screenTitle3;
          this.handleGetFieldNameOnSelectedObject(this.selectedObject);
          this.selectedFields = this.selectedFieldList3;
          this.selected = this.selectedFieldList3;
          this.isSaveButtonDisabled = false;
        }

        break;
      }
      default: {
        break;
      }
    }
    this.filteredFieldNames = [];
  }

  enableDisableSaveButton() {
    if (
      this.currentScreenTitle &&
      this.currentScreenTitle.length > 0 &&
      this.selected &&
      this.selected.length > 0
    ) {
      this.isSaveButtonDisabled = false;
    } else {
      this.isSaveButtonDisabled = true;
    }
  }

  handleGetFieldNameOnSelectedObject(objSelected) {
    this.dataLoaded = false;
    if (objSelected) {
      getFieldNames({ objectName: objSelected })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          } else {
            console.log("Got the field names successfully");
            this.fieldNameList = [];
            for (let i = 0; i < data.length; i++) {
              this.fieldNameList = [
                ...this.fieldNameList,
                { value: data[i], label: data[i] }
              ];
            }
            this.filteredFieldNames = this.fieldNameList;
            this.dataLoaded = true;
          }
        })
        .catch((error) => {
          this.dataLoaded = true;
          console.log("Error while getting object list : " + error);
        });
    } else {
      this.dataLoaded = true;
      console.log("No object selected");
    }
  }

  deletePageNoCalled = -1;
  deleteScreenEventCalledFromChild(event) {
    console.log("Selected Page is : " + event.detail);
    this.deletePageNoCalled = event.detail;
    this.showDeleteDialogBox = true;
  }

  onCloseDeleteDialogBox() {
    this.showDeleteDialogBox = false;
  }
  @api handleDeleteEventDialogBox() {
    if (this.currentScreenDisplayed > 0) {
      this.dataLoaded = false;
      this.showDeleteDialogBox = false;
      let screenTitleTemp = "";
      switch (this.deletePageNoCalled) {
        case 1: {
          screenTitleTemp = this.screenTitle1;
          break;
        }
        case 2: {
          screenTitleTemp = this.screenTitle2;
          break;
        }
        case 3: {
          screenTitleTemp = this.screenTitle3;
          break;
        }
        default: {
          break;
        }
      }
      deleteScreen({ screenNo: this.deletePageNoCalled })
        .then((data) => {
          if (data.error) {
            console.error("Got error while deleting the data : " + data.error);
            this.dataLoaded = true;
            throw new Error(data.error);
          } else {
            console.log("screen deleted successfully");
            this.showToastMessages(
              this.LABELS.FollowUpAppointments_settings_deleteScreenToastMessage.replace(
                "{0}",
                screenTitleTemp
              ),
              true
            );
            this.currentScreenDisplayed = this.currentScreenDisplayed - 1;

            this.currentScreenDisplayed === this.screenMaxLimitConst
              ? (this.disableAddStepBtn = true)
              : (this.disableAddStepBtn = false);

            switch (this.deletePageNoCalled) {
              case 1: {
                this.screenTitle1 = "";
                this.currentScreenTitle = "";
                this.selected = "";
                this.selectedFieldList1 = [];
                this.showScreen2 = false;
                break;
              }

              case 2: {
                this.screenTitle2 = "";
                this.currentScreenTitle = "";
                this.selected = "";
                this.selectedFieldList2 = [];
                this.showScreen2 = false;
                break;
              }
              case 3: {
                this.screenTitle3 = "";
                this.currentScreenTitle = "";
                this.selected = "";
                this.selectedFieldList3 = [];
                this.showScreen3 = false;
                break;
              }
              default: {
                break;
              }
            }

            if (this.deletePageNoCalled === 1) {
              this.showScreen1 = false;
            } else if (this.deletePageNoCalled === 2) {
              this.showScreen2 = false;
            } else if (this.deletePageNoCalled === 3) {
              this.showScreen3 = false;
            }

            this.callAPEX();
            this.dataLoaded = true;
          }
        })
        .catch((error) => {
          console.log("Error while deleting the screen : " + error);
          this.dataLoaded = true;
          this.showToastMessages(
            this.LABELS.FollowUpAppointments_settingPage_error_delete_screen,
            false
          );
        });
    } else {
      // min screens displayed
    }
  }

  duplicateEventCalledFromChild(event) {
    console.log("Duplicate event called for page : " + event.detail);
    let pageNo = event.detail;
    let screenTitleTemp = "";
    let fieldSelected = [];
    let toScreenNo;

    let currentMaxPageDisplayed = this.currentScreenDisplayed;
    if (currentMaxPageDisplayed < 3) {
      if (pageNo === 1) {
        if (currentMaxPageDisplayed === 2) {
          toScreenNo = 3;
        }
        if (currentMaxPageDisplayed === 1) {
          toScreenNo = 2;
        }
      }

      if (pageNo === 2) {
        if (currentMaxPageDisplayed === 1) {
          toScreenNo = 1;
        }
        if (currentMaxPageDisplayed === 2) {
          if (!this.showScreen1) {
            toScreenNo = 1;
          } else {
            toScreenNo = 3;
          }
        }
      }

      if (pageNo === 3) {
        if (currentMaxPageDisplayed === 1) {
          toScreenNo = 1;
        }
        if (currentMaxPageDisplayed === 2) {
          if (!this.showScreen1) {
            toScreenNo = 1;
          } else {
            toScreenNo = 2;
          }
        }
      }

      switch (pageNo) {
        case 1: {
          screenTitleTemp = this.screenTitle1;
          fieldSelected = this.selectedFieldList1;
          break;
        }
        case 2: {
          screenTitleTemp = this.screenTitle2;
          fieldSelected = this.selectedFieldList2;
          break;
        }
        case 3: {
          screenTitleTemp = this.screenTitle3;
          fieldSelected = this.selectedFieldList3;
          break;
        }
        default: {
          break;
        }
      }
      console.log("selected screen title : " + screenTitleTemp);
      console.log("selected fields  : " + fieldSelected);

      if (toScreenNo) {
        duplicateScreenData({ fromScreenNo: pageNo, toScreenNo: toScreenNo })
          .then((data) => {
            if (data.error) {
              console.error("Got error while saving the data : " + data);
              this.dataLoaded = true;
              throw new Error(data.error);
            } else {
              this.callAPEX();
              this.showToastMessages(
                this.LABELS.FollowUpAppointments_settings_duplicateScreenToastMessage.replace(
                  "{0}",
                  screenTitleTemp
                ),
                true
              );
            }
          })
          .catch((error) => {
            console.log(
              "Error while duplicating the screen : " + error.message
            );
            this.dataLoaded = true;
            this.showToastMessages(
              this.LABELS
                .FollowUpAppointments_settingPage_error_duplicate_screen,
              false
            );
          });
      }
    }
  }

  /**
   * FUNCTIONS TO CALL DIALOG BOX
   */
  dialogTitle = "";
  dialogMessage = "";
  showToastMessages(message, isSuccessMessage) {
    var variant = "success";
    if (isSuccessMessage) variant = "success";
    else variant = "error";

    this.template
      .querySelector("c-follow-up-appointment-custom-toast-notifications")
      .showToast(variant, message);
  }

  createStepTitle(minPage, maxPage) {
    return "Step " + minPage + " of " + maxPage;
  }

  /**
   * Function to swap the screens right and left
   */

  leftButtonEventCalledFromChild(event) {
    let pageNo = event.detail;
    switch (pageNo) {
      case 2: {
        // swap screen 1 & 2
        this.swapScreenLeftRightApexCall(1, 2);
        break;
      }
      case 3: {
        // swap screen 2 & 3
        this.swapScreenLeftRightApexCall(2, 3);
        break;
      }
      default: {
        break;
      }
    }
  }

  @api rightButtonEventCalledFromChild(event) {
    let pageNo = event.detail;
    switch (pageNo) {
      case 1: {
        // swap screen 1 & 2
        this.swapScreenLeftRightApexCall(1, 2);
        break;
      }
      case 2: {
        // swap screen 2 & 3
        this.swapScreenLeftRightApexCall(2, 3);
        break;
      }
      default: {
        break;
      }
    }
  }

  @api swapScreenLeftRightApexCall(fromScreen, toScreen) {
    swapScreenLeftRight({ fromScreenNo: fromScreen, toScreenNo: toScreen })
      .then((data) => {
        if (data.error) {
          console.error("Got error while saving the data : " + data);
          this.dataLoaded = true;
          throw new Error(data.error);
        } else {
          this.callAPEX();
        }
      })
      .catch((error) => {
        console.log("Error while shifting the screen : " + error);
        this.dataLoaded = true;
        this.showToastMessages(
          "Error while shifting the screen : " + error.message,
          false
        );
      });
  }
}
