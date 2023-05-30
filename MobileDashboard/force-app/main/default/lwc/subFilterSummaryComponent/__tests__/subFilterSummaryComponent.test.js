import { createElement } from 'lwc';
import SubFilterSummaryComponent from 'c/subFilterSummaryComponent';

let element;
describe('c-sub-filter-summary-component', () => {
  beforeEach(() => {
    element = createElement('c-sub-filter-summary-component', {
      is: SubFilterSummaryComponent,
    });

    element.counter = 5;
    element.icon = 'utility:like';
    element.label = 'the label';
    element.color = '#123456';
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should show correct info', () => {
    document.body.appendChild(element);

    const counter = element.shadowRoot.querySelector('.sub-counter');
    const subLabel = element.shadowRoot.querySelector('.sub-label');
    expect(counter.textContent).toBe('5');
    expect(subLabel.textContent).toBe('the label');
  });

  it('should have side class', () => {
    element.layout = 'SIDE';
    document.body.appendChild(element);

    const container = element.shadowRoot.querySelector('div');
    expect(container.classList).toContain('side');
  });

  it('should have stack class', () => {
    element.layout = 'STACK';
    document.body.appendChild(element);

    const container = element.shadowRoot.querySelector('div');
    expect(container.classList).toContain('stack');
  });
});
