import { createElement } from 'lwc';
import ConfirmModal from 'c/confirmModal';

let element;
describe('c-confirm-modal', () => {
  beforeEach(() => {
    element = createElement('c-confirm-modal', {
      is: ConfirmModal,
    });

    element.close = jest.fn();
    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('calls close with false on cancel', async () => {
    const cancelButton = element.shadowRoot.querySelector('.cancel-button');
    cancelButton.click();
    return Promise.resolve().then(() => {
      expect(element.close).toHaveBeenCalledWith(false);
    });
  });

  it('calls close with true on ok', async () => {
    const okButton = element.shadowRoot.querySelector('.ok-button');
    okButton.click();
    return Promise.resolve().then(() => {
      expect(element.close).toHaveBeenCalledWith(true);
    });
  });
});
