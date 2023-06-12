import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import AlertMessage from 'c/alertMessage';
import getAllFields from '@salesforce/apex/DashboardSettingsService.getAllFields';
import SIDE_EXAMPLE_SVG from '@salesforce/resourceUrl/side_example';
import STACK_EXAMPLE_SVG from '@salesforce/resourceUrl/stack_example';
import customLabels from './labels';

export default class EditCardModal extends LightningModal {
  @api modalTitle;
  @api objectsOptions;
  @api card;
  @api generateUniqueID;
  LABELS = customLabels;

  @api fieldsOptions;
  tempCard;
  EMPTY_SUB_FILTER = {
    key: '',
    field: '',
    fieldDisplay: '',
    fieldType: '',
    operator: '',
    operatorDisplay: '',
    value: '',
    unit: '',
    unitDisplay: '',
    quantity: '',
    label: '',
    icon: '',
    color: '#747474',
  };

  side_svg_url = `${SIDE_EXAMPLE_SVG}#side_example`;
  stack_svg_url = `${STACK_EXAMPLE_SVG}#stack_example`;

  connectedCallback() {
    this.tempCard = { ...this.card };
    this.refreshFieldsOptions(this.tempCard.object?.value);
  }

  renderedCallback() {
    this.detectSubFilterDrag();
  }

  handleCancelClick = () => {
    this.close();
  };

  handleSaveClick = () => {
    if (this.checkValidation()) {
      this.close(this.tempCard);
    }
  };

  onTitleChange = (e) => {
    this.tempCard.title = e.target.value;
  };

  onObjectComboChange = (e) => {
    this.tempCard = {
      ...this.tempCard,
      object: {
        value: e.target.value,
        label: e.target.options.find((opt) => opt.value === e.detail?.value)?.label,
      },
      filter: {
        ...this.tempCard.filter,
        subFilters: [],
      },
      subFilters: [this.EMPTY_SUB_FILTER],
    };

    this.refreshFieldsOptions(this.tempCard.object?.value);
  };

  get conditionOptions() {
    return [
      { label: this.LABELS.MobileDashboard_card_modal_details_filter_logic_and, value: 'AND' },
      { label: this.LABELS.MobileDashboard_card_modal_details_filter_logic_or, value: 'OR' },
      {
        label: this.LABELS.MobileDashboard_card_modal_details_filter_logic_custom,
        value: 'CUSTOM',
      },
    ];
  }

