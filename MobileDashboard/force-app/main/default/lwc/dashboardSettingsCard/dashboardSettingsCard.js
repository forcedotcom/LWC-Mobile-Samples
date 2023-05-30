import { LightningElement, api } from 'lwc';
import customLabels from './labels';

export default class DashboardSettingsCard extends LightningElement {
  @api index;
  @api card;
  @api handleEditCardClick;
  @api moveCardUp;
  @api moveCardDown;
  @api duplicateCard;
  @api deleteCard;
  @api cardsLength;
  LABELS = customLabels;

  handleEditClick = async () => {
    this.handleEditCardClick(this.index);
  };

  handleUpClick = () => {
    this.moveCardUp(this.index);
  };

  handleDownClick = () => {
    this.moveCardDown(this.index);
  };

  handleDuplicateCardClick = () => {
    this.duplicateCard(this.index);
  };

  handleDeleteCardClick = () => {
    this.deleteCard(this.index);
  };

  get mainFiltersDisplay() {
    let mainFilters = JSON.parse(JSON.stringify(this.card.filter.subFilters));
    return mainFilters.map((f, i) => {
      const start = this.getLogicDisplayText(i);
      const body = `${f.fieldDisplay} ${this.addEquals(f.operator)} ${f.operatorDisplay} ${
        f.value ?? ''
      } ${f.quantity ?? ''} ${f.unitDisplay ?? ''}`;
      return { key: f.key, displayText: `${start}${body}` };
    });
  }

  get isCustomLogic() {
    return this.card.filter.conditionLogic === 'CUSTOM';
  }

  get conditionLogicText() {
    return this.card.filter.conditionLogic === 'AND'
      ? this.LABELS.MobileDashboard_settings_card_display_logic_and
      : this.LABELS.MobileDashboard_settings_card_display_logic_or;
  }

  get number() {
    return this.index + 1;
  }

  get isFirst() {
    return this.index === 0;
  }

  get isLast() {
    return this.index === this.cardsLength - 1;
  }

  getLogicDisplayText(ind) {
    if (this.isCustomLogic) return `${ind + 1}\u00A0\u00A0\u00A0`;
    if (ind === 0) return '';
    else return `${this.conditionLogicText}\u00A0\u00A0\u00A0`;
  }

  addEquals(operator) {
    return operator && ['today', 'next', 'last'].includes(operator) ? '=' : '';
  }

  get previewSettings() {
    let subQueriesData = [];
    const sfEntries = this.card.subFilters?.entries() ?? [];
    for (let [index, subFilter] of sfEntries) {
      subQueriesData.push({
        index,
        count: 1,
        ...subFilter,
      });
    }

    return {
      Layout__c: this.card.layout,
      Title__c: this.card.title,
      subQueriesData,
    };
  }
}
