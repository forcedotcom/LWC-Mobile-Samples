/* eslint-disable no-unused-expressions */
/* eslint-disable @lwc/lwc/no-inner-html */
/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, wire, track } from "lwc";
import getSettingsObject from "@salesforce/apex/FollowUpAppointmentController.getSettingsObject";
import createRecord from "@salesforce/apex/FollowUpAppointmentController.createRecord";
import { getRecord } from "lightning/uiRecordApi";

import ID_FIELD from "@salesforce/schema/ServiceAppointment.Id";
import WORK_TYPE_FIELD from "@salesforce/schema/ServiceAppointment.WorkTypeId";
import SCHED_END_FIELD from "@salesforce/schema/ServiceAppointment.SchedEndTime";
import SCHED_START_FIELD from "@salesforce/schema/ServiceAppointment.SchedStartTime";
import APPOINTMENT_NUMBER_FIELD from "@salesforce/schema/ServiceAppointment.AppointmentNumber";
import DURATION from "@salesforce/schema/ServiceAppointment.Duration";
import overrideCSS from "./overrideCSS";
import customLabels from "./labels";

export default class followUpAppointmentMain extends LightningElement {
  // ----------------------------------- slot lwc -----------------------------------------------
  recommendedScore = 80;
  _serviceAppointmentId;

  useDefaultFields = true;
  currentAppointmentDefaultFieldNames = [
    ID_FIELD,
    WORK_TYPE_FIELD,
    SCHED_END_FIELD,
    SCHED_START_FIELD,
    APPOINTMENT_NUMBER_FIELD,
    DURATION
  ];
  // ----------------------------------- variables ---------------------------------------------

  LABELS = customLabels;
  @track record;
  @track fieldsToRecordFormPage1 = [];
  @track fieldsToRecordFormPage2 = [];
  @track fieldsToRecordFormPage3 = [];
  hideNoSetupError = true;
  hideCustomPage1 = true;
  hideCustomPage2 = true;
  hideCustomPage3 = true;
  hideCustomPage4 = true;
  pagesArray = [];
  hideEndPage = true;
  hideHeader = false;
  hideNextButton = false;
  hideBackButton = true;
  getFieldsDefaultValues = false;
  headerCustomPage1;
  headerCustomPage2;
  headerCustomPage3;
  headerSlotsPage = this.LABELS.FollowUpAppointments_SlotsPageTitle;
  listOfFields = [];
  settings;
  recordToCreate;
  @api workerAssignmentOptions;
  currentStepNumber = 1;
  maxStepNumber = 1;
  @api operatingHoursId;
  @api schedulingPolicyId;
  @api schedulingHorizonValue;
  @api schedulingHorizonUnits;
  @api showExactArrivalTime;
  @api showDataSpinner = false;
  numberOfFieldsLoaded = 0;
  newRecordId;
  @api newRecordNumber;

  @api maxDaysToGetAppointmentSlots = 10;

  // ------------------------------------------------------------------------------------------
  // ------------------------------ getter/setter ---------------------------------------------
  // ------------------------------------------------------------------------------------------

  @api get recordId() {
    return this.recordIdRealValue;
  }
  set recordId(recordId) {
    this.record = undefined;
    this.recordIdRealValue = recordId;
  }

  @wire(getRecord, {
    recordId: "$recordId",
    layoutTypes: ["Full"],
    modes: ["View"]
  })
  wiredRecord({ data, error }) {
    if (data) {
      this.record = data;
      this.recordId = data.id;
      this.recordName = data.apiName;
    } else {
      this.record = null;
      console.log("Error while get record is  : " + error);
    }
  }

  get objectApiName() {
    return (this.record && this.record.apiName) || null;
  }

  // ------------------------------------------------------------------------------------------
  // -------------------------------- functions -----------------------------------------------
  // ------------------------------------------------------------------------------------------

  connectedCallback() {
    const myStyle = document.createElement("style");
    myStyle.innerHTML = overrideCSS;
    document.head.appendChild(myStyle);

    this.lockScrolling();
    getSettingsObject({ recordId: this.recordId })
      .then((settings) => {
        if (settings.error || settings.error2) {
          let error = settings.error ? settings.error : settings.error2;
          console.log("Error while retrieving settings object: " + error);
          this.allowScrolling();
        } else {
          console.log("Got settings object successfully");
          this.settings = settings;

          this.operatingHoursId = settings.operatingHoursId;
          this.schedulingPolicyId = settings.schedulingPolicyId;
          this.schedulingHorizonValue = settings.schedulingHorizonValue;
          this.showExactArrivalTime = settings.showExactArrivalTime === "true";
          this.headerCustomPage1 = settings.headerCustomPage1;
          this.headerCustomPage2 = settings.headerCustomPage2;
          this.headerCustomPage3 = settings.headerCustomPage3;
          this.workerAssignmentOptions = settings.workerAssignmentOptions;

          if (
            this.settings.fieldsToShowPage1 === "null" &&
            this.settings.fieldsToShowPage2 === "null" &&
            this.settings.fieldsToShowPage3 === "null"
          ) {
            this.allowScrolling();
            this.hideNoSetupError = false;
            this.hideHeader = true;
            this.hideNextButton = true;
            this.hideBackButton = true;
            console.log(
              "*** We couldn’t launch this action. Ask your admin for help. ***"
            );
          } else {
            for (let index = 1; index < 4; index++) {
              if (this.settings["fieldsToShowPage" + index] !== "null") {
                this.pagesArray.push(index);
                this.settings["fieldsToShowPage" + index]
                  .split(";")
                  .forEach((field) => {
                    if (field.split(",")[0] !== "") {
                      this.listOfFields.push(field);
                      switch (field.split(",")[0]) {
                        case "WorkOrder":
                          this["fieldsToRecordFormPage" + index].push({
                            objectApiName: field.split(",")[0],
                            fieldApiName: field.split(",")[1],
                            recordId: this.recordId
                          });
                          break;
                        case "WorkOrderLineItem":
                          this["fieldsToRecordFormPage" + index].push({
                            objectApiName: field.split(",")[0],
                            fieldApiName: field.split(",")[1],
                            recordId: this.recordId
                          });
                          break;
                        case "ServiceAppointment":
                          this["fieldsToRecordFormPage" + index].push({
                            objectApiName: field.split(",")[0],
                            fieldApiName: field.split(",")[1],
                            recordId: settings.serviceAppointmentId
                          });
                          break;
                        default: {
                          break;
                        }
                      }
                    }
                  });
              }
            }
            this.pagesArray.push(4);
            this.maxStepNumber = this.pagesArray.length;
            this[
              "hideCustomPage" + this.pagesArray[this.currentStepNumber - 1]
            ] = false;
          }
        }
      })
      .catch((error) => {
        console.log("Error while retrieving settings object - ", error);
        this.allowScrolling();
      });
  }

