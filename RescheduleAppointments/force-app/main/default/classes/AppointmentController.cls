public without sharing class AppointmentController {
    
    public AppointmentController() {

    }

    @AuraEnabled
    public static Map<String, String> getServiceAppointment(String serviceAppointmentId) {

        Map<String, String> serviceAppointmentInfo = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id,
                                            Contact.FirstName,
                                            Contact.LastName,
                                            Contact.Phone,
                                            Status,
                                            Address,
                                            WorkType.Name,
                                            Subject,
                                            EarliestStartTime,
                                            ArrivalWindowStartTime,
                                            ArrivalWindowEndTime,
                                            SchedStartTime,
                                            SchedEndTime,
                                            DueDate,
                                            Description,
                                            AppointmentNumber
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];

                Address addr = sa.Address;
                String customerAddress = '';
                if (addr != null) {
                    if(addr.Street != null) customerAddress = customerAddress + addr.Street + ' ';
                    if(addr.City != null) customerAddress = customerAddress + addr.City + ' ';
                    if(addr.State != null) customerAddress = customerAddress + addr.State + ' ';
                    if(addr.PostalCode != null) customerAddress = customerAddress + addr.PostalCode + ' ';
                    if(addr.Country != null) customerAddress = customerAddress + addr.Country + ' ';
                }
                    
                serviceAppointmentInfo.put('serviceAppointmentId', serviceAppointmentId);
                serviceAppointmentInfo.put('CustomerFirstName', sa.Contact.FirstName);
                serviceAppointmentInfo.put('CustomerLastName', sa.Contact.LastName);
                serviceAppointmentInfo.put('CustomerPhone', sa.Contact.Phone);
                serviceAppointmentInfo.put('ServiceAppointmentStatus', sa.Status);
                serviceAppointmentInfo.put('CustomerAddress', customerAddress);
                serviceAppointmentInfo.put('WorkTypeName', sa.WorkType.Name);
                serviceAppointmentInfo.put('ServiceAppointmentSubject', sa.Subject);
                serviceAppointmentInfo.put('EarliestStartTime', ''+sa.EarliestStartTime);
                serviceAppointmentInfo.put('ArrivalWindowStartTime', ''+sa.ArrivalWindowStartTime); 
                serviceAppointmentInfo.put('ArrivalWindowEndTime', ''+sa.ArrivalWindowEndTime); 
                serviceAppointmentInfo.put('SchedStartTime', ''+sa.SchedStartTime);
                serviceAppointmentInfo.put('SchedEndTime', ''+sa.SchedEndTime);
                serviceAppointmentInfo.put('DueDate', ''+sa.DueDate);
                serviceAppointmentInfo.put('ServiceAppointmentDescription', sa.Description);
                serviceAppointmentInfo.put('AppointmentNumber', sa.AppointmentNumber);

                AssignedResource ar = [SELECT Id, ServiceResourceId
                                        FROM AssignedResource
                                        WHERE ServiceAppointmentId =: serviceAppointmentId
                                        ][0];

                ServiceResource sr = [SELECT Id, Name
                                        FROM ServiceResource
                                        WHERE Id =: ar.ServiceResourceId
                                        ][0];

                serviceAppointmentInfo.put('ServiceResourceName', sr.Name);

            } catch (Exception e) {
                serviceAppointmentInfo.put('error', ''+e);
            }
            return serviceAppointmentInfo;
        
    }

    @AuraEnabled()
    public static String getServiceAppointmentByFieldsList(String serviceAppointmentId, String serviceAppointmnetFields){
        List<sObject> queryresult = new List<SObject>();
        String result= '';
        try{

            System.debug('serviceAppointmnetFields:::' + serviceAppointmnetFields);
            List<String> fieldsJson = (List<String>)JSON.deserialize(serviceAppointmnetFields, List<String>.class);
            
            String fields = createAppointmentQueryFields(fieldsJson);
            String soqlquery = 'SELECT '+ fields + ' FROM ' + 'ServiceAppointment' + ' WHERE ID =:' + serviceAppointmentId;
            //check alphanumeric + _ 
            queryresult = Database.query(soqlquery);
            result = JSON.serialize(queryresult);
            System.debug('Get SA Result'+ queryresult);
            
            //return queryresult[0];

        } catch(Exception e){
            System.debug('Error getServiceAppointmentByFieldsList'+ e);
        }

        return result;
        

    }

    private static String createAppointmentQueryFields(List<String> serviceAppointmnetFields){
        List<String> defaultFields = new List<String>{
            'Id',
            'Contact.FirstName', 
            'Contact.LastName', 
            'Contact.Phone', 
            'Status', 
            'Address', 
            'WorkType.Name', 
            'Subject',
            'EarliestStartTime',
            'ArrivalWindowStartTime',
            'ArrivalWindowEndTime',
            'SchedStartTime',
            'SchedEndTime',
            'DueDate',
            'Description',
            'ServiceNote',
            'WorkTypeId',
            'AppointmentNumber'
        };

        Set<String> allFields = new Set<String>(defaultFields);      
        allFields.addAll(serviceAppointmnetFields);
        List<String> fieldsList = new List<String>();
        fieldsList.addAll(allFields);

        String fieldsStr = String.join( fieldsList, ', ' ); 

        return  fieldsStr;
    }

    @AuraEnabled()
    public static Map<String, Object> getSlots(
        String serviceAppointmentId,
        Id operatingHoursId,
        Id schedulingPolicyId,
        Boolean arrivalWindowFlag,
        String localetimezone
        ) {
       
    
        Map<String, Object> slotsList = new Map<String, Object>();
        
        try {
            if(serviceAppointmentId != null) {           
                ServiceAppointment sa = [SELECT Id, ServiceTerritoryId
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];        
                Timezone timeZone = Timezone.getTimeZone(localetimezone);
                if(timeZone == null ) {
                    timeZone = UserInfo.getTimeZone();
                }
                slotsList.put('timeZone', +timeZone.getId());

                if (sa.ServiceTerritoryId != null) {   
                    ServiceTerritory st = [SELECT OperatingHoursId  
                                            FROM ServiceTerritory   
                                            WHERE ID =: sa.ServiceTerritoryId  
                                            ][0];   
                    OperatingHours oh = [SELECT TimeZone    
                                        FROM OperatingHours 
                                        WHERE ID =: st.OperatingHoursID 
                                        ][0];   
                    timeZone = System.Timezone.getTimeZone(oh.TimeZone);
                    slotsList.put('timeZone', +timeZone.getId());

                }

                List<FSL.AppointmentBookingSlot> timeSlots = FSL.AppointmentBookingService.GetSlots(
                serviceAppointmentId,
                schedulingPolicyId,
                operatingHoursId,
                timeZone,
                arrivalWindowFlag
                );


                slotsList.put('list', timeSlots);
                List<String> timeSlotRange = new List<String>();
    
                for(integer i=0; i<timeSlots.size(); i++) {
                    System.debug('Time slots are : '+timeSlots[i].Interval.Start+'#'+ timeSlots[i].Interval.Finish);
                    timeSlotRange.add(timeSlots[i].Interval.Start+'#'+ timeSlots[i].Interval.Finish+'#'+(timeSlots[i].Grade).longValue());
                }
                slotsList.put('timeSlotList', timeSlotRange);     
            }
            else {
                slotsList.put('error', 'Invalid SA ID or token expired');
            }
            return slotsList;
        } catch (Exception e) {
            System.debug(e.getMessage());
            slotsList.put('error', ''+e.getMessage());
            return slotsList;
        }
    }

    @AuraEnabled
    public static Map<String, Object> getSlotsByAssignmentMethod(
        String serviceAppointmentId,
        Id operatingHoursId,
        Id schedulingPolicyId,
        Boolean arrivalWindowFlag,
        Id userId,
        String currentAssignmentMethod,
        Boolean cleanupRequired,
        String localetimezone
    ){
        try {

            if(currentAssignmentMethod == 'assignToMe'){
                assignCurrentUserAsRequiredResource(userId, serviceAppointmentId);
            }
            /*else if(currentAssignmentMethod == 'assignToAnyAvailable' && cleanupRequired == true){
                //Cleanup previous required resource prefernces modifications created to enable assign to me
                String workOrderId = [SELECT Id, ParentRecordId from ServiceAppointment WHERE Id =: serviceAppointmentId][0]?.ParentRecordId;
                if(workOrderId != null){
                    deleteExistingRequiredResources(workOrderId);
                }
                
            }
            else{
                System.Debug('Error in getSlotsByAssignmentMethod::: Unfamiliar assignment method'  );
            }*/

             return getSlots(serviceAppointmentId, operatingHoursId, schedulingPolicyId, arrivalWindowFlag, localetimezone);
        
        } catch (Exception e) {
            throw new AuraHandledException('Error in getSlotsByAssignmentMethod:::' + e.getMessage());
        }
    }


    @AuraEnabled()
    public static Map<String,String> scheduleSA(String serviceAppointmentId, String schedulingPolicyId, String userId, String currentAssignmentMethod) {
        
        Map<String, String> updateStatusArray = new Map<String, String>();

            try {

                if(currentAssignmentMethod == 'assignToMe'){
                    assignCurrentUserAsRequiredResource(userId, serviceAppointmentId);
                }
                

                System.debug('Service appointment is  : '+serviceAppointmentId);
                FSL.ScheduleResult myResult = new FSL.ScheduleResult();

                myResult = FSL.ScheduleService.schedule(schedulingPolicyId , serviceAppointmentId);
                System.debug('FSL api result is : '+ myResult);

                updateStatusArray.put('success',   '' + myResult);
                
                return updateStatusArray;

            } catch (Exception e) {
               throw new AuraHandledException('Error in scheduleSA:::' + e.getMessage() + ' ' + e.getLineNumber());
            }   
    }

    @AuraEnabled()
    public static Map<String, String> updateSASlot(String serviceAppointmentId, DateTime arrivalWindowStartTime, DateTime arrivalWindowEndTime) {
         // CALL to instrumentation api
         // InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - updateSASlot()');

        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];
                sa.ArrivalWindowStartTime = arrivalWindowStartTime; 
                sa.ArrivalWindowEndTime = arrivalWindowEndTime; 
                update sa;

                updateStatusArray.put('success', 'Appointment Updated');

            } catch (Exception e) {
                updateStatusArray.put('error', ''+e);
            }
        
        return updateStatusArray;
    }

    @AuraEnabled()
    public static Map<String, String> updateServiceAppointmentStatus(String serviceAppointmentId, String statusId) {
        // CALL to instrumentation api
        // InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - updateServiceAppointmentStatus()');

        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];
                sa.Status = statusId;
                update sa;
                updateStatusArray.put('success', 'Appointment Updated');
            } catch (Exception e) {
                updateStatusArray.put('error', ''+e.getMessage());
            }
        
        return updateStatusArray;
    }
    
    @AuraEnabled()
    public static Map<String, Object> updateSA(String serviceAppointmentId, DateTime earliestStartDate, DateTime arrivalStartDate, DateTime arrivalEndDate) {

        Map<String, Object> newSaArray = new Map<String, Object>();

        try {
            if(serviceAppointmentId != null) {
                ServiceAppointment sa = [SELECT Id, EarliestStartTime
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];        
                if(sa != null) {

                    sa.EarliestStartTime = earliestStartDate;
                    sa.ArrivalWindowEndTime = arrivalEndDate;
                    sa.ArrivalWindowStartTime = arrivalStartDate;
                    
                    update sa;
                    system.debug('Service appointment updated');
                    newSaArray.put('success', 'service appointment updated' );
                    
                }
                else {
                    newSaArray.put('error', 'Unable to find service appointment');
                }
            } else {
                newSaArray.put('error', 'No service appointment found');
            }

        } catch (Exception e) {
            System.debug(e.getMessage());
            newSaArray.put('error', ''+e.getMessage());
            return newSaArray;
        }
        return newSaArray;
    }

    @AuraEnabled
    public static void deleteExistingRequiredResources(String workOrderId){
        try {
            List<ResourcePreference> requiredResourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId  AND PreferenceType =: 'Required'];
            if(!requiredResourcePreferenceList.isEmpty()){
                delete requiredResourcePreferenceList;
                System.debug('deleted all existing required resources for work order:::' + workOrderId); 
            }
            

        } catch (Exception e) {
            throw new AuraHandledException('Error in deleteExistingRequiredResources:::' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteExistingResourcePreferencesForResource(String workOrderId, String serviceResourceId){
        try {
            List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId  AND ServiceResourceId =: serviceResourceId];
            if(!resourcePreferenceList.isEmpty()){
                delete resourcePreferenceList;
                System.debug('deleted existing resource preferences for service resource:::' + serviceResourceId); 
            }
            

        } catch (Exception e) {
            throw new AuraHandledException('Error in deleteExistingRequiredResources:::' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void addNewRequiredResource(String workOrderId, String serviceResourceId){
        try {

            List<ResourcePreference> existingResourcePreference = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId  AND ServiceResourceId =: serviceResourceId];
            
		    if(existingResourcePreference == null || existingResourcePreference.IsEmpty()){
                ResourcePreference techReq = new ResourcePreference(
                        PreferenceType= 'Required',
                        RelatedRecordId = workOrderId,
                        ServiceResourceId = serviceResourceId
                        );
                insert techReq;
                        
                System.debug('Added new required resource::: ' );
            }
            else if(existingResourcePreference[0].PreferenceType != 'Required'){
                existingResourcePreference[0].PreferenceType= 'Required';
                update existingResourcePreference;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error in  addNewRequiredResource resource ' + serviceResourceId + ' : ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String, String> assignCurrentUserAsRequiredResource(String userId, String serviceAppointmentId){
        try {
            
            Map<String, String> resultArray = new Map<String, String>();
            String serviceResourceId = [SELECT Id from ServiceResource WHERE RelatedRecordId =: userId][0]?.Id;
            String workOrderId = [SELECT Id, ParentRecordId FROM ServiceAppointment WHERE Id =: serviceAppointmentId][0]?.ParentRecordId;

            if(workOrderId != null && serviceResourceId != null){

                deleteExistingRequiredResources(workOrderId);
                deleteExistingResourcePreferencesForResource(workOrderId, serviceResourceId);
                addNewRequiredResource(workOrderId, serviceResourceId);
                
                List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId AND PreferenceType =: 'Required'];

                if(resourcePreferenceList != null && resourcePreferenceList.size() == 1){
                    System.debug('Assigned ' + serviceResourceId + 'as required resource in ::: ' + workOrderId);
                    resultArray.put('success', serviceResourceId);
                    
                }
                else{
                    System.debug('Could not assign ' + serviceResourceId + 'as required resource in::: ' + workOrderId);
                    resultArray.put('error', serviceResourceId);
                }
                                                
            }else{
                resultArray.put('error', serviceResourceId);
            }


            return resultArray;

        } catch (Exception e) {
            throw new AuraHandledException('Error in assignCurrentUserAsRequiredResource:::' + e.getMessage());
            
        }        
    }

    @AuraEnabled
    public static Map<String,Boolean> isUserExcludedResource(String userId, String serviceAppointmentId){
        Map<String,Boolean> results = new Map<String,Boolean>();

        try {
        
            String serviceResourceId = [SELECT Id from ServiceResource WHERE RelatedRecordId =: userId][0]?.Id;
            String workOrderId = [SELECT Id, ParentRecordId FROM ServiceAppointment WHERE Id =: serviceAppointmentId][0]?.ParentRecordId;

            if(serviceResourceId != null && workOrderId != null){
                List<ResourcePreference> resourcePreference = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE ServiceResourceId =: serviceResourceId AND RelatedRecordId =: workOrderId];
                if(!resourcePreference.isEmpty()){
                    resourcePreference tech = resourcePreference[0];
                    if((String)tech.get('PreferenceType') != null && (String)tech.get('PreferenceType') == 'Excluded'){
                        results.put('success', true);
                    }
                    else{
                        results.put('success', false);
                    }
                }
            }else{
                results.put('error', false);
            }

           
        } catch (Exception e) {
             throw new AuraHandledException('Error in isUserExcludedResource:::' + e.getMessage() + ', ' + e.getLineNumber());
        }

        return results;
    }

    @AuraEnabled
    public static Map<String,String> cloneWorkOrder(
        String originalSaId,
        DateTime startPermitDate,
        Integer selectedHorizonValue,
        String dummySA,
        String dummyWO
        ){
        //Todo return error
        Map<String,String> results = new MAP<String,String>();
        //DateTime dueDate = startPermitDate + selectedHorizonValue;

        try {
            ServiceAppointment originalSa = [SELECT Id,
                                                WorkTypeId,
                                                EarliestStartTime,
                                                ArrivalWindowStartTime,
                                                ArrivalWindowEndTime,
                                                SchedStartTime,
                                                SchedEndTime,
                                                DueDate,
                                                ServiceTerritoryId,
                                                Address,
                                                ParentRecordId 
                                                FROM ServiceAppointment
                                                WHERE ID =: originalSaId
                                                ][0];

           //DateTime dueDate = startPermitDate + selectedHorizonValue; 
           DateTime dueDate = originalSa.DueDate;   
            if(dummySA != null){
               
                //update existing startdate and due date
                updateDummySa(dummySA, startPermitDate, dueDate, originalSa.ServiceTerritoryId);
                results.put('dummyServiceAppointmentId', dummySA);
                results.put('dummyWorkOrderId', dummyWO);
            }
            else{
                
                String originalWOId = originalSa.ParentRecordId;

                Address address = originalSa.Address;

                String newWOId = createNewDummyWorkOrder(originalSa.ServiceTerritoryId, originalSa.WorkTypeId, originalWOId );

                if(String.isNotEmpty(newWOId)){

                    ServiceAppointment sa = [SELECT Id FROM ServiceAppointment where ParentRecordId =: newWOId][0];
                    if(sa == null){
                        sa = new ServiceAppointment();
                        sa.ParentRecordId = newWOId;
                        sa.DueDate = dueDate;
                        sa.EarliestStartTime = startPermitDate;
                        sa.ServiceTerritoryId = originalSa.ServiceTerritoryId;
                        insert sa;
                        
                    }
                    else{
                        updateDummySa(sa.Id, startPermitDate, dueDate, originalSa.ServiceTerritoryId);
                    }

                    //Clone resource preference list
                    String workOrderId = [SELECT Id, ParentRecordId from ServiceAppointment WHERE Id =: originalSAId][0]?.ParentRecordId;

                    System.debug('cloning resource refernce :::' + workOrderId + newWOId); 
                    cloneResourcePreference(workOrderId, newWOId);

                    System.debug('Returning cloned results:::' + sa.Id + newWOId);
                    results.put('dummyServiceAppointmentId', sa.Id);
                    results.put('dummyWorkOrderId', newWOId);
                    
                }
            }

            return results;
            
        }catch (Exception e) {
            System.debug('Error in clone work order:::' + e.getMessage() + e.getLineNumber());
            results.put('error', 'Error in clone work order:::' + e.getMessage() + e.getLineNumber());
            return results;
        }   
    }

    @AuraEnabled
    public static string deleteClonedResourcePreference(String clonedEorkOrderId){
        try {
            List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: clonedEorkOrderId];

            if(!resourcePreferenceList.isEmpty()){
                delete resourcePreferenceList;
            }

            return clonedEorkOrderId;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string deleteClonedWorkOrder(String clonedEorkOrderId){
        try {
            workOrder workOrder = [SELECT Id FROM WorkOrder WHERE Id =: clonedEorkOrderId][0];

            if(workOrder != null){
                delete workOrder;

                System.debug('Deleted ClonedWorkOrder::: ' + workOrder.Id);
                return workOrder.Id;
            }
            else{
                return '';
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string cloneResourcePreference(String workOrderId, String newWOId){
        try {
            
            List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId];

            if(!resourcePreferenceList.isEmpty()){
                //copy list
                 for (ResourcePreference tech : resourcePreferenceList){
                    copyResourcePreferenceObject(tech, newWOId);
                 }
            }
           
            return newWOId;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void copyResourcePreferenceObject(ResourcePreference originalRFObj, String newWO){
        try {

            ResourcePreference RFCopy = new ResourcePreference(
                        PreferenceType= originalRFObj.PreferenceType,
                        RelatedRecordId = newWO,
                        ServiceResourceId = originalRFObj.serviceResourceId
                        );
            insert RFCopy;
        } catch (Exception e) {
            throw new AuraHandledException('Error in copyResourcePreferenceObject::: ' + newWO + ' ' + originalRFObj.serviceResourceId + e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String,String> deleteClonedAppointmentData(String clonedServiceAppointmentId){
        Map<String,String> result = new Map<String,String>();
        try {
           
            ServiceAppointment sa = [SELECT Id, ParentRecordId FROM ServiceAppointment WHERE Id =: clonedServiceAppointmentId][0];
  
            if(sa != null){
                String woid = sa.ParentRecordId;
                WorkOrder wo = [SELECT Id FROM WorkOrder WHERE Id =: woid][0];

                delete sa;

                if(wo != null && String.isNotEmpty(woid)){
                    //delete after
                     List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: woid];
                    if(resourcePreferenceList != null){
                        delete resourcePreferenceList;
                                         
                    }
                    delete wo;
                    result.put('success', 'Sa: ' + sa.id + ' WO: ' + woid);
                }
                             
                
            }
            
            return result;
        } catch (Exception e) {
            result.put('error', e.getMessage());
            return result;
        }
    }

    
    @AuraEnabled
    public static Map<String, String> updateDummySa(String dummySA, DateTime startPermitDate, DateTime dueDate, String serviceTerritoryId){
        try {
            Map<String,String> results = new Map<String,String>();

            ServiceAppointment sa = [SELECT Id, ServiceTerritoryId FROM ServiceAppointment where Id =: dummySA][0];
                if(sa != null) {
                    sa.EarliestStartTime = startPermitDate;
                    sa.DueDate = dueDate;

                    if(String.isNotEmpty(serviceTerritoryId)){
                        sa.ServiceTerritoryId = serviceTerritoryId;
                    }

                    update sa;

                    
                    results.put('said', sa.Id);

                    System.debug('updated earliest start time for existing dummySa :::' + sa.Id);
                }
                else{
                    results.put('error', 'Could not find dummySa');

                }

                return results;

        } catch (Exception e) {
            Map<String,String> results = new Map<String,String>();
            results.put('error', e.getMessage() + e.getLineNumber());
            return results;
        }
    }

    
    @AuraEnabled
    public static string createNewDummyWorkOrder(String serviceTerritoryId, String workTypeId, String originalWOId){
        try {    
            String result='';        
            WorkOrder newWO = new WorkOrder();
            if(String.isNotEmpty(workTypeId)){
                newWO.WorkTypeId = workTypeId;
            }
            

            Address originalAddress = [SELECT Address from WorkOrder WHERE Id =: originalWOId][0]?.Address;
            
            if(String.IsEmpty(ServiceTerritoryId) && originalAddress != null){
                    if(originalAddress.Latitude != null && originalAddress.Longitude != null){
                        newWO.Longitude = originalAddress.Longitude;
                        newWO.Latitude = originalAddress.Latitude;
                    }
                    else{
                        newWO.Street = originalAddress.Street;
                        newWO.City = originalAddress.City;
                        newWO.State = originalAddress.State;
                        newWO.Country = originalAddress.Country;
                        newWO.PostalCode = originalAddress.PostalCode;
                    }
            }
            
            insert newWo;
            result = newWO.Id;
            return result;
                
        } catch (Exception e) {
            throw new AuraHandledException('Error in create new Dummy Work Order' + e.getMessage());
        }      
    }

    @AuraEnabled(cacheable=true)
    public static String getUserName (String userId){

        ServiceResource sr = [SELECT RelatedRecordId, Name
        FROM ServiceResource
        WHERE RelatedRecordId =: userId
       ][0];
        
        return sr.Name;
    }

    @AuraEnabled()
    public static Map<String, DateTime> convertTimeToOtherTimeZone(DateTime date1, DateTime date2, string sourceTimezone, string targetTimezone)
    {
        
        Map<String, DateTime> detailArray = new Map<String, DateTime>();
        // Source Timezone 
        TimeZone tz = Timezone.getTimeZone(sourceTimezone);
        System.debug('Display name: ' + tz.getDisplayName());
        System.debug('ID: ' + tz.getID());
        
        Integer offset = tz.getOffset(date1);
        System.debug('Offset: ' + offset/ (1000 * 60));

        Integer offset2 = tz.getOffset(date2);
        System.debug('Offset: ' + offset2/ (1000 * 60));
        
        // target Timezone.
        TimeZone targetTZ = Timezone.getTimeZone(targetTimezone);
        System.debug('Display name: ' + targetTZ.getDisplayName());
        
        // Date 1
        integer offsetTotargetTZ = targetTZ.getOffset(date1);
       	integer correction1 = offset - offsetTotargetTZ;

        // Date 2
        integer offsetTotargetTZ2 = targetTZ.getOffset(date2);
        integer correction2 = offset2 - offsetTotargetTZ2 ;

        detailArray.put('date1',date1.addMinutes(correction1 / (1000 * 60)));
        detailArray.put('date2',date2.addMinutes(correction2 / (1000 * 60)));
        
        return detailArray;
    }

    @AuraEnabled
    public static Map<String, String> getUpdatedSASchedulingInfo(String serviceAppointmentId) {

        Map<String, String> serviceAppointmentInfo = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id,
                                            EarliestStartTime,
                                            ArrivalWindowStartTime,
                                            ArrivalWindowEndTime,
                                            SchedStartTime,
                                            SchedEndTime,
                                            DueDate
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];
                    
                serviceAppointmentInfo.put('EarliestStartTime', ''+sa.EarliestStartTime);
                serviceAppointmentInfo.put('ArrivalWindowStartTime', ''+sa.ArrivalWindowStartTime); 
                serviceAppointmentInfo.put('ArrivalWindowEndTime', ''+sa.ArrivalWindowEndTime); 
                serviceAppointmentInfo.put('SchedStartTime', ''+sa.SchedStartTime);
                serviceAppointmentInfo.put('SchedEndTime', ''+sa.SchedEndTime);
                serviceAppointmentInfo.put('DueDate', ''+sa.DueDate);

            } catch (Exception e) {
                serviceAppointmentInfo.put('error', ''+ e);
            }
            return serviceAppointmentInfo;
        
    }

    @AuraEnabled(cacheable=true)
    public static Id getSchedulingPolicyId (String schedulingPolicyName){
        
       Id schedulingPolicyId = [SELECT Id, Name FROM FSL__Scheduling_Policy__c WHERE Name =: schedulingPolicyName LIMIT 1].Id;
        return schedulingPolicyId;
    }

    @AuraEnabled(cacheable=true)
    public static Id getOperatingHoursId (String operatingHoursName){
        
       Id operatingHoursId  = [SELECT Id, Name FROM OperatingHours WHERE Name =: operatingHoursName LIMIT 1].Id;
        return operatingHoursId;
    }


}