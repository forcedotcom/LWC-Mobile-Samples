# Set Up the Mobile Dashboard Lightning Web Component (LWC)
Let your mobile workers easily see an overview of their data. For example, show a dashboard that lets workers know where they stand with the company’s KPIs. That way, they always know what they need to work on.

**Note:** Mobile Dashboard LWC is an open-source component and is not supported by Salesforce Support.

1. Enable access to LWCs. See [Define a Permission Set for Your Org](https://developer.salesforce.com/docs/atlas.en-us.mobile_offline.meta/mobile_offline/quickstart_lwc_action_org_setup.htm#quickstart_lwc_action_org_setup_create_permset).
2. Enable the permission set.
	1. From Setup, in the Quick Find box, enter `Users`, and then select **Users**.
	2. Select the required mobile user.
	3. Under Permission Set Assignments, click **Edit Assignments**.
	4. Enable **Field Service Mobile Dashboard Permissions**.
	5. Repeat these steps for all the relevant mobile users.
3. To install the package, click https://login.salesforce.com/packaging/installPackage.apexp?p0=04tB0000000hBwWIAU.
4. From the Developer Console, run the script to get preconfigured cards for your dashboard: `DashboardPostInstall.onInstall();`
5. From the App Launcher, find and select **Mobile Dashboard Settings**.
6. Review the details of the cards and change them as needed. 
	- The preview cards show a dummy result of 1 record for each query.
	- When the result of a query includes more than 2000 records, the dashboard shows 2000+ instead of the exact number.
 	- If the tabs get stuck when adding or editing a card, see [Enable Lightning Web Security in an Org](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.security_lwsec_enable).
7. Make sure the queried fields are visible. Otherwise, the query doesn’t return any results.
	1. From the object management settings for the object whose fields you want to make visible, go to **Fields & Relationships**.
	2. For the required fields, click **Set Field-Level Security** and make the field-level security visible for all profiles.
8. Connect the LWC to a global action. See [Add Global Actions to the Field Service Mobile App](https://help.salesforce.com/s/articleView?id=sf.mfs_global_actions.htm&type=5).
	1. For Action Type, select **Lightning Web Components**.
	2. For Lightning Web Component, select **c:mainDashboard**.
9. Add the global action to the required layout.
10. From the Field Service mobile app, open the LWC to verify the setup.
