import { createElement } from 'lwc';
import ObjectIcon from 'c/objectIcon';

describe('c-object-icon', () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should produce component with the provided values', () => {
    const element = createElement('c-object-icon', {
      is: ObjectIcon,
    });

    element.iconUrl = 'https://moble-map-layers-test.com';
    element.color = '#123456';
    document.body.appendChild(element);

    const img = element.shadowRoot.querySelector('img');
    expect(img.src).toBe('https://moble-map-layers-test.com/');
  });

  it('should produce component with the default icon', () => {
    const element = createElement('c-object-icon', {
      is: ObjectIcon,
    });

    document.body.appendChild(element);

    const icon = element.shadowRoot.querySelector('lightning-icon');
    expect(icon.iconName).toBe('standard:address');
  });
});
