trigger ServiceDocumentCreation on DocumentRecipient (after insert) {

    //TODO: 
    //1. based on the number of signatures in your template, add the template id to a set below.
    //2. if you have a template with more than 4 signatures
    //   a. add another Set of templates following the pattern below.
    //   b. add the corresponding branch in the if-else branch starting at line 56
    //3. example: Set<String> SA_TEMPLATES_WITH_SIGNATURES_3 = new Set<String>{'0M0xx0000004CFUCA2'};
    Set<String> WO_TEMPLATES_WITH_1_SIGNATURES = new Set<String>{''};
    Set<String> WO_TEMPLATES_WITH_2_SIGNATURES = new Set<String>{''};
    Set<String> WO_TEMPLATES_WITH_3_SIGNATURES = new Set<String>{''};
    Set<String> WO_TEMPLATES_WITH_4_SIGNATURES = new Set<String>{''};

    Set<String> WOLI_TEMPLATES_WITH_1_SIGNATURES = new Set<String>{''};
    Set<String> WOLI_TEMPLATES_WITH_2_SIGNATURES = new Set<String>{''};
    Set<String> WOLI_TEMPLATES_WITH_3_SIGNATURES = new Set<String>{''};
    Set<String> WOLI_TEMPLATES_WITH_4_SIGNATURES = new Set<String>{''};

    Set<String> SA_TEMPLATES_WITH_1_SIGNATURES = new Set<String>{''};
    Set<String> SA_TEMPLATES_WITH_2_SIGNATURES = new Set<String>{''};
    Set<String> SA_TEMPLATES_WITH_3_SIGNATURES = new Set<String>{''};
    Set<String> SA_TEMPLATES_WITH_4_SIGNATURES = new Set<String>{''};


    // TODO: Set threshold for when you want to fire the trigger for when a template not added to an above sets
    // Eg: If you set this to 3, then if we cannot match the template being used, we'll automatically 
    //     fire the createServiceDocument invocable action when 3 signatures are collected
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
            // document once DEFAULT_NUM_SIGNATURES document recipients have been collected.


            // Work Order Templates
            // can be conbined with the number of signatures, but not able to distinguish between entities
            if (WO_TEMPLATES_WITH_1_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Template block');
                //only when all the signatures have been collected, then fire the trigger
                if (collectedSignaturesRelatedDRs.size() == 1) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WO_TEMPLATES_WITH_2_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Template block');
                if (collectedSignaturesRelatedDRs.size() == 2) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WO_TEMPLATES_WITH_3_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Template block');
                if (collectedSignaturesRelatedDRs.size() == 3) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WO_TEMPLATES_WITH_4_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Template block');
                if (collectedSignaturesRelatedDRs.size() == 4) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }


            // Work Order Line Item Templates
            else if (WOLI_TEMPLATES_WITH_1_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Line Item Template block');
                if (collectedSignaturesRelatedDRs.size() == 1) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WOLI_TEMPLATES_WITH_2_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Line Item Template block');
                if (collectedSignaturesRelatedDRs.size() == 2) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WOLI_TEMPLATES_WITH_3_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Line Item Template block');
                if (collectedSignaturesRelatedDRs.size() == 3) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (WOLI_TEMPLATES_WITH_4_SIGNATURES.contains(templateId)) {
                System.debug('Work Order Line Item Template block');
                if (collectedSignaturesRelatedDRs.size() == 4) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }

            // Service Appointment Templates
            else if (SA_TEMPLATES_WITH_1_SIGNATURES.contains(templateId)) {
                System.debug('Service Appointment Template block');
                if (collectedSignaturesRelatedDRs.size() == 1) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (SA_TEMPLATES_WITH_2_SIGNATURES.contains(templateId)) {
                System.debug('Service Appointment Template block');
                if (collectedSignaturesRelatedDRs.size() == 2) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (SA_TEMPLATES_WITH_3_SIGNATURES.contains(templateId)) {
                System.debug('Service Appointment Template block');
                if (collectedSignaturesRelatedDRs.size() == 3) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            } else if (SA_TEMPLATES_WITH_4_SIGNATURES.contains(templateId)) {
                System.debug('Service Appointment Template block');
                if (collectedSignaturesRelatedDRs.size() == 4) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }

            //default case
            else {
                System.debug('Default block');
                if (collectedSignaturesRelatedDRs.size() == DEFAULT_NUM_SIGNATURES) {
                    FireCreateServiceDocumentInvocableAction.TriggerCreateServiceDocumentInvocableAction(baseRecordId, templateId, null, null);
                }
            }
        }
    }
}
