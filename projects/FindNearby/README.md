# Set Up the Find Nearby Lightning Web Component (LWC)

Help your mobile workers figure out what records are close by. For example, mobile workers can search for service appointments to see where to go next. Or, they can search for a part they need to complete the task.

**Note:** Find Nearby LWC is an open-source component and is not supported by Salesforce Support.

## Before You Begin

We recommend taking the [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components) Trailhead to learn how to:

- Set up your Salesforce DX environment
- Set up Visual Studio Code
- Make sure your org is updated to the Summer '23 version and higher
- Authorize your org

## Set Up the LWC

1. Get the source code:
   1. From [LWC-Mobile-Samples](https://github.com/forcedotcom/LWC-Mobile-Samples), click **Code**.
   2. Clone the code or download the zip file.
2. Configure the LWC:

   1. Open the FindNearby folder in Visual Studio Code.
   2. Under `force-app/main/default/lwc/mobileMapLayersMain`, open the `config.js` file.
   3. Review the predefined code blocks in the mapObjects array. Each code block represents an object that can be displayed on the map. The map shows one type of object at a time, and you can switch between types. By default, the object type you see when you launch the LWC is the first code block of the mapObjects array. According to the default configuration of the LWC, the displayed object is Service Appointment.
      - `value`—The object’s name.
      - `latField`—The object’s field that contains the latitude value.
      - `longField`—The object’s field that contains the longitude value.
      - `titleField`—The value of the entered field is displayed as the title of the marker’s card and list entry.
      - `detailField`—The value of the entered field is displayed as the detail of the marker’s card and list entry.

   Example:

   ```json
   {
     "value": "ServiceAppointment",
     "latField": "Latitude",
     "longField": "Longitude",
     "titleField": "AppointmentNumber",
     "detailField": "Subject"
   }
   ```

   According to this code block: the map shows markers for service appointments; the service appointments are located on the map according to their latitude and longitude; the appointment number is the title of the card and the list entry; and the subject is the detail shown in the card and the list entry.

   4. Add a code block for every object type you want to see on the map.

      - Within a code block, use different fields for `latField`, `longField`, `titleField`, and `detailField`. For example, you can't use the Name field for both `titleField` and `detailField`.
      - Separate the code blocks using a comma.

   5. The distance unit is predefined as kilometers. To change the distance unit to miles, replace km with mi:

   `distanceUnit: 'mi'`

3. Authorize your org and deploy the code to your org. See [Quick Start: Lightning Web Components](https://trailhead.salesforce.com/content/learn/projects/quick-start-lightning-web-components).
4. Grant access to the LWC’s users.
   1. From Setup, in the Quick Find box, enter `Users`, and then select **Profiles**.
   2. Open the required profile.
   3. Under Enabled Apex Class Access, click **Edit** and add MobileMapLayersService.
   4. Give the users access to the records you want them to see.
5. Connect the LWC to a global action. See Add Global Actions to the Field Service Mobile App.
   1. For Action Type, select **Lightning Web Components**.
   2. For Lightning Web Component, select **c:mobileMapLayersMain**.
6. To see the map on a mobile device, add the map URL to the org’s trusted URLs. For more information, see [lightning-map](https://developer.salesforce.com/docs/component-library/bundle/lightning-map/documentation).
   1. From Setup, in the Quick Find box, enter `Security` and select **Trusted URLs**.
   2. Click **New Trusted URL**.
   3. Enter an API Name.
   4. For URL, enter `maps.a.forceusercontent.com`.
   5. Select **frame-src (iframe content)**.
   6. Save your changes.
   7. Repeat these steps for the `maps.b.forceusercontent.com` URL.
