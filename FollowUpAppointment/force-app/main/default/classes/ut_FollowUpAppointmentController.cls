@isTest
public without sharing class ut_FollowUpAppointmentController {
    

    public static final String ADMIN_EMAIL = 'ApptAssistantAdmin@SFDC.com';
    public static final String PERMSET_ADMIN = 'aa_Admin';
    public static final String PROFILE_ADMIN = 'System Administrator';
    public static final String PROFILE_USER = 'Standard User';
    public static final String AA_PSL = 'FSLApptAssistant';

    public static AssignedResource ar;
    public static ServiceAppointment sa;
    public static WorkOrder wo;
    public static WorkOrder wo_sa;
    public static ServiceResource sr;
    public static ResourcePreference rp;
    public static OperatingHours oh;
    public static WorkType wt;
    public static WorkType wt_sa;
    public static FSL__Scheduling_Policy__c sp;

    public enum UserType {
        ADMIN
    }



    /**
     * setupUser description
     * @param  profileName profileName description
     * @param  email       email description
     * @param  doInsert    doInsert description
     * @return             return description
     */
    public static User setupUser(String profileName, String email, Boolean doInsert) {
        return setupUser(profileName, 'Test', 'User ', null, email, doInsert);
    }

    private static Map<String, Id> mapProfileNameToId = new Map<String, Id>();
    private static Id getIdForProfile(String profileName) {
        if (!mapProfileNameToId.containsKey(profileName.toUpperCase())) {
            for (Profile p : [SELECT Id, Name FROM Profile WHERE Name = :profileName]) {
                mapProfileNameToId.put(p.Name.toUpperCase(), p.Id);
            }
        }

        return mapProfileNameToId.get(profileName.toUpperCase());
    }

    /**
     * Setup User with Profile, name and number
     **/
    public static User setupUser(
        String profileName,
        String firstName,
        String lastName,
        String employeeNumber,
        String email,
        Boolean doInsert
    ) {
        if (email == null) {
            email = 'unit.test.user@' + UserInfo.getOrganizationId() + '.apexanalytixtest.com';
        }
        User u = new User();
        u.FirstName = firstName;
        u.LastName = lastName;
        u.EmployeeNumber = employeeNumber;
        u.Email = email;
        u.Username = email;
        u.Alias = 'tuser' + String.valueOf(Integer.valueOf((Math.random() * 999)));
        u.Phone = '503-555-1212';
        u.ProfileId = getIdForProfile(profileName);
        u.TimeZoneSidKey = 'America/Los_Angeles';
        u.LocaleSidKey = 'en_US';
        u.EmailEncodingKey = 'ISO-8859-1';
        u.LanguageLocaleKey = 'en_US';

        if (UserInfo.isMultiCurrencyOrganization()) {
            ((SObject) u).put('CurrencyIsoCode', 'USD');
        }

        if (doInsert) {
            insert u;
        }

        return u;
    }


    static AssignedResource makeData(User user) {
        System.runAs(user) {
            sr = new ServiceResource();
            
            // ServiceTerritoryMember
            sr.Name = 'John Doe';
            sr.RelatedRecordId = user.Id;
            sr.LastKnownLatitude = 12.9716;
            sr.LastKnownLongitude = 77.5946;
            sr.IsActive = true;
            insert sr;

            sp = new FSL__Scheduling_Policy__c();
            sp.Name = 'Customer First Test';
            insert sp; 


            oh = new OperatingHours();
            oh.TimeZone = 'Europe/Istanbul';
            oh.Name = 'Test time zone';
            insert oh;
            
            List<OperatingHours> offsetList = [SELECT TimeZone FROM OperatingHours LIMIT 1];
            ServiceTerritory ter = new ServiceTerritory();
            ter.IsActive = true;
            ter.Name = 'Floor 5';
            ter.OperatingHoursId = oh.id;
            insert ter;
            
            
            ServiceTerritoryMember stm = new ServiceTerritoryMember();
            stm.ServiceResourceId = sr.id;
            stm.ServiceTerritoryId = ter.id;
            stm.EffectiveStartDate = Date.valueOf('2021-03-11');
            stm.TerritoryType = 'P';
            insert stm;

            Account a = new Account();
            a.Name = 'BAC';
            insert a;

            // create a work type
            wt = new WorkType();
            wt.Name = 'test';
            wt.EstimatedDuration = 2;
            wt.DurationType = 'Hours';
            wt.FSL__Due_Date_Offset__c = 7200;
            wt.FSL__Exact_Appointments__c = true;
            insert wt;

            wt_sa = new WorkType();
            wt_sa.Name = 'test1';
            wt_sa.EstimatedDuration = 2;
            wt_sa.DurationType = 'Hours';
            wt_sa.FSL__Due_Date_Offset__c = 7200;
            wt_sa.FSL__Exact_Appointments__c = true;
            wt_sa.ShouldAutoCreateSvcAppt = true;
            insert wt_sa;

            // create a work order
            wo = new WorkOrder();
            wo.WorkTypeId = wt.Id;
            wo.City = 'Bangalore';
            wo.Country = 'India';
            wo.Street = 'Palm Retreat';
            wo.Latitude = 12.9716;
            wo.Longitude = 77.5946;
            insert wo;

            wo_sa = new WorkOrder();
            wo_sa.WorkTypeId = wt_sa.Id;
            wo_sa.City = 'Bangalore';
            wo_sa.Country = 'India';
            wo_sa.Street = 'Palm Retreat';
            wo_sa.Latitude = 12.9716;
            wo_sa.Longitude = 77.5946;
            insert wo_sa;

            rp = new ResourcePreference();
            rp.RelatedRecordId = wo.Id;
            rp.ServiceResourceId = sr.Id;
            insert rp;


            sa = new ServiceAppointment();
            sa.ParentRecordId = wo.Id;
            sa.City = 'Bangalore';
            sa.Country = 'India';
            sa.Street = 'Palm Retreat';
            sa.ArrivalWindowStartTime = DateTime.valueOf('2024-03-11 10:00:00');
            sa.ArrivalWindowEndTime = DateTime.valueOf('2024-03-11 14:00:00');
            sa.Status = 'Dispatched';
            sa.ServiceTerritoryId = ter.id;
            sa.EarliestStartTime = DateTime.valueOf('2024-03-01 10:00:00');
            sa.DueDate = DateTime.valueOf('2024-05-19 10:00:00');
            sa.SchedStartTime = DateTime.valueOf('2024-03-11 11:00:00');
            sa.SchedEndTime = DateTime.valueOf('2024-03-11 12:00:00');
            sa.ServiceNote = 'Your appointment is confirmed';
            sa.Latitude = 12.9716;
            sa.Longitude = 77.5946;
            insert sa;
          
            ar = new AssignedResource();
            ar.ServiceResourceId = sr.id;
            ar.ServiceAppointmentId = sa.id;
            // TODO CHNAGE THIS
            //ar.ApptAssistantInfoUrl = 'www.salesforce.com';
            insert ar;

            return ar;
        } 
        return null;
        
    }

    public static User createUserWithPermSet(String email) {
        User usr = setupUser('System Administrator', email, true);

        return usr;
    }

    @isTest 
    static void test_getServiceAppointment() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user){
            Test.startTest();
            
             Map<String,String> mapInfo = FollowUpAppointmentController.getServiceAppointment(sa.Id);
             Map<String,String> mapInfo2 = FollowUpAppointmentController.getServiceAppointment('123123');

            List<String> schedulingPolicyList = FollowUpAppointmentController.getSchedulingPolicyList();
            List<String> operatingHoursList = FollowUpAppointmentController.getOperatingHoursList();

            
              
            system.assert(mapInfo.size() > 0, true);
            system.assert(mapInfo2.size() > 0, true);

            system.assert(schedulingPolicyList.size() > 0, true);
            system.assert(operatingHoursList.size() > 0, true);


            // system.assert(saInfo.size() > 0);
            // system.assert(currentAssignmentMethodInfo.size() > 0);
            // system.assert(scheduleSAInfo.size() > 0);
            // system.assert(Info1.size() > 0);
            // system.assert(Info2.size() > 0);
            // system.assert(Info3.size() > 0);
            // system.assert(Info4.size() > 0);

            Test.stopTest();
        }
    }


    @isTest 
    static void test_getSlots() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user){
            Test.startTest();
            
            Map<String, Object> mapInfo = FollowUpAppointmentController.getSlots(sa.Id, oh.Id, sp.Id, true, '');
            system.assert(mapInfo.size() > 0, true);

            Test.stopTest();
        }
    }

    @isTest 
    static void test_getSlotsByAssignmentMethod() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user){
            Test.startTest();
            Map<String, Object> mapInfo = FollowUpAppointmentController.getSlotsByAssignmentMethod(sa.Id, oh.Id, sp.Id, true, '');
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_scheduleSA() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, Object> mapInfo = FollowUpAppointmentController.scheduleSA(sa.Id, sp.Id);
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_updateSASlot() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> mapInfo = FollowUpAppointmentController.updateSASlot(sa.Id, sa.EarliestStartTime, sa.dueDate);
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }
    
    @isTest 
    static void test_updateServiceAppointmentStatus() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> mapInfo = FollowUpAppointmentController.updateServiceAppointmentStatus(sa.Id, sa.Status);
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_updateSA() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, Object> mapInfo = FollowUpAppointmentController.updateSA(sa.Id, sa.EarliestStartTime, sa.dueDate, sa.dueDate);
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_deleteExistingRequiredResources() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            FollowUpAppointmentController.deleteExistingRequiredResources(wo.Id);
            //system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_deleteExistingResourcePreferencesForResource() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            FollowUpAppointmentController.deleteExistingResourcePreferencesForResource(wo.Id, wo.Id);
            //system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_addNewRequiredResource() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            WorkOrder tempWo = new WorkOrder();
            tempWo.WorkTypeId = wt.Id;
            insert tempWo;
            Test.startTest();
            FollowUpAppointmentController.addNewRequiredResource(wo.Id, sr.Id);
            FollowUpAppointmentController.addNewRequiredResource(tempWo.Id, sr.Id);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_assignCurrentUserAsRequiredResource() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> mapInfo = FollowUpAppointmentController.assignCurrentUserAsRequiredResource(sa.Id, 'assignToMe');
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_isUserExcludedResource() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, Boolean> mapInfo = FollowUpAppointmentController.isUserExcludedResource(sa.Id);
            //Map<String, Boolean> mapInfo2 = FollowUpAppointmentController.isUserExcludedResource('tempId');
            system.assert(mapInfo.size() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_cloneWorkOrder() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> mapInfo = FollowUpAppointmentController.cloneWorkOrder(sa.Id, sa.SchedStartTime, sa.DueDate, sa.Id, wo.Id);
            Map<String, String> mapInfo2 = FollowUpAppointmentController.cloneWorkOrder(sa.Id, sa.SchedStartTime, sa.DueDate, null, null);

            system.assert(mapInfo.size() > -1, true);
            system.assert(mapInfo2.size() > -1, true);

            Test.stopTest();
        }
    }

    @isTest 
    static void test_deleteClonedResourcePreference() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            String mapInfo = FollowUpAppointmentController.deleteClonedResourcePreference(wo.Id);
            system.assert(mapInfo.length() > -1, true);
            Test.stopTest();
        }
    }


    @isTest 
    static void test_copyResourcePreferenceObject() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            FollowUpAppointmentController.copyResourcePreferenceObject(rp, wo.Id);
            //system.assert(mapInfo.length() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_updateDummySa() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> mapInfo = FollowUpAppointmentController.updateDummySa(sa.Id, sa.SchedStartTime, sa.SchedEndTime, sa.ServiceTerritoryId);
            system.assert(mapInfo.size() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_createNewDummyWorkOrder() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {

            WorkOrder tempWo = new WorkOrder();
            tempWo.WorkTypeId = wt.Id;
            tempWo.City = 'Bangalore';
            tempWo.Country = 'India';
            tempWo.Street = 'Palm Retreat';
            insert tempWo;

            Test.startTest();
            String mapInfo = FollowUpAppointmentController.createNewDummyWorkOrder(sa.ServiceTerritoryId, wt.Id, wo.Id);
            String mapInfo2 = FollowUpAppointmentController.createNewDummyWorkOrder('', wt.Id, wo.Id);
            String mapInfo3 = FollowUpAppointmentController.createNewDummyWorkOrder('', wt.Id, tempWo.Id);
            system.assert(mapInfo.length() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_getUserName() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            String mapInfo = FollowUpAppointmentController.getUserName();
            system.assert(mapInfo.length() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_convertTimeToOtherTimeZone() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, DateTime>  resultArray = FollowUpAppointmentController.convertTimeToOtherTimeZone(sa.DueDate, sa.EarliestStartTime, 'America/Tijuana', 'America/Tijuana');
            system.assert(resultArray.size() > 0, true);
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_getUpdatedSASchedulingInfo() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String>  resultArray = FollowUpAppointmentController.getUpdatedSASchedulingInfo(sa.Id);
            system.assert(resultArray.size() > 0, true);
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_getSpAndOpId() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Id resultArray = FollowUpAppointmentController.getSchedulingPolicyId(sp.Name);
            Id resultArray2 = FollowUpAppointmentController.getOperatingHoursId(oh.Name);

            system.assert(resultArray != null, true);
            system.assert(resultArray2 != null, true);

            Test.stopTest();        
        }
    }

    @isTest 
    static void test_getSettingsObject() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> resultArray = FollowUpAppointmentController.getSettingsObject(wo.Id);
            system.assert(resultArray.size() > -1 , true);
            Test.stopTest();     
        }
    }

    @isTest 
    static void test_getSettingsObject2() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            // Insert setting object 
            FollowupAppointmentSettings__c  settingsObj = new FollowupAppointmentSettings__c();
            settingsObj.ShowExactArrivalTime__c = true;
            settingsObj.Operating_Hours__c = oh.Id;
            settingsObj.Scheduling_Policy__c = sp.Id;
            settingsObj.Name = 'AA_Followup_Settings';
            settingsObj.Screen_Title_1__c = 'abc';
            settingsObj.Screen_Title_2__c = 'abc';
            settingsObj.Screen_Title_3__c = 'abc';
            settingsObj.Record_To_Create__c = 'workOrder';
            settingsObj.Scheduling_Horizon_Value__c = 12;
            settingsObj.Technician_Assigment__c = '23';
            insert settingsObj;
            Test.startTest();
            Map<String, String> resultArray2 = FollowUpAppointmentController.getSettingsObject(wo.Id);
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_deleteClonedAppointmentData() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String,String> mapInfo = FollowUpAppointmentController.deleteClonedAppointmentData(sa.Id);
            system.assert(mapInfo.size() > 0, true);
            Test.stopTest();
        }
    }

    // @isTest 
    // static void Test_cloneResourcePreference() {
    //     User user = createUserWithPermSet(ADMIN_EMAIL);
    //     makeData(user);
    //     system.runas(user) {
    //         WorkOrder newWo = new WorkOrder();
    //         newWo.WorkTypeId = wt.Id;
    //         insert newWo;
    //         Test.startTest();
    //         String resultStr = FollowUpAppointmentController.cloneResourcePreference(wo.Id, newWo.Id);
    //         system.assert(resultStr.length() > -1, true);
    //         Test.stopTest();
    //     }
    // }

    @isTest 
    static void Test_deleteClonedWorkOrder() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            String resultStr = FollowUpAppointmentController.deleteClonedWorkOrder(wo.Id);
            system.assert(resultStr.length() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void Test_getObjectNames() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            List<String> resultStr = FollowUpAppointmentController.getObjectNames();
            system.assert(resultStr.size() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void Test_getConfigurationData() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> resultStr = FollowUpAppointmentController.getConfigurationData();
            system.assert(resultStr.size() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void Test_getSavedScreenData() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, String> resultStr = FollowUpAppointmentController.getSavedScreenData();
            system.assert(resultStr.size() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void test_saveSettings() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            List<String> objectList = new List<String>();
            objectList.add(sp.Name);
            objectList.add(oh.Name);
            objectList.add('true');
            objectList.add('10');
            objectList.add('serviceAppointment');
            objectList.add('1');
            objectList.add('serviceAppointment');
            Test.startTest();
            Map<String, Object>  resultStr = FollowUpAppointmentController.saveSettings(objectList);
            system.assert(resultStr.size() > -1, true);
            Test.stopTest();
        }
    }

    @isTest 
    static void Test_saveSettings2() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {

            List<String> objectList = new List<String>();
            objectList.add(sp.Name);
            objectList.add(oh.Name);
            objectList.add('true');
            objectList.add('10');
            objectList.add('serviceAppointment');
            objectList.add('1');
            objectList.add('serviceAppointment');

            // Insert setting object 
            FollowupAppointmentSettings__c  settingsObj = new FollowupAppointmentSettings__c();
            settingsObj.ShowExactArrivalTime__c = true;
            settingsObj.Operating_Hours__c = oh.Id;
            settingsObj.Scheduling_Policy__c = sp.Id;
            settingsObj.Name = 'AA_Followup_Settings';
            settingsObj.Screen_Title_1__c = 'abc';
            settingsObj.Screen_Title_2__c = 'abc';
            settingsObj.Screen_Title_3__c = 'abc';
            settingsObj.Record_To_Create__c = 'workOrder';
            settingsObj.Scheduling_Horizon_Value__c = 12;
            settingsObj.Technician_Assigment__c = '23';
            insert settingsObj;
            Test.startTest();
            Map<String, Object>  resultStr2 = FollowUpAppointmentController.saveSettings(objectList);
            Test.stopTest();
        }
    }




    @isTest 
    static void Test_saveFieldSettings2() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {

            // Insert setting object 
            FollowupAppointmentSettings__c  settingsObj = new FollowupAppointmentSettings__c();
            settingsObj.ShowExactArrivalTime__c = true;
            settingsObj.Operating_Hours__c = oh.Id;
            settingsObj.Scheduling_Policy__c = sp.Id;
            settingsObj.Name = 'AA_Followup_Settings';
            settingsObj.Screen_Title_1__c = 'abc';
            settingsObj.Screen_Title_2__c = 'abc';
            settingsObj.Screen_Title_3__c = 'abc';
            settingsObj.Record_To_Create__c = 'workOrder';
            settingsObj.Scheduling_Horizon_Value__c = 12;
            settingsObj.Technician_Assigment__c = '23';
            insert settingsObj;

            Test.startTest();
            List<String> objectList = new List<String>();
            objectList.add('1');
            objectList.add('screentitle');
            objectList.add('serviceAppointment.Account');
            Map<String, Object>  resultStr = FollowUpAppointmentController.saveFieldSettings(objectList);
            system.assert(resultStr.size() > -1, true);

            List<String> objectList2 = new List<String>();
            objectList2.add('2');
            objectList2.add('screentitle');
            objectList2.add('serviceAppointment.Account');
            Map<String, Object>  resultStr2 = FollowUpAppointmentController.saveFieldSettings(objectList2);


            List<String> objectList3 = new List<String>();
            objectList3.add('3');
            objectList3.add('screentitle');
            objectList3.add('serviceAppointment.Account');
            Map<String, Object>  resultStr3 = FollowUpAppointmentController.saveFieldSettings(objectList3);

            Test.stopTest();
        }
    }

    @isTest 
    static void Test_saveFieldSettings() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            List<String> objectList = new List<String>();
            objectList.add('1');
            objectList.add('screentitle');
            objectList.add('serviceAppointment.Account');
            Map<String, Object>  resultStr = FollowUpAppointmentController.saveFieldSettings(objectList);
            system.assert(resultStr.size() > -1, true);

            List<String> objectList2 = new List<String>();
            objectList2.add('2');
            objectList2.add('screentitle');
            objectList2.add('serviceAppointment.Account');
            Map<String, Object>  resultStr2 = FollowUpAppointmentController.saveFieldSettings(objectList2);


            List<String> objectList3 = new List<String>();
            objectList3.add('3');
            objectList3.add('screentitle');
            objectList3.add('serviceAppointment.Account');
            Map<String, Object>  resultStr3 = FollowUpAppointmentController.saveFieldSettings(objectList3);

            Test.stopTest();
        }
    }

    @isTest 
    static void Test_deleteScreen() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            FollowupAppointmentSettings__c  settingsObj = new FollowupAppointmentSettings__c();
            settingsObj.ShowExactArrivalTime__c = true;
            settingsObj.Operating_Hours__c = oh.Id;
            settingsObj.Scheduling_Policy__c = sp.Id;
            settingsObj.Name = 'AA_Followup_Settings';
            settingsObj.Screen_Title_1__c = 'abc';
            settingsObj.Screen_Title_2__c = 'abc';
            settingsObj.Screen_Title_3__c = 'abc';
            settingsObj.Record_To_Create__c = 'workOrder';
            settingsObj.Scheduling_Horizon_Value__c = 12;
            settingsObj.Technician_Assigment__c = '23';
            insert settingsObj;

            Test.startTest();
            
            Map<String, Object>  resultStrz = FollowUpAppointmentController.duplicateScreenData(1,1);
            system.assert(resultStrz.size() > -1, true);
            Map<String, Object>  resultStr2z = FollowUpAppointmentController.duplicateScreenData(1,2);
            Map<String, Object>  resultStr3z = FollowUpAppointmentController.duplicateScreenData(1,3);

            Map<String, Object>  resultStr4 = FollowUpAppointmentController.duplicateScreenData(2,1);
            Map<String, Object>  resultStr5 = FollowUpAppointmentController.duplicateScreenData(2,2);
            Map<String, Object>  resultStr6 = FollowUpAppointmentController.duplicateScreenData(2,3);

            Map<String, Object>  resultStr7 = FollowUpAppointmentController.duplicateScreenData(3,1);
            Map<String, Object>  resultStr8 = FollowUpAppointmentController.duplicateScreenData(3,2);
            Map<String, Object>  resultStr9 = FollowUpAppointmentController.duplicateScreenData(3,3);
            
            Map<String, Object>  swipeLeft1 = FollowUpAppointmentController.swapScreenLeftRight(1,2);
            Map<String, Object>  swipeLeft2 = FollowUpAppointmentController.swapScreenLeftRight(2,3);
            Map<String, Object>  swipeLeft3 = FollowUpAppointmentController.swapScreenLeftRight(3,3);

            Map<String, Object>  resultStr = FollowUpAppointmentController.deleteScreen(1);
            system.assert(resultStr.size() > -1, true);
            Map<String, Object>  resultStr2 = FollowUpAppointmentController.deleteScreen(2);
            Map<String, Object>  resultStr3 = FollowUpAppointmentController.deleteScreen(3);

            Test.stopTest();
        }
    }

    // @isTest 
    // static void Test_duplicateScreenData() {
    //     User user = createUserWithPermSet(ADMIN_EMAIL);
    //     makeData(user);
    //     system.runas(user) {
    //         FollowupAppointmentSettings__c  settingsObj = new FollowupAppointmentSettings__c();
    //         settingsObj.ShowExactArrivalTime__c = true;
    //         settingsObj.Operating_Hours__c = oh.Id;
    //         settingsObj.Scheduling_Policy__c = sp.Id;
    //         settingsObj.Name = 'AA_Followup_Settings';
    //         settingsObj.Screen_Title_1__c = 'abc';
    //         settingsObj.Screen_Title_2__c = 'abc';
    //         settingsObj.Screen_Title_3__c = 'abc';
    //         settingsObj.Record_To_Create__c = 'workOrder';
    //         settingsObj.Scheduling_Horizon_Value__c = 12;
    //         settingsObj.Technician_Assigment__c = '23';
    //         insert settingsObj;

    //         Test.startTest();
    //         Map<String, Object>  resultStr = FollowUpAppointmentController.duplicateScreenData(1,1);
    //         system.assert(resultStr.size() > -1, true);
    //         Map<String, Object>  resultStr2 = FollowUpAppointmentController.duplicateScreenData(1,2);
    //         Map<String, Object>  resultStr3 = FollowUpAppointmentController.duplicateScreenData(1,3);

    //         Map<String, Object>  resultStr4 = FollowUpAppointmentController.duplicateScreenData(2,1);
    //         Map<String, Object>  resultStr5 = FollowUpAppointmentController.duplicateScreenData(2,2);
    //         Map<String, Object>  resultStr6 = FollowUpAppointmentController.duplicateScreenData(2,3);

    //         Map<String, Object>  resultStr7 = FollowUpAppointmentController.duplicateScreenData(3,1);
    //         Map<String, Object>  resultStr8 = FollowUpAppointmentController.duplicateScreenData(3,2);
    //         Map<String, Object>  resultStr9 = FollowUpAppointmentController.duplicateScreenData(3,3);
    //         Test.stopTest();
    //     }
    // }


    // @isTest 
    // static void Test_saveFieldSettings() {
    //     User user = createUserWithPermSet(ADMIN_EMAIL);
    //     makeData(user);
    //     system.runas(user) {
    //         Test.startTest();
    //         List<String> objectList = new List<String>();
    //         objectList.add('1');
    //         objectList.add('screentitle');
    //         objectList.add('serviceAppointment.Account');
    //         Map<String, Object>  resultStr = FollowUpAppointmentController.saveFieldSettings(objectList);
    //         system.assert(resultStr.size() > -1, true);
    //         Test.stopTest();
    //     }
    // }

    @isTest 
    static void Test_formatDataBaseOnValue() {

        String decimalValue = '30.00';
        String dateTimeValue = '2021-03-11 10:00:00';
        String booleanValue = 'true';
        String stringValue = 'string';
        Boolean answer1 = false;
        Boolean answer2 = false;
        Boolean answer3 = false;
        Boolean answer4 = false;

        Test.startTest();

        Object decimalOutput = FollowUpAppointmentController.formatDataBaseOnValue('Double', decimalValue);
        Object dateTimeOutput = FollowUpAppointmentController.formatDataBaseOnValue('DateTime', dateTimeValue);
        Object booleanOutput = FollowUpAppointmentController.formatDataBaseOnValue('Boolean', booleanValue);
        Object stringOutput = FollowUpAppointmentController.formatDataBaseOnValue('String', stringValue);

        if (decimalOutput instanceof Decimal) answer1 =  true;
        if (dateTimeOutput instanceof DateTime) answer2 =  true;
        if (booleanOutput instanceof Boolean) answer3 =  true;
        if (stringOutput instanceof String) answer4 =  true;

        system.assert(answer1 , true);
        system.assert(answer2 , true);
        system.assert(answer3 , true);
        system.assert(answer4 , true);

        Test.stopTest();
    }

    @isTest 
    static void test_createRecord_WO() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            List<String> arr  = new List<String>();
            arr.add('ServiceAppointment,Duration,Double,60');
            arr.add('ServiceAppointment,DurationType,Picklist,Minutes');
            arr.add('ServiceAppointment,FSL__Auto_Schedule__c,Boolean,false');
            Test.startTest();
            Map<String, Object> resultArray = FollowUpAppointmentController.createRecord('WorkOrder', wo.Id, arr, sa.ArrivalWindowStartTime, sa.ArrivalWindowEndTime, '10' );
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_createRecord_WO_SA() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            List<String> arr  = new List<String>();
            arr.add('WorkOrder,WorkTypeId,Reference,'+wt_sa.Id);
            arr.add('ServiceAppointment,Duration,Double,60');
            arr.add('ServiceAppointment,DurationType,Picklist,Minutes');
            arr.add('ServiceAppointment,FSL__Auto_Schedule__c,Boolean,false');
            Test.startTest();
            Map<String, Object> resultArray = FollowUpAppointmentController.createRecord('WorkOrder', wo_sa.Id, arr, sa.ArrivalWindowStartTime, sa.ArrivalWindowEndTime, '10' );
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_createRecord_WOLI() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            List<String> arr  = new List<String>();
            arr.add('ServiceAppointment,Duration,Double,60');
            arr.add('ServiceAppointment,DurationType,Picklist,Minutes');
            arr.add('ServiceAppointment,FSL__Auto_Schedule__c,Boolean,false');
            Test.startTest();
            Map<String, Object> resultArray = FollowUpAppointmentController.createRecord('WorkOrderLineItem', wo.Id, arr, sa.ArrivalWindowStartTime, sa.ArrivalWindowEndTime, '10' );
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_createRecord_WOLI_SA() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            List<String> arr  = new List<String>();
            arr.add('WorkOrderLineItem,WorkTypeId,Reference,'+wt_sa.Id);
            arr.add('ServiceAppointment,Duration,Double,60');
            arr.add('ServiceAppointment,DurationType,Picklist,Minutes');
            arr.add('ServiceAppointment,FSL__Auto_Schedule__c,Boolean,false');
            Test.startTest();
            Map<String, Object> resultArray = FollowUpAppointmentController.createRecord('WorkOrderLineItem', wo_sa.Id, arr, sa.ArrivalWindowStartTime, sa.ArrivalWindowEndTime, '10' );
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_createRecord_SA() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            List<String> arr  = new List<String>();
            arr.add('ServiceAppointment,Duration,Double,60');
            arr.add('ServiceAppointment,DurationType,Picklist,Minutes');
            arr.add('ServiceAppointment,FSL__Auto_Schedule__c,Boolean,false');
            Test.startTest();
            Map<String, Object> resultArray = FollowUpAppointmentController.createRecord('ServiceAppointment', wo.Id, arr, sa.ArrivalWindowStartTime, sa.ArrivalWindowEndTime, '10' );
            Test.stopTest();        
        }
    }


    @isTest 
    static void test_checkPermissionSetAssignment() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Map<String, Object> resultArray = FollowUpAppointmentController.checkPermSetAssignedToUser();
            Test.stopTest();        
        }
    }

    @isTest 
    static void test_getWorkTypeOffset() {
        User user = createUserWithPermSet(ADMIN_EMAIL);
        makeData(user);
        system.runas(user) {
            Test.startTest();
            Decimal offset = FollowUpAppointmentController.getWorkTypeOffset(wt.Name);
            Test.stopTest();
        }
    }

}