  onConditionOptionsChange = (e) => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.filter.conditionLogic = e.target.value;
    this.tempCard = { ...newCard };
  };

  onCustomLogicChange = (e) => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.filter.customLogic = e.target.value;
    this.tempCard = { ...newCard };
  };

  onDesignTabSelected = async () => {
    this.detectSubFilterDrag();
  };

  onLayoutRadioChange = (e) => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.layout = e.target.value;
    this.tempCard = { ...newCard };
  };

  @api handleAddConditionClick = () => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.filter.subFilters.push({ ...this.EMPTY_SUB_FILTER, key: this.generateUniqueID() });
    this.tempCard = { ...newCard };
  };

  @api handleAddSubFilterClick = () => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.subFilters.push({ ...this.EMPTY_SUB_FILTER, key: this.generateUniqueID() });
    this.tempCard = { ...newCard };
  };

  handleDeleteCondClick = (e) => {
    const index = e.target.value;
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.filter.subFilters.splice(index, 1);
    this.tempCard = { ...newCard };
  };

  updateSubFilter = (index, newVals) => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.subFilters = newCard.subFilters ?? [];
    newCard.subFilters[index] = { ...newCard.subFilters[index], ...newVals };
    this.tempCard = { ...newCard };
  };

  @api duplicateSubFilter = (index) => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.subFilters.splice(index + 1, 0, {
      ...newCard.subFilters[index],
      key: this.generateUniqueID(),
    });
    this.tempCard = { ...newCard };
  };

  @api deleteSubFilter = async (index) => {
    const toDelete = await AlertMessage.open({
      size: 'small',
      modalTitle: this.LABELS.MobileDashboard_settings_delete_sub_filter_warning_title,
      message: this.LABELS.MobileDashboard_settings_delete_sub_filter_warning_body,
      discardButtonText: this.LABELS.MobileDashboard_settings_cancel_button,
      isDeleteMsg: true,
    });

    if (toDelete) {
      let newCard = JSON.parse(JSON.stringify(this.tempCard));
      newCard.subFilters.splice(index, 1);
      this.tempCard = { ...newCard };
    }
  };

  updateMainSubFilter = (index, newVals) => {
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.filter.subFilters = newCard.filter?.subFilters ?? [];
    newCard.filter.subFilters[index] = { ...newCard.filter.subFilters[index], ...newVals };
    this.tempCard = { ...newCard };
  };

  async refreshFieldsOptions(obj) {
    if (!obj) {
      this.fieldsOptions = [];
      return;
    }
    const allFields = await getAllFields({ obj });
    this.fieldsOptions = allFields.sort((f1, f2) => (f1.label < f2.label ? -1 : 1));
  }

  get loading() {
    return !this.fieldsOptions;
  }

  get subFilters() {
    return this.tempCard?.subFilters ?? [];
  }

  get mainSubFilters() {
    let subFilters = this.tempCard?.filter?.subFilters ?? [];
    subFilters = subFilters.map((s, i) => ({ ...s, displayText: this.getLogicDisplayText(i) }));
    return subFilters;
  }

  getLogicDisplayText(ind) {
    if (this.isCustomLogic) return ind + 1;
    if (ind === 0) return '';
    else return this.conditionLogicText;
  }

  get isCustomLogic() {
    return this.tempCard.filter.conditionLogic === 'CUSTOM';
  }

  get conditionLogicText() {
    return this.tempCard.filter.conditionLogic === 'AND'
      ? this.LABELS.MobileDashboard_card_modal_details_and_between_logic
      : this.LABELS.MobileDashboard_card_modal_details_or_between_logic;
  }

  get isLayoutSide() {
    return this.tempCard.layout === 'SIDE';
  }

  get isLayoutStack() {
    return this.tempCard.layout === 'STACK';
  }

  get disableConditionLogic() {
    return !this.tempCard.object?.value;
  }

  get disableAddCondition() {
    return !this.tempCard.object?.value || !this.tempCard.filter.conditionLogic;
  }

  detectSubFilterDrag = async () => {
    const filters = this.template.querySelectorAll('c-sub-filter-card');
    if (filters.length !== this.tempCard.subFilters.length) {
      setTimeout(() => {
        this.detectSubFilterDrag();
      }, 500);
    }
    let dragged = -1;
    let dest = -1;
    filters.forEach((f) => {
      f.ondragstart = (e) => {
        dragged = e.target.index;
        f.classList.add('dragged');
      };

      f.ondragenter = (e) => {
        for (let filter of filters) {
          filter.removeDragDivider();
        }
        if (dragged !== e.target.index) {
          f.addDragDivider();
          dest = e.target.index;
        } else {
          dest = -1;
        }
      };

      f.ondragend = () => {
        for (let filter of filters) {
          filter.removeDragDivider();
        }
        f.classList.remove('dragged');
        f.disableDrag();
      };

      f.ondragover = (e) => e.preventDefault();

      f.ondrop = (e) => {
        f.disableDrag();
        if (dragged > -1 && dest > -1) {
          this.reorderSubFilters(dragged, dest);
        }
      };
    });
  };

  reorderSubFilters = (oldInd, newInd) => {
    if (oldInd < newInd) newInd--;
    const filter = this.tempCard.subFilters[oldInd];
    let newCard = JSON.parse(JSON.stringify(this.tempCard));
    newCard.subFilters.splice(oldInd, 1);
    newCard.subFilters.splice(newInd, 0, filter);
    this.tempCard = { ...newCard };
  };

  checkValidation() {
    let isValid = true;
    const tabset = this.template.querySelector('lightning-tabset');

    // check title, object and custom logic (if shown)
    const inputs = [];
    inputs.push(this.template.querySelector('.name-field-input'));
    inputs.push(this.template.querySelector('.object-combobox'));

    const customLogic = this.template.querySelector('.custom-logic-input');
    if (customLogic) inputs.push(this.template.querySelector('.custom-logic-input'));

    inputs.forEach((input) => {
      if (!input.validity.valid) {
        input.focus();
        input.blur();
        input.classList.add('slds-has-error');
        isValid = false;
        tabset.activeTabValue = 'details-tab';
      }
    });

    // check main basic filters
    const basicFilters = this.template.querySelectorAll('c-basic-filter');
    basicFilters.forEach((b) => {
      if (!b.checkValidation()) {
        isValid = false;
        tabset.activeTabValue = 'details-tab';
      }
    });

    // check sub filters
    const filters = this.template.querySelectorAll('c-sub-filter-card');
    filters.forEach((sub) => {
      if (!sub.checkValidation()) {
        if (isValid) tabset.activeTabValue = 'design-tab';
        isValid = false;
      }
    });

    // need to check scenario where we haven't moved to the second tab (selector won't work because they're still hidden),
    // and there could be an empty place-holder sub-filter
    if (JSON.stringify(this.subFilters) === JSON.stringify([this.EMPTY_SUB_FILTER])) {
      isValid = false;
      tabset.activeTabValue = 'design-tab';
      setTimeout(() => {
        const filter = this.template.querySelector('c-sub-filter-card');
        filter.checkValidation();
      }, 0);
    }

    return isValid;
  }
}