  sleep(ms) {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  callCreateRecordClass(arrivalWindowStartTime, arrivalWindowEndTime) {
    var querySelector = this.template.querySelectorAll("lightning-input-field");
    console.log("-- List of fields to update the new records");
    querySelector.forEach((field) => {
      var index = this.listOfFields.findIndex((i) =>
        i.includes(
          field.parentElement.objectApiName + "," + field.fieldName + ","
        )
      );
      this.listOfFields[index] = this.listOfFields[index] + "," + field.value;
      console.log("-- ", this.listOfFields[index]);
    });

    createRecord({
      recordToCreate: this.settings.recordToCreate,
      recordId: this.recordId,
      listOfFields: this.listOfFields,
      arrivalWindowStartTime: arrivalWindowStartTime,
      arrivalWindowEndTime: arrivalWindowEndTime,
      schedulingHorizonValue: this.schedulingHorizonValue
    })
      .then((newRecord) => {
        if (newRecord.error || newRecord.DML) {
          console.log("-- Error : ", newRecord.error);
          console.log("-- DML : ", newRecord.DML);
        } else if (newRecord.success) {
          this.newRecordId = newRecord.SAId;
          this.newRecordNumber = newRecord.SANumber;
          console.log("-- newRecordId : ", this.newRecordId);
          console.log("-- newRecordNumber : ", this.newRecordNumber);
          this.scheduleSAMethod(this.newRecordId);
        }
      })
      .catch((error) => {
        console.log(
          "-- error while creating record : " + JSON.stringify(error)
        );
        console.log("-- error : ", error);
        this.allowScrolling();
      });
  }

  scheduleSAMethod(newRecordId) {
    try {
      this.template
        .querySelector("c-mobile-appointment-booking-landing")
        .scheduleSAMethod(newRecordId);
    } catch (error) {
      console.log("Error while scheduling SA : " + error.message);
    } finally {
      this.allowScrolling();
    }
  }

  allowScrolling() {
    document.body.style.overflow = "auto";
    this.showDataSpinner = false;
  }
  lockScrolling() {
    document.body.style.overflow = "hidden";
    this.showDataSpinner = true;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------------------- handle ----------------------------------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  handleButtonClick(event) {
    let index = this.currentStepNumber - 1;
    switch (event.target.name) {
      case "nextButton":
        this["hideCustomPage" + this.pagesArray[index]] = true;
        this["hideCustomPage" + this.pagesArray[index + 1]] = false;
        this.currentStepNumber = this.currentStepNumber + 1;
        break;
      case "backButton":
        this["hideCustomPage" + this.pagesArray[index]] = true;
        this["hideCustomPage" + this.pagesArray[index - 1]] = false;
        this.currentStepNumber = this.currentStepNumber - 1;
        break;
      default: {
        break;
      }
    }
    switch (this.currentStepNumber) {
      case 1:
        this.hideNextButton = false;
        this.hideBackButton = true;
        break;
      case this.maxStepNumber:
        this.hideNextButton = true;
        this.hideBackButton = false;
        break;
      default:
        this.hideNextButton = false;
        this.hideBackButton = false;
        break;
    }
  }

  handleSelectedSlot(event) {
    var selectedSlotStart = event.detail.arrivalWindowStartTime;
    var selectedSlotEnd = event.detail.arrivalWindowEndTime;
    this.callCreateRecordClass(selectedSlotStart, selectedSlotEnd);
  }

  handleScheduleCloseWindow() {
    this.hideCustomPage1 = true;
    this.hideCustomPage2 = true;
    this.hideCustomPage3 = true;
    this.hideCustomPage4 = true;
    this.hideEndPage = false;
    this.hideHeader = true;
    this.hideNextButton = true;
    this.hideBackButton = true;
  }

  handleFieldsAreLoaded() {
    // checks if all fields have been added to the DOM
    this.numberOfFieldsLoaded = this.numberOfFieldsLoaded + 1;
    let numberOfFields =
      this.fieldsToRecordFormPage1.length +
      this.fieldsToRecordFormPage2.length +
      this.fieldsToRecordFormPage3.length;
    if (numberOfFields === this.numberOfFieldsLoaded) {
      this.allowScrolling();
    }
  }
}
