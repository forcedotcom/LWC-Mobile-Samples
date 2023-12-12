/* eslint-disable @lwc/lwc/no-dupe-class-members */
/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, track, wire } from "lwc";
import getServiceAppointment from "@salesforce/apex/AppointmentController.getServiceAppointment";
import getSlotsByAssignmentMethod from "@salesforce/apex/AppointmentController.getSlotsByAssignmentMethod";
import getSchedulingPolicyId from "@salesforce/apex/AppointmentController.getSchedulingPolicyId";
import getOperatingHoursId from "@salesforce/apex/AppointmentController.getOperatingHoursId";
import updateSA from "@salesforce/apex/AppointmentController.updateSA";
import scheduleSA from "@salesforce/apex/AppointmentController.scheduleSA";
import updateSASlot from "@salesforce/apex/AppointmentController.updateSASlot";
import cloneWorkOrder from "@salesforce/apex/AppointmentController.cloneWorkOrder";
import deleteClonedAppointmentData from "@salesforce/apex/AppointmentController.deleteClonedAppointmentData";
import isUserExcludedResource from "@salesforce/apex/AppointmentController.isUserExcludedResource";
import convertTimeToOtherTimeZone from "@salesforce/apex/AppointmentController.convertTimeToOtherTimeZone";
import assignCurrentUserAsRequiredResource from "@salesforce/apex/AppointmentController.assignCurrentUserAsRequiredResource";
import customLabels from "./labels";
import { convertDateUTCtoLocal } from "c/mobileAppointmentBookingUtils";
import getUserName from "@salesforce/apex/AppointmentController.getUserName";
import { getRecord, notifyRecordUpdateAvailable } from "lightning/uiRecordApi";
import ARRIVAL_WINDOW_START_FIELD from "@salesforce/schema/ServiceAppointment.ArrivalWindowStartTime";
import ARRIVAL_WINDOW_END_FIELD from "@salesforce/schema/ServiceAppointment.ArrivalWindowEndTime";
import PARENT_RECORD_FIELD from "@salesforce/schema/ServiceAppointment.ParentRecordId";

const fields = [
  ARRIVAL_WINDOW_START_FIELD,
  ARRIVAL_WINDOW_END_FIELD,
  PARENT_RECORD_FIELD
];

const assignmentMethod = {
  ASSIGN_TO_ME: "assignToMe",
  ASSIGN_TO_ANY_AVIALABLE: "assignToAnyAvailable"
};

export default class MobileAppointmentBookingLanding extends LightningElement {
  LABELS = customLabels;
  title = this.LABELS.Reschedule_Appointment_page_title;
  @api serviceAppointmentId;
  previousServiceAppointmentId;
  @track currentAppointmentData;
  @api appointmentFields;
  @api schedulingHorizonValue;
  @api schedulingPolicyId;
  @api showExactArrivalTime;
  @api maxDaysToGetAppointmentSlots;
  selectedHorizonUnit;
  @api operatingHoursId;
  @track selectedDate;
  @api recommendedScore;
  @api userId;
  dummySAid;
  dummyWO;
  getSlotQueryRunning = false;
  clonedWorkOrdersArr = [];
  CustomerFirstName;
  CustomerLastName;
  CustomerPhone;
  ServiceAppointmentStatus;
  CustomerAddress;
  WorkTypeName;
  ArrivalWindowStartTime;
  ArrivalWindowEndTime;
  SchedStartTime;
  SchedEndTime;
  ServiceAppointmentDueDate;
  ServiceAppointmentDescription;
  ServiceResourceId;
  ServiceResourceRole;
  ServiceResourceName;
  serviceAppointmentObject;
  @api timeSlotObject;
  @track isSlots = true;
  @track showCalenderInFullScreen = false;
  headlineDate;
  headlineTime;
  selectedSlotStart;
  selectedSlotEnd;
  showDataSpinner = false;
  inFlowMode = false;
  newAppointmentDate;
  newAppointmentTime;
  _maxValidCalendarDate;
  _minValidCalendarDate;
  @api nonAvailableDateArray = [];
  @api noOfDaysBeforeAfterWeek = 2;
  @api worktypeDisplayname;
  @track compactInfoObj = {};

  show_confirmBtnLayout = false;

  @api get serviceappointmentobject() {
    return this.serviceAppointmentObject;
  }
  set serviceappointmentobject(value) {
    if (value) {
      this.serviceAppointmentObject = value;
      this.customerFirstName = value.CustomerFirstName;
      this.customerLastName = value.CustomerLastName;
      this.CustomerPhone = value.CustomerPhone;
      this.ServiceAppointmentStatus = value.ServiceAppointmentStatus;
      this.CustomerAddress = value.CustomerAddress;
      this.WorkTypeName = value.WorkTypeName;
      this.ArrivalWindowStartTime = value.ArrivalWindowStartTime;
      this.ArrivalWindowEndTime = value.ArrivalWindowEndTime;
      this.SchedStartTime = value.SchedStartTime;
      this.SchedEndTime = value.SchedEndTime;
      this.ServiceAppointmentDescription = value.ServiceAppointmentDescription;
      this.ServiceAppointmentDueDate = value.DueDate;
    }
    this.getHeadlineDate();
  }

