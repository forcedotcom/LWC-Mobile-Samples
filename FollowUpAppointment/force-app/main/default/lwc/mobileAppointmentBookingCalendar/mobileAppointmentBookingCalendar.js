import { LightningElement, api, track } from 'lwc';
import customLabels from './labels';

export default class AaRebookingCalendar extends LightningElement {
    LABELS = customLabels;
    months = [ this.LABELS.FollowUpAppointments_MonthName_January, 
                this.LABELS.FollowUpAppointments_MonthName_February,
                this.LABELS.FollowUpAppointments_MonthName_March,
                this.LABELS.FollowUpAppointments_MonthName_April,
                this.LABELS.FollowUpAppointments_MonthName_May,
                this.LABELS.FollowUpAppointments_MonthName_June,
                this.LABELS.FollowUpAppointments_MonthName_July,
                this.LABELS.FollowUpAppointments_MonthName_August,
                this.LABELS.FollowUpAppointments_MonthName_September,
                this.LABELS.FollowUpAppointments_MonthName_October,
                this.LABELS.FollowUpAppointments_MonthName_November,
                this.LABELS.FollowUpAppointments_MonthName_December ];

    weekDaysArray = [ this.LABELS.FollowUpAppointments_WeekDayShort_Sunday, 
                    this.LABELS.FollowUpAppointments_WeekDayShort_Mon,
                    this.LABELS.FollowUpAppointments_WeekDayShort_Tue,
                    this.LABELS.FollowUpAppointments_WeekDayShort_Wed,
                    this.LABELS.FollowUpAppointments_WeekDayShort_Thu,
                    this.LABELS.FollowUpAppointments_WeekDayShort_Fri,
                    this.LABELS.FollowUpAppointments_WeekDayShort_Saturday];
    
    //passed from props
    showexactarrivaltime = false;
    shownoofdaysbeforeafterweek = 2;
    noOfRowsToDisplay = 1;
    firstWeekDayIndex = 0;
    noOfDaysInWeek = 7;
    isWeekView = true;
    disableDateBeforeCurrentDate = true;
    isLeftSwipeDisable = false;
    isRightSwipeDisable = false;

    @track noofWeeks = [];
    @track noOfMonths = [];
    currentSelectedDate = new Date();
    currentSelectedWeekNo;
    boolShowPopover = false;

    maxValidCalendarDate;
    _nonAvailableDates = [];

    currentMonthYearLabel;
    alternativeTextForMonthBtn;
    selectedDateByUser;
    previousSelectedDateByUser;
    _appointmentDate;

    @api get weekview() {
        return this.isWeekView;
    }

    set weekview(value) {
        this.isWeekView = !value;
    }

    @api get selectedDate() {
        return this.currentSelectedDate;
    }

    set selectedDate(value) {
        if(value) {
            this.currentSelectedDate = value;
        }
    }

    @api get maxValidDate() {
        return this.maxValidCalendarDate;
    }

    set maxValidDate(value) {
        if(value) {
            this.maxValidCalendarDate = new Date(value);
            this.maxValidCalendarDate.setHours(0,0,0,0);
        }
    }

    @api get nonAvailableDates() {
        return this.nonAvalableDates;
    }

    set nonAvailableDates(value) {
        if(value) {
            this._nonAvailableDates = value;
            this.setBlockDatesInWeekView(this.currentSelectedDate);
        }
    }

    @api get appointmentDate() {
        return this._appointmentDate;
    }
    set appointmentDate(value) {
        if(value) {
            this._appointmentDate = new Date(value);
            //for first state when the user hasn't select date yet - show the appt date as selcted
            this.setSelectedDateInWeekView(this.currentSelectedDate);
        }
    }

