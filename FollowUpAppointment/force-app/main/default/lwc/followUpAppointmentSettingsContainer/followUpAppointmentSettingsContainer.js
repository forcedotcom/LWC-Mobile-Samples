/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable no-unused-expressions */
import { LightningElement, track, api } from "lwc";
import getSchedulingPolicyList from "@salesforce/apex/FollowUpAppointmentController.getSchedulingPolicyList";
import getOperatingHoursList from "@salesforce/apex/FollowUpAppointmentController.getOperatingHoursList";
import saveSettings from "@salesforce/apex/FollowUpAppointmentController.saveSettings";
import getConfigurationData from "@salesforce/apex/FollowUpAppointmentController.getConfigurationData";
import checkPermSetAssignedToUser from "@salesforce/apex/FollowUpAppointmentController.checkPermSetAssignedToUser";

import customLabels from "./labels";

export default class followUpAppointmentSettingsContainer extends LightningElement {
  @track objectList = [];
  LABELS = customLabels;
  @track operatingHourList = [];
  @track slotDisplayOptions = [];
  @api technicianAssigmentSelected = "";
  showDialogBox = false;
  @track showWOSAoption = false;
  @track showWOLISAoption = false;
  @api reloadChildComponent = false;
  @api hasUnsavedChanges = false;

  arrival_window = this.LABELS.FollowUpAppointments_arriwal_window_title;
  exact_appointment_time =
    this.LABELS.FollowUpAppointments_exact_appointment_time_title;

  @api schedulingPolicySelected;
  @api operatingHoursSelected;
  @api appointmentSlotOptionSelected;
  @api schedulingHorizonUnits;
  dataLoaded;

  @api savedOH;
  @api savedSP;
  @api savedAppointmentSlotSelected;
  @api savedSchedulingHorizonUnits;
  @api savedTechnicianAssignment;
  @api savedObjectCreation;

  isCreateWorkOrderEnabled = false;
  isCreateWorkOrderLineItemEnabled = false;
  isCreateSAenabled = false;
  disableSaveButton = true;

  connectedCallback() {
    this.callAPEX();
  }

