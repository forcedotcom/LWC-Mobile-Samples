import { createElement } from 'lwc';
import SummaryComponent from 'c/summaryComponent';

let element;
describe('c-summary-component', () => {
  beforeEach(() => {
    element = createElement('c-summary-component', {
      is: SummaryComponent,
    });
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should show 2 sub-filter-sum-components', async () => {
    element.settings = {
      subQueriesData: [
        {
          index: 0,
          count: 1,
          subFilter: {
            key: 'rwn1fa',
            fieldDisplay: 'Time Sheet End Date',
            value: '',
            unitDisplay: 'days',
            quantity: '14',
            operatorDisplay: 'last',
          },
        },
        {
          index: 1,
          count: 1,
          subFilter: {
            key: '131fdb',
            fieldDisplay: 'Time Sheet Start Date',
            value: '',
            unitDisplay: 'weeks',
            quantity: '1',
            operatorDisplay: 'last',
          },
        },
      ],
    };
    element.demoMode = 'true';
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const subFilterSummaryComponents = element.shadowRoot.querySelectorAll(
        'c-sub-filter-summary-component'
      );
      expect(subFilterSummaryComponents).toHaveLength(2);
    });
  });

  it('should show correct title', async () => {
    element.settings = {
      node: {
        Id: 'a0oRO0000005xCKYAY',
        Object_Name__c: {
          value: 'ResourceAbsence',
        },
        Title__c: {
          value: 'My Absences',
        },
        Main_Filter__c: {
          value:
            '[{"key":"ken22n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATETIME","operator":"last","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"last"}, {"key":"ken23n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATETIME","operator":"last","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"last"}]',
        },
        Main_Filter_Logic__c: {
          value: 'CUSTOM',
        },
        Custom_Logic__c: {
          value: '1 AND 2',
        },
        Layout__c: {
          value: 'SIDE',
        },
        Sub_Filters__c: {
          value:
            '[{"key":"7wtchc","field":"FSL__Approved__c","fieldDisplay":"Approved","fieldType":"BOOLEAN","operator":"eq","value":true,"unit":"","unitDisplay":"","quantity":"","label":"Approved","icon":"utility:success","color":"#2E844A","operatorDisplay":"="},{"key":"e7fjv2","field":"FSL__Approved__c","fieldDisplay":"Approved","fieldType":"BOOLEAN","operator":"eq","value":false,"unit":"","unitDisplay":"","quantity":"","label":"Not Approved","icon":"utility:error","color":"#B72020","operatorDisplay":"="}]',
        },
        Order__c: {
          value: 0,
        },
      },
    };
    element.demoMode = 'false';
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const title = element.shadowRoot.querySelector('.main-container>p');
      expect(title.textContent).toBe('My Absences (0)');
    });
  });

  it('should show correct title', async () => {
    element.settings = {
      node: {
        Id: 'a0oRO0000005xCKYAY',
        Object_Name__c: {
          value: 'ResourceAbsence',
        },
        Title__c: {
          value: 'The Absences',
        },
        Main_Filter__c: {
          value:
            '[{"key":"ken22n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATE","operator":"today","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"last"}, {"key":"ken23n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATETIME","operator":"last","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"last"},{"key":"ken22n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATE","operator":"last","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"last"},{"key":"ken22n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATE","operator":"eq","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"="},{"key":"ken22n","field":"Start","fieldDisplay":"Start Time","fieldType":"DATE","operator":"next","value":"","unit":"month","unitDisplay":"months","quantity":"12","label":"","icon":"","color":"#747474","operatorDisplay":"next"}]',
        },
        Main_Filter_Logic__c: {
          value: 'OR',
        },
        Custom_Logic__c: {
          value: '',
        },
        Layout__c: {
          value: 'SIDE',
        },
        Sub_Filters__c: {
          value:
            '[{"key":"e7fjv2","field":"FSL__Approved__c","fieldDisplay":"Approved","fieldType":"BOOLEAN","operator":"eq","value":false,"unit":"","unitDisplay":"","quantity":"","label":"Not Approved","icon":"utility:error","color":"#B72020","operatorDisplay":"="}]',
        },
        Order__c: {
          value: 0,
        },
      },
    };
    element.demoMode = 'false';
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const title = element.shadowRoot.querySelector('.main-container>p');
      expect(title.textContent).toBe('The Absences (0)');
    });
  });
});
