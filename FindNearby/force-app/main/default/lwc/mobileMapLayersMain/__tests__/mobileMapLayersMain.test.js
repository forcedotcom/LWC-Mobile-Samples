import { createElement } from 'lwc';
import MobileMapLayersMain from 'c/mobileMapLayersMain';
import { graphql } from 'lightning/uiGraphQLApi';

jest.mock(
  '@salesforce/apex/MobileMapLayersService.retrieveAllObjFields',
  () => {
    return {
      default: jest.fn(() => [{ value: 'field1', label: 'field 1', type: 'STRING' }]),
    };
  },
  { virtual: true }
);

jest.mock(
  '@salesforce/apex/MobileMapLayersService.retrieveObjInfo',
  () => {
    return {
      default: jest.fn(() => ({
        label: 'Work Order',
        plural: 'Work Orders',
        iconUrl: '',
      })),
    };
  },
  { virtual: true }
);

let element;

describe('c-mobile-map-layers-main', () => {
  beforeEach(() => {
    element = createElement('c-mobile-map-layers-main', {
      is: MobileMapLayersMain,
    });

    document.body.appendChild(element);

    graphql.emit({
      uiapi: {
        query: {
          ServiceResource: {
            edges: [
              {
                node: {
                  Id: '0HnB00000002TLwKAM',
                  LastKnownLatitude: {
                    value: 32.4,
                  },
                  LastKnownLongitude: {
                    value: 34.9,
                  },
                },
              },
            ],
          },
        },
      },
    });
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should contain all 3 components', () => {
    const mapFilters = element.shadowRoot.querySelector('c-map-filters');
    expect(mapFilters).not.toBeNull();
    const mobileMap = element.shadowRoot.querySelector('c-mobile-map');
    expect(mobileMap).not.toBeNull();
    const locationsList = element.shadowRoot.querySelector('c-locations-list');
    expect(locationsList).not.toBeNull();
  });
});