    arrangeWeekDayArray() {
        if (this.firstWeekDayIndex > 0) {
            for (let j = 0; j < this.firstWeekDayIndex; j++) {
                this.weekDaysArray.push(this.weekDaysArray.shift());
                console.log('New array is : ' + this.weekDaysArray);
            }
        }
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getYearMonthTitle(date) {
        return  this.months[date.getMonth()] + ' ' + date.getFullYear();
    }

    getWeekNoFromDate(date) {
        return date.getWeekNo();
    }

    // calculate date by adding days
    calculateDateFromDays(date, days) {
        var newDate = new Date(date);
        newDate.setDate((date.getDate() + days));
        return newDate;
    }

    // calculate date by adding months
    calculateDateFromMonth(date, month) {
        var newDate = date;
        newDate.setMonth((date.getMonth() + month));
        console.log('new Month is : ' + newDate);
        return newDate;
    }

    getFirstDayOfWeek(date, index) {
        var start = index >= 0 ? index : 0;
        var d = new Date(date);
        var day = d.getDay();
        var diff = d.getDate() - day + (start > day ? start - 7 : start);
        d.setDate(diff);
        console.log('First day of week is : ' + d.getDate());
        return d;
    };

    getLastDayOfWeek(date, index) {
        var start = index >= 0 ? index : 0;
        var d = new Date(date);
        var day = d.getDay();
        var diff = d.getDate() - day + (start > day ? start - 1 : 6 + start);
        d.setDate(diff);
        return d;
    };

    connectedCallback() {

        //Fix for the issue that can't scroll down when full calendar is open and moving to landscape mode (W-12181896)
        document.body.style.overflow = 'auto';

        this.arrangeWeekDayArray();
        if (this.isWeekView) {
            this.showWeekView(this.getFirstDayOfWeek(this.currentSelectedDate, this.firstWeekDayIndex));
        } else {
            this.showMonthView(new Date());
        }
        
    }

    /**
     * WeekView
     * @param {} firstdayOfWeek 
     */

    showWeekView(firstdayOfWeek) {
        console.log("First day of the week is : "+firstdayOfWeek);
        this.boolShowPopover = false;
        this.noOfMonths = [];
        let firstArr = [];
        let tempRow = [];
        this.noofWeeks = [];
        for (let j = 0; j < this.noOfRowsToDisplay; j++) {
            for (let i = 0; i < this.weekDaysArray.length; i++) {
                firstArr = [];
                let tempDate = new Date(firstdayOfWeek);
                tempDate.setDate(firstdayOfWeek.getDate() + i);
                firstArr.date = tempDate.getDate();
                firstArr.value = tempDate;
                firstArr.id = "d" + tempDate.getDate();
                tempRow.push(firstArr);
            }
            this.noofWeeks.push(tempRow);
            console.log('Size of new array is : ' + this.noofWeeks.length);
        }
        this.currentMonthYearLabel = this.getYearMonthTitle(this.currentSelectedDate);
        this.alternativeTextForMonthBtn = "View month for " + this.currentMonthYearLabel;
        this.validateIfSelectedDateIsInRange(this.currentSelectedDate);
        this.setSelectedDateInWeekView(this.currentSelectedDate);
        if(this.disableDateBeforeCurrentDate) {
            this.validateLeftSwipeAction(firstdayOfWeek);
        }
        this.validateRightSwipeAction(this.getLastDayOfWeek(firstdayOfWeek, this.firstWeekDayIndex));  
    }

    /**
     * Month View
     * @param {Current Date} 
     */

    showMonthView(currDate) {

        var currdate = new Date();
        var monthDiff = this.getMonthDiff(currdate, this.maxValidDate);
        this.noOfMonths = [];
        let calendarSelectedDate;
        for (let a = 0; a < monthDiff+1; a++) {
            let newDate = new Date();
            let currMonth = newDate.getMonth();
            //Fix Bug W-12454215: When the next month is with less days than the previous,
            //for example, when the date is 29th January, this would make the date February the 29th which doesn't exist, 
            //JavaScript will try to find the closest valid date which is first of March.
            //So we set the day to the first day of the month.
            newDate.setDate(1); 
            let nextMonth = newDate.setMonth(currMonth + a);
            let newCurrMonth = new Date(nextMonth);
            calendarSelectedDate = newCurrMonth;
            const firstDay = (new Date(newCurrMonth.getFullYear(), newCurrMonth.getMonth())).getDay();
            const getNoOfDays = this.getDaysInMonth(newCurrMonth.getFullYear(), newCurrMonth.getMonth());
            let date = 1;
            let noofWeeks = [];

            for (let j = 0; j < 6; j++) {
                let arr = [];
                let days = [];
                let hasWeeksDate = false;
                for (let i = 0; i < this.weekDaysArray.length; i++) {
                    arr = [];
                    if (j === 0 && i < firstDay) {
                        arr.date = '';
                        arr.value = '';
                        days.push(arr);

                    } else if (getNoOfDays >= date) {

                        let dateValue = new Date(calendarSelectedDate);
                        dateValue = new Date(dateValue.setDate(date));
                        
                        if(dateValue < currDate) {
                            arr.date = date;
                            arr.value = dateValue;
                            hasWeeksDate = true;
                        } else if(new Date(dateValue.setHours(0,0,0,0)) > this.maxValidCalendarDate) {
                            arr.date = date;
                            arr.value = dateValue;
                            hasWeeksDate = true;
                            //break;
                        } else {
                            arr.date = date;
                            arr.value = dateValue;
                            arr.isValidDate = true;
                            hasWeeksDate = true;
                        }    
                        
                        let currentDay = new Date(dateValue.setHours(0,0,0,0)).getTime();
                        let today = new Date(currdate.setHours(0,0,0,0)).getTime();
                        if(currentDay === today){
                            arr.currentDay = true;
                        }
                        if(this.selectedDateByUser){
                            let selectedDate = new Date(this.selectedDateByUser.setHours(0,0,0,0)).getTime();
                            if(currentDay === selectedDate){
                                arr.selected = true;
                            }
                        }
                        
                        else if (!this.selectedDateByUser){
                            //first state when the user hasn't select date yet - show the appt date as selcted
                            if(this._appointmentDate && currentDay === this._appointmentDate.setHours(0,0,0,0)) {
                                arr.selected = true;
                            }
                        }
                        days.push(arr); 
                        date++;
                    } else break;
                }
                if(hasWeeksDate) 
                    noofWeeks.push(days);
            }
            let monthArr = [];
            monthArr.monthNo = calendarSelectedDate.getMonth();
            monthArr.monthTitle = this.getYearMonthTitle(calendarSelectedDate);
            monthArr.weeks = noofWeeks;
            this.noOfMonths.push(monthArr);
        }
    }

    getMonthDiff(d1, d2) {
        try {
            let months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        } catch(e) {
            console.error('getMonthDiff error: => ' + e.message );
            return 0;
        }
        
    }

    handleClick(event) {
        switch (event.target.title) {
            case 'previous':
                {
                    this.handlePreviousButtonClick();
                    break;
                }
            case "next":
                {
                    this.handleNextButtonClick();
                    break;
                }
            case "Cancel":
                {
                    this.isWeekView = true;
                    this.boolShowPopover = false;
                    document.body.style.overflow = 'auto';
                    this.selectedDateByUser = this.previousSelectedDateByUser;
                    this.setSelectedDateInWeekView(this.currentSelectedDate);                   
                    break;
                }
            case "OK":
                {
                    this.boolShowPopover = false;
                    document.body.style.overflow = 'auto';
                    if(this.selectedDateByUser){
                        this.handleDateSelectionEvent(this.selectedDateByUser, false);
                    }
                    this.isWeekView = true;
                    break;
                }

            default:
                {
                    if (event.currentTarget.title === 'weekViewDateId') {
                        let selectedDate = new Date(event.currentTarget.dataset.id)
                        let days = selectedDate.getDate();
                        this.handleDateSelectionEvent(selectedDate, true);

                        if (event) days = selectedDate.getDate();
                        for (let week = 0; week < this.noofWeeks.length; week++) {
                            for (let day = 0; day < this.noofWeeks[week].length; day++) {
                                this.noofWeeks[week][day].selected = false;
                                if (this.noofWeeks[week][day].date === days){
                                    this.noofWeeks[week][day].selected = true;
                                    this.selectedDateByUser = new Date(event.currentTarget.dataset.id);
                                }
                            }
                        }
                    }
                    if (event.currentTarget.title === 'monthViewDateId') {
                        if(event.currentTarget.dataset.id && event.currentTarget.dataset.id != null)  {
                            let selectedDate = new Date(event.currentTarget.dataset.id);
                            
                            let isValidDate = false;
                            for(let month=0; month < this.noOfMonths.length; month++) {
                                for (let week = 0; week < this.noOfMonths[month].weeks.length; week++) {
                                    for (let day = 0; day < this.noOfMonths[month].weeks[week].length; day++) {
                                        this.noOfMonths[month].weeks[week][day].selected = false;
                                        // this line is causing isse when using ===. Hence reverting the lint change.
                                        // eslint-disable-next-line eqeqeq
                                        if (this.noOfMonths[month].weeks[week][day].value == event.currentTarget.dataset.id) {
                                            if(this.noOfMonths[month].weeks[week][day].isValidDate) {
                                                isValidDate = true;
                                                this.noOfMonths[month].weeks[week][day].selected = true;
                                            } 
                                        } 
                                    }
                                }
                            }
                            if(isValidDate) {
                                this.previousSelectedDateByUser = this.selectedDateByUser; //Used for clicking on 'X' button
                                this.selectedDateByUser = selectedDate
                            }
                        }
                    }
                }
        }
    }

    handleMonthViewButton() {
        this.isWeekView = false;
        this.showMonthView(new Date());
        this.boolShowPopover = true;
        document.body.style.overflow = 'hidden';
    }

    getCurrentDate() {
        let currentDate = new Date();
        for (let week = 0; week < this.noofWeeks.length; week++) {
            for (let day = 0; day < this.noofWeeks[week].length; day++) {
                if (this.noofWeeks[week][day].date === currentDate.getDate() &&
                    this.currentSelectedDate.getMonth() === currentDate.getMonth() &&
                    this.currentSelectedDate.getFullYear() === currentDate.getFullYear())
                    this.noofWeeks[week][day].currentDay = true;
            }
        }
    }

    setSelectedDateInWeekView() {
        //var days = selectedDate.getDate();  commented as the variable was never used
        let currentDate = new Date().setHours(0,0,0,0);
        for (let week = 0; week < this.noofWeeks.length; week++) {
            for (let day = 0; day < this.noofWeeks[week].length; day++) {
                this.noofWeeks[week][day].selected = false;

                 if (this.selectedDateByUser && this.noofWeeks[week][day].value.setHours(0,0,0,0) === this.selectedDateByUser.setHours(0,0,0,0)) {
                     // SHOW SELECTED DATE IN WEEK VIEW
                     this.noofWeeks[week][day].selected = true;
                 }

                 else if (!this.selectedDateByUser){
                    //first state when the user hasn't select date yet - show the appt date as selcted
                    if(this._appointmentDate && this.noofWeeks[week][day].value.setHours(0,0,0,0) === this._appointmentDate.setHours(0,0,0,0)) {
                        this.noofWeeks[week][day].selected = true;
                    }
                 }
                
                // SHOW CURRENT DATE IN WEEK VIEW
                if(this.noofWeeks[week][day].value.setHours(0,0,0,0) === currentDate) {
                    this.noofWeeks[week][day].currentDay = true;
                }
            }
        }
    }

    setBlockDatesInWeekView() {
        //var days = selectedDate.getDate();
        //let currentDate = new Date().setHours(0,0,0,0);
        for (let week = 0; week < this.noofWeeks.length; week++) {
            for (let day = 0; day < this.noofWeeks[week].length; day++) {
                this.noofWeeks[week][day].blocked = false;

                let loopDate = this.noofWeeks[week][day].value.setHours(0,0,0,0);
                // BLOCK UN AVAILABLE DATES IN WEEK VIEW
                if(this.isInArray(this._nonAvailableDates,loopDate )) {
                    this.noofWeeks[week][day].blocked = true;
                    this.noofWeeks[week][day].selected = false;
                }
            }
        }
    }

    isInArray(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (value === array[i].getTime()) {
                return true;
            }
        }
        return false;
    }


