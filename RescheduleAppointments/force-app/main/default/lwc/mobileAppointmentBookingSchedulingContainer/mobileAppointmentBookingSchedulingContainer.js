import { LightningElement,  api, wire, track } from 'lwc';

import convertTimeToOtherTimeZone from '@salesforce/apex/AppointmentController.convertTimeToOtherTimeZone';
import customLabels from './labels';
import getUserName from '@salesforce/apex/AppointmentController.getUserName';

const assignmentMethod = {
    ASSIGN_TO_ME: "assignToMe",
    ASSIGN_TO_ANY_AVIALABLE: "assignToAnyAvailable"
}
export default class MobileAppointmentBookingSchedulingContainer extends LightningElement {
    guestToken;
    schedulePolicyId;
    LABELS = customLabels;
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
    maxValidCalendarDate;
    minValidCalendarDate;
    @api nonAvailableDateArray = [];
    @api noOfDaysBeforeAfterWeek;
    @api showExactArrivalTime;
    @api worktypeDisplayname;
    _currentAssignmentMethod;
    assignToName;
    @api userName;
    @api showAssignmentMethodToggle;
    @api isExcluded;

    show_confirmBtnLayout = false;
    _recommendedScore;
    @api allAppointmentsTitle = this.LABELS.Appointment_ReBooking_all_available_appointments;
    @api recommendedAppointmentsTitle = this.LABELS.Appointment_ReBooking_recommended_appointments;
    timeSlotObjectFilteredByGrades;
    @api userId;

    @api get serviceappointmentobject(){
        return this.serviceAppointmentObject;
    }
    set serviceappointmentobject(value){
        this.selectedDate = new Date();
        if(value){
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
            this.appointmentNumber = value.AppointmentNumber;
        }
        this.getHeadlineDate();
    }

    @api get serviceresourceobj(){
        return this.serviceAppointmentObject;
    }
    set serviceresourceobj(value){
        if(value){
            this.ServiceResourceId = value.ServiceResourceId;
            this.serviceResourceRole = value.ServiceResourceRole;
            this.ServiceResourceName = value.ServiceResourceName;
        }
    }

    @api get guesttoken(){
        return this.guestToken;
    }
    set guesttoken(value){
        if(value){
            this.guestToken = value;
        }
    }

    @api get schedulepolicy(){
        return this.schedulePolicyId;
    }
    set schedulepolicy(value){
        if(value){
            this.schedulePolicyId = value;
        }
    }