  callAPEX() {
    console.log("Apex method called ");

    /**
     * GET scheduling Policy
     */
    this.dataLoaded = false;
    this.objectList = [];
    getSchedulingPolicyList()
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        } else {
          for (let i = 0; i < data.length; i++) {
            this.objectList = [
              ...this.objectList,
              { value: data[i], label: data[i] }
            ];
          }
          this.dataLoaded = true;
        }
      })
      .catch((error) => {
        console.error("Error while getting scheduling policy : " + error);
      });

    this.operatingHourList = [];
    getOperatingHoursList()
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        } else {
          for (let i = 0; i < data.length; i++) {
            this.operatingHourList = [
              ...this.operatingHourList,
              { value: data[i], label: data[i] }
            ];
          }
          this.dataLoaded = true;
        }
      })
      .catch((error) => {
        console.log("Error while getting scheduling policy : " + error);
      });

    this.slotDisplayOptions = [];
    this.slotDisplayOptions = [
      ...this.slotDisplayOptions,
      { value: this.arrival_window, label: this.arrival_window }
    ];
    this.slotDisplayOptions = [
      ...this.slotDisplayOptions,
      { value: this.exact_appointment_time, label: this.exact_appointment_time }
    ];

    /**
     * Function to reload the settings from followup custom object
     */

    checkPermSetAssignedToUser()
      .then((data) => {
        if (data.error) {
          console.error("Error while assigning permission set " + data.error);
        } else {
          // if permission is assigned , get the configuration data.
          this.loadConfigurationDetails();
        }
      })
      .catch((error) => {
        console.log("Error while retrieving settings object - ", error);
      });
  }

  loadConfigurationDetails() {
    this.dataLoaded = false;
    getConfigurationData()
      .then((settings) => {
        if (settings.error) {
          console.error(
            "Error while retrieving settings object " + settings.error
          );
          this.validateSaveButton();
        } else if (settings.null) {
          // No record found
          this.disableSaveButton = true;
          console.error(
            "Got settings object successfully, No record found in SDB"
          );
        } else {
          console.log("Got settings object successfully");

          this.operatingHoursSelected = this.savedOH =
            settings.operatingHoursName;
          this.schedulingPolicySelected = this.savedSP =
            settings.schedulingPolicyName;
          this.schedulingHorizonUnits = this.savedSchedulingHorizonUnits =
            settings.schedulingHorizonValue;
          console.log(
            "Show exact arrival time is : " + settings.showExactArrivalTime
          );

          if (settings.showExactArrivalTime === "true") {
            this.appointmentSlotOptionSelected = this.exact_appointment_time;
          } else {
            this.appointmentSlotOptionSelected = this.arrival_window;
          }
          this.savedAppointmentSlotSelected =
            this.appointmentSlotOptionSelected;

          // assignment permission
          this.technicianAssigmentSelected = this.savedTechnicianAssignment =
            settings.Technician_Assigment__c;

          const myArray = settings.objectsToCreate.split(",");
          this.objectCreationAllowed = this.savedObjectCreation = myArray[0];
          console.log("1st array object is : " + this.objectCreationAllowed);
          myArray[0] === "workOrder"
            ? (this.showWOSAoption = true)
            : (this.showWOSAoption = false);
          myArray[0] === "workOrderLineItem"
            ? (this.showWOLISAoption = true)
            : (this.showWOLISAoption = false);

          if (myArray.length > 1 && myArray[1].length > 0) {
            myArray[0] === "workOrder"
              ? (this.isSAWOselected = true)
              : (this.isSAWOLIselected = true);
          }
          this.validateSaveButton();
          this.dataLoaded = true;
        }
      })
      .catch((error) => {
        console.log("Error while retrieving settings object - ", error);
      });
  }

  get assignmentPermissionOptions() {
    return [
      {
        label:
          this.LABELS
            .FollowUpAppointments_MobileWorkerAsignTo_themselves_or_anyWorker,
        value: "1"
      },
      {
        label: this.LABELS.FollowUpAppointments_MobileWorkerAsignTo_any_worker,
        value: "2"
      },
      {
        label: this.LABELS.FollowUpAppointments_MobileWorkerAsignTo_themselves,
        value: "3"
      }
    ];
  }

  get workOrderOption() {
    return [
      {
        label: this.LABELS.FollowUpAppointments_objectName_WorkOrder,
        value: "WorkOrder"
      }
    ];
  }

  get serviceAppointmentOption() {
    return [
      {
        label: this.LABELS.FollowUpAppointments_objectName_ServiceAppointment,
        value: "ServiceAppointment"
      }
    ];
  }

  get workOrderLineItemOption() {
    return [
      {
        label: this.LABELS.FollowUpAppointments_objectName_WorkOrderLineItem,
        value: "WorkOrderLineItem"
      }
    ];
  }

  onAssignementPermissionChange(event) {
    this.selectedAssigmentPermission = event.target.value;
    this.savedTechnicianAssignment !== this.selectedAssigmentPermission
      ? (this.hasUnsavedChanges = true)
      : (this.hasUnsavedChanges = false);
    this.technicianAssigmentSelected = event.target.value;
    this.validateSaveButton();
  }

  // onCreateObjectPerChange(event) {
  //     var value = event.target.value;
  //     console.log("Selected check box is : "+value);
  //     if(value === "WorkOrder") {
  //         this.isCreateWorkOrderEnabled = event.target.checked;
  //     } else if(value === "WorkOrderLineItem") {
  //         this.isCreateWorkOrderLineItemEnabled = event.target.checked;
  //     } else if(value === "ServiceAppointment") {
  //         this.isCreateSAenabled = event.target.checked;
  //     }
  // }

  objectCreationAllowed = "";
  onMobileUserObjectSelected(event) {
    const option = event.target.value;
    console.log("OnMobile user object selected : " + option);
    this.objectCreationAllowed = option;
    this.savedObjectCreation !== this.objectCreationAllowed
      ? (this.hasUnsavedChanges = true)
      : (this.hasUnsavedChanges = false);
    this.validateSaveButton();
  }

  isSAWOselected = false;
  isSAWOLIselected = false;
  handleSAforWO(event) {
    this.isSAWOselected = event.target.checked;
  }
  handleSAforWOLI(event) {
    this.isSAWOLIselected = event.target.checked;
  }

  @api handleSaveEvent() {
    console.log("Save event executed");

    let arr = [];
    arr.push(this.schedulingPolicySelected); // 0
    arr.push(this.operatingHoursSelected); // 1
    if (this.appointmentSlotOptionSelected === this.exact_appointment_time) {
      arr.push(true); // 2
    } else {
      arr.push(false); //2
    }

    arr.push(this.schedulingHorizonUnits); // 3

    let objectAllowedToBeCreated = "";

    this.objectCreationAllowed === "ServiceAppointment"
      ? (objectAllowedToBeCreated =
          objectAllowedToBeCreated + "ServiceAppointment")
      : objectAllowedToBeCreated;

    if (this.objectCreationAllowed === "WorkOrder") {
      objectAllowedToBeCreated = objectAllowedToBeCreated + "WorkOrder";
    }
    if (this.objectCreationAllowed === "WorkOrderLineItem") {
      objectAllowedToBeCreated = objectAllowedToBeCreated + "WorkOrderLineItem";
    }

    arr.push(objectAllowedToBeCreated); // 4
    arr.push(this.technicianAssigmentSelected); //5

    // create object perm for technician

    arr.push(objectAllowedToBeCreated); //6

    saveSettings({ inputArr: arr })
      .then((data) => {
        if (data.error) {
          console.error("Got error while saving the data : " + data);
          throw new Error(data.error);
        } else {
          console.log("saved successfully");
          this.showToastMessages(
            this.LABELS.FollowUpAppointments_settingPage_save_message,
            this.successVariant
          );
          this.reloadChildComponent = true;
          this.hasUnsavedChanges = false;
          this.disableSaveButton = true;
          this.callAPEX(); // call this function to ensure all variables are loaded again after save
        }
      })
      .catch((error) => {
        console.log("Error while getting scheduling policy : " + error);
        this.showToastMessages(
          this.LABELS.FollowUpAppointments_settingPage_error_message +
            " : " +
            error.message,
          this.errorVariant
        );
      });
  }

  /**
   *
   * Reload the screen when cancel event is called
   */
  @api handleCancelEvent() {
    this.callAPEX();
  }

  handleTabChangeEvent() {
    if (this.hasUnsavedChanges) {
      this.showToastMessages(
        this.LABELS.FollowUpAppointments_settingPage_warning_message,
        this.warningVariant
      );
    }
    this.reloadChildComponent
      ? (this.reloadChildComponent = false)
      : (this.reloadChildComponent = true);
    console.log("Lightning tab value changed");
  }

  handleSchedulingPolicyChange(event) {
    this.schedulingPolicySelected = event.detail.value;
    this.savedSP !== this.schedulingPolicySelected
      ? (this.hasUnsavedChanges = true)
      : (this.hasUnsavedChanges = false);
    this.validateSaveButton();
  }

  handleOperatingHoursChange(event) {
    this.operatingHoursSelected = event.detail.value;
    this.savedOH !== this.operatingHoursSelected
      ? (this.hasUnsavedChanges = true)
      : (this.hasUnsavedChanges = false);
    this.validateSaveButton();
  }

  handleAppointmentSlotSelectionChange(event) {
    this.appointmentSlotOptionSelected = event.detail.value;
    this.savedAppointmentSlotSelected !== this.appointmentSlotOptionSelected
      ? (this.hasUnsavedChanges = true)
      : (this.hasUnsavedChanges = false);
    this.validateSaveButton();
  }

  onSchedulingHorizonValueChange(event) {
    this.schedulingHorizonUnits = event.detail.value;
    let nameCmp = this.template.querySelector(".horizonInputField");

    // check if the entered value is numeric
    let regexPattern = /^-?[0-9]+$/;
    let result = regexPattern.test(this.schedulingHorizonUnits);
    if (event.detail.value && result) {
      nameCmp.setCustomValidity("");
    } else {
      nameCmp.setCustomValidity("Enter a number.");
    }
    this.savedSchedulingHorizonUnits !== this.schedulingHorizonUnits
      ? (this.hasUnsavedChanges = true)
      : (this.hasUnsavedChanges = false);
    this.validateSaveButton();
  }

  @api successVariant = "success";
  @api errorVariant = "error";
  @api warningVariant = "warning";

  showToastMessages(message, variant) {
    this.template
      .querySelector("c-follow-up-appointment-custom-toast-notifications")
      .showToast(variant, message);
  }

  closeDialog() {
    this.showDialogBox = false;
  }

  validateSaveButton() {
    if (
      this.schedulingPolicySelected &&
      this.operatingHoursSelected &&
      this.appointmentSlotOptionSelected &&
      this.objectCreationAllowed &&
      this.technicianAssigmentSelected &&
      this.schedulingHorizonUnits
    ) {
      if (
        this.schedulingPolicySelected === this.savedSP &&
        this.operatingHoursSelected === this.savedOH &&
        this.appointmentSlotOptionSelected ===
          this.savedAppointmentSlotSelected &&
        this.objectCreationAllowed === this.savedObjectCreation &&
        this.technicianAssigmentSelected === this.savedTechnicianAssignment &&
        this.schedulingHorizonUnits === this.savedSchedulingHorizonUnits
      ) {
        this.disableSaveButton = true;
      } else {
        this.disableSaveButton = false;
      }
    } else {
      this.disableSaveButton = true;
    }
  }
}
