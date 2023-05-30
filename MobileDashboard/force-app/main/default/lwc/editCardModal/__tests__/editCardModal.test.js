import { createElement } from 'lwc';
import EditCardModal from 'c/editCardModal';

jest.mock(
  '@salesforce/apex/DashboardSettingsService.getAllFields',
  () => {
    return {
      default: jest.fn(() => [{ value: 'AccountName', label: 'Account Name' }]),
    };
  },
  { virtual: true }
);

let element;
let tabset;

describe('c-edit-card-modal', () => {
  beforeEach(() => {
    element = createElement('c-edit-card-modal', {
      is: EditCardModal,
    });

    element.objectsOptions = [
      { label: 'Account', value: 'Account' },
      { label: 'Contact', value: 'Contact' },
    ];
    element.generateUniqueID = jest.fn(() => 'abc');
    element.close = jest.fn();
    element.card = {
      index: 1,
      title: 'card title',
      object: { label: 'Account', value: 'Account' },
      filter: {
        conditionLogic: 'AND',
        subFilters: [
          {
            key: 'rwn1ft',
            fieldDisplay: 'Time Sheet End Date',
            value: '',
            unitDisplay: 'days',
            quantity: '14',
            operatorDisplay: 'last',
          },
          {
            key: '131fda',
            fieldDisplay: 'Time Sheet Start Date',
            value: '',
            unitDisplay: 'weeks',
            quantity: '1',
            operatorDisplay: 'last',
          },
        ],
      },
      subFilters: [
        {
          key: 'rwn1fa',
          fieldDisplay: 'Time Sheet End Date',
          value: '',
          unitDisplay: 'days',
          quantity: '14',
          operatorDisplay: 'last',
        },
        {
          key: '131fdb',
          fieldDisplay: 'Time Sheet Start Date',
          value: '',
          unitDisplay: 'weeks',
          quantity: '1',
          operatorDisplay: 'last',
        },
      ],
      layout: 'SIDE',
    };

    document.body.appendChild(element);

    tabset = element.shadowRoot.querySelector('lightning-tabset');
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('closes modal on cancel', async () => {
    const cancel = element.shadowRoot.querySelectorAll('lightning-button')[0];
    cancel.click();
    return Promise.resolve().then(() => {
      expect(element.close).toHaveBeenCalled();
    });
  });

  it('closes modal on save', async () => {
    const title = element.shadowRoot.querySelector('.name-field-input');
    const obj = element.shadowRoot.querySelector('.object-combobox');

    title.validity = { valid: true };
    obj.validity = { valid: true };

    const basicFilters = element.shadowRoot.querySelectorAll('c-basic-filter');
    basicFilters.forEach((bf) => {
      bf.checkValidation = () => true;
    });

    const subFilters = element.shadowRoot.querySelectorAll('c-sub-filter-card');
    subFilters.forEach((sf) => {
      sf.checkValidation = () => true;
    });

    const save = element.shadowRoot.querySelectorAll('lightning-button')[1];
    save.click();
    return Promise.resolve().then(() => {
      expect(element.close).toHaveBeenCalled();
    });
  });

  it('leaves modal open on save with invalid fields', async () => {
    const title = element.shadowRoot.querySelector('.name-field-input');
    const obj = element.shadowRoot.querySelector('.object-combobox');

    title.validity = { valid: false };
    obj.validity = { valid: false };

    const basicFilters = element.shadowRoot.querySelectorAll('c-basic-filter');
    basicFilters.forEach((bf) => {
      bf.checkValidation = () => false;
    });

    const subFilters = element.shadowRoot.querySelectorAll('c-sub-filter-card');
    subFilters.forEach((sf) => {
      sf.checkValidation = () => false;
    });

    const save = element.shadowRoot.querySelectorAll('lightning-button')[1];
    save.click();
    return Promise.resolve().then(() => {
      expect(element.close).not.toHaveBeenCalled();
    });
  });

  it('clears main conditions when changing object', async () => {
    let conditions = element.shadowRoot.querySelectorAll('.condition');
    expect(conditions).toHaveLength(2);

    const objectCombobox = element.shadowRoot.querySelector('.object-combobox');
    objectCombobox.value = 'Contact';
    objectCombobox.dispatchEvent(new Event('change'));
    return Promise.resolve().then(() => {
      conditions = element.shadowRoot.querySelectorAll('.condition');
      expect(conditions).toHaveLength(0);
    });
  });

  it('empties field options when changing to null object', async () => {
    expect(element.fieldsOptions).toHaveLength(1);

    const objectCombobox = element.shadowRoot.querySelector('.object-combobox');
    objectCombobox.value = '';
    objectCombobox.dispatchEvent(new Event('change'));
    return Promise.resolve().then(() => {
      expect(element.fieldsOptions).toHaveLength(0);
    });
  });

  it('does not clear main conditions when changing condition logic', async () => {
    let conditions = element.shadowRoot.querySelectorAll('.condition');
    expect(conditions).toHaveLength(2);

    const conditionCombobox = element.shadowRoot.querySelector('.condition-combobox');
    conditionCombobox.value = 'OR';
    conditionCombobox.dispatchEvent(new Event('change'));
    return Promise.resolve().then(() => {
      conditions = element.shadowRoot.querySelectorAll('.condition');
      expect(conditions).toHaveLength(2);
    });
  });

  it('adds condition on handleAddConditionClick call', async () => {
    let conditions = element.shadowRoot.querySelectorAll('.condition');
    expect(conditions).toHaveLength(2);

    element.handleAddConditionClick();
    return Promise.resolve().then(() => {
      conditions = element.shadowRoot.querySelectorAll('.condition');
      expect(conditions).toHaveLength(3);
    });
  });

  it('removes condition when delete clicked', async () => {
    let conditions = element.shadowRoot.querySelectorAll('.condition');
    expect(conditions).toHaveLength(2);

    const deleteButton = element.shadowRoot.querySelector('.condition lightning-button-icon');
    deleteButton.click();
    return Promise.resolve().then(() => {
      conditions = element.shadowRoot.querySelectorAll('.condition');
      expect(conditions).toHaveLength(1);
    });
  });

  describe('tests details tab', () => {
    beforeEach(() => {
      tabset.activeTabValue = 'details-tab';
    });

    it('add sub filter on handleAddSubFilterClick call', async () => {
      let subFilters = element.shadowRoot.querySelectorAll('c-sub-filter-card');
      expect(subFilters).toHaveLength(2);

      element.handleAddSubFilterClick();
      return Promise.resolve().then(() => {
        subFilters = element.shadowRoot.querySelectorAll('c-sub-filter-card');
        expect(subFilters).toHaveLength(3);
      });
    });

    it('add sub filter on duplicateSubFilter call', async () => {
      let subFilters = element.shadowRoot.querySelectorAll('c-sub-filter-card');
      expect(subFilters).toHaveLength(2);

      element.duplicateSubFilter(0);
      return Promise.resolve().then(() => {
        subFilters = element.shadowRoot.querySelectorAll('c-sub-filter-card');
        expect(subFilters).toHaveLength(3);
      });
    });
  });

  it('reorders sub filters on drag', async () => {
    const firstSubFilter = element.shadowRoot.querySelectorAll('c-sub-filter-card')[0];
    const secondSubFilter = element.shadowRoot.querySelectorAll('c-sub-filter-card')[1];

    const eStart = new Event('dragstart');
    const eEnter = new Event('dragenter');
    const eEnd = new Event('dragend');
    const eDrop = new Event('drop');
    secondSubFilter.dispatchEvent(eStart);
    firstSubFilter.dispatchEvent(eEnter);
    secondSubFilter.dispatchEvent(eEnd);
    secondSubFilter.dispatchEvent(eDrop);

    return Promise.resolve().then(() => {
      expect(firstSubFilter.index).toBe(1);
      expect(secondSubFilter.index).toBe(0);
    });
  });

  it('does not reorder sub filters if entering with a filter to itself', async () => {
    const firstSubFilter = element.shadowRoot.querySelectorAll('c-sub-filter-card')[0];

    const eStart = new Event('dragstart');
    const eEnter = new Event('dragenter');
    const eEnd = new Event('dragend');
    const eDrop = new Event('drop');
    firstSubFilter.dispatchEvent(eStart);
    firstSubFilter.dispatchEvent(eEnter);
    firstSubFilter.dispatchEvent(eEnd);
    firstSubFilter.dispatchEvent(eDrop);

    return Promise.resolve().then(() => {
      expect(firstSubFilter.index).toBe(0);
    });
  });
});
