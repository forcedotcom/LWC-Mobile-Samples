import { LightningElement, api, track } from "lwc";
import getServiceAppointment from "@salesforce/apex/AppointmentController.getServiceAppointment";
import updateAppointmentStatus from "@salesforce/apex/AppointmentController.updateServiceAppointmentStatus";
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
import customLabels from "./labels";
import { formatAppointmentDateandHourRange } from "c/mobileAppointmentBookingUtils";

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
  @api useDefaultFields;
  @api schedulingHorizonValue;
  @api schedulingPolicyId;
  @api showExactArrivalTime;
  @api maxDaysToGetAppointmentSlots;
  selectedHorizonUnit;
  @api operatingHoursId;
  _showModal = 0;
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
  @track selectedDate;
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
  maxValidCalendarDate;
  minValidCalendarDate;
  @api nonAvailableDateArray = [];
  @api noOfDaysBeforeAfterWeek = 2;
  @api worktypeDisplayname;

  show_confirmBtnLayout = false;

  @api get serviceappointmentobject() {
    return this.serviceAppointmentObject;
  }
  set serviceappointmentobject(value) {
    this.selectedDate = new Date();
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
  get showModal() {
    return this._showModal;
  }

  set showModal(value) {
    this._showModal = value;
  }

  @api
  get currentAssignmentMethod() {
    return this._currentAssignmentMethod;
  }

  set currentAssignmentMethod(value) {
    this._currentAssignmentMethod = value;
  }

  @api get showAssignmentMethodToggle() {
    return this.enableAssignToMe && this.enableAssignToEveryAvailable;
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
  OriginalArrivalEndDate;
  OriginalArrivalStartDate = null;
  OriginalArrivalEndDate = null;
  dateArrayForQuery = [];
  dateArrayForQueryCurrentMobileWorkwerSlots = [];
  dateArrayForQueryAllMobilesWorkerSlots = [];
  @track timeSlotDateWise;
  timeSlotWiseTemp = [];
  selectedSlotStringForToast = "";

  //Toast
  @track showToast = false;
  toastVariant = "success";
  toastTitle = "";
  toastMessage = "";
  @api schedulingPolicy;
  @api operatingHours;

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
    this.template.addEventListener("closemodal", this.closeModal);
    this.template.addEventListener("openmodal", this.openModal);
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
    if (this._previousServiceAppointmentId != this.serviceAppointmentId) {
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
    } else {
      this.currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ME;
      this.isCleanupRequired = false;
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
    let firstDateOfWeek;
    this.currentAppointmentData = JSON.parse(JSON.stringify(data));
    this.error = undefined;
    this.serviceTerritoryTimeZone = data.ServiceTerritoryTimeZone;
    this.currentSAstatus = data.ServiceAppointmentStatus;

    if (data.ArrivalWindowEndTime && data.ArrivalWindowEndTime !== "null") {
      this.OriginalArrivalEndDate = this.convertDateUTCtoLocal(
        data.ArrivalWindowEndTime
      );
    }
    if (data.ArrivalWindowStartTime && data.ArrivalWindowStartTime !== "null") {
      this.OriginalArrivalStartDate = this.convertDateUTCtoLocal(
        data.ArrivalWindowStartTime
      );
    }

    this.OriginalEarliestStartDate = this.convertDateUTCtoLocal(
      data.EarliestStartTime
    );
    this.checkServiceAppointmentStatus(this.currentSAstatus);
    this.serviceAppointmentDueDate = this.convertDateUTCtoLocal(data.DueDate);
    this.maxValidCalendarDate = this.calculateMaxValidHorizonDate();

    if (data.EarliestStartTime) {
      this.minValidCalendarDate = this.convertDateUTCtoLocal(
        data.EarliestStartTime.toString()
      );
    } else {
      this.minValidCalendarDate = this.getDateWithoutTime(new Date());
    }

    this.dataLoaded = true;
  }

  createSAObject(data) {
    let appointmentFields = {};
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

  openModal(event) {
    event.preventDefault();
    this.showModal = 1;
  }

  closeModal(event) {
    event.preventDefault();
    this.showModal = 0;
  }

  onCustomEventCalled(event) {
    console.log("customEvent handled from lp");
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
    if (this.schedulingHorizonValue && this.selectedHorizonUnit) {
      var currentDate = new Date();
      var targetDate;
      let schedulingHorizonValueToNumber = parseInt(
        this.schedulingHorizonValue
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
      else return targetDate;
    } else {
      return this.serviceAppointmentDueDate;
    }
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
    var start = index >= 0 ? index : 0;
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (start > day ? start - 7 : start);
    d.setDate(diff);
    console.log("First day of week is : " + d.getDate());
    var newDate = new Date(
      d.setDate(d.getDate() - this.noOfDaysBeforeAfterWeek)
    ).setHours(0, 0, 0, 0);
    return newDate;
  }

  getLastDayOfWeek(date, index) {
    var start = index >= 0 ? index : 0;
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (start > day ? start - 1 : 6 + start);
    d.setDate(diff);
    var newDate = new Date(
      d.setDate(d.getDate() + this.noOfDaysBeforeAfterWeek)
    ).setHours(0, 0, 0, 0);
    return newDate;
  }

  isInArray(value) {
    let currentDateArray = [];

    if (this.currentAssignmentMethod == assignmentMethod.ASSIGN_TO_ME) {
      currentDateArray = this.dateArrayForQueryCurrentMobileWorkwerSlots;
    } else {
      currentDateArray = this.dateArrayForQueryAllMobilesWorkerSlots;
    }

    for (var i = 0; i < currentDateArray.length; i++) {
      if (value.getTime() == currentDateArray[i].getTime()) {
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
    var lastdate;
    if (slotArray.length > 0) {
      var timeSlot = slotArray[slotArray.length - 1].split("#");
      lastdate = this.getDateWithoutTime(
        Date.parse(timeSlot[0].replace(/-/g, "/"))
      );
      console.log("Last Date from the slots is : " + lastdate);
    }
    return lastdate;
  }

  addDatesToCashArray(start, end) {
    var currentDate = start;
    let currentDateArray = [];

    if (this.currentAssignmentMethod == assignmentMethod.ASSIGN_TO_ME) {
      currentDateArray = this.dateArrayForQueryCurrentMobileWorkwerSlots;
    } else {
      currentDateArray = this.dateArrayForQueryAllMobilesWorkerSlots;
    }

    while (currentDate <= end) {
      var addingDate = new Date(currentDate);
      currentDateArray.push(addingDate);
      var tempDate = currentDate.setDate(currentDate.getDate() + 1);
      currentDate = new Date(tempDate);
    }

    currentDateArray = Array.from(new Set(currentDateArray));
  }

  removeDatesFromCashArray() {
    if (this.currentAssignmentMethod == assignmentMethod.ASSIGN_TO_ME) {
      this.dateArrayForQueryCurrentMobileWorkwerSlots = [];
    } else {
      this.dateArrayForQueryAllMobilesWorkerSlots = [];
    }
  }

  showAlertWithError(errorMessage) {
    alert(errorMessage);
  }

  handleGetSlotQueryForSelectedDate(event) {
    event.stopPropagation();
    event.preventDefault();
    var firstDateOfWeek = this.getFirstDayOfWeek(event.detail.selectedDate);
    if (this.dataLoaded) {
      this.lockScrolling();
      console.log("handleGetSlotQueryForSelectedDate", firstDateOfWeek);
      this.handleGetSlotQueryForSelectedDateRange(firstDateOfWeek);
    }
  }

  handleGetSlotQueryForSelectedDateRange(selectedDate) {
    this.lockScrolling();
    console.log("handleGetSlotQueryForSelectedDateRange", selectedDate);
    var firstDateOfWeek = selectedDate;
    if (firstDateOfWeek <= new Date()) {
      firstDateOfWeek = new Date();
    }
    console.log("handleGetSlotQueryForSelectedDateRange", selectedDate);
    var lastDateOfWeek = this.getLastDayOfWeek(firstDateOfWeek, 0);
    if (lastDateOfWeek > this.maxValidCalendarDate) {
      lastDateOfWeek = this.maxValidCalendarDate;
    }
    console.log(
      "First and Last date of the week : " +
        firstDateOfWeek +
        "      " +
        lastDateOfWeek
    );

    var loopdate = new Date(firstDateOfWeek);
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
        loopdate = this.minValidCalendarDate;
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
                console.log("getSlots method called");
                getSlotsByAssignmentMethod({
                  serviceAppointmentId: saData.dummyServiceAppointmentId,
                  operatingHoursId: this.operatingHoursId,
                  schedulingPolicyId: this.schedulingPolicyId,
                  arrivalWindowFlag: this.showExactArrivalTime,
                  userId: this.userId,
                  currentAssignmentMethod: this.currentAssignmentMethod,
                  cleanupRequired: this.isCleanupRequired,
                  localetimezone: lcaletime
                })
                  .then((data) => {
                    console.log(
                      "getSlotsByAssignmentMethod allowScrolling::::"
                    );
                    this.allowScrolling();
                    console.log("Time zone of the sa is : " + data.timeZone);
                    this.timeZoneOfDummySA = data.timeZone;

                    if (data.error) {
                      console.log("Error in getting slots : " + data.error);
                      this.showAlertWithError(
                        this.LABELS
                          .AppointmentAssistance_confirmation_failure_message
                      );
                      this.timeSlotDateWise = [];
                      this.deleteDummySa(saData.dummyServiceAppointmentId);
                    } else {
                      this.timeSlotWiseTemp = data.timeSlotList;
                      this.timeSlotDateWise = this.timeSlotWiseTemp;

                      var tempDate = loopdate.setDate(
                        loopdate.getDate() + this.maxDaysToGetAppointmentSlots
                      );
                      loopdate = new Date(tempDate);
                      console.log(
                        "New Loop date is : " +
                          loopdate +
                          "   and last day of week is : " +
                          lastDateOfWeek
                      );
                      if (loopdate <= lastDateOfWeek) {
                        this.handleGetSlotQueryForSelectedDateRange(loopdate);
                      } else {
                        this.deleteDummySa(saData.dummyServiceAppointmentId);
                      }
                    }
                  })
                  .catch((error) => {
                    this.deleteDummySa(saData.dummyServiceAppointmentId);
                    console.log("Error while executing FSL API :", +error);
                    this.timeSlotDateWise = [];
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
            this.deleteDummySa(saData.dummyServiceAppointmentId);
            console.log("Errror while creating dummy SA  :", +error);
            this.timeSlotDateWise = [];
            this.allowScrolling();
          });
      } else {
        // IF THE DATE IS BEFORE ARRIVAL WINDOW START DATE
        console.log("Loop date is less than minimum valid date");

        var tempDate = loopdate.setDate(
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
      var tempDate = loopdate.setDate(
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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onServiceAppointmentUpdate = (event) => {
    this.lockScrolling();
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
          this.allowScrolling();
          console.log("error is : " + error);
        });
    } else {
      this.UpdateServiceAppointmentFunction(event);
    }
  };

  UpdateServiceAppointmentFunction = (event) => {
    let selectedSlotStart = event.detail.selectedSlotStart;
    let selectedSlotEnd = event.detail.selectedSlotEnd;
    this.selectedSlotStringForToast = formatAppointmentDateandHourRange(
      selectedSlotStart,
      selectedSlotEnd
    );
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
        this.convertDateUTCtoLocal(ArrivalWindowStartTime).getTime()
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
              this.allowScrolling();
              this.showSpinnerInChildClass = false;
              this.handleShowToast(
                "warning",
                this.LABELS
                  .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                ""
              );
              console.log(
                this.LABELS
                  .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message +
                  "  " +
                  data.error
              );
            } else {
              // If the transaction Success, run the FSL schedule service
              scheduleSA({
                serviceAppointmentId: this.serviceAppointmentId,
                schedulingPolicyId: this.schedulingPolicyId,
                userId: this.userId,
                currentAssignmentMethod: this.currentAssignmentMethod
              })
                .then((data) => {
                  this.allowScrolling();
                  if (data.error) {
                    this.showSpinnerInChildClass = false;
                    this.handleShowToast(
                      "warning",
                      this.LABELS
                        .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                      ""
                    );
                    console.log(
                      "Error while executing FSL API : " +
                        "  " +
                        JSON.stringify(data.error)
                    );
                  } else {
                    console.log(
                      "Service appointment Scheduled : " + JSON.stringify(data)
                    );

                    this.handleShowToast(
                      "success",
                      this.LABELS
                        .Appointment_ReBooking_toastMessage_appointment_reschedule,
                      this.selectedSlotStringForToast
                    );
                    this.isAppointmentConfirmed = true;
                    console.log("Appointment reschedule sucessfully");

                    // Update Data After successfull booking
                    this.getInitData();
                  }
                })
                .catch((error) => {
                  this.revertSA();
                  this.allowScrolling();
                  this.showSpinnerInChildClass = false;
                  this.handleShowToast(
                    "warning",
                    this.LABELS
                      .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                    ""
                  );
                  console.log(
                    "Error while executing FSL API : " +
                      "  " +
                      JSON.stringify(error)
                  );
                });
            }
          })
          .catch((error) => {
            this.allowScrolling();
            this.showSpinnerInChildClass = false;
            this.handleShowToast(
              "warning",
              this.LABELS
                .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
              ""
            );
            console.log(
              this.LABELS
                .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message +
                "  " +
                error
            );
          });
      } else {
        this.allowScrolling();
        this.showSpinnerInChildClass = false;
        this.handleShowToast(
          "warning",
          this.LABELS.Appointment_ReBooking_same_appointment_selected_warning,
          ""
        );
      }
    } else {
      this.allowScrolling();
      console.log("Invalid date time ");
    }
  };

  isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  executeRescheduleAppointmentQuery() {
    this.showSpinnerInChildClass = true;
    updateAppointmentStatus({
      serviceAppointmentId: this.serviceAppointmentId,
      statusId: this.rescheduleStatusId
    })
      .then((data) => {
        this.allowScrolling();
        if (data.success) {
          this.handleShowToast(
            "success",
            this.LABELS
              .Appointment_ReBooking_toastMessage_appointment_reschedule,
            this.selectedSlotStringForToast
          );
          this.isAppointmentConfirmed = true;
        } else if (data.urlExpired) {
          console.log("invalidURL #9:");
          this.show_InvalidURLpage();
        } else {
          if (data.error) {
            this.handleShowToast(
              "warning",
              this.LABELS
                .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
              ""
            );
            console.log(
              this.LABELS
                .Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message +
                "  " +
                data.error
            );
          }
        }
        this.showSpinnerInChildClass = false;
      })
      .catch((e) => {
        console.log("ExecuteRescheduleAppointmentQuery" + JSON.stringify(e));
      });
  }

  HandleCloseToast() {
    this.showToast = false;
  }

  onWeekChangeEvent(event) {
    this.selectedDate = event.detail.date;
    console.log("On week change called");
    const returnValue = this.template
      .querySelector("c-mobile-appointment-booking-slots-container")
      .onWeekUpdated(this.selectedDate);
    this.runApexQueryToChangeEarlistStartDate(this.selectedDate);
  }

  onSlotSelection(event) {
    e.stopPropagation();
    e.preventDefault();
    this.selectedSlotStart = event.detail.startDate;
    this.selectedSlotEnd = event.detail.endDate;
    this.setNewAppointmentSelectedText(
      event.detail.startDate,
      event.detail.endDate
    );
  }

  onCustomEventCalled(event) {
    e.preventDefault();
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
      }
    }
  }

  handleBackButton() {
    this.handleButtonClickEvent("showConfirmScreen");
  }
  // pass date to main/parent class
  handleButtonClickEvent(buttonEvent) {
    const customEvent = new CustomEvent("eventname", {
      detail: { buttonName: buttonEvent }
    });
    this.dispatchEvent(customEvent);
  }

  getHeadlineDate() {
    const dateOptions = { weekday: "long", month: "long", day: "numeric" };
    if (this.ArrivalWindowStartTime == "null" || this.showExactArrivalTime) {
      var startDate = this.convertDateUTCtoLocal(this.SchedStartTime);
      var endDate = this.convertDateUTCtoLocal(this.SchedEndTime);
    } else {
      var startDate = this.convertDateUTCtoLocal(this.ArrivalWindowStartTime);
      var endDate = this.convertDateUTCtoLocal(this.ArrivalWindowEndTime);
    }
    if (startDate && endDate) {
      var dateLong = startDate.toLocaleDateString(undefined, dateOptions);
      var time =
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

  convertDateUTCtoLocal(date) {
    if (date && date !== "null") {
      return new Date(date.replace(/ /g, "T") + ".000Z");
    } else {
      return "";
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

  onButtonClick(event) {
    this.buttonClickName = event.detail.buttonName;
    switch (this.buttonClickName) {
      case "rescheduleEvent": {
        this.showRescheduleScreen(true);
        break;
      }
      case "confirmEvent": {
        this.executeConfirmAppointmentQuery();
        break;
      }
      case "showConfirmScreen": {
        this.dateArrayForQuery = [];
        this.dateArrayForQueryAllMobilesWorkerSlots = [];
        this.dateArrayForQueryCurrentMobileWorkwerSlots = [];
        this.showConfirmScreen(true);
        break;
      }
      case "cancelAppointmentEvent": {
        this.executeCancelAppointmentQuery();
        break;
      }
      case "rescheduleSAsuccess": {
        this.executeRescheduleAppointmentQuery();
        console.log("Appointment reschedule sucessfully");
        window.location.reload();
        break;
      }
      case "showPageExpired": {
        this.show_InvalidURLpage();
        break;
      }
      case "onMonthViewSelected": {
        this.dateArrayForQuery = [];
        this.dateArrayForQueryAllMobilesWorkerSlots = [];
        this.dateArrayForQueryCurrentMobileWorkwerSlots = [];
        break;
      }
      default: {
      }
    }
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
      });
  }

  handleShowToast(toastVariant, toastTitle, toastMessage) {
    this.showToast = true;
    this.toastVariant = toastVariant;
    this.toastTitle = toastTitle;
    this.toastMessage = toastMessage;
    //scroll top when toast is shown
    let container = this.template.querySelector(".landing-container");
    if (container) {
      container.scrollIntoView();
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
}
