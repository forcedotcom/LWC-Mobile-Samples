import { createElement } from 'lwc';
import LocationsList from 'c/locationsList';

let element;
const oneLocation = require('./data/oneLocation.json');
const threeLocations = require('./data/threeLocations.json');

describe('c-locations-list', () => {
  beforeEach(() => {
    element = createElement('c-locations-list', {
      is: LocationsList,
    });

    element.currentObject = {
      value: 'WorkOrder',
      label: 'Work Order',
      plural: 'Work Orders',
      iconUrl: '',
      color: '',
    };
    element.setCurrentMarker = jest.fn();
    element.redirectToMarkerDetails = jest.fn();
    element.routeToMarkerLocation = jest.fn();
    element.handleError = jest.fn(console.log);
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    element = null;
  });

  it('has correct plural title', async () => {
    element.filteredMarkers = threeLocations;
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const title = element.shadowRoot.querySelector('.title-tile');
      expect(title.textContent).toBe('3 Work Orders');
    });
  });

  it('has correct singular title', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const title = element.shadowRoot.querySelector('.title-tile');
      expect(title.textContent).toBe('1 Work Order');
    });
  });

  it('has correct subtitle', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const tileSub = element.shadowRoot.querySelector('li[data-index="0"] .tile-subtitle');
      expect(tileSub.textContent).toBe('15 km • field2-1');
    });
  });

  it('has correct number of records', async () => {
    element.filteredMarkers = threeLocations;
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      const tiles = element.shadowRoot.querySelectorAll('li');
      expect(tiles).toHaveLength(4);
    });
  });

  it('sets current marker when clicked', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    const tile = element.shadowRoot.querySelector('li[data-index="0"]');
    tile.click();

    return Promise.resolve().then(() => {
      expect(element.setCurrentMarker).toHaveBeenCalledWith(0);
    });
  });

  it('shows popover when actions button clicked', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    const popover = element.shadowRoot.querySelector('.popover-container div');
    expect(popover.classList).toContain('popover-hidden');
    const actionsButton = element.shadowRoot.querySelector('.actions-button button');
    actionsButton.click();
    return Promise.resolve().then(() => {
      expect(popover.classList).toContain('popover-shown');
    });
  });

  it('triggers redirectToMarkerDetails when view clicked', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    const action = element.shadowRoot.querySelectorAll('.action-item')[0];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.redirectToMarkerDetails).toHaveBeenCalled();
    });
  });

  it('triggers routeToMarkerLocation when route clicked', async () => {
    element.filteredMarkers = threeLocations;
    document.body.appendChild(element);

    const action = element.shadowRoot.querySelectorAll('.action-item')[1];
    action.click();
    return Promise.resolve().then(() => {
      expect(element.routeToMarkerLocation).toHaveBeenCalled();
    });
  });

  it('opens list on drag up', async () => {
    element.filteredMarkers = threeLocations;
    document.body.appendChild(element);

    const mainTemplate = element.shadowRoot.querySelector('.main-container');
    const header = element.shadowRoot.querySelector('.header');

    const eStart = new Event('touchstart');
    const eMove = new Event('touchmove');
    const eEnd = new Event('touchend');
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 0, y: 10 };
    eStart.touches = [{ target: header, clientX: point1.x, clientY: point1.y }];
    eMove.touches = [{ target: header, clientX: point2.x, clientY: point2.y }];
    header.dispatchEvent(eStart);
    header.dispatchEvent(eMove);
    header.dispatchEvent(eEnd);

    return Promise.resolve().then(() => {
      expect(mainTemplate.style.transform).toBe('translateY(calc(85% - 10px)');
    });
  });

  it('closes list on drag down', async () => {
    element.filteredMarkers = threeLocations;
    document.body.appendChild(element);

    const mainTemplate = element.shadowRoot.querySelector('.main-container');
    const header = element.shadowRoot.querySelector('.header');

    const eStart = new Event('touchstart');
    const eMove = new Event('touchmove');
    const eEnd = new Event('touchend');
    const point1 = { x: 0, y: 10 };
    const point2 = { x: 0, y: 0 };
    eStart.touches = [{ target: header, clientX: point1.x, clientY: point1.y }];
    eMove.touches = [{ target: header, clientX: point2.x, clientY: point2.y }];
    header.dispatchEvent(eStart);
    header.dispatchEvent(eMove);
    header.dispatchEvent(eEnd);

    return Promise.resolve().then(() => {
      expect(mainTemplate.style.transform).toBe('translateY(calc((90% - 0px) - -10px))');
    });
  });

  it('hides popover on mask clicked', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    const actionsButton = element.shadowRoot.querySelector('.actions-button button');
    actionsButton.click();
    return Promise.resolve().then(async () => {
      const popover = element.shadowRoot.querySelector('.popover-container div');
      expect(popover.classList).toContain('popover-shown');
      const mask = element.shadowRoot.querySelector('.popover-mask');
      mask.click();
      return Promise.resolve().then(() => {
        expect(popover.classList).toContain('popover-hidden');
      });
    });
  });

  it('hides popover after second click on same button', async () => {
    element.filteredMarkers = oneLocation;
    document.body.appendChild(element);

    const actionsButton = element.shadowRoot.querySelector('.actions-button button');
    actionsButton.click();
    return Promise.resolve().then(async () => {
      const popover = element.shadowRoot.querySelector('.popover-container div');
      expect(popover.classList).toContain('popover-shown');
      actionsButton.click();
      return Promise.resolve().then(() => {
        expect(popover.classList).toContain('popover-hidden');
      });
    });
  });

  it('sets paddingBottom correctly when using iOS devices', async () => {
    element.filteredMarkers = oneLocation;

    navigatorGetter = jest.spyOn(window, 'navigator', 'get');
    navigatorGetter.mockReturnValue({
      userAgent: 'Macintosh',
      maxTouchPoints: 2,
      platform: '',
    });
    document.body.appendChild(element);

    const list = element.shadowRoot.querySelector('.list');
    expect(list.style.paddingBottom).toBe('34px');
  });
});