  @api get serviceresourceobj() {
    return this.serviceAppointmentObject;
  }
  set serviceresourceobj(value) {
    if (value) {
      this.ServiceResourceId = value.ServiceResourceId;
      this.serviceResourceRole = value.ServiceResourceRole;
      this.ServiceResourceName = value.ServiceResourceName;
    }
  }

  @api get schedulepolicy() {
    return this.schedulePolicyId;
  }
  set schedulepolicy(value) {
    if (value) {
      this.schedulePolicyId = value;
    }
  }

  @api get timeslotobject() {
    return this.timeSlotObject;
  }
  set timeslotobject(value) {
    this.showDataSpinner = false;
    if (value) {
      this.timeSlotObject = value;
    }
  }

  @api get showdataspinner() {
    return this.showDataSpinner;
  }
  set showdataspinner(value) {
    this.showDataSpinner = value;
  }

  @api get maxvaliddate() {
    return this.maxValidCalendarDate;
  }

  set maxvaliddate(value) {
    if (value) {
      this.maxValidCalendarDate = value;
    }
  }

  @api get minValidCalendarDate() {
    return this._minValidCalendarDate;
  }

  set minValidCalendarDate(value) {
    this._minValidCalendarDate = value;
  }

  @api get shownoofdaysbeforeafterweek() {
    return this.noOfDaysBeforeAfterWeek;
  }
  set shownoofdaysbeforeafterweek(value) {
    if (value) {
      this.noOfDaysBeforeAfterWeek = value;
    }
  }

  @api get showexactarrivaltime() {
    return this.showExactArrivalTime;
  }
  set showexactarrivaltime(value) {
    this.showExactArrivalTime = value;
  }

  @api get inflowmode() {
    return this.inFlowMode;
  }
  set inflowmode(value) {
    this.inFlowMode = value;
  }

  @api get worktypename() {
    return this.WorkTypeName;
  }
  set worktypename(value) {
    this.WorkTypeName = value;
  }
  @api get maxValidCalendarDate() {
    return this._maxValidCalendarDate;
  }

  set maxValidCalendarDate(value) {
    this._maxValidCalendarDate = value;
  }

  @api
  get currentAssignmentMethod() {
    return this._currentAssignmentMethod;
  }

  set currentAssignmentMethod(value) {
    this._currentAssignmentMethod = value;
    this.getUserNameForAssignTo();
  }

  set schedulingHorizonUnit(value) {
    this.selectedHorizonUnit = value;
  }
  @api get schedulingHorizonUnit() {
    return this.selectedHorizonUnit;
  }

  @api enableAssignToMe;
  @api enableAssignToEveryAvailable;
  @api isExcluded;
  showMobileWorkerChoice = false;

  serviceTerritoryTimeZone;
  currentSAstatus;
  OriginalArrivalStartDate = null;
  OriginalArrivalEndDate = null;
  dateArrayForQuery = [];
  dateArrayForQueryCurrentMobileWorkwerSlots = [];
  dateArrayForQueryAllMobilesWorkerSlots = [];
  @track timeSlotDateWise;
  timeSlotWiseTemp = [];

  @api schedulingPolicy;
  @api operatingHours;
  @api assignToName;

  ARRIVAL_TIME_TEXT = "Exact Appointment Times";
  ARRIVAL_WINDOW_TEXT = "Arrival Windows";

  BTN_CANCEL_PRESSED = "Cancelled";
  BTN_CONFIRMED_PRESSED = "Confirmed";
  BTN_RESHEDULED_PRESSED = "Rescheduled";

  SCHEDULING_UNIT_DAY = "Days";
  SCHEDULING_UNIT_WEEK = "Weeks";
  SCHEDULING_UNIT_MONTH = "Months";

  constructor() {
    super();
    this.template.addEventListener(
      "onassignmentmethodchanged",
      this.handleCurrentAssignmentMethodChange
    );
    this.isExcluded = false;
  }

  connectedCallback() {
    this._previousServiceAppointmentId = this.serviceAppointmentId;
    this.dataLoaded = false;
    this.prepareInitialDataAndAssignmentData();
    //Get scheduling policy id and operating hours id
    this.getIdFromName();
  }

  renderedCallback() {
    if (this._previousServiceAppointmentId !== this.serviceAppointmentId) {
      console.log(
        "getting new Service appointment:" +
          this.serviceAppointmentId +
          ", previous: " +
          this._previousServiceAppointmentId
      );
      this.dataLoaded = false;
      this.prepareInitialDataAndAssignmentData();
    }
  }

  // Wire a record
  @wire(getRecord, { recordId: "$serviceAppointmentId", fields: fields })
  record;

