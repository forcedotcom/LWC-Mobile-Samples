import { LightningElement, api } from 'lwc';
import getAllPicklistOptions from '@salesforce/apex/DashboardSettingsService.getAllPicklistOptions';
import customLabels from './labels';

export default class BasicFilter extends LightningElement {
  @api objectValue;
  @api index;
  @api fieldsOptions;
  @api field;
  @api operator;
  @api value;
  @api quantity;
  @api unit;
  @api updateSubFilter;
  LABELS = customLabels;

  picklistOptions;

  connectedCallback() {
    this.refreshPicklistOptions(this.field);
  }

  @api checkValidation() {
    let isValid = true;

    const combos = this.template.querySelectorAll('lightning-combobox');
    const inputs = this.template.querySelectorAll('lightning-input');
    const all = [...combos, ...inputs];

    all.forEach((i) => {
      if (!i.validity.valid) {
        i.focus();
        i.blur();
        i.classList.add('slds-has-error');
        isValid = false;
      }
    });

    return isValid;
  }

  /* Field */

  get filterFieldValue() {
    return this.field;
  }

  get filterFieldType() {
    return this.fieldsOptions?.find((opt) => opt.value === this.field)?.type;
  }

  get isFieldTypeDate() {
    return this.filterFieldType === 'DATE' || this.filterFieldType === 'DATETIME';
  }

  get isFieldTypePicklist() {
    return this.filterFieldType === 'PICKLIST';
  }

  get isFieldTypeBoolean() {
    return this.filterFieldType === 'BOOLEAN';
  }

  get isFieldTypeRegular() {
    return (
      (!this.isFieldTypeBoolean && !this.isFieldTypePicklist && !this.isFieldTypeDate) ||
      (this.isFieldTypeDate && !this.isSpecialOperator)
    );
  }

  onFilterFieldChange = (e) => {
    this.value = this.quantity = this.unit = this.unitDisplay = '';
    const selectedField = e.target.value;
    setTimeout(() => {
      this.field = selectedField;
      this.operator = this.isFieldNoOperator ? 'eq' : this.isFieldTypeDate ? 'today' : 'eq';
      this.refreshPicklistOptions(this.field);
      this.updateSubFilter(this.index, {
        field: this.field,
        fieldDisplay: this.fieldsOptions?.find((opt) => opt.value === this.field)?.label,
        fieldType: this.fieldsOptions?.find((opt) => opt.value === this.field)?.type,
        value: this.isFieldTypeBoolean ? true : '',
        operator: this.operator,
        operatorDisplay: this.getOperatorDisplay(),
        quantity: '',
        unit: '',
        unitDisplay: '',
      });
    }, 0);
  };

  /* Operator */

  get filterOperatorValue() {
    return this.operator;
  }

  get showDefaultOperator() {
    return !this.isFieldTypeBoolean && !this.isFieldTypePicklist && !this.isFieldTypeDate;
  }

  get isSpecialOperator() {
    return ['today', 'last', 'next'].includes(this.operator);
  }

  get isFieldNoOperator() {
    return this.isFieldTypeBoolean || this.isFieldTypePicklist;
  }

  get filterOperatorOptions() {
    return [
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_equals,
        value: 'eq',
        display: '=',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_not_equal,
        value: 'ne',
        display: '≠',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_less_than,
        value: 'lt',
        display: '<',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_greater_than,
        value: 'gt',
        display: '>',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_less_or_equal,
        value: 'lte',
        display: '≤',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_greater_or_equal,
        value: 'gte',
        display: '≥',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_operator_contains,
        value: 'like',
        display: this.LABELS.MobileDashboard_basic_filter_operator_contains,
      },
    ];
  }

  get dateFilterOperatorOptions() {
    return [
      {
        label: this.LABELS.MobileDashboard_basic_filter_date_type_today,
        value: 'today',
        display: this.LABELS.MobileDashboard_settings_card_display_operator_today,
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_date_type_next,
        value: 'next',
        display: this.LABELS.MobileDashboard_settings_card_display_operator_next,
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_date_type_last,
        value: 'last',
        display: this.LABELS.MobileDashboard_settings_card_display_operator_last,
      },
      { label: this.LABELS.MobileDashboard_basic_filter_date_type_on, value: 'eq', display: '=' },
      {
        label: this.LABELS.MobileDashboard_basic_filter_date_type_before,
        value: 'lt',
        display: '<',
      },
      {
        label: this.LABELS.MobileDashboard_basic_filter_date_type_after,
        value: 'gt',
        display: '>',
      },
    ];
  }

  getOperatorDisplay() {
    return (
      this.isFieldTypeDate ? this.dateFilterOperatorOptions : this.filterOperatorOptions
    )?.find((opt) => opt.value === this.operator)?.display;
  }

  onFilterOperatorChange = (e) => {
    this.operator = e.target.value;
    this.value = this.quantity = this.unit = '';
    this.updateSubFilter(this.index, {
      operator: this.operator,
      operatorDisplay: this.getOperatorDisplay(),
      value: '',
      quantity: '',
      unit: '',
      unitDisplay: '',
    });
  };

  /* Value */

  get filterValue() {
    return this.value;
  }

  get showValueField() {
    return this.operator !== 'today';
  }

  get fieldInputLabel() {
    return this.filterFieldType === 'DATETIME'
      ? ''
      : this.LABELS.MobileDashboard_basic_filter_value;
  }

  get filterValueOptions() {
    return this.picklistOptions;
  }

  async refreshPicklistOptions(field) {
    if (!field) return;
    if (!this.filterFieldType) {
      setTimeout(() => {
        this.refreshPicklistOptions(field);
      }, 500);
    } else if (this.isFieldTypePicklist) {
      const allOptions = await getAllPicklistOptions({ obj: this.objectValue, field });
      this.picklistOptions = allOptions.sort((f1, f2) => (f1.label < f2.label ? -1 : 1));
    } else {
      this.picklistOptions = [];
    }
  }

  onFilterValueChange = (e) => {
    this.value = this.isFieldTypeBoolean ? e.target.checked : e.target.value;
    this.updateSubFilter(this.index, { value: this.value });
  };

  /* Quantity */

  get filterQuantityValue() {
    return this.quantity;
  }

  onFilterQuantityChange = (e) => {
    this.quantity = e.target.value;
    this.updateSubFilter(this.index, {
      quantity: this.quantity,
    });
  };

  /* Unit */

  get filterUnitValue() {
    return this.unit;
  }

  get filterUnitValueOptions() {
    return [
      {
        label: this.LABELS.MobileDashboard_settings_card_display_unit_days,
        value: 'day',
        display: this.LABELS.MobileDashboard_settings_card_display_unit_days,
      },
      {
        label: this.LABELS.MobileDashboard_settings_card_display_unit_weeks,
        value: 'week',
        display: this.LABELS.MobileDashboard_settings_card_display_unit_weeks,
      },
      {
        label: this.LABELS.MobileDashboard_settings_card_display_unit_months,
        value: 'month',
        display: this.LABELS.MobileDashboard_settings_card_display_unit_months,
      },
    ];
  }

  getUnitDisplay() {
    return this.filterUnitValueOptions?.find((opt) => opt.value === this.unit)?.display;
  }

  onFilterUnitChange = (e) => {
    this.unit = e.target.value;
    this.updateSubFilter(this.index, {
      unit: this.unit,
      unitDisplay: this.getUnitDisplay(),
    });
  };
}
