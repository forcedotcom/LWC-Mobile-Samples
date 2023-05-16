import { LightningElement, api } from 'lwc';
import getAllPicklistOptions from '@salesforce/apex/MobileMapLayersService.getAllPicklistOptions';

export default class MapFilters extends LightningElement {
  @api mapObjects;
  @api handleError;
  @api currentObjectFilter;
  @api currentFieldFilter;
  @api setCurrentObjectFilter;
  @api setCurrentFieldFilter;
  selectedFieldFilter = { label: '', value: '', type: '', input: '' };
  picklistOptions;

  connectedCallback() {
    this.selectedFieldFilter = this.currentFieldFilter.field;
    this.refreshPicklistOptions();
  }

  renderedCallback() {
    const fieldContainer = this.template.querySelector('.field-combo-container');
    const comboCover = this.template.querySelector('.field-combo-cover');
    comboCover.style.height = `${fieldContainer.clientHeight}px`;
    comboCover.style.width = `${fieldContainer.clientWidth}px`;
  }

  // Getters

  get filteredObjectText() {
    return this.currentObjectFilter?.label || 'None';
  }

  get filteredFieldText() {
    const currentField = this.currentFieldFilter.field.label;
    return !currentField ? 'None' : currentField;
  }

  get filterFieldButtonClass() {
    let buttonClasses = 'button filter-button';
    return `${buttonClasses} ${
      this.currentFieldFilter.isActive ? 'active-button' : 'inactive-button'
    }`;
  }

  get objRadioOptions() {
    return this.mapObjects;
  }

  get fieldRadioOptions() {
    if (!this.currentObjectFilter.value) return [];
    const objFields = this.mapObjects.find(
      (o) => o.value === this.currentObjectFilter.value
    ).fields;
    return objFields
      ?.map((f) => ({ label: f.label, value: f.value, type: f.type }))
      .sort((f1, f2) => (f1.label < f2.label ? -1 : 1));
  }

  get filterValueOptions() {
    return this.picklistOptions;
  }

  get inputType() {
    if (this.selectedFieldFilter?.type === 'DATETIME') return 'DATE';
    return this.selectedFieldFilter?.type;
  }

  get isFieldTypeBoolean() {
    return this.selectedFieldFilter.type === 'BOOLEAN';
  }

  get isFieldTypePicklist() {
    return this.selectedFieldFilter.type === 'PICKLIST';
  }

  get isFieldTypeRegular() {
    return !this.isFieldTypeBoolean && !this.isFieldTypePicklist;
  }

  get showResultsDisabled() {
    return (
      !this.selectedFieldFilter.value ||
      (!this.isFieldTypeBoolean && !this.selectedFieldFilter.input)
    );
  }

  get clearDisabled() {
    return !this.currentFieldFilter.field.value;
  }

  // Event Handlers

  onObjRadioChange = (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      this.clearFieldFilter();
      this.setCurrentObjectFilter(this.objRadioOptions.find((o) => o.value === e.target.value));
      this.closeSheet('object-filter-bottom-sheet');
    } catch (error) {
      this.handleError(error);
    }
  };

  onFieldRadioChange = (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      this.selectedFieldFilter = {
        ...this.fieldRadioOptions.find((o) => o.value === e.target.value),
      };
      this.selectedFieldFilter.input = this.isFieldTypeBoolean ? false : '';
      this.refreshPicklistOptions();
      this.closeSheet('fields-list-bottom-sheet');
    } catch (error) {
      this.handleError(error);
    }
  };

  onFieldInputChange = (e) => {
    try {
      const input = this.isFieldTypeBoolean ? e.target.checked : e.target.value;
      this.selectedFieldFilter = { ...this.selectedFieldFilter, input };
    } catch (error) {
      this.handleError(error);
    }
  };

  // Buttons Handlers

  handleTopFiltersObjClick = () => {
    this.openSheet('object-filter-bottom-sheet');
    this.closeSheet('field-filter-bottom-sheet');
    this.closeSheet('fields-list-bottom-sheet');
  };

  handleTopFiltersFieldClick = () => {
    this.selectedFieldFilter = this.currentFieldFilter.field;
    this.openSheet('field-filter-bottom-sheet');
    this.closeSheet('object-filter-bottom-sheet');
  };

  handleFieldComboClick = () => {
    this.openSheet('fields-list-bottom-sheet');
  };

  handleCloseObjFiltersClick = () => {
    this.closeSheet('object-filter-bottom-sheet');
  };

  handleCloseFieldFiltersClick = () => {
    this.closeSheet('field-filter-bottom-sheet');
  };

  handleCloseFieldsListClick = () => {
    this.closeSheet('fields-list-bottom-sheet');
  };

  handleShowResultsClick = () => {
    if (this.isFieldTypeBoolean) this.selectedFieldFilter.input = !!this.selectedFieldFilter.input;
    this.setCurrentFieldFilter(true, this.selectedFieldFilter);
    this.closeSheet('field-filter-bottom-sheet');
  };

  handleClearClick = () => {
    this.clearFieldFilter();
    this.closeSheet('field-filter-bottom-sheet');
    this.closeSheet('fields-list-bottom-sheet');
  };

  // Helpers

  async refreshPicklistOptions() {
    if (this.isFieldTypePicklist) {
      const allOptions = await getAllPicklistOptions({
        obj: this.currentObjectFilter.value,
        field: this.selectedFieldFilter.value,
      });
      this.picklistOptions = [
        { label: '', value: '' },
        ...allOptions.sort((f1, f2) => (f1.label < f2.label ? -1 : 1)),
      ];
    } else {
      this.picklistOptions = [];
    }
  }

  clearFieldFilter() {
    this.setCurrentFieldFilter(false, {
      label: '',
      value: '',
      type: '',
      input: '',
    });
  }

  openSheet(sheet) {
    const sheetClasses = this.template.querySelector(`.${sheet}`).classList;
    sheetClasses.add('pt-page-moveToTop');
    sheetClasses.add('shadow');
    sheetClasses.remove('pt-page-moveFromTop');
  }

  closeSheet(sheet) {
    const sheetClasses = this.template.querySelector(`.${sheet}`).classList;
    if (Array.from(sheetClasses).includes('pt-page-moveToTop')) {
      sheetClasses.add('pt-page-moveFromTop');
      sheetClasses.remove('pt-page-moveToTop');
    }
    sheetClasses.remove('shadow');
    this.template.querySelectorAll('.sheet-content').forEach((s) => (s.scrollTop = 0));
  }
}
