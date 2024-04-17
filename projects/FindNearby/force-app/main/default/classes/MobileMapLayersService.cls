public with sharing class MobileMapLayersService {
  @AuraEnabled(cacheable=false)
  public static List<Map<String, String>> getAllPicklistOptions(
    String obj,
    String field
  ) {
    try {
      SObjectType objType = Schema.getGlobalDescribe().get(obj);
      Map<String, Schema.SObjectField> fields = objType.getDescribe()
        .fields.getMap();
      Schema.DescribeFieldResult dfr = fields.get(field).getDescribe();

      List<Map<String, String>> picklistOptions = new List<Map<String, String>>();
      Map<String, String> temp = new Map<String, String>();

      List<Schema.PicklistEntry> picklistVals = dfr.getPicklistValues();
      for (Schema.PicklistEntry picklistVal : picklistVals) {
        temp = new Map<String, String>();
        temp.put('value', picklistVal.getValue());
        temp.put('label', picklistVal.getLabel());
        picklistOptions.add(temp);
      }

      return picklistOptions;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=false)
  public static List<sObject> executeFilterQuery(
    String currentObjectFilter,
    Map<String, String> currentFieldFilter
  ) {
    try {
      List<sObject> results = new List<sObject>();

      String fieldType = currentFieldFilter.get('type');
      String fieldName = currentFieldFilter.get('value');
      String input = currentFieldFilter.get('input');

      // verify object and fields are valid and accessible
      if (
        !isSafeObject(currentObjectFilter) ||
        !isSafeField(currentObjectFilter, fieldName.toLowerCase())
      )
        return results;

      // sanitize input: cast and escape quotes
      input = castToType(input, fieldType);

      if (isLikeNeeded(fieldType))
        input = '%' + input + '%';
      if (isQuotesNeeded(fieldType))
        input = '\'' + input + '\'';
      if (fieldType == 'Time')
        input += 'Z';
      String operator = isLikeNeeded(fieldType) ? 'LIKE' : '=';

      String whereClause = buildWhereClause(
        fieldType,
        fieldName,
        operator,
        input
      );
      List<String> params = new List<String>{
        currentObjectFilter,
        whereClause
      };
      String filterQuery = String.format(
        'SELECT Id FROM {0} WHERE {1}',
        params
      );

      results = Database.Query(filterQuery);
      return results;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  private static boolean isQuotesNeeded(String type) {
    List<String> types = new List<String>{
      'Date',
      'Time',
      'DateTime',
      'Boolean',
      'Double',
      'Integer',
      'Currency',
      'Percent'
    };
    return !types.contains(type);
  }

  private static boolean isLikeNeeded(String type) {
    List<String> types = new List<String>{
      'Date',
      'Time',
      'DateTime',
      'Boolean',
      'Double',
      'Integer',
      'Currency',
      'Percent',
      'Reference'
    };
    return !types.contains(type);
  }

  private static String buildWhereClause(
    String fieldType,
    String field,
    String operator,
    String input
  ) {
    if (fieldType != 'DateTime')
      return field + ' ' + operator + ' ' + input;

    // for dateTime fields - search whole day, user don't need to put in the exact time
    String startDate = input + 'T00:00:00.000Z';
    String endDate = input + 'T23:59:59.999Z';
    List<String> params = new List<String>{ field, startDate, endDate };
    return String.format('{0} > {1} and {0} < {2}', params);
  }

  private static boolean isSafeObject(String objName) {
    SObjectType myObj = Schema.getGlobalDescribe().get(objName);
    return myObj.getDescribe().isAccessible();
  }

  private static boolean isSafeField(String objName, String fieldName) {
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
        when 'Time' {
          Pattern MyPattern = Pattern.compile('\\d\\d:\\d\\d:\\d\\d.\\d\\d\\d');
          Matcher MyMatcher = MyPattern.matcher(input);
          if (MyMatcher.matches())
            return input;
          else
            return '';
        }
        when 'Date', 'DateTime' {
          return String.valueOf(Date.valueOf(input));
        }
        when 'Boolean' {
          return String.valueOf(Boolean.valueOf(input));
        }
        when 'Integer' {
          return String.valueOf(Integer.valueOf(input));
        }
        when 'Double', 'Currency', 'Percent' {
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
