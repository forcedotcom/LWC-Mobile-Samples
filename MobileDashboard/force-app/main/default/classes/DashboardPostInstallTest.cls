@isTest
public with sharing class DashboardPostInstallTest {

    @isTest
    static void testInstallScriptPredefinedCards() {
        List<Mobile_Dashboard_Setting__c> allCardsBefore = [SELECT Id FROM Mobile_Dashboard_Setting__c];
        Assert.areEqual(0, allCardsBefore.size());

        DashboardPostInstall.onInstall();
        
        List<Mobile_Dashboard_Setting__c> allCardsAfter = [SELECT Id FROM Mobile_Dashboard_Setting__c];
        Assert.areEqual(4, allCardsAfter.size());
    }
}
