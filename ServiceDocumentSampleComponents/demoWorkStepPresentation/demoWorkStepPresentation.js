import { LightningElement, api } from 'lwc';

export default class DemoWorkStepPresentation extends LightningElement {
    @api
    get workStepRecord() {
        return this._workStepRecord;
    }
    set workStepRecord(val) {
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
            this._workStepRecord = val.node;
        }
    }
}