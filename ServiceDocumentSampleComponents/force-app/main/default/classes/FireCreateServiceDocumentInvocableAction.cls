public with sharing class FireCreateServiceDocumentInvocableAction {

    private static final String API_VERSION = 'v58.0';

    private static final String CREATE_SERVICE_DOCUMENT_ACTION_PATH = '/services/data/'+ API_VERSION +'/actions/standard/createServiceDocument';

    private static final String AUTHORIZATION_HEADER = 'Authorization';
    private static final String AUTHORIZATION_BEARER_PREFIX = 'Bearer ';

    private static final String CONTENT_TYPE_HEADER = 'Content-Type';
    private static final String CONTENT_TYPE_JSON = 'application/json';

    private static final String ACCEPT_HEADER = 'Accept';

    /**
     * RecordId: RecordId to generate service document for. WO/WOLI/SA id
     * TemplateId: Service document template to generate document for. Starts with '0M0'
     * Locale: (Optional) Locale to generate the document in. Example valid formats: 'ru', 'ru_PL'
     * Title: (Optional) Used to name the document saved
     */
    @future (callout=true)
    public static void TriggerCreateServiceDocumentInvocableAction(String recordId, String templateId, String locale, String title) {

        System.debug('Attempting to queue Create Service Document');
        System.debug('RecordId: ' + recordId);
        System.debug('TemplateId: ' + templateId);
        System.debug('Locale: ' + locale);
        System.debug('Title: ' + title);

        String sessionId = UserInfo.getSessionId();

        HttpRequest httpRequest = new HttpRequest();

        httpRequest.setMethod('POST');
        httpRequest.setEndpoint(URL.getOrgDomainUrl().toExternalForm() + CREATE_SERVICE_DOCUMENT_ACTION_PATH);
        httpRequest.setHeader(AUTHORIZATION_HEADER, AUTHORIZATION_BEARER_PREFIX + sessionId);
        httpRequest.setHeader(CONTENT_TYPE_HEADER, CONTENT_TYPE_JSON);
        httpRequest.setHeader(ACCEPT_HEADER, CONTENT_TYPE_JSON);

        JSONGenerator jg = JSON.createGenerator(false);
        jg.writeStartObject();
        jg.writeFieldName('inputs');
        jg.writeStartArray();

        jg.writeStartObject();
        jg.writeObjectField('recordId', recordId);
        jg.writeObjectField('templateId', templateId);
        if (locale != null) {
            jg.writeObjectField('locale', locale);
        }
        if (title != null) {
            jg.writeObjectField('title', title);
        }
        jg.writeEndObject();
        jg.writeEndArray();
        jg.writeEndObject();

        httpRequest.setBody( jg.getAsString() );

        Http http = new Http();
        HttpResponse response = http.send(httpRequest);
        System.debug(response.getBody());
    }
}