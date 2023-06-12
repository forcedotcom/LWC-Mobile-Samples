import { createElement } from 'lwc';
import BasicFilter from 'c/basicFilter';

let element;

let fieldsCombo;
let operatorCombo;
let valueField;
let quantityField;
let unitCombo;

jest.mock(
  '@salesforce/apex/DashboardSettingsService.getAllPicklistOptions',
  () => {
    return {
      default: jest.fn(() => [{ value: 'option1', label: 'Option 1' }]),
    };
  },
  { virtual: true }
);

describe('c-basic-filter', () => {
  beforeEach(() => {
    element = createElement('c-basic-filter', {
      is: BasicFilter,
    });

    element.objectValue = 'Account';
    element.index = 0;
    element.fieldsOptions = [
      { label: 'My Date', value: 'myDate', type: 'DATE' },
      { label: 'My Boolean', value: 'myBoolean', type: 'BOOLEAN' },
      { label: 'My Picklist', value: 'myPicklist', type: 'PICKLIST' },
    ];
    element.field = '';
    element.operator = '';
    element.value = '';
    element.quantity = '';
    element.unit = '';
    element.updateSubFilter = jest.fn();

    document.body.appendChild(element);

    fieldsCombo = element.shadowRoot.querySelector('.field-combo');
    operatorCombo = element.shadowRoot.querySelector('.operator-combo');
    valueField = element.shadowRoot.querySelector('.value-input');
    quantityField = element.shadowRoot.querySelector('.quantity-input');
    unitCombo = element.shadowRoot.querySelector('.unit-combo');
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('sets operators list correctly when selecting a date field', async () => {
    fieldsCombo.value = 'myDate';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(() => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      expect(operatorCombo.label).toBe('c.MobileDashboard_basic_filter_date_operator');
    });
  });

  it('sets qunatity and unit as visible when selecting a special operator', async () => {
    expect(quantityField).toBeNull();
    expect(unitCombo).toBeNull();

    fieldsCombo.value = 'myDate';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      operatorCombo.value = 'next';
      operatorCombo.dispatchEvent(new Event('change'));
      return Promise.resolve().then(async () => {
        quantityField = element.shadowRoot.querySelector('.quantity-input');
        unitCombo = element.shadowRoot.querySelector('.unit-combo');
        expect(quantityField).not.toBeNull();
        expect(unitCombo).not.toBeNull();
      });
    });
  });

  it('sets operator as hidden if field is boolean', async () => {
    expect(operatorCombo).not.toBeNull();

    fieldsCombo.value = 'myBoolean';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      expect(operatorCombo).toBeNull();
    });
  });

  it('sets operator as hidden if field is picklist', async () => {
    expect(operatorCombo).not.toBeNull();

    fieldsCombo.value = 'myPicklist';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      expect(operatorCombo).toBeNull();
    });
  });

  it('sets value as hidden when selecting the today operator', async () => {
    expect(valueField).not.toBeNull();

    fieldsCombo.value = 'myDate';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      operatorCombo.value = 'today';
      operatorCombo.dispatchEvent(new Event('change'));
      return Promise.resolve().then(async () => {
        valueField = element.shadowRoot.querySelector('.value-input');
        expect(valueField).toBeNull();
      });
    });
  });

  it('calls updateSubFilter when updating value', async () => {
    expect(operatorCombo).not.toBeNull();

    valueField.value = 'abc';
    valueField.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      expect(element.updateSubFilter).toHaveBeenCalledWith(0, { value: 'abc' });
    });
  });

  it('calls updateSubFilter when updating quantity', async () => {
    fieldsCombo.value = 'myDate';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      operatorCombo.value = 'last';
      operatorCombo.dispatchEvent(new Event('change'));
      return Promise.resolve().then(async () => {
        quantityField = element.shadowRoot.querySelector('.quantity-input');
        quantityField.value = '7';
        quantityField.dispatchEvent(new Event('change'));
        return Promise.resolve().then(async () => {
          expect(element.updateSubFilter).toHaveBeenCalledWith(0, { quantity: '7' });
        });
      });
    });
  });

  it('calls updateSubFilter when updating unit', async () => {
    fieldsCombo.value = 'myDate';
    fieldsCombo.dispatchEvent(new Event('change'));
    return Promise.resolve().then(async () => {
      operatorCombo = element.shadowRoot.querySelector('.operator-combo');
      operatorCombo.value = 'last';
      operatorCombo.dispatchEvent(new Event('change'));
      return Promise.resolve().then(async () => {
        unitCombo = element.shadowRoot.querySelector('.unit-combo');
        unitCombo.value = 'day';
        unitCombo.dispatchEvent(new Event('change'));
        return Promise.resolve().then(async () => {
          expect(element.updateSubFilter).toHaveBeenCalledWith(0, {
            unit: 'day',
            unitDisplay: 'c.MobileDashboard_settings_card_display_unit_days',
          });
        });
      });
    });
  });

  it('return true from checkValidation when fields are valid', async () => {
    fieldsCombo.validity = { valid: true };
    operatorCombo.validity = { valid: true };
    valueField.validity = { valid: true };

    const isValid = element.checkValidation();
    expect(isValid).toBeTruthy;
  });

  it('return false from checkValidation when fields are not valid', async () => {
    fieldsCombo.validity = { valid: true };
    operatorCombo.validity = { valid: false };
    valueField.validity = { valid: false };

    const isValid = element.checkValidation();
    expect(isValid).toBeFalsy;
  });
});
