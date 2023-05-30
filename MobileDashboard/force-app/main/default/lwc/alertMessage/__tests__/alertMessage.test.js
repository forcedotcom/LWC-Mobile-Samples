import { createElement } from 'lwc';
import AlertMessage from 'c/alertMessage';

let element;
describe('c-alert-message', () => {
  beforeEach(() => {
    element = createElement('c-alert-message', {
      is: AlertMessage,
    });

    element.modalTitle = 'Title of the Modal';
    element.message = 'Body of the Modal';
    element.discardButtonText = 'Cancel';
    element.handleDiscardClick = jest.fn();
    element.close = jest.fn();
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('has all correct info', () => {
    element.isDeleteMsg = false;
    document.body.appendChild(element);

    const title = element.shadowRoot.querySelector('.modal-header h2');
    expect(title.textContent).toBe('Title of the Modal');

    const body = element.shadowRoot.querySelector('.message');
    expect(body.textContent).toBe('Body of the Modal');
  });

  it('calls close with no parameters when cancel clicked', async () => {
    element.isDeleteMsg = false;
    document.body.appendChild(element);

    const action = element.shadowRoot.querySelector('lightning-button');
    action.click();
    return Promise.resolve().then(() => {
      expect(element.close).toHaveBeenCalled();
    });
  });

  it('calls close with true when ok clicked', async () => {
    element.isDeleteMsg = true;
    document.body.appendChild(element);

    const action = element.shadowRoot.querySelector('lightning-button.slds-var-m-left_x-small');
    action.click();
    return Promise.resolve().then(() => {
      expect(element.close).toHaveBeenCalledWith(true);
    });
  });
});