    // pass date to main/parent class
    handleDateSelectionEvent(selectedDate, isSelectedFromWeekView) {

        if (!this.isWeekView) {
            this.isWeekView = true;
            this.boolShowPopover = false;
            document.body.style.overflow = 'auto';
            this.currentSelectedDate = selectedDate;
            this.changeNextWeek(this.currentSelectedDate);
            this.showWeekView(this.getFirstDayOfWeek(selectedDate, this.firstWeekDayIndex));
        }
        const customEvent = new CustomEvent('dateselection', {
            detail: { date: selectedDate , isweekview : isSelectedFromWeekView}
        });
        this.dispatchEvent(customEvent);
    }

    handlePreviousButtonClick() {
        if (this.isWeekView) {
            this.currentSelectedDate = this.calculateDateFromDays(this.currentSelectedDate, -this.noOfDaysInWeek);
            this.currentSelectedDate = this.getFirstDayOfWeek(this.currentSelectedDate, this.firstWeekDayIndex);
            this.changeNextWeek(this.currentSelectedDate);
        }
    }

    handleNextButtonClick() {
        if (this.isWeekView) {
            // for Week View
            this.currentSelectedDate = this.calculateDateFromDays(this.currentSelectedDate, this.noOfDaysInWeek);
            this.currentSelectedDate = this.getFirstDayOfWeek(this.currentSelectedDate, this.firstWeekDayIndex)
            this.changeNextWeek(this.currentSelectedDate);
        }
    }

