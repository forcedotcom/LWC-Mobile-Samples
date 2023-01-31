import { createElement } from 'lwc';
import MobileMap from 'c/mobileMap';

let element;

describe('c-mobile-map', () => {
  beforeEach(() => {
    element = createElement('c-mobile-map', {
      is: MobileMap,
    });

    element.filteredMarkers = [
      {
        location: { Latitude: 10, Longitude: 10 },
        value: { title: 'marker title1' },
      },
      {
        location: { Latitude: 20, Longitude: 20 },
        value: { title: 'marker title2' },
      },
      {
        location: { Latitude: 30, Longitude: 30 },
        value: { title: 'marker title3' },
      },
    ];
    element.currentMarker = element.filteredMarkers[0];
    element.currentMarkerInd = 0;
    element.setCurrentMarker = jest.fn();
    element.redirectToMarkerDetails = jest.fn();
    element.routeToMarkerLocation = jest.fn();
    element.handleError = jest.fn(console.log);

    document.body.appendChild(element);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    element = null;
  });

  it('should show map and hide cards on launch', () => {
    const map = element.shadowRoot.querySelector('lightning-map');
    const cards = element.shadowRoot.querySelector('.cards');

    expect(map).not.toBeNull();
    expect(cards).toBeNull();
  });

  it('should be 2 markers on the map', async () => {
    const map = element.shadowRoot.querySelector('lightning-map');

    return Promise.resolve().then(() => {
      expect(map.mapMarkers).toHaveLength(3);
    });
  });

  it('card has correct title', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(() => {
      const cards = element.shadowRoot.querySelector('.cards');
      expect(cards).not.toBeNull();
      const cardTitle = element.shadowRoot.querySelector('.title-text');
      expect(cardTitle.textContent).toBe('marker title1');
    });
  });

  it('closes card on x click', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(async () => {
      const cardClose = element.shadowRoot.querySelector('.x');
      cardClose.click();
      return Promise.resolve().then(() => {
        const cards = element.shadowRoot.querySelector('.cards');
        expect(cards).toBeNull();
      });
    });
  });

  it('closes card when locator clicked', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(async () => {
      const locator = element.shadowRoot.querySelector('.locator');
      locator.click();
      return Promise.resolve().then(() => {
        const cards = element.shadowRoot.querySelector('.cards');
        expect(cards).toBeNull();
      });
    });
  });

  it('triggers redirectToMarkerDetails when open record clicked', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(async () => {
      const action = element.shadowRoot.querySelectorAll('.card-primary-button')[0];
      action.click();
      return Promise.resolve().then(() => {
        expect(element.redirectToMarkerDetails).toHaveBeenCalled();
      });
    });
  });

  it('triggers routeToMarkerLocation when get directions clicked', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(async () => {
      const action = element.shadowRoot.querySelectorAll('.card-primary-button')[1];
      action.click();
      return Promise.resolve().then(() => {
        expect(element.routeToMarkerLocation).toHaveBeenCalled();
      });
    });
  });

  it('moves to previous item when back clicked', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(async () => {
      const back = element.shadowRoot.querySelectorAll('.card-footer-arrow')[0];
      back.click();
      return Promise.resolve().then(() => {
        expect(element.setCurrentMarker).toHaveBeenCalledWith(2);
      });
    });
  });

  it('moves to next item when next clicked', async () => {
    element.currentMarkerSet(false);

    return Promise.resolve().then(async () => {
      const back = element.shadowRoot.querySelectorAll('.card-footer-arrow')[1];
      back.click();
      return Promise.resolve().then(() => {
        expect(element.setCurrentMarker).toHaveBeenCalledWith(1);
      });
    });
  });
});
