trigger ServiceDocumentCreation on DocumentRecipient (after insert) {

    //TODO: 
    //1. if you have a template with more than 4 signatures, please add it here
    //2. please edit the content of the sets bellow to contain your template ids accordingly
    Set<String> WO_TEMPLATES_WITH_SIGNATURES_1 = new Set<String>{''};
    Set<String> WO_TEMPLATES_WITH_SIGNATURES_2 = new Set<String>{''};
    Set<String> WO_TEMPLATES_WITH_SIGNATURES_3 = new Set<String>{''};
    Set<String> WO_TEMPLATES_WITH_SIGNATURES_4 = new Set<String>{''};

    Set<String> WOLI_TEMPLATES_WITH_SIGNATURES_1 = new Set<String>{''};
    Set<String> WOLI_TEMPLATES_WITH_SIGNATURES_2 = new Set<String>{''};
    Set<String> WOLI_TEMPLATES_WITH_SIGNATURES_3 = new Set<String>{''};
    Set<String> WOLI_TEMPLATES_WITH_SIGNATURES_4 = new Set<String>{''};

    Set<String> SA_TEMPLATES_WITH_SIGNATURES_1 = new Set<String>{''};
    Set<String> SA_TEMPLATES_WITH_SIGNATURES_2 = new Set<String>{''};
    Set<String> SA_TEMPLATES_WITH_SIGNATURES_3 = new Set<String>{'0M0xx0000004CFUCA2'};
    Set<String> SA_TEMPLATES_WITH_SIGNATURES_4 = new Set<String>{''};

    final Integer DEFAULT_NUM_SIGNATURES = 3;


    for (DocumentRecipient dr : Trigger.new) {
        ID documentId = dr.DocumentId;
        if (documentId.getSobjectType() == Schema.ServiceReport.SObjectType) {

            List<ServiceReport> serviceReports = [SELECT Id, ParentId, DocumentTemplate FROM ServiceReport WHERE Id = :documentId];
            String templateId = serviceReports.get(0).DocumentTemplate;
            System.debug('Service Report Identified: ' + documentId);
            System.debug('Template Id: ' + templateId);

            ID baseRecordId = serviceReports.get(0).ParentId;
            System.debug('Base record Id: ' + baseRecordId);

            //currently already collected signatures
            List<DocumentRecipient> collectedSignaturesRelatedDRs = [SELECT Id FROM DocumentRecipient WHERE DocumentId = :documentId];
            System.debug('Number of collected signatures related DocumentRecipients: ' + collectedSignaturesRelatedDRs.size());

            // There is currently no way to retrieve the number of signatures
            // on a template. Thus, for now we need to hardcode associations of
            // template IDs and the number of signature records to collect before automatic
            // invocation of PDFication.

            // Below, we've provided an example organized by template entity, but more
            // if conditions could be added within the switch blocks. If no specific template
            // matches, we also have a default condition which will always submit the service 
            // document once 2 document recipients have been collected.


            // Work Order Templates
            // can be conbined with the number of signatures, but not able to distinguish between entities
            if (WO_TEMPLATES_WITH_SIGNATURES_1.contains(templateId)) { // WO template with 1 signature 
                System.debug('Work Order Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 1) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WO_TEMPLATES_WITH_SIGNATURES_2.contains(templateId)) { // WO template with 2 signature 
                System.debug('Work Order Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 2) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WO_TEMPLATES_WITH_SIGNATURES_3.contains(templateId)) { // WO template with 3 signature 
                System.debug('Work Order Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 3) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WO_TEMPLATES_WITH_SIGNATURES_4.contains(templateId)) { // WO template with 4 signature 
                System.debug('Work Order Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 4) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }


            // Work Order Line Item Templates
            else if (WOLI_TEMPLATES_WITH_SIGNATURES_1.contains(templateId)) { // WOLI template with 1 signature 
                System.debug('Work Order Line Item Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 1) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WOLI_TEMPLATES_WITH_SIGNATURES_2.contains(templateId)) { // WOLI template with 2 signature 
                System.debug('Work Order Line Item Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 2) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WOLI_TEMPLATES_WITH_SIGNATURES_3.contains(templateId)) { // WOLI template with 3 signature
                System.debug('Work Order Line Item Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 3) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WOLI_TEMPLATES_WITH_SIGNATURES_4.contains(templateId)) { // WOLI template with 4 signature 
                System.debug('Work Order Line Item Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 4) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }

            // Service Appointment Templates
            else if (SA_TEMPLATES_WITH_SIGNATURES_1.contains(templateId)) { // SA template with 1 signature 
                System.debug('Service Appointment Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 1) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (SA_TEMPLATES_WITH_SIGNATURES_2.contains(templateId)) { // SA template with 2 signature 
                System.debug('Service Appointment Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 2) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (SA_TEMPLATES_WITH_SIGNATURES_3.contains(templateId)) { // SA template with 3 signature 
                System.debug('Service Appointment Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 3) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (SA_TEMPLATES_WITH_SIGNATURES_4.contains(templateId)) { // SA template with 4 signature 
                System.debug('Service Appointment Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 4) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }

            //default case
            else {
                System.debug('Default block');//3 signatures
                if (collectedSignaturesRelatedDRs.size() == DEFAULT_NUM_SIGNATURES) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }
        }
    }
}
