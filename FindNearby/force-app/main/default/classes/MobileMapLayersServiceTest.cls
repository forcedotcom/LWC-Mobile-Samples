@isTest
public with sharing class MobileMapLayersServiceTest {
    public static ServiceResource sr;

    static {
        sr = new ServiceResource(
            RelatedRecordId = System.UserInfo.getUserId(),
            Name = 'Resource Name',
            LastKnownLatitude = 10.000000000000000,
            LastKnownLongitude = 10.000000000000000
        );
        insert sr;
    }

    @isTest
    static void getAssignedResourceLocationTest() {
        try {
            List<Decimal> location = MobileMapLayersService.getAssignedResourceLocation();
            Assert.areEqual(10, location[0]);
            Assert.areEqual(10, location[0]);
        } catch (Exception e) {
            Assert.fail('An exception was thrown: ' + e.getMessage());
        }
    }

    @isTest
    static void getObjectLocationsTest() {
        try {
            List<Map<String, String>> locations = new List<Map<String, String>>();
            Map<String, String> tempList = new Map<String, String>();
            tempList.put('Id', sr.Id);
            tempList.put('Latitude', String.valueOf(sr.LastKnownLatitude));
            tempList.put('Longitude', String.valueOf(sr.LastKnownLongitude));
            tempList.put('MajorField', sr.Name);
            tempList.put('SecondField', sr.RelatedRecordId);
            locations.add(tempList);

            List<Map<String, String>> result = MobileMapLayersService.getObjectLocations(
                'ServiceResource',
                'LastKnownLatitude',
                'LastKnownLongitude',
                'Name',
                'RelatedRecordId'
            );

            Assert.areEqual(locations, result);
        } catch (Exception e) {
            Assert.fail('An exception was thrown: ' + e.getMessage());
        }
    }

    @isTest
    static void retrieveAllObjFieldsTest() {
        try {
            SObjectType accountType = Schema.getGlobalDescribe().get('Account');
            Map<String, Schema.SObjectField> fields = accountType.getDescribe().fields.getMap();

            List<Map<String, String>> result = MobileMapLayersService.retrieveAllObjFields('Account');
            Assert.areEqual(fields.size(), result.size());
        } catch (Exception e) {
            Assert.fail('An exception was thrown: ' + e.getMessage());
        }
    }

    @isTest
    static void retrieveObjInfoTest() {
        try {
            Map<String, String> result = MobileMapLayersService.retrieveObjInfo('Account');
            Assert.areEqual(result.get('Label'), 'Account');
            Assert.areEqual(result.get('Plural'), 'Accounts');
        } catch (Exception e) {
            Assert.fail('An exception was thrown: ' + e.getMessage());
        }
    }

    @isTest
    static void executeFilterQueryTest() {
        try {
            Map<String, String> currentFieldFilter = new Map<String, String>();
            currentFieldFilter.put('type', 'STRING');
            currentFieldFilter.put('value', 'name');
            currentFieldFilter.put('input', 'Resource Name');
            List<sObject> result = MobileMapLayersService.executeFilterQuery('ServiceResource', currentFieldFilter);

            Assert.areEqual(result[0].Id, sr.Id);
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
            MobileMapLayersService.executeFilterQuery('ServiceResource', currentFieldFilter);

            Assert.fail('Invalid value, should throw an error');
        } catch (Exception e) {
            Assert.isTrue(true);
        }
    }
}