    changeNextWeek(selectedDate) {
        this.showWeekView(selectedDate);
        const customEvent = new CustomEvent('weekchangeevent', {
            bubbles: true, composed: true,
            detail: { date: selectedDate }
        });
        this.dispatchEvent(customEvent);
    }

    changeNextMonth(addMonth) {
        this.showMonthView(this.calculateDateFromMonth(this.currentSelectedDate, addMonth));
    }

    validateLeftSwipeAction(firstDayOfTheWeek) {
        var dNow = new Date();
        this.isLeftSwipeDisable = false;
        if(firstDayOfTheWeek < dNow) {
            // Disable the left swipe 
            this.isLeftSwipeDisable = true;
        }
    }

    validateRightSwipeAction(lastWeekDay) {
        this.isRightSwipeDisable = false;
        if(lastWeekDay > this.maxValidCalendarDate) {
            // Disable the left swipe 
            this.isRightSwipeDisable = true;
        }
    }

    validateIfSelectedDateIsInRange(selectedDate) {
        var currentDate = new Date();
        if(selectedDate < currentDate) {
            // Disable the left swipe 
            this.currentSelectedDate = currentDate;
        }
    }

    xDown = null;
    yDown = null;  

    handleTouchStart(evt) {  
                                         
        this.xDown = evt.touches[0].clientX;
        this.yDown = evt.touches[0].clientY;
        console.log("Touch : Start : "+this.xDown);
    }; 
    
