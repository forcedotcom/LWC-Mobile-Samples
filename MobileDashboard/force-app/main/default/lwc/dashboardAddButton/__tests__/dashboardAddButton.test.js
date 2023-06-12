import { createElement } from 'lwc';
import DashboardAddButton from 'c/dashboardAddButton';

let element;
describe('c-dashboard-add-button', () => {
  beforeEach(() => {
    element = createElement('c-add-button', {
      is: DashboardAddButton,
    });

    element.label = 'Button label';
    element.handleAddClick = jest.fn();
    element.disabled = false;
    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('shows correct label', () => {
    const label = element.shadowRoot.querySelector('lightning-button');
    expect(label.title).toBe('Button label');
  });

  it('calls function when clicked', async () => {
    const action = element.shadowRoot.querySelector('lightning-button');
    action.click();
    return Promise.resolve().then(() => {
      expect(element.handleAddClick).toHaveBeenCalled();
    });
  });
});
