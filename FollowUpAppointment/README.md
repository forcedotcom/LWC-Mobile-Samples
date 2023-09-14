## Set Up the Follow-Up Appointment Lightning Web Component (LWC)
Let your mobile workers create and schedule follow-up appointments for customers directly from the mobile app, without contacting customer services.

Note: Follow-Up Appointment LWC is an open-source component and is not supported by Salesforce Support.

1. Enable access to LWCs. See [Define a Permission Set for Your Org](https://developer.salesforce.com/docs/atlas.en-us.mobile_offline.meta/mobile_offline/quickstart_lwc_action_org_setup.htm#quickstart_lwc_action_org_setup_create_permset).
2. Enable the permission sets.
	1. From Setup, in the Quick Find box, enter Users, and then select **Users**.
	2. Select the required user.
	3. Under Permission Set Assignments, click **Edit Assignments**.
	4. Enable these permission sets:
		- Field Service Agent License
		- Field Service Agent Permissions
		- Field Service Mobile License
		- Field Service Resource License
		- Field Service Resource Permissions
		- Field Service Follow-Up Appointment Permissions
3. Grant access to Apex classes.
	1. From Setup, in the Quick Find box, enter `Custom Code`, and then select **Apex Classes**.
	2. For FollowUpAppointmentController, click **Security**.
	3. Add the relevant profiles to the Enabled Profiles list.
4. To install the package, click 
   https://login.salesforce.com/packaging/installPackage.apexp?p0=04t1Q0000012BwaQAE.
5. From the App Launcher, find and select **Follow-Up Appointment Settings**.
6. Configure the LWC.
	1. In the Settings tab, determine which appointment slots the mobile worker sees and determine who the work can be assigned to and what kind of work they can create.
	If you choose to let mobile workers create the service appointment, only a service appointment is created. If you choose to let mobile workers create work orders or work order line items, a service appointment is created automatically. A service appointment is created regardless of the Auto-Create Service Appointment setting for the work type.

		*Tip:* To control whether the service appointment can be assigned only to the mobile worker in the app, make sure that your scheduling policy includes the **Field Service - Required Resources work rule**.

	2. In the Mobile Workflow tab, configure up to four steps. 
		- To add the address, use the fields that compose the address, such as City and Street.
		- Lookup fields appear as read-only fields for the mobile user.
7. Add the component to the Work Order record page to troubleshoot the setup.
	1. From a Work Order record page in Field Service, click the settings icon and select Edit Page.
	2. In Lightning App Builder, drag the Follow-Up Appointment component onto the layout.
	3. Save your changes.
	4. Log in to the org with a user that is a Service Resource (mobile worker) and check the process end to end.
	5. If you encounter an issue with the component, click F12 to check the console logs.
8. Connect the LWC to a quick action on the Work Order, or Work Order Line Item object. See [Create Quick Actions for the Field Service Mobile App](https://help.salesforce.com/s/articleView?id=sf.mfs_quick_actions.htm&type=5).
	1. For Action Type, select **Lightning Web Components**.
	2. For Lightning Web Component, select **c:followUpAppointmentMain**.
9. Add the quick action to the required layout.
10. Log in to the Field Service mobile app as a mobile user and open the LWC to verify that everything works as expected on a mobile device.