    @api get timeslotobject() {
        return this.timeSlotObject;
    }
    set timeslotobject(value) {
        this.showDataSpinner = false;
        if(value){
            this.timeSlotObject = value;
            this.filterTimeSlotObjectByGrade(this.timeSlotObject);  
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
        if(value) {
            this.maxValidCalendarDate = value;
        }
    }

    @api get shownoofdaysbeforeafterweek(){
        return this.noOfDaysBeforeAfterWeek;
    }
    set shownoofdaysbeforeafterweek(value){
        if(value){
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

    @api
    get recommendedScore() {
        return this._recommendedScore;
    }

    set recommendedScore(value) {
       this._recommendedScore = value;
    }
    @api
    get currentAssignmentMethod() {
        return this._currentAssignmentMethod;
    }

    set currentAssignmentMethod(value) {
       this._currentAssignmentMethod = value;
       
       if(this.userName){//if we already got the name from apex
        this.setAssigNameByAssignMethod();
       }
    }


    onDateSelected(event) {
        this.selectedDate = event.detail.date;
        console.log('Selected date in main class : '+this.selectedDate);
        var staticElement = this.template.querySelector('[data-id="calendar"]');
        var top  = staticElement.getBoundingClientRect().top
        console.log("The element is : "+top);
        const returnValue = this.template.querySelector('c-mobile-appointment-booking-slots-container').onPositionUpdated(top);
    }

    onWeekChangeEvent(event) {
        this.selectedDate = event.detail.date;
        console.log("On week change called");
        const returnValue = this.template.querySelector('c-mobile-appointment-booking-slots-container').onWeekUpdated(this.selectedDate);
        this.runApexQueryToChangeEarlistStartDate(this.selectedDate);
    }

    onSlotSelection(event) {
        this.selectedSlotStart = event.detail.startDate;
        this.selectedSlotEnd = event.detail.endDate;
        
        // run only if there is Service Territory
        if (this.serviceTerritoryTimeZone) {
            
            /**
             * CONVERT THE TIME FROM LOCALE TO SERVER
             */
            convertTimeToOtherTimeZone({    date1: this.selectedSlotStart,
                                            date2: this.selectedSlotEnd,
                                            targetTimezone:  this.serviceTerritoryTimeZone,
                                            sourceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
                                    })
            .then((data) => {

                this.selectedSlotStart = new Date(data.date1);
                this.selectedSlotEnd = new Date(data.date2);

            }).catch(error => {
                console.log('error is : '+error);
            })
        }
        
        this.setNewAppointmentSelectedText(event.detail.startDate, event.detail.endDate);
    }

    onCustomEventCalled(event) {
        switch (event.detail.name) {
            case 'trigergetslotapi': {
                this.runApexQueryToChangeEarlistStartDate(event.detail.value);
                break;
            }
            case 'updateNonAvailableDates': {
                this.nonAvailableDateArray = event.detail.value;
                console.log("Array of the date not available : "+ this.nonAvailableDateArray.length);
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
        const customEvent = new CustomEvent('eventname', {
            detail:{ buttonName : buttonEvent } 
        });
       this.dispatchEvent(customEvent);
    }

    getHeadlineDate() { 
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        if (this.ArrivalWindowStartTime == 'null' || this.showExactArrivalTime) {
            var startDate = this.convertDateUTCtoLocal(this.SchedStartTime);
            var endDate = this.convertDateUTCtoLocal(this.SchedEndTime);    
        } else {
            var startDate = this.convertDateUTCtoLocal(this.ArrivalWindowStartTime);
            var endDate = this.convertDateUTCtoLocal(this.ArrivalWindowEndTime);    
        }
        if(startDate && endDate) {
            var dateLong = startDate.toLocaleDateString(undefined, dateOptions);
            var time = this.getFormattedTimeFromDate(startDate) + ' - '+this.getFormattedTimeFromDate(endDate);
            if(this.showExactArrivalTime) {
                time = this.getFormattedTimeFromDate(startDate);
            }
            this.headlineDate = dateLong;
            this.headlineTime = time;
        }
    }

    convertDateUTCtoLocal(date) {
        if(date && date !== 'null') {
          return new Date((date.replace(/ /g,"T") + '.000Z'));
        } else {
          return '';
        }
    }

    getFormattedTimeFromDate(date) { // method to format the time digits
        var tempDate = new Date(date);
        var hours = tempDate.getHours();
        var minutes = tempDate.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + " "+ampm;
    }

    handleConfirm() {
        // allow scrolling
        document.body.style.overflow = 'auto';
        const customEvent = new CustomEvent('serviceappointmentupdate', {
            detail:{selectedSlotStart : this.selectedSlotStart,
                    selectedSlotEnd : this.selectedSlotEnd,
                    ArrivalWindowStartTime : this.ArrivalWindowStartTime,
                    schedulePolicyId : this.schedulePolicyId
            }
        });
        this.dispatchEvent(customEvent);
        this.show_confirmBtnLayout = false;
    }

    runApexQueryToChangeEarlistStartDate(selectedDate) {
        const customEvent = new CustomEvent('getslotexecuted', {
            detail:{ selectedDate : selectedDate } 
        });
       this.dispatchEvent(customEvent);
    }

    /**
     * SAVE ALL VALUES AFTER SELECTING THE SLOT
     */
    position;
    setNewAppointmentSelectedText(start, end) {

        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        var dateLong = start.toLocaleDateString(undefined, dateOptions);
        var time = this.getFormattedTimeFromDate(start) + ' - '+this.getFormattedTimeFromDate(end);
        if(this.showExactArrivalTime) {
            time = this.getFormattedTimeFromDate(start);
        }
        this.newAppointmentDate = dateLong + ", " + time;
        this.show_confirmBtnLayout = true;
        // lock scrolling
        document.body.style.overflow = 'hidden';
    }

    handleConfirmBtnClose() {
        this.show_confirmBtnLayout = false;
        // allow scrolling
        document.body.style.overflow = 'auto';
    }

    filterTimeSlotObjectByGrade(timeSlotObject){
        let timeSlotArr = Object.values(timeSlotObject);
        this.timeSlotObjectFilteredByGrades = timeSlotArr.filter(this.filterByGrade(this._recommendedScore));
    }

    filterByGrade(score){
        return function(element) {
            let splittedElement = element.split('#');
            let grade = splittedElement[2];
            return grade >= score;
        }
    }

    @wire(getUserName, { userId: '$userId' })
    wireUserName({ error, data }) {
        if (data) {
            this.userName = data;
            this.error = undefined;
            console.log("UserName from getUserName :" + data);

            this.setAssigNameByAssignMethod();

        } else if (error) {
            console.log("error in getUserName: " + JSON.stringify(error));

        }
    }

    setAssigNameByAssignMethod(){
        if(this._currentAssignmentMethod == assignmentMethod.ASSIGN_TO_ME){
            //"Assigned to You (userName)"
            this.assignToName = this.LABELS.Appointment_ReBooking_assigned_to_you.replace('{0}' , this.userName);
        }
        else{
            this.assignToName = this.LABELS.Appointment_ReBooking_assigned_to_any_available_worker;
        }
    }

    @api clearSlotsAfterAssignmentMethodChange(updatedAssignmentMethod){
        this.template.querySelector('c-mobile-appointment-booking-slots-container').clearSlotsAfterAssignmentMethodChange(updatedAssignmentMethod);
    }

} 