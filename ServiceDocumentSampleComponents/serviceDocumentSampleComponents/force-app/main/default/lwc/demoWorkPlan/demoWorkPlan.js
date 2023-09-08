import { LightningElement, api, wire, track } from "lwc";
import { gql, graphql } from "lightning/uiGraphQLApi";

export default class DemoWorkPlan extends LightningElement {
  @api workPlanId;

  @track _workStepRecords;

  @api
  get workPlanRecord() {
    return this._workPlanRecord;
  }
  set workPlanRecord(val) {
    if (val && val.errors && val.errors.length > 0) {
      // ERROR
    } else {
      // val.node is like below
      // {
      //     "Id": "0gqRO0000000fw4YAA",
      //     "ParentRecordId": {
      //         "value": "0WORO000000CkXF4A0",
      //         "displayValue": null
      //     }
      // }
      this._workPlanRecord = val.node;
    }
  }

  @wire(graphql, {
    query: "$workStepQuery",
    variables: "$workStepVariables"
  })
  handleWorkStepGql(val) {
    if (val && val.errors && val.errors.length > 0) {
      // ERROR
    } else if (
      val &&
      val.data &&
      val.data.uiapi.query.WorkStep &&
      val.data.uiapi.query.WorkStep.edges.length > 0
    ) {
      this._workStepRecords = val.data.uiapi.query.WorkStep.edges;
    }
  }

  get workStepQuery() {
    return gql`
      query workstep($parentId: ID = "") {
        uiapi {
          query {
            WorkStep(where: { WorkPlanId: { eq: $parentId } }) {
              edges {
                node {
                  Id
                  WorkPlanId {
                    value
                    displayValue
                  }
                  Status {
                    value
                    displayValue
                    label
                  }
                  Name {
                    value
                    displayValue
                    label
                  }
                  Description {
                    value
                    displayValue
                  }
                }
              }
            }
          }
        }
      }
    `;
  }
  get workStepVariables() {
    return {
      parentId: this.workPlanId
    };
  }
}