  calcAssignmentMethod() {
    if (this.enableAssignToMe && this.enableAssignToEveryAvailable) {
      if (this.isExcluded) {
        //Admin enabled both options but Current User is excluded from this Work Order
        this.currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ANY_AVIALABLE;
        this.isCleanupRequired = false;
      } else {
        this.currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ME;
        this.isCleanupRequired = true;
      }

      this.showMobileWorkerChoice = true;
    } else if (!this.enableAssignToMe) {
      this.currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ANY_AVIALABLE;
      this.isCleanupRequired = false;
      this.showMobileWorkerChoice = false;
    } else {
      this.currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ME;
      this.isCleanupRequired = false;
      this.showMobileWorkerChoice = false;
    }
  }

  getInitData() {
    this.lockScrolling();
    this.dataLoaded = false;
    getServiceAppointment({ serviceAppointmentId: this.serviceAppointmentId })
      .then((data) => {
        this.allowScrolling();
        console.log(
          "getInitData Service appointment received::: " + JSON.stringify(data)
        );
        if (data.error) {
          this.dataLoaded = false;
          this.error = data.error;
          console.log("Error in getInitData::: " + JSON.stringify(data.error));
        } else {
          this.currentAppointmentData = JSON.parse(JSON.stringify(data));
          this.updateCompactInfoObj(
            this.currentAppointmentData.WorkTypeName,
            convertDateUTCtoLocal(
              this.currentAppointmentData.ArrivalWindowStartTime
            ),
            convertDateUTCtoLocal(
              this.currentAppointmentData.ArrivalWindowEndTime
            ),
            this.currentAppointmentData.AppointmentNumber
          );
          this.handleDataOnServiceAppointmentRecieved(data);
        }
      })
      .catch((e) => {
        this.allowScrolling();
        this.dataLoaded = false;
        console.log("Error in getInitData::: " + JSON.stringify(e));
      });
  }

  handleDataOnServiceAppointmentRecieved(data) {
    this.error = undefined;
    this.serviceTerritoryTimeZone = data.ServiceTerritoryTimeZone;
    this.currentSAstatus = data.ServiceAppointmentStatus;

    if (data.ArrivalWindowEndTime && data.ArrivalWindowEndTime !== "null") {
      this.OriginalArrivalEndDate = convertDateUTCtoLocal(
        data.ArrivalWindowEndTime
      );
    }
    if (data.ArrivalWindowStartTime && data.ArrivalWindowStartTime !== "null") {
      this.OriginalArrivalStartDate = convertDateUTCtoLocal(
        data.ArrivalWindowStartTime
      );
    }

    this.OriginalEarliestStartDate = convertDateUTCtoLocal(
      data.EarliestStartTime
    );
    this.checkServiceAppointmentStatus(this.currentSAstatus);
    this.serviceAppointmentDueDate = convertDateUTCtoLocal(data.DueDate);
    this.maxValidCalendarDate = this.calculateMaxValidHorizonDate();

    if (data.EarliestStartTime) {
      this.minValidCalendarDate = convertDateUTCtoLocal(
        data.EarliestStartTime.toString()
      );
    } else {
      this.minValidCalendarDate = this.getDateWithoutTime(new Date());
    }

    this.dataLoaded = true;
  }

  createSAObject(data) {
    let appointmentFields = {};
    // eslint-disable-next-line no-unused-expressions
    data.fields &&
      Object.keys(data.fields).forEach((appointmentField) => {
        appointmentFields[appointmentField] = {
          name: appointmentField,
          value:
            data.fields[appointmentField] && data.fields[appointmentField].value
        };
      });

    console.log("createSAObject::: " + JSON.stringify(appointmentFields));
    return appointmentFields;
  }

  checkServiceAppointmentStatus(currentSAStatus) {
    console.log(
      "checkServiceAppointmentStatus => Current: " +
        currentSAStatus +
        " ; confirmed: " +
        this.confirmStatusId +
        " ; rescheduled: " +
        this.rescheduleStatusId +
        "  ;  canceled : " +
        this.cancelStatusId
    );

    if (currentSAStatus === this.cancelStatusId) {
      this.showCancelScreen(true);
    } else if (currentSAStatus === this.confirmStatusId) {
      this.isAppointmentConfirmed = true;
    } else {
      this.isAppointmentConfirmed = false;
    }
    if (!this.allowToConfirmAppt) {
      this.isAppointmentConfirmed = true;
    }
  }

  showCancelScreen(value) {
    this.show_cancelScreen = value;
    this.show_RescheduleAppointmentScreen = !value;
    this.show_ConfirmAppointmentScreen = !value;
  }

  showConfirmScreen(value) {
    this.show_cancelScreen = !value;
    this.show_RescheduleAppointmentScreen = !value;
    this.show_ConfirmAppointmentScreen = value;
  }
  showRescheduleScreen(value) {
    this.show_cancelScreen = !value;
    this.show_RescheduleAppointmentScreen = value;
    this.show_ConfirmAppointmentScreen = !value;
  }

