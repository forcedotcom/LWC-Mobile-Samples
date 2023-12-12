import { createElement } from "lwc";
import MainDashboard from "c/mainDashboard";
import { graphql } from "lightning/uiGraphQLApi";

let element;
describe("c-main-dashboard", () => {
  beforeEach(() => {
    element = createElement("c-main-dashboard", {
      is: MainDashboard
    });

    document.body.appendChild(element);

    graphql.emit({
      uiapi: {
        query: {
          Mobile_Dashboard_Setting__c: {
            edges: [
              {
                node: {
                  Id: "a0oRO0000005xCYYAY",
                  Object_Name__c: {
                    value: "ServiceAppointment"
                  },
                  Title__c: {
                    value: "My Upcoming Service Appointments"
                  },
                  Main_Filter__c: {
                    value:
                      '[{"key":"hog03n","field":"SchedStartTime","fieldDisplay":"Scheduled Start","fieldType":"DATETIME","operator":"last","value":"","unit":"month","unitDisplay":"months","quantity":"16","label":"","icon":"","color":"#747474","operatorDisplay":"last"}]'
                  },
                  Main_Filter_Logic__c: {
                    value: "AND"
                  },
                  Custom_Logic__c: {
                    value: null
                  },
                  Layout__c: {
                    value: "STACK"
                  },
                  Sub_Filters__c: {
                    value:
                      '[{"key":"hhrget","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Scheduled","unit":"","unitDisplay":"","quantity":"","label":"Scheduled","icon":"utility:clock","color":"#747474"},{"key":"le98t2","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Canceled","unit":"","unitDisplay":"","quantity":"","label":"Canceled","icon":"utility:warning","color":"#8C4B02"},{"key":"6ze7fr","field":"Status","fieldDisplay":"Status","fieldType":"PICKLIST","operator":"eq","operatorDisplay":"=","value":"Completed","unit":"","unitDisplay":"","quantity":"","label":"Completed","icon":"utility:success","color":"#2E844A"}]'
                  },
                  Order__c: {
                    value: 0
                  }
                }
              },
              {
                node: {
                  Id: "a0oRO0000005xHjYAI",
                  Object_Name__c: {
                    value: "Asset"
                  },
                  Title__c: {
                    value: "My Asset"
                  },
                  Main_Filter__c: {
                    value: "[]"
                  },
                  Main_Filter_Logic__c: {
                    value: "OR"
                  },
                  Custom_Logic__c: {
                    value: null
                  },
                  Layout__c: {
                    value: "SIDE"
                  },
                  Sub_Filters__c: {
                    value:
                      '[{"key":"pzlqyw","field":"Name","fieldDisplay":"Asset Name","fieldType":"STRING","operator":"eq","value":"ABC","unit":"","unitDisplay":"","quantity":"","label":"ABC","icon":"","color":"#747474","operatorDisplay":"="},{"key":"bmu42o","field":"Name","fieldDisplay":"Asset Name","fieldType":"STRING","operator":"eq","value":"DEF","unit":"","unitDisplay":"","quantity":"","label":"DEF","icon":"","color":"#747474","operatorDisplay":"="},{"key":"se7sdp","field":"Name","fieldDisplay":"Asset Name","fieldType":"STRING","operator":"like","value":"Asset","unit":"","unitDisplay":"","quantity":"","label":"None","icon":"","color":"#747474","operatorDisplay":"contains"}]'
                  },
                  Order__c: {
                    value: 1
                  }
                }
              }
            ]
          }
        }
      }
    });
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should have 2 summary components", () => {
    const cards = element.shadowRoot.querySelectorAll("c-summary-component");
    expect(cards).toHaveLength(2);
  });
});
