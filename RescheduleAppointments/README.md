# Set Up the Reschedule Appointments Lightning Web Component (LWC)

Let your mobile workers reschedule appointments for customers directly from the mobile app, without contacting customer services.

## Before You Begin
We recommend taking the [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components) to learn how to:
+ Set up your Salesforce DX environment
+ Set up Visual Studio Code
+ Authorize your org

## Set Up the LWC

1. Get the source code.
    1. From [LWC-Mobile-Samples](https://github.com/forcedotcom/LWC-Mobile-Samples), click **Code**.
    2. Clone the code or download the zip file.
2. Enable the permission sets:
    1. From Setup, in the Quick Find box, enter `Users`, and then select __Users__.
    2. Select the required user.
    3. Under Permission Set Assignments, click Edit Assignments.
    4. Enable these permission sets:
        * Field Service Agent License
        * Field Service Agent Permissions
        * Field Service Mobile License
        * Field Service Resource License
        * Field Service Resource Permissions

    Tip: Make sure that the Dispatched status is not considered a pinned status. From Field Service Settings, go to Scheduling and deselect the Dispatched status from the list of statuses that are considered as pinned, or unmovable, for scheduling.

3. Configure the LWC:
    1. Open the `RescheduleAppointments` folder in Visual Studio Code. 
    2. Under
       `force-app/main/default/lwc/mobileAppointmentBookingSettingsContainer`, open the `MobileAppointmentBookingSettingsContainer.js` file.
    3. You can modify these settings:
        * `enableAssignToMe` and `enableAssignToEveryAvailable` are set to true. You can change one of these settings to false if required. This is achieved by modifying the work order’s resource preferences so that existing required resources are deleted and the current mobile worker is added as the only required resource for the service appointment (the service resource related to the current user). The setting is controlled by the assignCurrentUserAsRequiredResource Apex function. If both settings are set to true, the deleteExistingRequiredResources Apex function deletes the required resource object created for assignToMe.

        Tip: To control if the service appointment can be assigned only to the mobile worker in the app, make sure that your scheduling policy includes the __Field Service - Required Resources__ work rule.
         * `recommendedScore` is set to 80, meaning that service appointments with a score above 80 appear in the list of results. You can modify this grade as needed.
    4. Fill in the names of your `OperatingHours` and `SchedulingPolicy`.
    
    5. You can also fill in these optional settings according to your Appointment Booking preferences:
        * `schedulingHorizonUnit`: Enter `Days`, `Weeks`, or `Months`
        * `schedulingHorizonValue`: Enter the number of `Days`, `Weeks`, or `Months`
        * `showExactArrivalTime`: To show exact appointment times, enter `true`. To show arrival windows, enter `false`.
        * `maxDaysToGetAppointmentSlots`: Must match the __Maximum days to get candidates or to book an appointment__ field in your Field Service Settings. To find this value, go to __Field Service Settings >  Scheduling > General Logic__.

        
 4. Authorize your org and deploy the code to your org. [See Quick Start: Lightning Web Components.](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components) The files must be deployed in this order:
    1. Classes folder
    2. Custom labels folder
    3. From the lwc folder:
        1. MobileAppointmentBookingCalendar
        2. MobileAppointmentBookingUtils
        3. MobileAppointmentBookingCompactAppointmentInfo
        4. MobileAppointmentBookingRescheduleAppointment
        5. MobileAppointmentBookingResourceAssignment
        6. MobileAppointmentBookingSlotsContainer
        7. MobileAppointmentBookingSchedulingContainer
        8. MobileAppointmentBookingLanding
        9. MobileAppointmentBookingSettingsContainer

5. Grant access to the LWC’s users.
    1. From Setup, in the Quick Find box, enter `Users`, and then select __Profiles__.
    2. Open the required profile.
    3. Under Enabled Apex Class Access, click __Edit__ and add AppointmentController.
    4. Give the users access to the records you want them to see.

6. Connect the LWC to a quick action to the Service Appointment object. See [Create Quick Actions for the Field Service Mobile App.](https://help.salesforce.com/s/articleView?id=sf.mfs_quick_actions.htm&type=5)
    1. For Action Type, select __Lightning Web Components__.
    2. For Lightning Web Component, select 
        __c:MobileAppointmentBookingSettingsContainer.__

__See Also__

Known Issue:  [Reschedule Appointments LWC requires refreshing the Field Service mobile app](https://trailblazer.salesforce.com/issues_view?id=a1p4V000002d8lmQAA)
