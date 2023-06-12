import { createElement } from 'lwc';
import MobileWorkFlowPreviewScreen from 'c/mobileWorkFlowPreviewScreen';

let element;
describe('c-mobile-work-flow-preview-screen', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  beforeEach(() => {
    element = createElement('c-mobile-work-flow-preview-screen', {
      is: MobileWorkFlowPreviewScreen,
    });

    element.screenTitle = 'title1';
    element.screenSubTitle = 'title2';
    element.appointmentDetailTitle = 'appointmentTitle';
    element.currentScreen = 2;
    element.screenno = jest.fn();
    document.body.appendChild(element);
  });
  it('should have the correct title', () => {
    const title = element.shadowRoot.querySelector('.screenTitle1');
    expect(title.textContent).toBe('title1');

    const screenTitle2 = element.shadowRoot.querySelector('.screenTitle2');
    expect(screenTitle2.textContent).toBe('title2');

    const appointmentTitle = element.shadowRoot.querySelector('.appointmentTitle');
    expect(appointmentTitle.textContent).toBe('appointmentTitle');
  });
});
