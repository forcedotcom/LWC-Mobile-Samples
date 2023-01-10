public with sharing class MobileMapLayersService {

    @AuraEnabled(cacheable=false)
    public static List<Decimal> getAssignedResourceLocation() {
        try {
            List<Decimal> location = new List<Decimal>();
            Id userId = System.UserInfo.getUserId();
            if (userId != null) {
                List<ServiceResource> resource = [Select LastKnownLatitude, LastKnownLongitude from ServiceResource where RelatedRecordId = :userId LIMIT 1];
                if (resource.size() > 0) {
                    location.add(resource[0].LastKnownLatitude);
                    location.add(resource[0].LastKnownLongitude);
                }
            }
            return location;
        } catch (Exception e) {
            throw new HandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static List<Map<String, String>> getObjectLocations(String value, String latField, String longField, String majorField, String secondField) {
        try {
            List<Map<String, String>> locations = new List<Map<String, String>>();

            // verify object and fields are valid and accessible
            if (!isSafeObject(value) ||
                !isSafeField(value, latField.toLowerCase()) ||
                !isSafeField(value, longField.toLowerCase()) ||
                !isSafeField(value, majorField.toLowerCase()) ||
                !isSafeField(value, secondField.toLowerCase()))
                return locations;

            List<String> params = new List<String>{ latField, longField, majorField, secondField, value };
            List<sObject> records = Database.Query(String.format('SELECT {0}, {1}, {2}, {3} FROM {4} WHERE {0} != null and {1} != null', params));
            Map<String, String> tempList;
            for (sObject rec : records) {
                tempList = new Map<String, String>();
                tempList.put('Id', rec.Id);
                tempList.put('Latitude', String.valueOf(rec.get(latField)));
                tempList.put('Longitude', String.valueOf(rec.get(longField)));
                tempList.put('MajorField', String.valueOf(rec.get(majorField)));
                tempList.put('SecondField', String.valueOf(rec.get(secondField)));
                locations.add(tempList);
            }
            return locations;
        } catch (Exception e) {
            throw new HandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static List<Map<String, String>> retrieveAllObjFields(String value) {
        SObjectType objType = Schema.getGlobalDescribe().get(value);
        Map<String, Schema.SObjectField> fields = objType.getDescribe().fields.getMap();
        Set<String> fieldsKeys = fields.keySet();

        List<Map<String, String>> fieldsInfo = new List<Map<String, String>>();
        Map<String, String> temp = new Map<String, String>();
        Schema.DescribeFieldResult field;

        for (String key : fieldsKeys) {
            field = fields.get(key).getDescribe();
            temp = new Map<String, String>();
            temp.put('value', key);
            temp.put('label', field.getLabel());
            temp.put('type', field.getType().name());
            fieldsInfo.add(temp);
        }

        return fieldsInfo;
    }

    @AuraEnabled(cacheable=false)
    public static Map<String, String> retrieveObjInfo(String value) {
        Map<String, String> info = new Map<String, String>();
        SObjectType objType = Schema.getGlobalDescribe().get(value);
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        info.put('Label', objDescribe.getLabel());
        info.put('Plural', objDescribe.getLabelPlural());
        
        // get object's icon
    	List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
        List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
        for (Schema.DescribeTabSetResult tsr : tabSetDesc) { tabDesc.addAll(tsr.getTabs()); }
        
        List<Schema.DescribeIconResult> icons;
        List<Schema.DescribeColorResult> colorDesc;
        for (Schema.DescribeTabResult tr : tabDesc) {
            if (value == tr.getSobjectName()) {
                icons = tr.getIcons();
                for (DescribeIconResult icon : icons) {
                    if (icon.getTheme() == 'theme4' || icon.getTheme() == 'custom') {
                        info.put('IconUrl', icon.getUrl());
                        break;
                    }
                }
                colorDesc = tr.getColors();
                info.put('Color', '#' + colorDesc[0].getColor());
                break;
            }
        }
        
        return info;
    }

    @AuraEnabled(cacheable=false)
    public static List<sObject> executeFilterQuery(String currentObjectFilter, Map<String, String> currentFieldFilter) {
        try {
            List<sObject> results = new List<sObject>();
            
            String fieldType = currentFieldFilter.get('type');
            String fieldName = currentFieldFilter.get('value');
            String input = currentFieldFilter.get('input');

            // verify object and fields are valid and accessible
            if (!isSafeObject(currentObjectFilter) ||
                !isSafeField(currentObjectFilter, fieldName.toLowerCase()))
                return results;

            // sanitize input: cast and escape quotes
            input = castToType(input, fieldType);

            if (isLikeNeeded(fieldType)) input = '%' + input + '%';
            if (isQuotesNeeded(fieldType)) input = '\'' + input + '\'';
            if (fieldType == 'TIME') input += 'Z';
            String operator = isLikeNeeded(fieldType) ? 'LIKE' : '=';

            String whereClause = buildWhereClause(fieldType, fieldName, operator, input);
            List<String> params = new List<String>{ currentObjectFilter, whereClause };
            String filterQuery = String.format('SELECT Id FROM {0} WHERE {1}', params);

            results = Database.Query(filterQuery);
            return results;
        } catch (Exception e) {
            throw new HandledException(e.getMessage());
        }
    }

    private static boolean isQuotesNeeded(String type) {
        List<String> types = new List<String>{ 'DATE', 'TIME', 'DATETIME', 'BOOLEAN', 'DOUBLE', 'INTEGER', 'CURRENCY', 'PERCENT' };
        return !types.contains(type);
    }

    private static boolean isLikeNeeded(String type) {
        List<String> types = new List<String>{ 'DATE', 'TIME', 'DATETIME', 'BOOLEAN', 'DOUBLE', 'INTEGER', 'CURRENCY', 'PERCENT', 'REFERENCE' };
        return !types.contains(type);
    }

    private static String buildWhereClause(String fieldType, String field, String operator, String input) {
        if (fieldType != 'DATETIME') return field + ' ' + operator + ' ' + input;
        
        // for dateTime fields - search whole day, user don't need to put in the exact time
        String startDate = input + 'T00:00:00.000Z';
        String endDate = input + 'T23:59:59.999Z';
        List<String> params = new List<String>{ field, startDate, endDate };
        return String.format('{0} > {1} and {0} < {2}', params);
    }

    private static boolean isSafeObject(String objName){
        SObjectType myObj = Schema.getGlobalDescribe().get(objName);
        return myObj.getDescribe().isAccessible();
    }

    private static boolean isSafeField(String objName, String fieldName){
        if (isSafeObject(objName)) {
            SObjectType myObj = Schema.getGlobalDescribe().get(objName);
            SObjectField myField = myObj.getDescribe().fields.getMap().get(fieldName);
            return myField.getDescribe().isAccessible();
        }
        return false;
    }

    private static String castToType(String input, String fieldType) {
        try {
            switch on fieldType {
                when 'TIME' {
                    Pattern MyPattern = Pattern.compile('\\d\\d:\\d\\d:\\d\\d.\\d\\d\\d');
                    Matcher MyMatcher = MyPattern.matcher(input);
                    if (MyMatcher.matches()) return input;
                    else return '';
                }
                when 'DATE', 'DATETIME' {
                    return String.valueOf(Date.valueOf(input));
                }
                when 'BOOLEAN' {
                    return String.valueOf(Boolean.valueOf(input));
                }
                when 'INTEGER' {
                    return String.valueOf(Integer.valueOf(input));
                }	
                when 'DOUBLE', 'CURRENCY', 'PERCENT' {
                    return String.valueOf(Double.valueOf(input));
                }
                when else {
                    return String.escapeSingleQuotes(input);
                }
            }
        } catch (Exception e) {
            throw new HandledException(e.getMessage());
        }
    }
}
