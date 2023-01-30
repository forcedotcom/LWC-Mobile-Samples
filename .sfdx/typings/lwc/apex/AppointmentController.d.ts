declare module "@salesforce/apex/AppointmentController.getServiceAppointment" {
  export default function getServiceAppointment(param: {serviceAppointmentId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getSlots" {
  export default function getSlots(param: {serviceAppointmentId: any, operatingHoursId: any, schedulingPolicyId: any, arrivalWindowFlag: any, localetimezone: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getSlotsByAssignmentMethod" {
  export default function getSlotsByAssignmentMethod(param: {serviceAppointmentId: any, operatingHoursId: any, schedulingPolicyId: any, arrivalWindowFlag: any, userId: any, currentAssignmentMethod: any, cleanupRequired: any, localetimezone: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.scheduleSA" {
  export default function scheduleSA(param: {serviceAppointmentId: any, schedulingPolicyId: any, userId: any, currentAssignmentMethod: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.updateSASlot" {
  export default function updateSASlot(param: {serviceAppointmentId: any, arrivalWindowStartTime: any, arrivalWindowEndTime: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.updateServiceAppointmentStatus" {
  export default function updateServiceAppointmentStatus(param: {serviceAppointmentId: any, statusId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.updateSA" {
  export default function updateSA(param: {serviceAppointmentId: any, earliestStartDate: any, arrivalStartDate: any, arrivalEndDate: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.deleteExistingRequiredResources" {
  export default function deleteExistingRequiredResources(param: {workOrderId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.deleteExistingResourcePreferencesForResource" {
  export default function deleteExistingResourcePreferencesForResource(param: {workOrderId: any, serviceResourceId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.addNewRequiredResource" {
  export default function addNewRequiredResource(param: {workOrderId: any, serviceResourceId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.assignCurrentUserAsRequiredResource" {
  export default function assignCurrentUserAsRequiredResource(param: {userId: any, serviceAppointmentId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.isUserExcludedResource" {
  export default function isUserExcludedResource(param: {userId: any, serviceAppointmentId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.cloneWorkOrder" {
  export default function cloneWorkOrder(param: {originalSaId: any, startPermitDate: any, selectedHorizonValue: any, dummySA: any, dummyWO: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.deleteClonedResourcePreference" {
  export default function deleteClonedResourcePreference(param: {clonedEorkOrderId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.deleteClonedWorkOrder" {
  export default function deleteClonedWorkOrder(param: {clonedEorkOrderId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.cloneResourcePreference" {
  export default function cloneResourcePreference(param: {workOrderId: any, newWOId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.copyResourcePreferenceObject" {
  export default function copyResourcePreferenceObject(param: {originalRFObj: any, newWO: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.deleteClonedAppointmentData" {
  export default function deleteClonedAppointmentData(param: {clonedServiceAppointmentId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.updateDummySa" {
  export default function updateDummySa(param: {dummySA: any, startPermitDate: any, dueDate: any, serviceTerritoryId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.createNewDummyWorkOrder" {
  export default function createNewDummyWorkOrder(param: {serviceTerritoryId: any, workTypeId: any, originalWOId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getUserName" {
  export default function getUserName(param: {userId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.convertTimeToOtherTimeZone" {
  export default function convertTimeToOtherTimeZone(param: {date1: any, date2: any, sourceTimezone: any, targetTimezone: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getUpdatedSASchedulingInfo" {
  export default function getUpdatedSASchedulingInfo(param: {serviceAppointmentId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getSchedulingPolicyId" {
  export default function getSchedulingPolicyId(param: {schedulingPolicyName: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getOperatingHoursId" {
  export default function getOperatingHoursId(param: {operatingHoursName: any}): Promise<any>;
}
