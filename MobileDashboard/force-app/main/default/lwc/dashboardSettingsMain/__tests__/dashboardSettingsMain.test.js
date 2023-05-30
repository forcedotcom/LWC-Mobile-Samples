import { createElement } from 'lwc';
import DashboardSettingsMain from 'c/dashboardSettingsMain';
import { graphql } from 'lightning/uiGraphQLApi';

jest.mock(
  '@salesforce/apex/DashboardSettingsService.getAllObjLabels',
  () => {
    return {
      default: jest.fn(() => ({
        Asset: 'Asset',
        ServiceAppointment: 'Service Appointment',
      })),
    };
  },
  { virtual: true }
);

jest.mock(
  '@salesforce/apex/DashboardSettingsService.insertNewCard',
  () => {
    return {
      default: jest.fn(() => 1),
    };
  },
  { virtual: true }
);

jest.mock(
  '@salesforce/apex/DashboardSettingsService.updateCardsOrder',
  () => {
    return {
      default: jest.fn(),
    };
  },
  { virtual: true }
);

let element;
describe('c-dashboard-settings-main', () => {
  beforeEach(() => {
    element = createElement('c-dashboard-settings-main', {
      is: DashboardSettingsMain,
    });

    document.body.appendChild(element);

    graphql.emit({
      uiapi: {
        query: {
          Mobile_Dashboard_Setting__c: {
            edges: [
              {
                node: {
                  Id: 'a0oRO0000005xCYYAY',
                  Object_Name__c: {
                    value: 'ServiceAppointment',
                  },
                  Title__c: {
                    value: 'My Upcoming Service Appointments',
                  },
                  Main_Filter__c: {
                    value:
                      '[{"key":"hog03n","field":"SchedStartTime","fieldDisplay":"Scheduled Start","fieldType":"DATETIME","operator":"last","value":"","unit":"month","unitDisplay":"months","quantity":"16","label":"","icon":"","color":"#747474","operatorDisplay":"last"}]',
                  },
                  Main_Filter_Logic__c: {
                    value: 'AND',
                  },
                  Custom_Logic__c: {
                    value: null,
                  },
                  Layout__c: {
                    value: 'STACK',
                  },
                  Sub_Filters__c: {
                    value:
                      '[{"key":"hhrget","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Scheduled","unit":"","unitDisplay":"","quantity":"","label":"Scheduled","icon":"utility:clock","color":"#747474"},{"key":"le98t2","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Canceled","unit":"","unitDisplay":"","quantity":"","label":"Canceled","icon":"utility:warning","color":"#8C4B02"},{"key":"6ze7fr","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Completed","unit":"","unitDisplay":"","quantity":"","label":"Completed","icon":"utility:success","color":"#2E844A"}]',
                  },
                  Order__c: {
                    value: 0,
                  },
                },
              },
              {
                node: {
                  Id: 'a0oRO0000005xHjYAI',
                  Object_Name__c: {
                    value: 'Asset',
                  },
                  Title__c: {
                    value: 'My Asset',
                  },
                  Main_Filter__c: {
                    value: '[]',
                  },
                  Main_Filter_Logic__c: {
                    value: 'OR',
                  },
                  Custom_Logic__c: {
                    value: null,
                  },
                  Layout__c: {
                    value: 'SIDE',
                  },
                  Sub_Filters__c: {
                    value:
                      '[{"key":"pzlqyw","field":"Name","fieldDisplay":"Asset Name","fieldType":"STRING","operator":"eq","value":"ABC","unit":"","unitDisplay":"","quantity":"","label":"ABC","icon":"","color":"#747474","operatorDisplay":"="},{"key":"bmu42o","field":"Name","fieldDisplay":"Asset Name","fieldType":"STRING","operator":"eq","value":"DEF","unit":"","unitDisplay":"","quantity":"","label":"DEF","icon":"","color":"#747474","operatorDisplay":"="},{"key":"se7sdp","field":"Name","fieldDisplay":"Asset Name","fieldType":"STRING","operator":"like","value":"Asset","unit":"","unitDisplay":"","quantity":"","label":"None","icon":"","color":"#747474","operatorDisplay":"contains"}]',
                  },
                  Order__c: {
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      },
    });
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should have 2 cards', () => {
    const cards = element.shadowRoot.querySelectorAll('c-dashboard-settings-card');
    expect(cards).toHaveLength(2);
  });

  it('should switch cards on moveCardUp called for second card', async () => {
    const card0 = element.shadowRoot.querySelectorAll('c-dashboard-settings-card')[0];
    const card1 = element.shadowRoot.querySelectorAll('c-dashboard-settings-card')[1];

    element.moveCardUp(1);
    return Promise.resolve().then(() => {
      expect(card0.index).toBe(1);
      expect(card1.index).toBe(0);
    });
  });

  it('should switch cards on moveCardDown called for first card', async () => {
    const card0 = element.shadowRoot.querySelectorAll('c-dashboard-settings-card')[0];
    const card1 = element.shadowRoot.querySelectorAll('c-dashboard-settings-card')[1];

    element.moveCardDown(0);
    return Promise.resolve().then(() => {
      expect(card0.index).toBe(1);
      expect(card1.index).toBe(0);
    });
  });

  it('should have 3 cards after duplicating', async () => {
    element.duplicateCard(0);
    return Promise.resolve().then(async () => {
      return Promise.resolve().then(() => {
        const cards = element.shadowRoot.querySelectorAll('c-dashboard-settings-card');
        expect(cards).toHaveLength(3);
      });
    });
  });

  it('should not duplicate if index is invalid', async () => {
    element.duplicateCard(-1);
    return Promise.resolve().then(async () => {
      return Promise.resolve().then(() => {
        const cards = element.shadowRoot.querySelectorAll('c-dashboard-settings-card');
        expect(cards).toHaveLength(2);
      });
    });
  });
});
