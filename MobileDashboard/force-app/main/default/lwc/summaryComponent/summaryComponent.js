import { LightningElement, api, wire } from 'lwc';
import { gql, graphql } from 'lightning/uiGraphQLApi';
import { DQM } from './BuildGraphQL';

export default class SummaryComponent extends LightningElement {
  @api settings;
  @api demoMode;

  recordsCount = 0;
  subQueriesData = [];
  fullQuery = '';

  renderedCallback() {
    if (this.isDemoMode) {
      const subCounter = this.settings.subQueriesData.length;
      this.recordsCount = subCounter === 0 ? 1 : subCounter;
      this.subQueriesData = this.settings.subQueriesData;
    }
  }

  connectedCallback() {
    if (!this.isDemoMode) {
      this.fullQuery = this.buildQuery();
    }
  }

  @wire(graphql, {
    query: '$fullQuery',
  })
  GetDbResults({ data, error }) {
    if (data) {
      this.setRecordsAndSubQueries(data);
    }
    if (error) {
      console.log(error);
    }
  }

  buildQuery() {
    return gql`
      ${DQM.gqlQueryMaker(this.settings)}
    `;
  }

  getResults(data, queryName) {
    return data?.uiapi?.query[queryName]?.edges?.length ?? 0;
  }

  setRecordsAndSubQueries(data) {
    this.recordsCount = this.getResults(data, 'counter_main');
    for (let [i, subFilter] of this.subFilters.entries()) {
      this.subQueriesData[i] = {
        count: this.getResults(data, `counter_${i}`),
        index: i,
        label: subFilter.label,
        icon: subFilter.icon,
        color: subFilter.color,
      };
    }
    this.subQueriesData = [...this.subQueriesData];
  }

  get subContainerClass() {
    return `sub-container ${this.layout === 'SIDE' ? 'sub-container-side' : 'sub-container-stack'}`;
  }

  get subFilters() {
    return JSON.parse(this.settings?.node?.Sub_Filters__c.value ?? '[]');
  }

  get title() {
    return this.isDemoMode ? this.settings?.Title__c : this.settings?.node?.Title__c.value;
  }

  get layout() {
    return this.isDemoMode ? this.settings?.Layout__c : this.settings?.node?.Layout__c.value;
  }

  get isDemoMode() {
    return this.demoMode === 'true';
  }

  get recordsCountDisplay() {
    return this.recordsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  get displayPlus() {
    return this.recordsCount === 2000;
  }

  get mainContainerClass() {
    return `main-container ${this.isDemoMode ? 'border' : ''}`;
  }

  get isNonEmptyCard() {
    return this.isDemoMode ? !!this.settings.subQueriesData.length : !!this.subFilters.length;
  }

  get nonEmptyCardTitleClass() {
    return this.isNonEmptyCard ? 'padding-non-empty-card' : '';
  }
}