    handleToucEnd(evt) {
        //Scroll to the following selected date ;
        //update selected date;
        if ( ! this.xDown || ! this.yDown ) {
            return;
        }
        let xUp = evt.changedTouches[0].clientX;
        let yUp = evt.changedTouches[0].clientY;
        let xDiff = this.xDown - xUp;
        let yDiff = this.yDown - yUp;
    
        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/

            if ( xDiff > 0 ) {
                /* left swipe */ 
                if(!this.isRightSwipeDisable) {
                    this.handleNextButtonClick();
                }
                
                
            } else {
                /* right swipe*/ 
                if(!this.isLeftSwipeDisable) {
                    this.handlePreviousButtonClick();
                } 
            } 
                     
        } else {
            if ( yDiff > 0 ) {
            /* up swipe */ 
            } else { 
            /* down swipe */
            }
        }
        /* reset values */
        this.xDown = null;
        this.yDown = null;
    }

    previousElement;
    executeScroll(selectedDate) {
        var elementToShow =  this.template.querySelector('[id^=d' + selectedDate.getDate() + ']');
        if(elementToShow) {
            try {
                elementToShow.scrollIntoView({
                    behavior: "smooth",
                    inline: "end"
                  })
            } 
            catch(e) {
                console.log("Error is : "+e);
            }  
        }
    }

}