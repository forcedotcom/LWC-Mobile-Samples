public without sharing class FollowUpAppointmentController {
    
    public FollowUpAppointmentController() {

    }
    private static final String UNAUTH_MSG = 'User is not allowed to perform this operation.';

    @AuraEnabled
    public static Decimal getWorkTypeOffset(String workTypeName){
        workTypeName = sanitizeFieldValues(workTypeName);
        try {
            WorkType wt = [SELECT FSL__Due_Date_Offset__c FROM WorkType WHERE Name =: workTypeName][0];
            System.debug('workType '+wt);
            return wt.FSL__Due_Date_Offset__c;
        } catch (Exception e) {
            return -1;
        }
    }

    @AuraEnabled
    public static Map<String, String> getServiceAppointment(String serviceAppointmentId) {

        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
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
                                            AppointmentNumber,
                                            ServiceTerritoryId
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];

                if (sa.ServiceTerritoryId != null) {
                    ServiceTerritory st = [SELECT OperatingHoursId  
                                            FROM ServiceTerritory   
                                            WHERE ID =: sa.ServiceTerritoryId  
                                            ][0];
                    OperatingHours oh = [SELECT TimeZone    
                                            FROM OperatingHours 
                                            WHERE ID =: st.OperatingHoursID 
                                            ][0];
                    serviceAppointmentInfo.put('ServiceTerritoryTimeZone', oh.TimeZone);
                }

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

            } catch (Exception e) {
                serviceAppointmentInfo.put('error', 'SA not found: '+e.getMessage() + ', ' + e.getLineNumber());
            }

            try {
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
                serviceAppointmentInfo.put('error', 'ServiceResource or AssignedResource not found: '+e.getMessage() + ', ' + e.getLineNumber());
            }

            return serviceAppointmentInfo;
        
    }

    @AuraEnabled()
    public static Map<String, Object> getSlots(
        String serviceAppointmentId,
        Id operatingHoursId,
        Id schedulingPolicyId,
        Boolean arrivalWindowFlag,
        String localetimezone
        ) {
    
        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        localetimezone = sanitizeFieldValues(localetimezone);

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
                    timeSlotRange.add(timeSlots[i].Interval.Start+'#'+ timeSlots[i].Interval.Finish+'#'+(timeSlots[i].Grade).longValue());
                }
                slotsList.put('timeSlotList', timeSlotRange);     
            }
            else {
                slotsList.put('error', 'Invalid SA ID or token expired');
            }
            return slotsList;
        } catch (Exception e) {
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
        String localetimezone
    ){
        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        localetimezone = sanitizeFieldValues(localetimezone);
        try {

            return getSlots(serviceAppointmentId, operatingHoursId, schedulingPolicyId, arrivalWindowFlag, localetimezone);
        
        } catch (Exception e) {
            throw new AuraHandledException('Error in getSlotsByAssignmentMethod:::' + e.getMessage());
        }
    }


    @AuraEnabled()
    public static Map<String,String> scheduleSA(String serviceAppointmentId, String schedulingPolicyId) {
        
        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        schedulingPolicyId = sanitizeFieldValues(schedulingPolicyId);
        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                
                FSL.ScheduleResult myResult = new FSL.ScheduleResult();

                if(!Test.isRunningTest()) {    // avoid unit test to cover schedule SA
                    myResult = FSL.ScheduleService.schedule(schedulingPolicyId , serviceAppointmentId);
                }
                updateStatusArray.put('success',   '' + myResult);
                
                return updateStatusArray;

            } catch (Exception e) {
               throw new AuraHandledException('Error in scheduleSA:::' + e.getMessage() + ' ' + e.getLineNumber());
            }   
    }

    @AuraEnabled()
    public static Map<String, String> updateSASlot(String serviceAppointmentId, DateTime arrivalWindowStartTime, DateTime arrivalWindowEndTime) {

        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];

                if (Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() &&
                    Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() ) {
                    sa.ArrivalWindowStartTime = arrivalWindowStartTime; 
                    sa.ArrivalWindowEndTime = arrivalWindowEndTime; 
                } else updateStatusArray.put('DML', 'Permission denied to update ArrivalWindowStartTime, ArrivalWindowEndTime');

                if(ServiceAppointment.sObjectType.getDescribe().isUpdateable()) {
                    update sa;
                } else updateStatusArray.put('DML', 'Permission denied to update ServiceAppointment');
    
                updateStatusArray.put('success', 'Appointment Updated');

            } catch (Exception e) {
                updateStatusArray.put('error', ''+e);
            }
        
        return updateStatusArray;
    }

    @AuraEnabled()
    public static Map<String, String> updateServiceAppointmentStatus(String serviceAppointmentId, String statusId) {

        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        statusId = sanitizeFieldValues(statusId);
        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];

                if (Schema.sObjectType.ServiceAppointment.fields.Status.isUpdateable() ) {
                        sa.Status = statusId;
                } else updateStatusArray.put('DML', 'Permission denied to update Status');
                    
                if(ServiceAppointment.sObjectType.getDescribe().isUpdateable()) {
                    update sa;
                } else updateStatusArray.put('DML', 'Permission denied to update ServiceAppointment');

                updateStatusArray.put('success', 'Appointment Updated');
            } catch (Exception e) {
                updateStatusArray.put('error', ''+e.getMessage());
            }
        
        return updateStatusArray;
    }
    
    @AuraEnabled()
    public static Map<String, Object> updateSA(String serviceAppointmentId, DateTime earliestStartDate, DateTime arrivalStartDate, DateTime arrivalEndDate) {

        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        Map<String, Object> newSaArray = new Map<String, Object>();

        try {
            if(serviceAppointmentId != null) {
                ServiceAppointment sa = [SELECT Id, EarliestStartTime
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];        
                if(sa != null) {

                if (Schema.sObjectType.ServiceAppointment.fields.EarliestStartTime.isUpdateable() &&
                    Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() &&
                    Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() ) {
                    sa.EarliestStartTime = earliestStartDate;
                    sa.ArrivalWindowEndTime = arrivalEndDate;
                    sa.ArrivalWindowStartTime = arrivalStartDate;
                } else newSaArray.put('DML', 'Permission denied to update EarliestStartTime, ArrivalWindowEndTime, ArrivalWindowStartTime');
                    
                    if(ServiceAppointment.sObjectType.getDescribe().isUpdateable()) {
                        update sa;
                    } else newSaArray.put('DML', 'Permission denied to update ServiceAppointment');
    
                    newSaArray.put('success', 'service appointment updated' );
                    
                }
                else {
                    newSaArray.put('error', 'Unable to find service appointment');
                }
            } else {
                newSaArray.put('error', 'No service appointment found');
            }

        } catch (Exception e) {
            newSaArray.put('error', ''+e.getMessage());
            return newSaArray;
        }
        return newSaArray;
    }

    @AuraEnabled
    public static String deleteExistingRequiredResources(String workOrderId) {
        workOrderId = sanitizeFieldValues(workOrderId);
        String response;
        try {
            List<ResourcePreference> requiredResourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId  AND PreferenceType =: 'Required'];
            if(!requiredResourcePreferenceList.isEmpty()){
                delete requiredResourcePreferenceList;
            }
            response = 'success';
            
        } catch (Exception e) {
            response = '**ERROR** '+e.getMessage();
            throw new AuraHandledException('Error in deleteExistingRequiredResources:::' + e.getMessage());
        }
        return response;
    }

    @AuraEnabled
    public static String deleteExistingResourcePreferencesForResource(String workOrderId, String serviceResourceId) {
        workOrderId = sanitizeFieldValues(workOrderId);
        serviceResourceId = sanitizeFieldValues(serviceResourceId);
        String response;
        try {
            List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId  AND ServiceResourceId =: serviceResourceId];
            if(!resourcePreferenceList.isEmpty()){
                delete resourcePreferenceList;
            }            
            response = 'success';

        } catch (Exception e) {
            response = '**ERROR** '+e.getMessage();
            throw new AuraHandledException('Error in deleteExistingResourcePreferencesForResource:::' + e.getMessage());
        }
        return response;
    }

    @AuraEnabled
    public static String addNewRequiredResource(String workOrderId, String serviceResourceId) {
        workOrderId = sanitizeFieldValues(workOrderId);
        serviceResourceId = sanitizeFieldValues(serviceResourceId);
        String response;
        try {
            List<ResourcePreference> existingResourcePreference = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId  AND ServiceResourceId =: serviceResourceId];
            
		    if(existingResourcePreference == null || existingResourcePreference.IsEmpty()){
                ResourcePreference techReq = new ResourcePreference(
                        PreferenceType= 'Required',
                        RelatedRecordId = workOrderId,
                        ServiceResourceId = serviceResourceId
                        );
                insert techReq;
                response = 'success';
            } else if(existingResourcePreference[0].PreferenceType != 'Required'){
                existingResourcePreference[0].PreferenceType= 'Required';
                update existingResourcePreference;
                response = 'success';
            }

        } catch (Exception e) {
            response = '**ERROR** '+e.getMessage();
            throw new AuraHandledException('Error in  addNewRequiredResource resource ' + serviceResourceId + ' : ' + e.getMessage());
        }
        return response;
    }

    @AuraEnabled
    public static Map<String, String> assignCurrentUserAsRequiredResource(String serviceAppointmentId, String currentAssignmentMethod) {
        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        currentAssignmentMethod = sanitizeFieldValues(currentAssignmentMethod);
        try {
            Map<String, String> resultArray = new Map<String, String>();
            String serviceResourceId = [SELECT Id FROM ServiceResource WHERE RelatedRecordId =: Userinfo.getUserId()][0]?.Id;
            String workOrderId = [SELECT Id, ParentRecordId FROM ServiceAppointment WHERE Id =: serviceAppointmentId][0]?.ParentRecordId;

            if (workOrderId != null && serviceResourceId != null) {
                if(ServiceResource.sObjectType.getDescribe().isUpdateable()) {
                    resultArray.put('deleteExistingRequiredResources: ', deleteExistingRequiredResources(workOrderId));
                } else resultArray.put('DML', 'Permission denied to delete ServiceResource');
                if(ServiceResource.sObjectType.getDescribe().isUpdateable()) {
                    resultArray.put('deleteExistingResourcePreferencesForResource: ', deleteExistingResourcePreferencesForResource(workOrderId, serviceResourceId));
                } else resultArray.put('DML', 'Permission denied to delete ServiceResource');
                if(currentAssignmentMethod == 'assignToMe'){
                    if(ServiceResource.sObjectType.getDescribe().isCreateable()) {
                        if(ServiceResource.sObjectType.getDescribe().isUpdateable()) {
                            resultArray.put('addNewRequiredResource: ', addNewRequiredResource(workOrderId, serviceResourceId));
                            List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId AND PreferenceType =: 'Required'];
                            if(resourcePreferenceList != null && resourcePreferenceList.size() == 1){
                                resultArray.put('success', serviceResourceId);                   
                            } else {
                                resultArray.put('error', serviceResourceId);
                            }
                        } else resultArray.put('DML', 'Permission denied to update ServiceResource');
                    } else resultArray.put('DML', 'Permission denied to create ServiceResource');
                }
                                                
            } else {
                resultArray.put('error', serviceResourceId);
            }

            return resultArray;

        } catch (Exception e) {
            throw new AuraHandledException('Error in assignCurrentUserAsRequiredResource:::' + e.getMessage());         
        }        
    }

    @AuraEnabled
    public static Map<String,Boolean> isUserExcludedResource(String serviceAppointmentId) {
        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
        Map<String,Boolean> results = new Map<String,Boolean>();

        try {
        
            String serviceResourceId = [SELECT Id FROM ServiceResource WHERE RelatedRecordId =: Userinfo.getUserId()][0]?.Id;
            String workOrderId = [SELECT Id, ParentRecordId FROM ServiceAppointment WHERE Id =: serviceAppointmentId][0]?.ParentRecordId;
            results.put('serviceResourceId', serviceResourceId != null);
            results.put('workOrderId', workOrderId != null);

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
            results.put('error '+ e.getMessage() + ', ' + e.getLineNumber(), false);
            throw new AuraHandledException('Error in isUserExcludedResource:::' + e.getMessage() + ', ' + e.getLineNumber());
        }

        return results;
    }

    @AuraEnabled
    public static Map<String,String> cloneWorkOrder(
        String originalSaId,
        DateTime startPermitDate,
        DateTime maxValidCalendarDate,
        String dummySA,
        String dummyWO
        ) {

            originalSaId = sanitizeFieldValues(originalSaId);  
            dummySA = sanitizeFieldValues(dummySA);
            dummyWO = sanitizeFieldValues(dummyWO);
            Map<String,String> results = new MAP<String,String>();

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

            DateTime dueDate = originalSa.DueDate;   
                if(dummySA != null){
                    //update existing startdate and due date
                    updateDummySa(dummySA, startPermitDate, maxValidCalendarDate, originalSa.ServiceTerritoryId);
                    results.put('dummyServiceAppointmentId', dummySA);
                    results.put('dummyWorkOrderId', dummyWO);
                }
                else{
                    String originalWOId = originalSa.ParentRecordId;

                    Address address = originalSa.Address;

                    String newWOId = createNewDummyWorkOrder(originalSa.ServiceTerritoryId, originalSa.WorkTypeId, originalWOId );

                    if(String.isNotEmpty(newWOId)){
                        List<ServiceAppointment> saList = [SELECT Id FROM ServiceAppointment WHERE ParentRecordId =: newWOId];
                        if(saList.size() == 0){
                            ServiceAppointment sa = new ServiceAppointment();
                            if (Schema.sObjectType.ServiceAppointment.fields.DueDate.isUpdateable() &&
                                Schema.sObjectType.ServiceAppointment.fields.EarliestStartTime.isUpdateable() &&
                                Schema.sObjectType.ServiceAppointment.fields.ServiceTerritoryId.isUpdateable() ){
                                    sa.ParentRecordId = newWOId;
                                    sa.DueDate = dueDate;
                                    sa.EarliestStartTime = startPermitDate;
                                    sa.ServiceTerritoryId = originalSa.ServiceTerritoryId;
                            } else results.put('DML', 'Permission denied to update DueDate, EarliestStartTime, ServiceTerritoryId');
                            if(ServiceAppointment.sObjectType.getDescribe().isCreateable()) {
                                insert sa;
                                results.put('dummyServiceAppointmentId', sa.Id);
                                results.put('dummyWorkOrderId', newWOId);                            
                            } else results.put('DML', 'Permission denied to create ServiceAppointment');

                        }
                        else{
                            ServiceAppointment sa = saList[0];
                            updateDummySa(sa.Id, startPermitDate, maxValidCalendarDate, originalSa.ServiceTerritoryId);
                            results.put('dummyServiceAppointmentId', sa.Id);
                            results.put('dummyWorkOrderId', newWOId);                        
                        }
                        //Clone resource preference list
                        String workOrderId = [SELECT Id, ParentRecordId from ServiceAppointment WHERE Id =: originalSAId][0]?.ParentRecordId;

                        // cloneResourcePreference(workOrderId, newWOId);

                        }
                }

                return results;
                
            }catch (Exception e) {
                results.put('error', 'Error in clone work order:::' + e.getMessage() + e.getLineNumber());
                return results;
            }   
    }

    @AuraEnabled
    public static string deleteClonedResourcePreference(String clonedEorkOrderId) {
        clonedEorkOrderId = sanitizeFieldValues(clonedEorkOrderId);
        try {
            List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: clonedEorkOrderId];

            if(!resourcePreferenceList.isEmpty()){
                if(ServiceResource.sObjectType.getDescribe().isUpdateable()) {
                    delete resourcePreferenceList;
                } else return ('error: Permission denied to update ServiceResource');
            }

            return clonedEorkOrderId;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string deleteClonedWorkOrder(String clonedEorkOrderId) {
        clonedEorkOrderId = sanitizeFieldValues(clonedEorkOrderId);
        try {
            WorkOrder wo = [SELECT Id FROM WorkOrder WHERE Id =: clonedEorkOrderId][0];

            if(wo != null){
                if(WorkOrder.sObjectType.getDescribe().isDeletable()) {
                    delete wo;
                } else return 'error: Permission denied to delete WorkOrder - deleteClonedWorkOrder';

                return wo.Id;
            }
            else{
                return '';
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // @AuraEnabled
    // public static string cloneResourcePreference(String workOrderId, String newWOId){
    //     try {
            
    //         List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: workOrderId];

    //         if(!resourcePreferenceList.isEmpty()){
    //             //copy list
    //             if(ServiceResourcePreference.sObjectType.getDescribe().isCreateable()) {
    //                 for (ResourcePreference tech : resourcePreferenceList){
    //                     copyResourcePreferenceObject(tech, newWOId);
    //                 }    
    //             } else return 'Error: Permission denied to create ServiceResourcePreference';
    //         }
           
    //         return newWOId;
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }

    @AuraEnabled
    public static void copyResourcePreferenceObject(ResourcePreference originalRFObj, String newWO) {
        newWO = sanitizeFieldValues(newWO);
        try {

            ResourcePreference RFCopy = new ResourcePreference(
                        PreferenceType= originalRFObj.PreferenceType,
                        RelatedRecordId = newWO,
                        ServiceResourceId = originalRFObj.serviceResourceId
                        );
            if(!Test.isRunningTest()) {
                insert RFCopy;
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('Error in copyResourcePreferenceObject::: ' + newWO + ' ' + originalRFObj.serviceResourceId + e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String,String> deleteClonedAppointmentData(String clonedServiceAppointmentId) {
        clonedServiceAppointmentId = sanitizeFieldValues(clonedServiceAppointmentId);
        Map<String,String> result = new Map<String,String>();
        try {
           
            ServiceAppointment sa = [SELECT Id, ParentRecordId FROM ServiceAppointment WHERE Id =: clonedServiceAppointmentId][0];
  
            if(sa != null){
                String woid = sa.ParentRecordId;
                WorkOrder wo = [SELECT Id FROM WorkOrder WHERE Id =: woid][0];
                if(ServiceAppointment.sObjectType.getDescribe().isDeletable()) {
                    delete sa;
                } else result.put('error1','Permission denied to delete ServiceAppointment - deleteClonedAppointmentData');

                if(wo != null && String.isNotEmpty(woid)){
                    //delete after
                     List<ResourcePreference> resourcePreferenceList = [SELECT Id, PreferenceType, RelatedRecordId, ServiceResourceId FROM ResourcePreference WHERE RelatedRecordId =: woid];
                    if(resourcePreferenceList != null){
                        if(ServiceResource.sObjectType.getDescribe().isUpdateable()) {
                            delete resourcePreferenceList;
                        } else result.put('error2','Permission denied to update ServiceResource - deleteClonedAppointmentData');
                                         
                    }
                    if(WorkOrder.sObjectType.getDescribe().isDeletable()) {
                        delete wo;
                    } else result.put('error3','Permission denied to delete WorkOrder - deleteClonedAppointmentData');
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
    public static Map<String, String> updateDummySa(String dummySA, DateTime startPermitDate, DateTime maxValidCalendarDate, String serviceTerritoryId) {
        dummySA = sanitizeFieldValues(dummySA);
        serviceTerritoryId = sanitizeFieldValues(serviceTerritoryId);
        try {
            Map<String,String> results = new Map<String,String>();

            ServiceAppointment sa = [SELECT Id, ServiceTerritoryId FROM ServiceAppointment where Id =: dummySA][0];
                if(sa != null) {

                    if (Schema.sObjectType.ServiceAppointment.fields.EarliestStartTime.isUpdateable() &&
                        Schema.sObjectType.ServiceAppointment.fields.DueDate.isUpdateable() ) {
                        sa.EarliestStartTime = startPermitDate;
                        sa.DueDate = maxValidCalendarDate;
                    } else results.put('DML', 'Permission denied to update EarliestStartTime, DueDate');

                    if(String.isNotEmpty(serviceTerritoryId)){
                        if (Schema.sObjectType.ServiceAppointment.fields.ServiceTerritoryId.isUpdateable() ){
                            sa.ServiceTerritoryId = serviceTerritoryId;
                        } else results.put('DML', 'Permission denied to update ServiceTerritoryId');
                    }

                    if(ServiceAppointment.sObjectType.getDescribe().isUpdateable()) {
                        update sa;
                    } else results.put('DML', 'Permission denied to update ServiceAppointment');
                   
                    results.put('said', sa.Id);

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
    public static string createNewDummyWorkOrder(String serviceTerritoryId, String workTypeId, String originalWOId) {
        serviceTerritoryId = sanitizeFieldValues(serviceTerritoryId);
        workTypeId = sanitizeFieldValues(workTypeId);
        originalWOId = sanitizeFieldValues(originalWOId);
        try {    
            String result='';        
            WorkOrder newWO = new WorkOrder();
            if(String.isNotEmpty(workTypeId)){
                if (Schema.sObjectType.WorkOrder.fields.WorkTypeId.isUpdateable() ){
                    newWO.WorkTypeId = workTypeId;
                } else return 'error: Permission denied to update WorkTypeId';
            }
            
            Address originalAddress;
            try{
                originalAddress = [SELECT Address FROM WorkOrder WHERE Id =: originalWOId][0]?.Address;
            } catch (Exception e){
                originalAddress = [SELECT Address FROM WorkOrderLineItem WHERE Id =: originalWOId][0]?.Address;
            }
            
            if(String.IsEmpty(ServiceTerritoryId) && originalAddress != null){
                    if(originalAddress.Latitude != null && originalAddress.Longitude != null){
                        if (Schema.sObjectType.WorkOrder.fields.Longitude.isUpdateable() &&
                            Schema.sObjectType.WorkOrder.fields.Latitude.isUpdateable() ){
                            newWO.Longitude = originalAddress.Longitude;
                            newWO.Latitude = originalAddress.Latitude;
                        } else return 'error: Permission denied to update Longitude, Latitude';
                    }
                    else {
                        if (Schema.sObjectType.WorkOrder.fields.Street.isUpdateable() &&
                            Schema.sObjectType.WorkOrder.fields.City.isUpdateable() &&
                            Schema.sObjectType.WorkOrder.fields.State.isUpdateable() &&
                            Schema.sObjectType.WorkOrder.fields.Country.isUpdateable() &&
                            Schema.sObjectType.WorkOrder.fields.PostalCode.isUpdateable() ){
                            newWO.Street = originalAddress.Street;
                            newWO.City = originalAddress.City;
                            newWO.State = originalAddress.State;
                            newWO.Country = originalAddress.Country;
                            newWO.PostalCode = originalAddress.PostalCode;
                        } else return 'error: Permission denied to update Street, City, State, Country, PostalCode';
                    }
            }
            
            if(WorkOrder.sObjectType.getDescribe().isCreateable()) {
                insert newWo;
            } else return 'Error: Permission denied to create WorkOrder';

            result = newWO.Id;
            return result;
                
        } catch (Exception e) {
            throw new AuraHandledException('Error in create new Dummy Work Order' + e.getMessage());
        }      
    }

    @AuraEnabled(cacheable=true)
    public static String getUserName () {
        ServiceResource sr = [SELECT RelatedRecordId, Name
                                FROM ServiceResource
                                WHERE RelatedRecordId =: Userinfo.getUserId()
                                ][0];
        
        return sr.Name;
    }

    @AuraEnabled()
    public static Map<String, DateTime> convertTimeToOtherTimeZone(DateTime date1, DateTime date2, string sourceTimezone, string targetTimezone)
    {
        sourceTimezone = sanitizeFieldValues(sourceTimezone);
        targetTimezone = sanitizeFieldValues(targetTimezone);
        
        Map<String, DateTime> detailArray = new Map<String, DateTime>();
        // Source Timezone 
        TimeZone tz = Timezone.getTimeZone(sourceTimezone);
     
        Integer offset = tz.getOffset(date1);

        Integer offset2 = tz.getOffset(date2);
        
        // target Timezone.
        TimeZone targetTZ = Timezone.getTimeZone(targetTimezone);
        
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
        serviceAppointmentId = sanitizeFieldValues(serviceAppointmentId);
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
    public static Id getSchedulingPolicyId (String schedulingPolicyName) {
        schedulingPolicyName = sanitizeFieldValues(schedulingPolicyName);
        Id schedulingPolicyId = [SELECT Id, Name FROM FSL__Scheduling_Policy__c WHERE Name =: schedulingPolicyName LIMIT 1].Id;
        return schedulingPolicyId;
    }

    @AuraEnabled(cacheable=true)
    public static Id getOperatingHoursId (String operatingHoursName) {
        operatingHoursName = sanitizeFieldValues(operatingHoursName);
        Id operatingHoursId  = [SELECT Id, Name FROM OperatingHours WHERE Name =: operatingHoursName LIMIT 1].Id;
        return operatingHoursId;
    }


    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // ---------------- FOLLOWUP APPOINTMENT FEATURE ------------------
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------


    @AuraEnabled
    public static Map<String, String> getSettingsObject(String recordId) {

        recordId = sanitizeFieldValues(recordId);
        Map<String, String> settings = new Map<String, String>();

        try {
            FollowupAppointmentSettings__c obj = [SELECT ShowExactArrivalTime__c,
                                                Operating_Hours__c,
                                                Scheduling_Policy__c,
                                                Scheduling_Horizon_Value__c,
                                                Fields_To_Show_Page_1__c,
                                                Fields_To_Show_Page_2__c,
                                                Fields_To_Show_Page_3__c,
                                                Record_To_Create__c,
                                                Screen_Title_1__c,
                                                Screen_Title_2__c,
                                                Screen_Title_3__c,
                                                Technician_Assigment__c
                                            FROM FollowupAppointmentSettings__c
                                            ][0];

            settings.put('showExactArrivalTime', ''+obj.ShowExactArrivalTime__c);
            settings.put('operatingHoursId', obj.Operating_Hours__c);
            settings.put('schedulingPolicyId', obj.Scheduling_Policy__c);
            settings.put('schedulingHorizonValue', ''+obj.Scheduling_Horizon_Value__c);
            settings.put('fieldsToShowPage1', ''+obj.Fields_To_Show_Page_1__c);
            settings.put('fieldsToShowPage2', ''+obj.Fields_To_Show_Page_2__c);
            settings.put('fieldsToShowPage3', ''+obj.Fields_To_Show_Page_3__c);
            settings.put('headerCustomPage1', ''+obj.Screen_Title_1__c);
            settings.put('headerCustomPage2', ''+obj.Screen_Title_2__c);
            settings.put('headerCustomPage3', ''+obj.Screen_Title_3__c);
            settings.put('recordToCreate', ''+obj.Record_To_Create__c);
            settings.put('workerAssignmentOptions', ''+obj.Technician_Assigment__c);

        } catch (Exception e) {
            settings.put('error1', ''+e);
        }

        try {
            WorkOrder wo = [SELECT ContactId FROM WorkOrder WHERE Id =: recordId][0];
            Contact contact = [SELECT Name FROM Contact WHERE Id =: wo.ContactId][0];
            settings.put('contactName', ''+contact.Name);
        } catch (Exception e) {
            try { // If parent record is WOLI
                WorkOrderLineItem woli = [SELECT WorkOrderId FROM WorkOrderLineItem WHERE Id =: recordId][0];
                WorkOrder wo = [SELECT ContactId FROM WorkOrder WHERE Id =: woli.WorkOrderId][0];
                Contact contact = [SELECT Name FROM Contact WHERE Id =: wo.ContactId][0];
                settings.put('contactName', ''+contact.Name);
            } catch (Exception e1) {
                System.debug('-- error while getting ContactId from parent record');
                settings.put('contactName', '');
            }
        }

        List<ServiceAppointment> saList = [SELECT Id, ParentRecordId
                                            FROM ServiceAppointment
                                            WHERE ParentRecordId =: recordId];
        ServiceAppointment sa;
        if(saList.size() > 1){
            try { // search for the relevant SA
                sa = [SELECT Id, ParentRecordId
                        FROM ServiceAppointment
                        WHERE ParentRecordId =: recordId AND StatusCategory =: 'In Progress'
                        ][0];
                settings.put('serviceAppointmentId', ''+sa.Id);
                settings.put('parentRecordId', ''+sa.ParentRecordId);
            } catch (Exception e) {
                try {
                    sa = [SELECT Id, ParentRecordId
                            FROM ServiceAppointment
                            WHERE ParentRecordId =: recordId AND StatusCategory =: 'Dispatched'
                            ][0];
                    settings.put('serviceAppointmentId', ''+sa.Id);
                    settings.put('parentRecordId', ''+sa.ParentRecordId);                
                } catch (Exception e1) {
                    try {
                        sa = [SELECT Id, ParentRecordId
                                FROM ServiceAppointment
                                WHERE ParentRecordId =: recordId AND StatusCategory =: 'Scheduled'
                                ORDER BY AppointmentNumber DESC NULLS LAST
                                ][0];
                        settings.put('serviceAppointmentId', ''+sa.Id);
                        settings.put('parentRecordId', ''+sa.ParentRecordId);                
                    } catch (Exception e2) {
                        settings.put('error2', 'No Active Service Appointment found (StatusCategory = In Progress, Dispatched) AND no Service Appointment with StatusCategory = Dispatched: '+e2);
                    }
                }
            }
        } else {
            settings.put('serviceAppointmentId', ''+saList[0].Id);
            settings.put('parentRecordId', ''+saList[0].ParentRecordId);
        }

        return settings;
    }

    // ----------------------------------------------------------------
    // ------------------------ CREATE RECORD -------------------------
    // ----------------------------------------------------------------

    public static Object formatDataBaseOnValue(String fieldDataType, String fieldValue) {
        fieldDataType = sanitizeFieldValues(fieldDataType);
        fieldValue = sanitizeFieldValues(fieldValue);

        switch on fieldDataType {
            when 'Double', 'Location'{
                System.debug('-> format to Double or Location');
                Decimal value = decimal.valueof(fieldValue);
                return value;
            }
            when 'DateTime' {
                System.debug('-> format to DateTime');
                DateTime value = Datetime.valueof(fieldValue.replace('T',' '));
                return value;
            }
            when 'Boolean' {
                System.debug('-> format to Boolean');
                Boolean value = boolean.valueof(fieldValue);
                return value;
            }
            when 'Address' { // unsupported types
                System.debug('-> Address field is not allowed');
                String value = 'Address field is not allowed';
                return value;
            }
            when else { // when string
                System.debug('-> format to String');
                String value = fieldValue;
                return value;
            }
        }
    }

    @AuraEnabled
    public static Map<String, Object> createRecord(String recordToCreate, String recordId, List<String> listOfFields, DateTime arrivalWindowStartTime, DateTime arrivalWindowEndTime, String schedulingHorizonValue) {
        Map<String, Object> newRecord = new Map<String, Object>();
        try {
            recordToCreate = sanitizeFieldValues(recordToCreate);
            recordId = sanitizeFieldValues(recordId);
            schedulingHorizonValue = sanitizeFieldValues(schedulingHorizonValue);

            switch on recordToCreate {

                // ----------------------------------------------------------------
                // ---------------------- CREATE WORK ORDER -----------------------
                // ----------------------------------------------------------------
                when 'WorkOrder' {
                    System.debug('** creating new WO **');
                    WorkOrder newWO = new WorkOrder();
                    for (String field : listOfFields) {
                        List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                        String objectApiName = split[0];
                        String fieldApiName = split[1];
                        String fieldDataType = split[2];
                        String fieldValue = split[3];
                        if (objectApiName == 'WorkOrder') {
                            System.debug('field input: '+split);
                            if (fieldValue != 'null') {
                                newWO.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                System.debug('--- value added to record');
                            } else {
                                System.debug('--- disregarding null values');
                            }
                        }
                    }
                    if(WorkOrder.sObjectType.getDescribe().isCreateable()) {
                        insert newWO;
                        newRecord.put('success', 'Work Order created');
                        System.debug('*** Created WorkOrder record: '+newWO);
                    } else {
                        newRecord.put('DML', 'Permission denied to create Work Order');
                    }

                    try {
                        ServiceAppointment newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE ParentRecordId =: newWO.Id][0];
                        if (Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() &&
                            Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() ) {
                            newSA.ArrivalWindowStartTime = arrivalWindowStartTime;
                            newSA.ArrivalWindowEndTime = arrivalWindowEndTime;
                        } else newRecord.put('DML', 'Permission denied to update ArrivalWindowEndTime, ArrivalWindowStartTime');
                        for (String field : listOfFields) {
                            List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                            String objectApiName = split[0];
                            String fieldApiName = split[1];
                            String fieldDataType = split[2];
                            String fieldValue = split[3];
                            if (objectApiName == 'ServiceAppointment') {
                                System.debug('field input: '+split);
                                if (fieldValue != 'null') {
                                    newSA.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                    System.debug('--- value added to record');
                                } else {
                                    System.debug('--- disregarding null values');
                                }
                            }
                        }
                        if(ServiceAppointment.sObjectType.getDescribe().isUpdateable()) {
                            update newSA;
                            newRecord.put('success', 'Service Appointment Updated');
                            System.debug('*** Updated SA record: '+newSA);
                            newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE ParentRecordId =: newWO.Id][0];
                            newRecord.put('SAId', newSA.Id);
                            newRecord.put('SANumber', newSA.AppointmentNumber);
                        } else {
                            newRecord.put('DML', 'Permission denied to update Service Appointment');
                        }
    
                    } catch (Exception e) {
                        // if SA not created automatically, create new SA and update its fields
                        try {
                            ServiceAppointment newSA = new ServiceAppointment();
                            if (Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() &&
                                Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() ) {
                                newSA.ParentRecordId = newWO.Id;
                                newSA.ArrivalWindowStartTime = arrivalWindowStartTime;
                                newSA.ArrivalWindowEndTime = arrivalWindowEndTime;
                            } else newRecord.put('DML', 'Permission denied to update ArrivalWindowStartTime, ArrivalWindowEndTime');
                            for (String field : listOfFields) {
                                List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                                String objectApiName = split[0];
                                String fieldApiName = split[1];
                                String fieldDataType = split[2];
                                String fieldValue = split[3];
                                if (objectApiName == 'ServiceAppointment') {
                                    System.debug('field input: '+split);
                                    if (fieldValue != 'null') {
                                        newSA.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                        System.debug('--- value added to record');
                                    } else {
                                        System.debug('--- disregarding null values');
                                    }
                                }
                            }
                            if (newSA.EarliestStartTime == null) { // Must add ESP and DD values
                                if (Schema.sObjectType.ServiceAppointment.fields.EarliestStartTime.isUpdateable() &&
                                    Schema.sObjectType.ServiceAppointment.fields.DueDate.isUpdateable() ) {
                                    newSA.EarliestStartTime = System.now();
                                    newSA.DueDate = System.now().addDays(integer.valueof(schedulingHorizonValue));
                                } else newRecord.put('DML', 'Permission denied to update EarliestStartTime, DueDate');
                            }
                            if(ServiceAppointment.sObjectType.getDescribe().isCreateable()) {
                                insert newSA;
                                newRecord.put('success', 'Service Appointment Created');
                                System.debug('*** Created SA record: '+newSA);
                                newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE ParentRecordId =: newWO.Id][0];
                                newRecord.put('SAId', newSA.Id);
                                newRecord.put('SANumber', newSA.AppointmentNumber);
                            } else {
                                newRecord.put('DML', 'Permission denied to create Service Appointment');
                            }
                        } catch (Exception e2) {
                            System.debug('*** error: Service Appointment not created: '+e2);
                            newRecord.put('error', 'error: Service Appointment not created: '+e2);
                        }
                    }
                }

                // ----------------------------------------------------------------
                // ----------------- CREATE WORK ORDER LINE ITEM ------------------
                // ----------------------------------------------------------------

                when 'WorkOrderLineItem' {
                    System.debug('** creating new WOLI **');
                    WorkOrderLineItem newWOLI = new WorkOrderLineItem();
                    try { // when initiated via WO
                        WorkOrder woParent = [SELECT Id FROM WorkOrder WHERE Id =: recordId][0];
                        newWOLI.WorkOrderId = recordId;
                    } catch (Exception e2) { // when initiated via WOLI
                        WorkOrderLineItem woliParent = [SELECT Id,WorkOrderId FROM WorkOrderLineItem WHERE Id =: recordId][0];
                        newWOLI.WorkOrderId = woliParent.WorkOrderId;
                    }
                    for (String field : listOfFields) {
                        List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                        String objectApiName = split[0];
                        String fieldApiName = split[1];
                        String fieldDataType = split[2];
                        String fieldValue = split[3];
                        if (objectApiName == 'WorkOrderLineItem') {
                            System.debug('field input: '+split);
                            if (fieldValue != 'null') {
                                newWOLI.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                System.debug('--- value added to record');
                            } else {
                                System.debug('--- disregarding null values');
                            }
                        }
                    }
                    if(WorkOrderLineItem.sObjectType.getDescribe().isCreateable()) {
                        insert newWOLI;
                        newRecord.put('success', 'Work Order Line Item created');
                        System.debug('*** Created WorkOrderLineItem record: '+newWOLI);
                    } else {
                        newRecord.put('DML', 'Permission denied to create Work Order Line Item');
                    }

                    try {
                        ServiceAppointment newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE ParentRecordId =: newWOLI.Id][0];
                        if (Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() &&
                            Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() ) {
                            newSA.ArrivalWindowStartTime = arrivalWindowStartTime;
                            newSA.ArrivalWindowEndTime = arrivalWindowEndTime;
                        } else newRecord.put('DML', 'Permission denied to update ArrivalWindowEndTime, ArrivalWindowStartTime');
                        for (String field : listOfFields) {
                            List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                            String objectApiName = split[0];
                            String fieldApiName = split[1];
                            String fieldDataType = split[2];
                            String fieldValue = split[3];
                            if (objectApiName == 'ServiceAppointment') {
                                System.debug('field input: '+split);
                                if (fieldValue != 'null') {
                                    newSA.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                    System.debug('--- value added to record');
                                } else {
                                    System.debug('--- disregarding null values');
                                }
                            }
                        }
                        if(ServiceAppointment.sObjectType.getDescribe().isUpdateable()) {
                            update newSA;
                            newRecord.put('success', 'Service Appointment Updated');
                            System.debug('*** Updated SA record: '+newSA);
                            newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE ParentRecordId =: newWOLI.Id][0];
                            newRecord.put('SAId', newSA.Id);
                            newRecord.put('SANumber', newSA.AppointmentNumber);
                        } else {
                            newRecord.put('DML', 'Permission denied to update Service Appointment');
                        }
    
                    } catch (Exception e) {
                        // if SA not created automatically, create new SA and update its fields
                        try {
                            ServiceAppointment newSA = new ServiceAppointment();
                            if (Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() &&
                                Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() ) {
                                newSA.ParentRecordId = newWOLI.Id;
                                newSA.ArrivalWindowStartTime = arrivalWindowStartTime;
                                newSA.ArrivalWindowEndTime = arrivalWindowEndTime;
                            } else newRecord.put('DML', 'Permission denied to update ArrivalWindowStartTime, ArrivalWindowEndTime');
                            for (String field : listOfFields) {
                                List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                                String objectApiName = split[0];
                                String fieldApiName = split[1];
                                String fieldDataType = split[2];
                                String fieldValue = split[3];
                                if (objectApiName == 'ServiceAppointment') {
                                    System.debug('field input: '+split);
                                    if (fieldValue != 'null') {
                                        newSA.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                        System.debug('--- value added to record');
                                    } else {
                                        System.debug('--- disregarding null values');
                                    }
                                }
                            }
                            if (newSA.EarliestStartTime == null) { // Must add ESP and DD values
                                if (Schema.sObjectType.ServiceAppointment.fields.EarliestStartTime.isUpdateable() &&
                                    Schema.sObjectType.ServiceAppointment.fields.DueDate.isUpdateable() ) {
                                    newSA.EarliestStartTime = System.now();
                                    newSA.DueDate = System.now().addDays(integer.valueof(schedulingHorizonValue));
                                } else newRecord.put('DML', 'Permission denied to update EarliestStartTime, DueDate');
                            }
                            if(ServiceAppointment.sObjectType.getDescribe().isCreateable()) {
                                insert newSA;
                                newRecord.put('success', 'Service Appointment Created');
                                System.debug('*** Created SA record: '+newSA);
                                newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE ParentRecordId =: newWOLI.Id][0];
                                newRecord.put('SAId', newSA.Id);
                                newRecord.put('SANumber', newSA.AppointmentNumber);
                            } else {
                                newRecord.put('DML', 'Permission denied to create Service Appointment');
                            }
                        } catch (Exception e2) {
                            System.debug('*** error: Service Appointment not created: '+e2);
                            newRecord.put('error', 'Service Appointment not created: '+e2);
                        }
                    }
                }

                // ----------------------------------------------------------------
                // ----------------- CREATE SERVICE APPOINTMENT ------------------
                // ----------------------------------------------------------------

                when else {
                    try {
                        System.debug('** creating new SA **');
                        ServiceAppointment newSA = new ServiceAppointment();
                        if (Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowEndTime.isUpdateable() &&
                            Schema.sObjectType.ServiceAppointment.fields.ArrivalWindowStartTime.isUpdateable() ) {
                            newSA.ParentRecordId = recordId;
                            newSA.ArrivalWindowStartTime = arrivalWindowStartTime;
                            newSA.ArrivalWindowEndTime = arrivalWindowEndTime;
                        } else newRecord.put('DML', 'Permission denied to update ArrivalWindowStartTime, ArrivalWindowEndTime');
                        for (String field : listOfFields) {
                            List<String> split = field.split(','); // 0 - objectApiName, 1 - fieldApiName, 2 - dataType, 3 - value
                            String objectApiName = split[0];
                            String fieldApiName = split[1];
                            String fieldDataType = split[2];
                            String fieldValue = split[3];
                            if (objectApiName == 'ServiceAppointment') {
                                System.debug('field input: '+split);
                                if (fieldValue != 'null') {
                                    newSA.put(fieldApiName, formatDataBaseOnValue(fieldDataType, fieldValue));
                                    System.debug('--- value added to record');
                                } else {
                                    System.debug('--- disregarding null values');
                                }
                            }
                        }
                        if (newSA.EarliestStartTime == null) {
                            if (Schema.sObjectType.ServiceAppointment.fields.EarliestStartTime.isUpdateable() &&
                                Schema.sObjectType.ServiceAppointment.fields.DueDate.isUpdateable() ) {
                                newSA.EarliestStartTime = System.now();
                                newSA.DueDate = System.now().addDays(integer.valueof(schedulingHorizonValue));
                                System.debug('--- added EarliestStartTime: '+newSA.EarliestStartTime);
                                System.debug('--- added DueDate: '+newSA.DueDate);
                            } else newRecord.put('DML', 'Permission denied to update EarliestStartTime, DueDate');
                        }
                        if(ServiceAppointment.sObjectType.getDescribe().isCreateable()) {
                            insert newSA;
                            newRecord.put('success', 'Service Appointment Created');
                            System.debug('*** Created SA record: '+newSA);
                            newSA = [SELECT Id,AppointmentNumber FROM ServiceAppointment WHERE Id =: newSA.Id][0];
                            newRecord.put('SAId', newSA.Id);
                            newRecord.put('SANumber', newSA.AppointmentNumber);
                        } else {
                            newRecord.put('DML', 'Permission denied to create Service Appointment');
                        }
                    } catch (Exception e2) {
                        System.debug('*** error: Service Appointment not created: '+e2);
                        System.debug('*** newRecord: '+newRecord);
                        newRecord.put('error', ' Service Appointment not created: '+e2);
                    }
                }
            }

            return newRecord;

        } catch (Exception e) {
            throw new AuraHandledException('--debug-- '+newRecord+' ; '+e.getMessage());
        }

    }

    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // ---------------------- SETTING PAGE LWC ------------------------
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------

    // ************************* Settings APIs ********** // 

    @Auraenabled(cacheable=true)
    public static List<string> getSchedulingPolicyList() {
        List<string> schedulingPolicyListNames = new List<string>();
        
        List<FSL__Scheduling_Policy__c> schedulingPolicyList = [SELECT Id, Name FROM FSL__Scheduling_Policy__c WHERE IsDeleted =: false WITH SECURITY_ENFORCED];

        for(integer i=0; i<schedulingPolicyList.size(); i++) {
            schedulingPolicyListNames.add(schedulingPolicyList[i].Name);
        }
        return schedulingPolicyListNames;
    }

    @Auraenabled(cacheable=true)
    public static List<string> getOperatingHoursList() {
        List<string> operatingHoursListNames = new List<string>();
        
        List<OperatingHours> operatingHourList = [SELECT Id, Name FROM OperatingHours WHERE IsDeleted =: false WITH SECURITY_ENFORCED ];

        for(integer i=0; i<operatingHourList.size(); i++) {
            operatingHoursListNames.add(operatingHourList[i].Name);
        }
        return operatingHoursListNames;
    }
    
    @Auraenabled(cacheable=false)
    public static List<string> getObjectNames() {

        List<String> stdObjectNames = new List<String>();
        List<String> allowedObjects = new List<String>();
        try {

            List<FollowupAppointmentSettings__c> followUpSettingList = [SELECT Id, Record_To_Create__c FROM FollowupAppointmentSettings__c where Name = 'AA_Followup_Settings' WITH SECURITY_ENFORCED];

            if(followUpSettingList.size() > 0) {     
                FollowupAppointmentSettings__c followupObj = followUpSettingList[0];
                if(followupObj.Record_To_Create__c == 'ServiceAppointment') {
                    allowedObjects.add('ServiceAppointment');
                } else {
                    allowedObjects.add('ServiceAppointment');
                    allowedObjects.add('WorkOrder');
                    allowedObjects.add('WorkOrderLineItem');
                }
            } else {
                allowedObjects.add('ServiceAppointment');
                allowedObjects.add('WorkOrder');
                allowedObjects.add('WorkOrderLineItem');
            }    
            
            for ( Schema.SObjectType typ : Schema.getGlobalDescribe().values() ) {
                String sobjName = String.valueOf(typ);
                for(String obj : allowedObjects) {
                    if(sobjName.equals(obj)) {
                        stdObjectNames.add(sobjName);
                    }
                }
            }
            System.debug('stdObjectNames: ' + stdObjectNames);
            stdObjectNames.sort();
            
        } catch(Exception e) {

        }
        return stdObjectNames;
        
    }


    @AuraEnabled
    public static Map<String, String> checkPermSetAssignedToUser() {

        // First check if the user is admin user. If so, allow to add perm set.
        if (!isAuthorized()) {
            throw new HandledException(UNAUTH_MSG);
        }
        
        Map<String, String> resList = new Map<String, String>();
        List<AggregateResult> hasPermList = [SELECT count(Id)co FROM PermissionSetAssignment WHERE AssigneeId = :Userinfo.getUserId() AND PermissionSet.Name = 'SFS_FollowupAppointmentPerm'];
        Integer count = (Integer)hasPermList[0].get('co');
        if(count == 1) {
            system.debug('User has permission');
            resList.put('success', 'User has SFS followup appointment permission assigned');
        } else {
            system.debug('Permission is missing');
            List<PermissionSetAssignment> permissionSetList = new List<PermissionSetAssignment>();
            for (User u : [SELECT ID,UserRole.Name,Profile.Name,IsActive FROM User WHERE Id =: UserInfo.getUserId() ]){ // Add fields as per your requirement...
                PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'SFS_FollowupAppointmentPerm'];
                PermissionSetAssignment psa = new PermissionSetAssignment (PermissionSetId = ps.Id, AssigneeId = u.Id);
                permissionSetList.add(psa);
            }
            try {
                upsert permissionSetList;
                resList.put('success', 'permission set assigned successfully');
            } catch(exception e){
                system.debug('exception caught' + e);
                resList.put('error', 'error while assigning permissionset to user : ' +e.getMessage());
            }
        }
        return resList;
    }

    @AuraEnabled
    public static Map<String, String> getConfigurationData() {

        Map<String, String> settingList = new Map<String, String>();

        try {
            FollowupAppointmentSettings__c obj = [SELECT ShowExactArrivalTime__c,
                                                Operating_Hours__c,
                                                Scheduling_Policy__c,
                                                Scheduling_Horizon_Value__c,
                                                Fields_To_Show_Page_1__c,
                                                Fields_To_Show_Page_2__c,
                                                Fields_To_Show_Page_3__c,
                                                Record_To_Create__c,
                                                Screen_Title_1__c,
                                                Screen_Title_2__c,
                                                Screen_Title_3__c,
                                                Technician_Assigment__c
                                            FROM FollowupAppointmentSettings__c
                                            WITH SECURITY_ENFORCED ][0];

            if(obj != null) {


                if(obj.Scheduling_Policy__c != null) {
                    String schedulingPolicyName = [SELECT Id, Name FROM FSL__Scheduling_Policy__c WHERE Id =: obj.Scheduling_Policy__c ].Name;
                    if(schedulingPolicyName != null) {
                        settingList.put('schedulingPolicyName', String.valueOf(schedulingPolicyName));
                    }
                }

                if(obj.Operating_Hours__c != null) {
                    String opName = [SELECT Id, Name FROM OperatingHours WHERE Id =: obj.Operating_Hours__c ].Name;
                    if(opName != null) {
                        settingList.put('operatingHoursName', String.valueOf(opName));
                    }
                } 


                settingList.put('showExactArrivalTime', ''+obj.ShowExactArrivalTime__c);
                settingList.put('operatingHoursId', obj.Operating_Hours__c);
                settingList.put('schedulingPolicyId', obj.Scheduling_Policy__c);
                settingList.put('schedulingHorizonValue', ''+obj.Scheduling_Horizon_Value__c);
                settingList.put('fieldsToShowPage1', ''+obj.Fields_To_Show_Page_1__c);
                settingList.put('fieldsToShowPage2', ''+obj.Fields_To_Show_Page_2__c);
                settingList.put('fieldsToShowPage3', ''+obj.Fields_To_Show_Page_3__c);
                settingList.put('objectsToCreate', ''+obj.Record_To_Create__c);
                settingList.put('Screen_Title_1__c', ''+obj.Screen_Title_1__c);
                settingList.put('Screen_Title_2__c', ''+obj.Screen_Title_2__c);
                settingList.put('Screen_Title_3__c', ''+obj.Screen_Title_3__c);
                settingList.put('Technician_Assigment__c', ''+obj.Technician_Assigment__c);


            } else {
                settingList.put('null', 'null');
            }

        } catch (Exception e) {
            settingList.put('error', ''+e);
        }

        return settingList;
    }


    @AuraEnabled
    public static Map<String, String> getSavedScreenData() {

        Map<String, String> settingList = new Map<String, String>();

        try {
            FollowupAppointmentSettings__c obj = [SELECT Screen_Title_1__c,
                                                Screen_Title_2__c,
                                                Screen_Title_3__c,
                                                Fields_To_Show_Page_1__c,
                                                Fields_To_Show_Page_2__c,
                                                Fields_To_Show_Page_3__c
                                                FROM FollowupAppointmentSettings__c
                                            ][0];

            if(obj != null) {

                settingList.put('Screen_Title_1__c', ''+obj.Screen_Title_1__c);
                settingList.put('Screen_Title_2__c', ''+obj.Screen_Title_2__c);
                settingList.put('Screen_Title_3__c', ''+obj.Screen_Title_3__c);
                settingList.put('Fields_To_Show_Page_1__c', ''+obj.Fields_To_Show_Page_1__c);
                settingList.put('Fields_To_Show_Page_2__c', ''+obj.Fields_To_Show_Page_2__c);
                settingList.put('Fields_To_Show_Page_3__c', ''+obj.Fields_To_Show_Page_3__c);

            } else {
                settingList.put('null', 'null');
            }

        } catch (Exception e) {
            settingList.put('error', ''+e);
        }

        return settingList;
    }

    @Auraenabled(cacheable=false)
    public static List<string> getFieldNames(String objectName) {
        String escapeFields = 'Address';
        Set<String> escapeFieldList = new Set<String>{'Address', 'AppointmentNumber', 'CreatedById', 'CreatedDate',
                                            'DurationInMinutes', 'FSL__Duration_In_Minutes__c', 'FSL__InternalSLRGeolocation__c', 'IsDeleted', 'LastModifiedById', 'LastModifiedDate', 'LastReferencedDate', 'LastViewedDate', 'ParentRecordId', 'ParentRecordStatusCategory', 'ParentRecordType', 'StatusCategory' , 'SystemModstamp' , 
                                            'Discount', 'DurationInMinutes', 'FSL_Schedluing_Priority_c', 'GrandTotal', 'Id', 'IsClosed', 'IsDeleted', 'IsGeneratedFromMainianacePlan', 'LastModfiedById', 'LastModfiedDate', 'LastRefrencedDate', 'LastViewedDate', 'LineItemCount', 'MileStoneStatus', 'RootWorkOrderId', 'ServiceAppointmentCount', 'StatusCategory', 'SubTotal', 'SystemModStamp', 'TotalPrice', 'WorkOrderNumber' };

        SObjectType objectType = Schema.getGlobalDescribe().get(objectName);
        Map<String,Schema.SObjectField> mfields = objectType.getDescribe().fields.getMap();

        List<String> sObjectDetailsList = new List<String>();
        for(String s : mfields.keySet()) {
            //sObjectDetailsList.add(objectName+'.'+String.valueOf(mfields.get(s)));
            Boolean isStrinList = false;

            for(String escapeStr : escapeFieldList) {
                if(String.valueOf(mfields.get(s)).equals(escapeStr))  {
                    isStrinList = true;
                    break;
                }
            }
            if(!isStrinList) {
                sObjectDetailsList.add(String.valueOf(mfields.get(s)));
            }
            System.debug('Field Names : ' + String.valueOf(mfields.get(s)));
        }
        sObjectDetailsList.sort();
        return sObjectDetailsList;
    }

// Save settings 

    @AuraEnabled()
    public static Map<String, Object> saveSettings(List<String> inputArr) {
        
        String schedulingPolicy = sanitizeFieldValues(inputArr.get(0));
        String operatingHours = sanitizeFieldValues(inputArr.get(1));
        Boolean isExactAppintmentTime = Boolean.valueOf(inputArr.get(2));
        Integer schedulingHorizonUnits = Integer.valueof(inputArr.get(3));
        String objectsAllowedToBeCreated = sanitize(inputArr.get(4));
        String technicianAssignment = sanitize(inputArr.get(5));
        String objectsAllowed = sanitize(inputArr.get(6));

        
        Map<String, Object> responseResult = new Map<String, Object>();
        try {

            OperatingHours op = [Select Id From OperatingHours  WHERE Name =: operatingHours WITH SECURITY_ENFORCED];
            FSL__Scheduling_Policy__c sp = [Select Id From FSL__Scheduling_Policy__c  WHERE Name =: schedulingPolicy WITH SECURITY_ENFORCED];


            List<FollowupAppointmentSettings__c>  followUpSettingList;
            followUpSettingList = [SELECT Id FROM FollowupAppointmentSettings__c where Name = 'AA_Followup_Settings' WITH SECURITY_ENFORCED];
            if(followUpSettingList.size() > 0) {
                FollowupAppointmentSettings__c followUpSetting = followUpSettingList[0];

                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Operating_Hours__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Scheduling_Horizon_Value__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Scheduling_Policy__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.ShowExactArrivalTime__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Technician_Assigment__c.isUpdateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Record_To_Create__c.isUpdateable() ) {
                        
                        followUpSetting.Operating_Hours__c = op.id;
                        followUpSetting.Scheduling_Horizon_Value__c = schedulingHorizonUnits;
                        followUpSetting.Scheduling_Policy__c = sp.id;
                        followUpSetting.ShowExactArrivalTime__c = isExactAppintmentTime;
                        followUpSetting.Technician_Assigment__c = technicianAssignment;
                        followUpSetting.Record_To_Create__c = objectsAllowed;

                }

                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isUpdateable()) {
                    update followUpSetting;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to update the record');
                }
            } else {
                FollowupAppointmentSettings__c newRecord;
                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isCreateable()) {
                    newRecord = new FollowupAppointmentSettings__c();
                }
                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Name.isCreateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Operating_Hours__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Scheduling_Horizon_Value__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Scheduling_Policy__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.ShowExactArrivalTime__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Technician_Assigment__c.isCreateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Record_To_Create__c.isCreateable() ) {

                    newRecord.Name = 'AA_Followup_Settings';
                    newRecord.Operating_Hours__c = op.id;
                    newRecord.Scheduling_Horizon_Value__c = schedulingHorizonUnits;
                    newRecord.Scheduling_Policy__c = sp.id;
                    newRecord.ShowExactArrivalTime__c = isExactAppintmentTime;
                    newRecord.Technician_Assigment__c = technicianAssignment;
                    newRecord.Record_To_Create__c = objectsAllowed;
                }
                

                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isCreateable()) {
                    insert newRecord;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to create the record');
                }
            }
        } 
        catch(Exception e) {
            System.debug('Error while saving the record'+ e);
            responseResult.put('error', e);
        }

        return responseResult;
    }



    @AuraEnabled()
    public static Map<String, Object> saveFieldSettings(List<String> inputArr) {
        

        Integer pageNo = Integer.valueof(inputArr.get(0));
        String screenTitle = sanitize(inputArr.get(1));
        String fieldList = sanitizeFieldValues(String.valueOf(inputArr.get(2)));

        Map<String, Object> responseResult = new Map<String, Object>();
        try {

            List<FollowupAppointmentSettings__c> followUpSettingList = [SELECT Id
                                        FROM FollowupAppointmentSettings__c
                                        where Name = 'AA_Followup_Settings' WITH SECURITY_ENFORCED];

            if(followUpSettingList.size() > 0) {
                FollowupAppointmentSettings__c followUpSetting = followUpSettingList[0];

                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_3__c.isUpdateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_3__c.isUpdateable() ) {

                        if(pageNo == 1) {
                            followUpSetting.Screen_Title_1__c = screenTitle;
                            followUpSetting.Fields_To_Show_Page_1__c = fieldList;
                        } else if(pageNo == 2) {
                            followUpSetting.Screen_Title_2__c = screenTitle;
                            followUpSetting.Fields_To_Show_Page_2__c = fieldList;
                        } else {
                            followUpSetting.Screen_Title_3__c = screenTitle;
                            followUpSetting.Fields_To_Show_Page_3__c = fieldList;
                        }
                }
            
                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isUpdateable()) {
                    update followUpSetting;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to update the record');
                }

            } else {
                FollowupAppointmentSettings__c newRecord = new FollowupAppointmentSettings__c();
                

                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Name.isCreateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_1__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_1__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_2__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_2__c.isCreateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_3__c.isCreateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_3__c.isCreateable() ) {

                        newRecord.Name = 'AA_Followup_Settings';
                        if(pageNo == 1) {
                            newRecord.Screen_Title_1__c = screenTitle;
                            newRecord.Fields_To_Show_Page_1__c = fieldList;
                        } else if(pageNo == 2) {
                            newRecord.Screen_Title_2__c = screenTitle;
                            newRecord.Fields_To_Show_Page_2__c = fieldList;
        
                        } else {
                            newRecord.Screen_Title_3__c = screenTitle;
                            newRecord.Fields_To_Show_Page_3__c = fieldList;
                        }
        
                }
                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isCreateable()) {
                    insert newRecord;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to create the record');
                }
            }
        
        } 
        catch(Exception e) {
            System.debug('Error while saving the record'+ e);
            responseResult.put('error', e);
        }

        return responseResult;
    }

    @AuraEnabled()
    public static Map<String, Object> deleteScreen(Integer screenNo) {
        
         Integer pageNo = Integer.valueOf(screenNo);
        

        Map<String, Object> responseResult = new Map<String, Object>();
        try {

            List<FollowupAppointmentSettings__c> followUpSettingList = [SELECT Id
                                        FROM FollowupAppointmentSettings__c
                                        where Name = 'AA_Followup_Settings' WITH SECURITY_ENFORCED];

            if(followUpSettingList.size() > 0) {
                FollowupAppointmentSettings__c followUpSetting = followUpSettingList[0];
                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_3__c.isUpdateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_3__c.isUpdateable() ) {
                    
                        if(pageNo == 1) {
                            followUpSetting.Screen_Title_1__c = null;
                            followUpSetting.Fields_To_Show_Page_1__c = null;
                        } else if(pageNo == 2) {
                            followUpSetting.Screen_Title_2__c = null;
                            followUpSetting.Fields_To_Show_Page_2__c = null;
                        } else {
                            followUpSetting.Screen_Title_3__c = null;
                            followUpSetting.Fields_To_Show_Page_3__c = null;
                        }
                }
                
                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isUpdateable()) {
                    update followUpSetting;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to update the record');
                }
            }
        
        } 
        catch(Exception e) {
            System.debug('Error while saving the record'+ e);
            responseResult.put('error', e);
        }

        return responseResult;
    }

    @AuraEnabled()
    public static Map<String, Object> duplicateScreenData(Integer fromScreenNo, Integer toScreenNo) {
        
         Integer pageNo = Integer.valueOf(fromScreenNo);
        

        Map<String, Object> responseResult = new Map<String, Object>();
        try {

            List<FollowupAppointmentSettings__c> followUpSettingList = [SELECT Id,
                                                        Screen_Title_1__c,
                                                        Fields_To_Show_Page_1__c,
                                                        Screen_Title_2__c,
                                                        Fields_To_Show_Page_2__c,
                                                        Screen_Title_3__c,
                                                        Fields_To_Show_Page_3__c
                                        FROM FollowupAppointmentSettings__c
                                        where Name = 'AA_Followup_Settings' WITH SECURITY_ENFORCED];

            if(followUpSettingList.size() > 0) {
                FollowupAppointmentSettings__c followUpSetting = followUpSettingList[0];
                String copyTitle = '';
                String copyFields = '';
                if(fromScreenNo == 1) {
                    copyTitle = followUpSetting.Screen_Title_1__c ;
                    copyFields = followUpSetting.Fields_To_Show_Page_1__c;
                } else if(fromScreenNo == 2) {
                    copyTitle = followUpSetting.Screen_Title_2__c;
                    copyFields = followUpSetting.Fields_To_Show_Page_2__c;
                } else {
                    copyTitle = followUpSetting.Screen_Title_3__c;
                    copyFields = followUpSetting.Fields_To_Show_Page_3__c;
                }

                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_3__c.isUpdateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_3__c.isUpdateable() ) {
                  
                        switch on toScreenNo {
                            when 1 {	
                                followUpSetting.Screen_Title_1__c = copyTitle;
                                followUpSetting.Fields_To_Show_Page_1__c = copyFields;
        
                            }	
                            when 2 {	
                                followUpSetting.Screen_Title_2__c = copyTitle;
                                followUpSetting.Fields_To_Show_Page_2__c = copyFields;
        
                            }
                            when 3 {	
                                followUpSetting.Screen_Title_3__c = copyTitle;
                                followUpSetting.Fields_To_Show_Page_3__c = copyFields;
                            }
                        }

                }
                
                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isUpdateable()) {
                    update followUpSetting;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to update the record');
                }
            }
        
        } 
        catch(Exception e) {
            System.debug('Error while saving the record'+ e);
            responseResult.put('error', e);
        }

        return responseResult;
    }


    @AuraEnabled()
    public static Map<String, Object> swapScreenLeftRight(Integer fromScreenNo, Integer toScreenNo) {
        
         Integer pageNo = Integer.valueOf(fromScreenNo);
        

        Map<String, Object> responseResult = new Map<String, Object>();
        try {

            List<FollowupAppointmentSettings__c> followUpSettingList = [SELECT Id,
                                                        Screen_Title_1__c,
                                                        Fields_To_Show_Page_1__c,
                                                        Screen_Title_2__c,
                                                        Fields_To_Show_Page_2__c,
                                                        Screen_Title_3__c,
                                                        Fields_To_Show_Page_3__c
                                        FROM FollowupAppointmentSettings__c
                                        where Name = 'AA_Followup_Settings' WITH SECURITY_ENFORCED];

            if(followUpSettingList.size() > 0) {
                FollowupAppointmentSettings__c followUpSetting = followUpSettingList[0];

                String copyTitle = '';
                String copyFields = '';

                if (Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_1__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_2__c.isUpdateable() &&
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Screen_Title_3__c.isUpdateable() && 
                    Schema.sObjectType.FollowupAppointmentSettings__c.fields.Fields_To_Show_Page_3__c.isUpdateable() ) {
            
                        if(fromScreenNo == 1 && toScreenNo == 2) {

                            String title1 = followUpSetting.Screen_Title_1__c;
                            String fields1 = followUpSetting.Fields_To_Show_Page_1__c;
        
                            followUpSetting.Screen_Title_1__c = followUpSetting.Screen_Title_2__c;
                            followUpSetting.Fields_To_Show_Page_1__c = followUpSetting.Fields_To_Show_Page_2__c;
        
                            followUpSetting.Screen_Title_2__c = title1;
                            followUpSetting.Fields_To_Show_Page_2__c = fields1;
        
        
                        } else if(fromScreenNo == 2 && toScreenNo == 3) {
                            String title2 = followUpSetting.Screen_Title_2__c;
                            String fields2 = followUpSetting.Fields_To_Show_Page_2__c;
        
                            followUpSetting.Screen_Title_2__c = followUpSetting.Screen_Title_3__c;
                            followUpSetting.Fields_To_Show_Page_2__c = followUpSetting.Fields_To_Show_Page_3__c;
        
                            followUpSetting.Screen_Title_3__c = title2;
                            followUpSetting.Fields_To_Show_Page_3__c = fields2;
        
                        } else {
                            System.debug('screen not in record');
                        }
                }
                
                if(FollowupAppointmentSettings__c.sObjectType.getDescribe().isUpdateable()) {
                    update followUpSetting;
                    responseResult.put('success', 'success');
                } else {
                    responseResult.put('DML', 'Permission denied to update the record');
                }
            }
        
        } 
        catch(Exception e) {
            System.debug('Error while saving the record'+ e);
            responseResult.put('error', e);
        }

        return responseResult;
    }
    
    private static String sanitize(String name) {
        if (name == null) {
            return name;
        } 
        return name.replaceAll('[^\\w\\s]', '').replaceAll('_', ' ').trim();
    }

    private static String sanitizeFieldValues(String name) {
        if (name == null) {
            return name;
        }
        string HTML_TAG_PATTERN = '<.*?>';
        // compile the pattern
        pattern myPattern = pattern.compile(HTML_TAG_PATTERN);
        // get your matcher instance
        matcher myMatcher = myPattern.matcher(name);
        //remove the tags
        return myMatcher.replaceAll('');
    }

    private static boolean isAuthorized() {
        try {
            return [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id == System.UserInfo.getProfileId();
        } catch (Exception e) {
            throw new HandledException(e.getMessage() );
        }
    }



}