global class DashboardPostInstall {
  
  global static void onInstall() {
    
    // add OOTB cards
    List<Mobile_Dashboard_Setting__c> existingSettings = [SELECT Id FROM Mobile_Dashboard_Setting__c];
    if (existingSettings.size() == 0) {
      List<Map<String, Object>> allInfo = getInfoList();

      for (Map<String, Object> info : allInfo) {
        insertPredefinedCard(info);
      }
    }
  }

  private static void insertPredefinedCard(Map<String, Object> cardInfo) {
    try {
      Mobile_Dashboard_Setting__c card = new Mobile_Dashboard_Setting__c();
      for (String key : cardInfo.keySet()) {
        card.put(key, cardInfo.get(key));
      }
      insert card;
    } catch (Exception e) {
      return;
    }
  }

  private static List<Map<String, Object>> getInfoList() {
    List<Map<String, Object>> allInfo = new List<Map<String, Object>>();
    
    Map<String, Object> one = new Map<String, Object>{
      'Custom_Logic__c' => '',
      'Layout__c' => 'STACK',
      'Main_Filter_Logic__c' => 'AND',
      'Main_Filter__c' => '[{"key":"e7tsds","field":"SchedStartTime","fieldDisplay":"Scheduled Start","fieldType":"DATETIME","operator":"next","value":"","unit":"day","unitDisplay":"Days","quantity":"7","label":"","icon":"","color":"#747474","operatorDisplay":"Next"}]',
      'Object_Name__c' => 'ServiceAppointment',
      'Order__c' => 0,
      'Sub_Filters__c' => '[{"key":"hhrget","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Scheduled","unit":"","unitDisplay":"","quantity":"","label":"Scheduled","icon":"utility:clock","color":"#747474"},{"key":"le98t2","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Canceled","unit":"","unitDisplay":"","quantity":"","label":"Canceled","icon":"utility:warning","color":"#8C4B02"},{"key":"6ze7fr","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Completed","unit":"","unitDisplay":"","quantity":"","label":"Completed","icon":"utility:success","color":"#2E844A"}]',
      'Title__c' => 'My Upcoming Service Appointments'
    };
    allInfo.add(one);

    Map<String, Object> two = new Map<String, Object>{
      'Custom_Logic__c' => '',
      'Layout__c' => 'SIDE',
      'Main_Filter_Logic__c' => 'AND',
      'Main_Filter__c' => '[{"key":"ken22n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATETIME","operator":"next","value":"","unit":"day","unitDisplay":"Days","quantity":"7","label":"","icon":"","color":"#747474","operatorDisplay":"Next"}]',
      'Object_Name__c' => 'ResourceAbsence',
      'Order__c' => 1,
      'Sub_Filters__c' => '[{"key":"7wtchc","field":"FSL__Approved__c","fieldDisplay":"Approved","fieldType":"BOOLEAN","operator":"eq","value":true,"unit":"","unitDisplay":"","quantity":"","label":"Approved","icon":"utility:success","color":"#2E844A","operatorDisplay":"="},{"key":"e7fjv2","field":"FSL__Approved__c","fieldDisplay":"Approved","fieldType":"BOOLEAN","operator":"eq","value":false,"unit":"","unitDisplay":"","quantity":"","label":"Not Approved","icon":"utility:error","color":"#B72020","operatorDisplay":"="}]',
      'Title__c' => 'My Absences'
    };
    allInfo.add(two);

    Map<String, Object> three = new Map<String, Object>{
      'Custom_Logic__c' => '',
      'Layout__c' => 'STACK',
      'Main_Filter_Logic__c' => 'AND',
      'Main_Filter__c' => '[{"key":"4kzcgy","field":"StartTime","fieldDisplay":"Start Time","fieldType":"DATETIME","operator":"next","value":"","unit":"day","unitDisplay":"Days","quantity":"7","label":"","icon":"","color":"#747474","operatorDisplay":"Next"}]',
      'Object_Name__c' => 'Shift',
      'Order__c' => 2,
      'Sub_Filters__c' => '[{"key":"te2awa","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","value":"Confirmed","unit":"","unitDisplay":"","quantity":"","label":"Confirmed","icon":"utility:success","color":"#377032","operatorDisplay":"="},{"key":"8uuxpt","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","value":"Published","unit":"","unitDisplay":"","quantity":"","label":"Published","icon":"utility:away","color":"#A7206D","operatorDisplay":"="},{"key":"lug6r2","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","value":"Tentative","unit":"","unitDisplay":"","quantity":"","label":"Tentative","icon":"utility:info","color":"#747474","operatorDisplay":"="}]',
      'Title__c' => 'My Shifts'
    };
    allInfo.add(three);

    Map<String, Object> four = new Map<String, Object>{
      'Custom_Logic__c' => '',
      'Layout__c' => 'STACK',
      'Main_Filter_Logic__c' => 'AND',
      'Main_Filter__c' => '[{"key":"eqgkr8","field":"StartDate","fieldDisplay":"Time Sheet Start Date","fieldType":"DATE","operator":"last","value":"","unit":"day","unitDisplay":"Days","quantity":"7","label":"","icon":"","color":"#747474","operatorDisplay":"Last"}]',
      'Object_Name__c' => 'TimeSheet',
      'Order__c' => 3,
      'Sub_Filters__c' => '[{"key":"s6knsk","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","value":"New","unit":"","unitDisplay":"","quantity":"","label":"New","icon":"","color":"#747474","operatorDisplay":"="},{"key":"g2gwc0","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","value":"Submitted","unit":"","unitDisplay":"","quantity":"","label":"Submitted","icon":"","color":"#747474","operatorDisplay":"="},{"key":"mnfpeh","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","value":"Approved","unit":"","unitDisplay":"","quantity":"","label":"Approved","icon":"","color":"#747474","operatorDisplay":"="}]',
      'Title__c' => 'My Timesheets'
    };
    allInfo.add(four);

    return allInfo;
  }
}