  calculateMaxValidHorizonDate() {
    var currentDate;
    var targetDate;
    if (this.schedulingHorizonValue && this.selectedHorizonUnit) {
      currentDate = new Date();
      let schedulingHorizonValueToNumber = parseInt(
        this.schedulingHorizonValue,
        10
      );
      switch (this.selectedHorizonUnit) {
        case this.SCHEDULING_UNIT_WEEK:
          targetDate = new Date(
            currentDate.setDate(
              currentDate.getDate() + schedulingHorizonValueToNumber * 7
            )
          );
          break;
        case this.SCHEDULING_UNIT_MONTH:
          targetDate = new Date(
            currentDate.setMonth(
              currentDate.getMonth() + schedulingHorizonValueToNumber
            )
          );
          break;
        default: //this.SCHEDULING_UNIT_DAY
          targetDate = new Date(
            currentDate.setDate(
              currentDate.getDate() + schedulingHorizonValueToNumber
            )
          );
      }

      console.log("Scheduling horizon unit : new date is  : " + targetDate);

      if (this.serviceAppointmentDueDate < targetDate)
        return this.serviceAppointmentDueDate;
      return targetDate;
    }
    return this.serviceAppointmentDueDate;
  }

  getDateWithoutTime(date) {
    var d;
    if (typeof val === "string") {
      d = new Date(date.replace(/-/g, "/")); // replace method is use to support time in safari
    } else {
      d = new Date(date);
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  onDateSelected(event) {
    this.selectedDate = event.detail.date;
    console.log("Selected date in main class : " + this.selectedDate);
  }

  getFirstDayOfWeek(date, index) {
    var newDate;
    var start = index >= 0 ? index : 0;
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (start > day ? start - 7 : start);
    d.setDate(diff);
    console.log("First day of week is : " + d.getDate());
    newDate = new Date(
      d.setDate(d.getDate() - this.noOfDaysBeforeAfterWeek)
    ).setHours(0, 0, 0, 0);
    return newDate;
  }

  getLastDayOfWeek(date, index) {
    var newDate;
    var start = index >= 0 ? index : 0;
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (start > day ? start - 1 : 6 + start);
    d.setDate(diff);
    newDate = new Date(
      d.setDate(d.getDate() + this.noOfDaysBeforeAfterWeek)
    ).setHours(0, 0, 0, 0);
    return newDate;
  }

  isInArray(value) {
    let currentDateArray = [];

    if (this.currentAssignmentMethod === assignmentMethod.ASSIGN_TO_ME) {
      currentDateArray = this.dateArrayForQueryCurrentMobileWorkwerSlots;
    } else {
      currentDateArray = this.dateArrayForQueryAllMobilesWorkerSlots;
    }

    for (let i = 0; i < currentDateArray.length; i++) {
      if (value.getTime() === currentDateArray[i].getTime()) {
        return true;
      }
    }
    return false;
  }

  revertSA() {
    updateSA({
      serviceAppointmentId: this.serviceAppointmentId,
      earliestStartDate: this.OriginalEarliestStartDate,
      arrivalStartDate: this.OriginalArrivalStartDate,
      arrivalEndDate: this.OriginalArrivalEndDate
    })
      .then((data) => {
        if (data.success) {
          console.log("Service appointment reverted successfully");
        } else console.log("Error while reverting the service appointment");
      })
      .catch((error) => {
        console.log("Error while reverting the service appointment " + error);
      });
  }

  getLastSlotFromTheArray(slotArray) {
    var timeSlot;
    var lastdate;
    if (slotArray.length > 0) {
      timeSlot = slotArray[slotArray.length - 1].split("#");
      lastdate = this.getDateWithoutTime(
        Date.parse(timeSlot[0].replace(/-/g, "/"))
      );
      console.log("Last Date from the slots is : " + lastdate);
    }
    return lastdate;
  }

  addDatesToCashArray(start, end) {
    var currentDate = start;
    var addingDate;
    var tempDate;
    let currentDateArray = [];

    if (this.currentAssignmentMethod === assignmentMethod.ASSIGN_TO_ME) {
      currentDateArray = this.dateArrayForQueryCurrentMobileWorkwerSlots;
    } else {
      currentDateArray = this.dateArrayForQueryAllMobilesWorkerSlots;
    }

    while (currentDate <= end) {
      addingDate = new Date(currentDate);
      currentDateArray.push(addingDate);
      tempDate = currentDate.setDate(currentDate.getDate() + 1);
      currentDate = new Date(tempDate);
    }

    currentDateArray = Array.from(new Set(currentDateArray));
  }

  removeDatesFromCashArray() {
    if (this.currentAssignmentMethod === assignmentMethod.ASSIGN_TO_ME) {
      this.dateArrayForQueryCurrentMobileWorkwerSlots = [];
    } else {
      this.dateArrayForQueryAllMobilesWorkerSlots = [];
    }
  }

  showAlertWithError(errorMessage) {
    // eslint-disable-next-line no-alert
    alert(errorMessage);
  }

  handleGetSlotQueryForSelectedDate(event) {
    var firstDateOfWeek;
    event.stopPropagation();
    event.preventDefault();
    firstDateOfWeek = this.getFirstDayOfWeek(event.detail.selectedDate);
    if (this.dataLoaded) {
      this.lockScrolling();
      console.log("handleGetSlotQueryForSelectedDate", firstDateOfWeek);
      this.handleGetSlotQueryForSelectedDateRange(firstDateOfWeek);
    }
  }

  handleGetSlotQueryForSelectedDateRange(selectedDate) {
    var firstDateOfWeek;
    var lastDateOfWeek;
    var loopdate;
    this.lockScrolling();
    console.log("handleGetSlotQueryForSelectedDateRange", selectedDate);
    firstDateOfWeek = selectedDate;
    if (firstDateOfWeek <= new Date()) {
      firstDateOfWeek = new Date();
    }
    console.log("handleGetSlotQueryForSelectedDateRange", selectedDate);
    lastDateOfWeek = this.getLastDayOfWeek(firstDateOfWeek, 0);
    if (lastDateOfWeek > this.maxValidCalendarDate) {
      lastDateOfWeek = this.maxValidCalendarDate;
    }
    console.log(
      "First and Last date of the week : " +
        firstDateOfWeek +
        "      " +
        lastDateOfWeek
    );

    loopdate = new Date(firstDateOfWeek);
    loopdate = new Date(this.getDateWithoutTime(loopdate));

    console.log("Date in the Array is : " + loopdate);
    console.log(
      "this.dateArrayForQuery.indexOf(loopdate) + : " +
        loopdate +
        "   and  " +
        this.isInArray(loopdate)
    );

    if (!this.isInArray(loopdate)) {
      console.log("Address is : " + this.street);
      //If the date is not added in cache, run the below code to add it and get fresh slots
      this.addDatesToCashArray(new Date(loopdate), new Date(loopdate));

      console.log(
        "getSlot As Per StartDate :  " +
          loopdate +
          " Minvalid Calendar date : " +
          this.minValidCalendarDate
      );
      if (loopdate < this.minValidCalendarDate) {
        loopdate = new Date(this.minValidCalendarDate.getTime());
      }

      if (loopdate >= this.minValidCalendarDate) {
        console.log("Run appointment query for  date " + loopdate);

        // IF THE DATE IS AFTER ARRIVAL WINDOW START DATE
        console.log("clone sa method called");
        cloneWorkOrder({
          originalSaId: this.serviceAppointmentId,
          startPermitDate: loopdate,
          selectedHorizonValue: this.schedulingHorizonValue,
          dummySA: this.dummySAid,
          dummyWO: this.dummyWO
        })
          .then((saData) => {
            if (saData.dummyServiceAppointmentId) {
              this.lockScrolling();
              this.dummySAid = saData.dummyServiceAppointmentId;
              this.dummyWO = saData.dummyWorkOrderId;
              console.log(
                "clone sa method finished::: sa:" +
                  saData.dummyServiceAppointmentId
              );

              this.sleep(3000).then(() => {
                var lcaletime =
                  Intl.DateTimeFormat().resolvedOptions().timeZone;
                assignCurrentUserAsRequiredResource({
                  serviceAppointmentId: this.dummySAid,
                  currentAssignmentMethod: this.currentAssignmentMethod
                })
                  .then((dataAfterResourceAssignment) => {
                    if (dataAfterResourceAssignment.error) {
                      this.deleteDummySa(this.dummySAid);
                    } else {
                      getSlotsByAssignmentMethod({
                        serviceAppointmentId: this.dummySAid,
                        operatingHoursId: this.operatingHoursId,
                        schedulingPolicyId: this.schedulingPolicyId,
                        arrivalWindowFlag: this.showExactArrivalTime,
                        localetimezone: lcaletime
                      })
                        .then((data) => {
                          console.log(
                            "getSlotsByAssignmentMethod allowScrolling::::"
                          );
                          this.allowScrolling();
                          console.log(
                            "Time zone of the sa is : " + data.timeZone
                          );
                          this.timeZoneOfDummySA = data.timeZone;

                          if (data.error) {
                            console.log(
                              "Error in getting slots : " + data.error
                            );
                            this.showAlertWithError(
                              this.LABELS
                                .Reschedule_Appointment_confirmation_failure_message
                            );
                            this.timeSlotDateWise = [];
                            this.deleteDummySa(
                              saData.dummyServiceAppointmentId
                            );
                          } else {
                            this.timeSlotWiseTemp = data.timeSlotList;
                            this.timeSlotDateWise = this.timeSlotWiseTemp;

                            let tempDate = loopdate.setDate(
                              loopdate.getDate() +
                                this.maxDaysToGetAppointmentSlots
                            );
                            loopdate = new Date(tempDate);
                            console.log(
                              "New Loop date is : " +
                                loopdate +
                                "   and last day of week is : " +
                                lastDateOfWeek
                            );
                            if (loopdate <= lastDateOfWeek) {
                              this.handleGetSlotQueryForSelectedDateRange(
                                loopdate
                              );
                            } else {
                              this.deleteDummySa(
                                saData.dummyServiceAppointmentId
                              );
                            }
                          }
                        })
                        .catch((error) => {
                          this.deleteDummySa(saData.dummyServiceAppointmentId);
                          console.log(
                            "Error while executing FSL API :",
                            +error
                          );
                          this.timeSlotDateWise = [];
                          this.allowScrolling();
                        });
                    }
                  })
                  .catch((error) => {
                    console.log(
                      "Error While assigning current user as required resource: " +
                        error
                    );
                    this.allowScrolling();
                  });
              });
            } else if (saData.error) {
              console.log("Errror while creating dummy SA  :", +saData.error);
              this.timeSlotDateWise = [];
              this.allowScrolling();
            }
          })
          .catch((error) => {
            // delete SA/WO incase transaction fails
            this.deleteDummySa(this.dummyServiceAppointmentId);
            console.log("Errror while creating dummy SA  :", +error);
            this.timeSlotDateWise = [];
            this.allowScrolling();
          });
      } else {
        // IF THE DATE IS BEFORE ARRIVAL WINDOW START DATE
        console.log("Loop date is less than minimum valid date");

        let tempDate = loopdate.setDate(
          loopdate.getDate() + this.maxDaysToGetAppointmentSlots
        );
        loopdate = new Date(tempDate);
        if (loopdate <= lastDateOfWeek) {
          this.handleGetSlotQueryForSelectedDateRange(loopdate);
        } else {
          this.timeSlotDateWise = this.timeSlotWiseTemp;
        }
      }
    } else {
      // If the date are already cache, take the slot from it and run the query for next date;
      let tempDate = loopdate.setDate(
        loopdate.getDate() + this.maxDaysToGetAppointmentSlots
      );
      loopdate = new Date(tempDate);

      if (loopdate <= lastDateOfWeek) {
        this.handleGetSlotQueryForSelectedDateRange(loopdate);
      } else {
        this.timeSlotDateWise = [];
        this.allowScrolling();
      }
    }
  }

  sleep(ms) {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onServiceAppointmentUpdate = (event) => {
    let selectedSlotStart = event.detail.selectedSlotStart;
    let selectedSlotEnd = event.detail.selectedSlotEnd;

    // in case of no Service Territory, skip apex class
    if (this.serviceTerritoryTimeZone) {
      /**
       * CONVERT THE TIME FROM LOCALE TO SERVER
       */
      convertTimeToOtherTimeZone({
        date1: selectedSlotStart,
        date2: selectedSlotEnd,
        targetTimezone: this.serviceTerritoryTimeZone,
        sourceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
        .then((data) => {
          console.log("Date converted from apex is : " + new Date(data.date1));
          console.log("Date converted from apex is : " + new Date(data.date2));
          selectedSlotStart = new Date(data.date1);
          selectedSlotEnd = new Date(data.date2);
          this.UpdateServiceAppointmentFunction(event);
        })
        .catch((error) => {
          console.log("error is : " + error);
        });
    } else {
      this.UpdateServiceAppointmentFunction(event);
    }
  };

  UpdateServiceAppointmentFunction = (event) => {
    let selectedSlotStart = event.detail.selectedSlotStart;
    let selectedSlotEnd = event.detail.selectedSlotEnd;
    let ArrivalWindowStartTime = event.detail.ArrivalWindowStartTime;

    if (
      this.isValidDate(selectedSlotStart) &&
      this.isValidDate(selectedSlotEnd)
    ) {
      if (!ArrivalWindowStartTime || ArrivalWindowStartTime === "null") {
        ArrivalWindowStartTime = "1970-01-01 09:00:00"; //Overwrites null ArrivalWindowStart field
      }
      if (
        selectedSlotStart.getTime() !==
        convertDateUTCtoLocal(ArrivalWindowStartTime).getTime()
      ) {
        this.showSpinnerInChildClass = true;
        console.log("this.selectedSlotStart=" + selectedSlotStart);
        console.log("this.selectedSlotEnd=" + selectedSlotEnd);
        updateSASlot({
          serviceAppointmentId: this.serviceAppointmentId,
          arrivalWindowStartTime: selectedSlotStart,
          arrivalWindowEndTime: selectedSlotEnd
        })
          .then((data) => {
            if (data.error) {
              this.template
                .querySelector(
                  "c-mobile-appointment-booking-scheduling-container"
                )
                .handleSchedulingResponse(false);
            } else {
              // If the transaction Success, run the FSL schedule service
              assignCurrentUserAsRequiredResource({
                serviceAppointmentId: this.serviceAppointmentId,
                currentAssignmentMethod: this.currentAssignmentMethod
              })
                .then((requiresResourceAssignmentResults) => {
                  if (requiresResourceAssignmentResults.error) {
                    console.log("error");
                  } else {
                    scheduleSA({
                      serviceAppointmentId: this.serviceAppointmentId,
                      schedulingPolicyId: this.schedulingPolicyId,
                      userId: this.userId
                    })
                      .then((scheduleData) => {
                        if (scheduleData.error) {
                          console.log(
                            "Error while executing FSL API : " +
                              "  " +
                              JSON.stringify(scheduleData.error)
                          );
                          this.template
                            .querySelector(
                              "c-mobile-appointment-booking-scheduling-container"
                            )
                            .handleSchedulingResponse(false);
                        } else {
                          console.log(
                            "Service appointment Scheduled : " +
                              JSON.stringify(scheduleData)
                          );
                          this.isAppointmentConfirmed = true;
                          // Update Data After successfull booking
                          this.updateCompactInfoAfterReschedule(
                            selectedSlotStart,
                            selectedSlotEnd
                          );
                          this.template
                            .querySelector(
                              "c-mobile-appointment-booking-scheduling-container"
                            )
                            .handleSchedulingResponse(true);

                          notifyRecordUpdateAvailable([
                            { recordId: this.serviceAppointmentId }
                          ]);
                        }
                      })
                      .catch((error) => {
                        this.revertSA();
                        console.log(
                          "Error while executing FSL API : " +
                            "  " +
                            JSON.stringify(error)
                        );
                        this.template
                          .querySelector(
                            "c-mobile-appointment-booking-scheduling-container"
                          )
                          .handleSchedulingResponse(false);
                      });
                  }
                })
                .catch((error) => {
                  this.revertSA();
                  console.log(
                    "Error while executing FSL API : " +
                      "  " +
                      JSON.stringify(error)
                  );
                  this.template
                    .querySelector(
                      "c-mobile-appointment-booking-scheduling-container"
                    )
                    .handleSchedulingResponse(false);
                });
            }
          })
          .catch((error) => {
            console.log(
              this.LABELS
                .Reschedule_Appointment_toastMessage_reschedule_appointment_fail_message +
                "  " +
                error
            );
            this.template
              .querySelector(
                "c-mobile-appointment-booking-scheduling-container"
              )
              .handleSchedulingResponse(false);
          });
      } else {
        this.template
          .querySelector("c-mobile-appointment-booking-scheduling-container")
          .handleSchedulingResponse(false);
      }
    } else {
      console.log("Invalid date time ");
      this.template
        .querySelector("c-mobile-appointment-booking-scheduling-container")
        .handleSchedulingResponse(false);
    }
  };

  isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  onWeekChangeEvent(event) {
    this.selectedDate = event.detail.date;
    console.log("On week change called");
    this.template
      .querySelector("c-mobile-appointment-booking-slots-container")
      .onWeekUpdated(this.selectedDate);
    this.runApexQueryToChangeEarlistStartDate(this.selectedDate);
  }

  onSlotSelection(event) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedSlotStart = event.detail.startDate;
    this.selectedSlotEnd = event.detail.endDate;
    this.setNewAppointmentSelectedText(
      event.detail.startDate,
      event.detail.endDate
    );
  }

  onCustomEventCalled(event) {
    event.preventDefault();
    switch (event.detail.name) {
      case "trigergetslotapi": {
        this.runApexQueryToChangeEarlistStartDate(event.detail.value);
        break;
      }
      case "updateNonAvailableDates": {
        this.nonAvailableDateArray = event.detail.value;
        console.log(
          "Array of the date not available : " +
            this.nonAvailableDateArray.length
        );
        break;
      }
      default: {
        break;
      }
    }
  }

  getHeadlineDate() {
    const dateOptions = { weekday: "long", month: "long", day: "numeric" };
    var startDate;
    var endDate;
    var dateLong;
    var time;
    if (this.ArrivalWindowStartTime === "null" || this.showExactArrivalTime) {
      startDate = convertDateUTCtoLocal(this.SchedStartTime);
      endDate = convertDateUTCtoLocal(this.SchedEndTime);
    } else {
      startDate = this.ArrivalWindowStartTime;
      endDate = convertDateUTCtoLocal(this.ArrivalWindowEndTime);
    }
    if (startDate && endDate) {
      dateLong = startDate.toLocaleDateString(undefined, dateOptions);
      time =
        this.getFormattedTimeFromDate(startDate) +
        " - " +
        this.getFormattedTimeFromDate(endDate);
      if (this.showExactArrivalTime) {
        time = this.getFormattedTimeFromDate(startDate);
      }
      this.headlineDate = dateLong;
      this.headlineTime = time;
    }
  }

  getFormattedTimeFromDate(date) {
    // method to format the time digits
    var tempDate = new Date(date);
    var hours = tempDate.getHours();
    var minutes = tempDate.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  }

  runApexQueryToChangeEarlistStartDate(selectedDate) {
    const customEvent = new CustomEvent("getslotexecuted", {
      detail: { selectedDate: selectedDate }
    });
    this.dispatchEvent(customEvent);
  }

  /**
   * SAVE ALL VALUES AFTER SELECTING THE SLOT
   */
  position;
  setNewAppointmentSelectedText(start, end) {
    const dateOptions = { weekday: "long", month: "long", day: "numeric" };
    var dateLong = start.toLocaleDateString(undefined, dateOptions);
    var time =
      this.getFormattedTimeFromDate(start) +
      " - " +
      this.getFormattedTimeFromDate(end);
    if (this.showExactArrivalTime) {
      time = this.getFormattedTimeFromDate(start);
    }
    this.newAppointmentDate = dateLong;
    this.newAppointmentTime = time;
    this.show_confirmBtnLayout = true;
    // lock scrolling
    document.body.style.overflow = "hidden";
  }

  handleConfirmBtnClose() {
    this.show_confirmBtnLayout = false;
    // allow scrolling
    document.body.style.overflow = "auto";
  }

  handleCurrentAssignmentMethodChange = (event) => {
    this.lockScrolling();
    const updatedValue = event.detail.assignmentMethod;
    const selectedDate = event.detail.selecteddate;

    this.currentAssignmentMethod = assignmentMethod[updatedValue];

    //dispatch get Slots
    let firstDateOfWeek = this.getFirstDayOfWeek(selectedDate);

    this.template
      .querySelector("c-mobile-appointment-booking-scheduling-container")
      .clearSlotsAfterAssignmentMethodChange(this.currentAssignmentMethod);
    //clone and get slots

    console.log(
      "Calling handleGetSlotQueryForSelectedDateRange after assignment method change::: existing dummy- " +
        this.dummySAid
    );
    this.handleGetSlotQueryForSelectedDateRange(firstDateOfWeek);
  };

  deleteDummySa(dummySaId) {
    console.log(
      "deleteDummySa begins :::  Dummy Service Appointment: " + dummySaId
    );
    this.lockScrolling();
    deleteClonedAppointmentData({ clonedServiceAppointmentId: dummySaId })
      .then((data) => {
        this.allowScrolling();
        if (data) {
          console.log(
            "deleteClonedAppointmentData response ::::" +
              JSON.stringify(data, null, 2)
          );
          this.dummySAid = null;
          this.dummyWO = null;
        }
      })
      .catch((error) => {
        this.allowScrolling();
        console.log(
          "There was a problem deleting the SA" + JSON.stringify(error)
        );
      });
  }

  prepareInitialDataAndAssignmentData() {
    isUserExcludedResource({
      userId: this.userId,
      serviceAppointmentId: this.serviceAppointmentId
    })
      .then((data) => {
        if (data.success) {
          console.log(
            "isUserExcludedResource response received userIsExcluded::: " +
              data.success
          );
          this.isExcluded = data.success;
        } else {
          console.log("Error in isUserExcludedResource ::: ");
          this.isExcluded = false;
        }
      })
      .catch((e) => {
        this.isExcluded = false;
        console.log("Error in isUserExcludedResource ::: " + JSON.stringify(e));
      })
      .finally(() => {
        this.calcAssignmentMethod();
        this.getInitData();
        this.selectedDate = new Date();
      });
  }

  allowScrolling() {
    document.body.style.overflow = "auto";
    this.showDataSpinner = false;
  }
  lockScrolling() {
    document.body.style.overflow = "hidden";
    this.showDataSpinner = true;
  }

  getIdFromName() {
    if (this.schedulingPolicy) {
      getSchedulingPolicyId({ schedulingPolicyName: this.schedulingPolicy })
        .then((data) => {
          this.schedulingPolicyId = data;
        })
        .catch((e) => {
          console.log("Error in getSchedulingPolicyId: " + JSON.stringify(e));
        });
    } else {
      console.log(
        "schedulingPolicy is undefined, getSchedulingPolicyId not called"
      );
    }

    if (this.operatingHours) {
      getOperatingHoursId({ operatingHoursName: this.operatingHours })
        .then((data) => {
          this.operatingHoursId = data;
        })
        .catch((e) => {
          console.log("Error in getOperatingHoursId: " + JSON.stringify(e));
        });
    } else {
      console.log(
        "operatingHours is undefined, getOperatingHoursId not called"
      );
    }
  }

  getUserNameForAssignTo() {
    getUserName({ userId: this.userId })
      .then((data) => {
        if (data.error) {
          console.log("error in getUserName: " + JSON.stringify(data.error));
        } else {
          this.userName = data;
          this.error = undefined;
          console.log("UserName from getUserName :" + data);
          this.setAssigNameByAssignMethod();
        }
      })
      .catch((error) => {
        console.log("error in getUserName: " + JSON.stringify(error));
      });
  }

  setAssigNameByAssignMethod() {
    if (this._currentAssignmentMethod) {
      if (this._currentAssignmentMethod === assignmentMethod.ASSIGN_TO_ME) {
        this.assignToName =
          this.LABELS.Reschedule_Appointment_assigned_to_you.replace(
            "{0}",
            this.userName
          );
      } else {
        this.assignToName =
          this.LABELS.Reschedule_Appointment_assigned_to_any_available_worker;
      }
    }
  }

  updateCompactInfoAfterReschedule(selectedSlotStart, selectedSlotEnd) {
    this.updateCompactInfoObj(
      this.currentAppointmentData.WorkTypeName,
      selectedSlotStart,
      selectedSlotEnd,
      this.currentAppointmentData.AppointmentNumber
    );
  }

  updateCompactInfoObj(workTypeName, startDate, endDate, appointmentNumber) {
    let compactInfo = {};

    if (this.showExactArrivalTime) {
      compactInfo = {
        workTypeName,
        startDate,
        endDate: null,
        appointmentNumber
      };
    } else {
      compactInfo = {
        workTypeName,
        startDate,
        endDate,
        appointmentNumber
      };
    }

    this.compactInfoObj = JSON.parse(JSON.stringify(compactInfo));
  }
}
