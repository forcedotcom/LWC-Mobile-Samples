@isTest
public with sharing class DashboardSettingsServiceTest {
  public static Mobile_Dashboard_Setting__c mds;

  static {
    mds = new Mobile_Dashboard_Setting__c(
      Title__c = 'Test Title',
      Main_Filter_Logic__c = 'AND',
      Order__c = 0,
      Object_Name__c = 'Account'
    );
    insert mds;
  }

  @isTest
  static void testGetAllObjects() {
    try {
      List<Map<String, String>> result = DashboardSettingsService.getAllObjects();

      // get 2 examples
      Map<String, String> accountObject;
      Map<String, String> contactObject;
      for (Map<String, String> obj : result) {
        if (obj.containsKey('value') && obj.get('value') == 'Account') {
          accountObject = obj;
        }
        if (obj.containsKey('value') && obj.get('value') == 'Contact') {
          contactObject = obj;
        }
      }
      Assert.isNotNull(accountObject);
      Assert.areEqual('Account', accountObject.get('label'));

      Assert.isNotNull(contactObject);
      Assert.areEqual('Contact', contactObject.get('label'));
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testGetAllFields() {
    try {
      List<Map<String, String>> result = DashboardSettingsService.getAllFields(
        'Account'
      );

      // get 2 examples
      Map<String, String> nameField;
      Map<String, String> phoneField;
      for (Map<String, String> field : result) {
        if (field.containsKey('value') && field.get('value') == 'Name') {
          nameField = field;
        }
        if (field.containsKey('value') && field.get('value') == 'Phone') {
          phoneField = field;
        }
      }
      Assert.isNotNull(nameField);
      Assert.areEqual('Account Name', nameField.get('label'));

      Assert.isNotNull(phoneField);
      Assert.areEqual('Account Phone', phoneField.get('label'));
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testGetAllPicklistOptions() {
    try {
      List<Map<String, String>> result = DashboardSettingsService.getAllPicklistOptions(
        'ServiceAppointment',
        'Status'
      );

      Assert.isNotNull(result);

      // get 2 examples
      Map<String, String> completed;
      Map<String, String> canceled;
      for (Map<String, String> option : result) {
        if (option.containsKey('value') && option.get('value') == 'Completed') {
          completed = option;
        }
        if (option.containsKey('value') && option.get('value') == 'Canceled') {
          canceled = option;
        }
      }

      Assert.isNotNull(completed);
      Assert.isNotNull(canceled);
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testGetAllObjLabels() {
    try {
      List<String> apiNames = new List<String>{ 'ServiceAppointment', 'Case' };
      Map<String, String> result = DashboardSettingsService.getAllObjLabels(
        apiNames
      );

      Assert.areEqual('Service Appointment', result.get(apiNames.get(0)));
      Assert.areEqual('Case', result.get(apiNames.get(1)));
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testInsertNewCard() {
    try {
      List<Mobile_Dashboard_Setting__c> cardsBefore = [
        SELECT Id
        FROM Mobile_Dashboard_Setting__c
      ];
      Assert.isNotNull(cardsBefore);
      Assert.areEqual(1, cardsBefore.size());

      Map<String, String> data = new Map<String, String>();
      data.put('customLogic', '');
      data.put('layout', 'SIDE');
      data.put('mainFilterLogic', 'AND');
      data.put('mainFilter', '');
      data.put('objectName', 'Account');
      data.put('index', '1');
      data.put('subFilters', '');
      data.put('title', 'Test Title2');

      DashboardSettingsService.insertNewCard(data);

      List<Mobile_Dashboard_Setting__c> cardsAfter = [
        SELECT Id
        FROM Mobile_Dashboard_Setting__c
      ];
      Assert.isNotNull(cardsAfter);
      Assert.areEqual(2, cardsAfter.size());
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testUpdateCard() {
    try {
      Mobile_Dashboard_Setting__c cardBefore = [
        SELECT Id, Title__c
        FROM Mobile_Dashboard_Setting__c
        WHERE Id = :mds.Id
      ];
      Assert.isNotNull(cardBefore);
      Assert.areEqual('Test Title', cardBefore.Title__c);

      Map<String, String> data = new Map<String, String>();
      data.put('customLogic', '');
      data.put('layout', 'SIDE');
      data.put('mainFilterLogic', 'AND');
      data.put('mainFilter', '');
      data.put('objectName', 'Account');
      data.put('index', '0');
      data.put('subFilters', '');
      data.put('title', 'Updated Test Title');
      DashboardSettingsService.updateCard(mds.Id, data);

      Mobile_Dashboard_Setting__c cardAfter = [
        SELECT Id, Title__c
        FROM Mobile_Dashboard_Setting__c
        WHERE Id = :mds.Id
      ];
      Assert.isNotNull(cardAfter);
      Assert.areEqual('Updated Test Title', cardAfter.Title__c);
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testDeleteCard() {
    try {
      List<Mobile_Dashboard_Setting__c> cardsBefore = [
        SELECT Id
        FROM Mobile_Dashboard_Setting__c
      ];
      Assert.isNotNull(cardsBefore);
      Assert.areEqual(1, cardsBefore.size());

      DashboardSettingsService.deleteCard(mds.Id);

      List<Mobile_Dashboard_Setting__c> cardsAfter = [
        SELECT Id
        FROM Mobile_Dashboard_Setting__c
      ];
      Assert.isNotNull(cardsAfter);
      Assert.areEqual(0, cardsAfter.size());
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void testUpdateCardsOrder() {
    try {
      Map<String, String> data = new Map<String, String>();
      data.put('customLogic', '');
      data.put('layout', 'SIDE');
      data.put('mainFilterLogic', 'AND');
      data.put('mainFilter', '');
      data.put('objectName', 'Account');
      data.put('index', '1');
      data.put('subFilters', '');
      data.put('title', 'Test Title2');
      Id newId = DashboardSettingsService.insertNewCard(data);

      List<Mobile_Dashboard_Setting__c> cardsBefore = [
        SELECT Id, Title__c, Order__c
        FROM Mobile_Dashboard_Setting__c
      ];
      for (Mobile_Dashboard_Setting__c card : cardsBefore) {
        if (card.Title__c == 'Test Title') {
          Assert.areEqual(0, card.Order__c);
        }
        if (card.Title__c == 'Test Title2') {
          Assert.areEqual(1, card.Order__c);
        }
      }

      List<String> cardsIds = new List<String>();
      cardsIds.add(newId);
      cardsIds.add(mds.Id);
      DashboardSettingsService.updateCardsOrder(cardsIds);

      List<Mobile_Dashboard_Setting__c> cardsAfter = [
        SELECT Id, Title__c, Order__c
        FROM Mobile_Dashboard_Setting__c
      ];
      for (Mobile_Dashboard_Setting__c card : cardsAfter) {
        if (card.Title__c == 'Test Title') {
          Assert.areEqual(1, card.Order__c);
        }
        if (card.Title__c == 'Test Title2') {
          Assert.areEqual(0, card.Order__c);
        }
      }
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }
}
