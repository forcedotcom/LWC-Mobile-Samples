public with sharing class DashboardSettingsService {
  private static final String UNAUTH_MSG = 'Changing the dashboard settings is restricted to admins only.';

  @AuraEnabled(cacheable=false)
  public static List<Map<String, String>> getAllObjects() {
    List<Map<String, String>> objectsList = new List<Map<String, String>>();
    Map<String, String> tempMap;

    for (Schema.SObjectType objType : Schema.getGlobalDescribe().Values()) {
      String name = objType.getDescribe().getName();
      String label = objType.getDescribe().getLabel();
      if (
        !name.containsignorecase('history') &&
        !name.containsignorecase('tag') &&
        !name.containsignorecase('share') &&
        !name.containsignorecase('feed') &&
        !name.containsignorecase('group') &&
        !name.containsignorecase('public') &&
        !objType.getDescribe().isCustomSetting() &&
        objType.getDescribe().isCreateable() &&
        objType.getDescribe().getRecordTypeInfos().size() > 0
      ) {
        tempMap = new Map<String, String>();
        tempMap.put('value', name);
        tempMap.put('label', label);
        objectsList.add(tempMap);
      }
    }

    return objectsList;
  }

  @AuraEnabled(cacheable=false)
  public static List<Map<String, String>> getAllFields(String obj) {
    SObjectType objType = Schema.getGlobalDescribe().get(obj);
    Map<String, Schema.SObjectField> fields = objType.getDescribe()
      .fields.getMap();
    Set<String> fieldsKeys = fields.keySet();

    List<Map<String, String>> fieldsInfo = new List<Map<String, String>>();
    Map<String, String> temp = new Map<String, String>();
    Schema.DescribeFieldResult field;

    for (String key : fieldsKeys) {
      field = fields.get(key).getDescribe();
      if (field.getType().name() != 'ADDRESS' && field.isAccessible()) {
        temp = new Map<String, String>();
        temp.put('value', field.getLocalName());
        temp.put('label', field.getLabel());
        temp.put('type', field.getType().name());
        fieldsInfo.add(temp);
      }
    }

    return fieldsInfo;
  }

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

  @AuraEnabled
  public static Map<String, String> getAllObjLabels(List<String> apiNames) {
    try {
      Map<String, String> objectLabels = new Map<String, String>();
      String objectLabel;
      for (String apiName : apiNames) {
        objectLabel = Schema.getGlobalDescribe()
          .get(apiName)
          .getDescribe()
          .getLabel();
        objectLabels.put(apiName, objectLabel);
      }
      return objectLabels;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=false)
  public static String insertNewCard(Map<String, String> data) {
    try {
      if (!isAuthorized()) {
        throw new HandledException(UNAUTH_MSG);
      }
      Mobile_Dashboard_Setting__c newSetting = new Mobile_Dashboard_Setting__c(
        Custom_Logic__c = data.get('customLogic'),
        Layout__c = data.get('layout'),
        Main_Filter_Logic__c = data.get('mainFilterLogic'),
        Main_Filter__c = data.get('mainFilter'),
        Object_Name__c = data.get('objectName'),
        Order__c = Integer.valueOf(data.get('index')),
        Sub_Filters__c = data.get('subFilters'),
        Title__c = data.get('title')
      );

      insert newSetting;
      return newSetting.Id;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=false)
  public static void updateCard(String Id, Map<String, String> data) {
    try {
      if (!isAuthorized()) {
        throw new HandledException(UNAUTH_MSG);
      }
      Mobile_Dashboard_Setting__c setting = [
        SELECT
          Custom_Logic__c,
          Layout__c,
          Main_Filter_Logic__c,
          Main_Filter__c,
          Object_Name__c,
          Order__c,
          Sub_Filters__c,
          Title__c
        FROM Mobile_Dashboard_Setting__c
        WHERE Id = :Id
      ];

      setting.Custom_Logic__c = data.get('customLogic');
      setting.Layout__c = data.get('layout');
      setting.Main_Filter_Logic__c = data.get('mainFilterLogic');
      setting.Main_Filter__c = data.get('mainFilter');
      setting.Object_Name__c = data.get('objectName');
      setting.Order__c = Integer.valueOf(data.get('index'));
      setting.Sub_Filters__c = data.get('subFilters');
      setting.Title__c = data.get('title');

      update setting;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=false)
  public static void deleteCard(String Id) {
    try {
      if (!isAuthorized()) {
        throw new HandledException(UNAUTH_MSG);
      }
      Mobile_Dashboard_Setting__c setting = [
        SELECT Id
        FROM Mobile_Dashboard_Setting__c
        WHERE Id = :Id
      ];
      delete setting;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=false)
  public static void updateCardsOrder(List<String> cardsIds) {
    try {
      if (!isAuthorized()) {
        throw new HandledException(UNAUTH_MSG);
      }
      List<Mobile_Dashboard_Setting__c> allSettings = [
        SELECT Id, Order__c
        FROM Mobile_Dashboard_Setting__c
      ];
      for (Mobile_Dashboard_Setting__c setting : allSettings) {
        setting.Order__c = cardsIds.indexOf(setting.Id);
      }
      update allSettings;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }

  private static boolean isAuthorized() {
    try {
      List<Profile> adminProfiles = [
        SELECT Id
        FROM Profile
        WHERE PermissionsContentAdministrator = TRUE
      ];
      for (Profile p : adminProfiles) {
        if (p.Id == System.UserInfo.getProfileId()) {
          return true;
        }
      }
      return false;
    } catch (Exception e) {
      throw new HandledException(e.getMessage());
    }
  }
}
