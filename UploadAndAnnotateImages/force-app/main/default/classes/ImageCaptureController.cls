public with sharing class ImageCaptureController {
    
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getContentDocumentId(String contentVersionId) {
        return [
            SELECT ContentDocumentId
            FROM ContentVersion
            WHERE Id = :contentVersionId
            WITH SECURITY_ENFORCED
        ];
    }
    
    @AuraEnabled
    public static List<ContentVersion> getContentVersionId(String uniqueCvId) {
        return [
            SELECT Id
            FROM ContentVersion
            WHERE ReasonForChange = :uniqueCvId
            WITH SECURITY_ENFORCED
        ];
    }

    @AuraEnabled
    public static void createContentDocumentLink(String contentDocumentId, String recordId) {
        ContentDocumentLink cdl = new ContentDocumentLink(
            LinkedEntityId = recordId,
            ContentDocumentId = contentDocumentId,
            ShareType = 'V'
        );
        if (Schema.sObjectType.ContentDocumentLink.fields.LinkedEntityId.isCreateable() &&
                Schema.sObjectType.ContentDocumentLink.fields.ContentDocumentId.isCreateable() &&
                Schema.sObjectType.ContentDocumentLink.fields.ShareType.isCreateable()) {
            insert cdl;
        } else {
            throw new SObjectException('Unable to create ContentDocumentLink!');
        }
    }
}
