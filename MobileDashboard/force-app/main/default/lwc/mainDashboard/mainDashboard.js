import { LightningElement, wire, api } from 'lwc';
import { gql, graphql, refreshGraphQL } from 'lightning/uiGraphQLApi';

export default class MainDashboard extends LightningElement {
  dashboardSettings = [];
  GET_DASHBOARD_SETTINGS_QRY = '';

  queryResult;
  refreshed = false;

  connectedCallback() {
    this.GET_DASHBOARD_SETTINGS_QRY = gql`
      ${this.getDashboardQuery()}
    `;
  }

  @wire(graphql, {
    query: '$GET_DASHBOARD_SETTINGS_QRY',
  })
  GetAllDashboardSettings(result) {
    this.queryResult = result;
    const { data, errors } = result;
    if (data) {
      if (!this.refreshed) {
        this.refreshGraphQL();
        this.refreshed = true;
        return;
      }
      const allSettings = data?.uiapi?.query['Mobile_Dashboard_Setting__c']?.edges;
      if (allSettings) this.populateDashboardSettings(allSettings);
    }
    if (errors) {
      console.log(JSON.stringify(errors));
    }
  }

  populateDashboardSettings(allSettings) {
    for (const setting of allSettings) {
      this.dashboardSettings[setting.node.Order__c.value] = setting;
    }
    this.dashboardSettings = [...this.dashboardSettings];
  }

  getDashboardQuery() {
    return `query GetAllDashboardSettings {
        uiapi {
          query {
            Mobile_Dashboard_Setting__c  @category(name: "recordQuery") {
              edges {
                node {
                  Id,
                  Object_Name__c @category(name: "StringValue") {
                    value
                  }
                  Title__c @category(name: "StringValue") {
                    value
                  }
                  Main_Filter__c @category(name: "TextAreaValue") {
                    value
                  }
                  Main_Filter_Logic__c @category(name: "PicklistValue") {
                    value
                  }
                  Custom_Logic__c @category(name: "StringValue") {
                    value
                  }
                  Layout__c  @category(name: "PicklistValue") {
                    value
                  }
                  Sub_Filters__c @category(name: "TextAreaValue") {
                    value
                  }
                  Order__c @category(name: "DoubleValue") {
                    value
                  }
                }
              }
            }
          }
        }
      }`;
  }

  @api async refreshGraphQL() {
    return refreshGraphQL(this.queryResult);
  }
}
