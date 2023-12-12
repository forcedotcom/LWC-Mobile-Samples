@isTest
public with sharing class MobileMapLayersServiceTest {
  public static ServiceResource sr;

  static {
    sr = new ServiceResource(
      RelatedRecordId = System.UserInfo.getUserId(),
      Name = 'Resource Name',
      LastKnownLatitude = 10.000000000000000,
      LastKnownLongitude = 10.000000000000000,
      ResourceType = 'T',
      IsActive = true
    );
    insert sr;
  }

  @isTest
  static void executeFilterQueryTest() {
    try {
      Map<String, String> currentFieldFilter = new Map<String, String>();
      currentFieldFilter.put('type', 'STRING');
      currentFieldFilter.put('value', 'name');
      currentFieldFilter.put('input', 'Resource Name');
      List<sObject> result = MobileMapLayersService.executeFilterQuery(
        'ServiceResource',
        currentFieldFilter
      );

      Assert.areEqual(result[0].id, sr.Id);
    } catch (Exception e) {
      Assert.fail('An exception was thrown: ' + e.getMessage());
    }
  }

  @isTest
  static void executeFilterQueryInvalidInputTest() {
    try {
      Map<String, String> currentFieldFilter = new Map<String, String>();
      currentFieldFilter.put('type', 'DOUBLE');
      currentFieldFilter.put('value', 'lastknownlatitude');
      currentFieldFilter.put('input', 'text');
      MobileMapLayersService.executeFilterQuery(
        'ServiceResource',
        currentFieldFilter
      );

      Assert.fail('Invalid value, should throw an error');
    } catch (Exception e) {
      Assert.isTrue(true);
    }
  }
}
