import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/uiGraphQLApi';
import { NavigationMixin } from 'lightning/navigation';
import retrieveAllObjFields from '@salesforce/apex/MobileMapLayersService.retrieveAllObjFields';
import retrieveObjInfo from '@salesforce/apex/MobileMapLayersService.retrieveObjInfo';
import executeFilterQuery from '@salesforce/apex/MobileMapLayersService.executeFilterQuery';
import Id from '@salesforce/user/Id';
import { config } from './config';
import ConfirmModal from 'c/confirmModal';
import overrideCSS from './overrideCSS';

export default class MobileMapLayersMain extends NavigationMixin(LightningElement) {
  CONFIG = config;
  userId = Id;
  resourceLocation = { lat: '0.0', lng: '0.0' };
  isResourceLocationSet = false;
  allMarkers = [];
  filteredMarkers = [];
  currentMarker;
  currentMarkerInd = 0;
  currentObjectFilter = {
    value: '',
    label: '',
    plural: '',
    iconUrl: '',
    color: '',
  };
  currentFieldFilter = {
    isActive: false,
    field: { value: '', label: '', type: '', input: '' },
  };
  fullQuery;
  init = false;

  connectedCallback() {
    if (!['km', 'mi'].includes(this.CONFIG.distanceUnit)) this.CONFIG.distanceUnit = 'km';

    const myStyle = document.createElement('style');
    myStyle.innerHTML = overrideCSS;
    document.head.appendChild(myStyle);
  }

  renderedCallback() {
    if (!this.init) {
      this.init = true;
      window.visualViewport?.addEventListener('resize', (e) => {
        if (window.visualViewport.height === window.innerHeight)
          this.template.querySelector(
            '.main-container'
          ).style.top = `${window.visualViewport.pageTop.toString()}px`;
      });
    }
  }

  // Get resource lcation (triggers the whole process)

  @wire(graphql, {
    query: gql`
      query resourceLocation($userId: ID) {
        uiapi {
          query {
            ServiceResource(where: { RelatedRecordId: { eq: $userId } }) {
              edges {
                node {
                  Id
                  LastKnownLatitude {
                    value
                  }
                  LastKnownLongitude {
                    value
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: '$userIdVariable',
  })
  GetAssignedResourceLocation({ data, errors }) {
    if (data?.uiapi && !this.isResourceLocationSet) {
      const location = data.uiapi.query.ServiceResource.edges[0].node;
      const lat = location?.LastKnownLatitude?.value;
      const lng = location?.LastKnownLongitude?.value;

      if (lat && lng) {
        this.resourceLocation = { lat, lng };
      }

      this.template.querySelector('c-mobile-map')?.setResourceMarker(this.resourceLocation);
      this.isResourceLocationSet = true;

      this.addLocations();
    } else if (errors) {
      this.handleError(errors);
    }
  }

  // Add objects

  async addLocations() {
    try {
      let fields;
      let objInfo;
      let objQueries = [];
      this.CONFIG.mapObjects.forEach(async (o, ind) => {
        fields = await retrieveAllObjFields(o);
        o.fields = fields;
        o.firstDetailFieldLabel = o.fields?.find(
          (f) => f.value === o.firstDetailField.toLowerCase()
        )?.label;
        o.secondDetailFieldLabel = o.fields?.find(
          (f) => f.value === o.secondDetailField.toLowerCase()
        )?.label;
        o.thirdDetailFieldLabel = o.fields?.find(
          (f) => f.value === o.thirdDetailField.toLowerCase()
        )?.label;

        objInfo = await retrieveObjInfo(o);
        o.label = objInfo?.label;
        o.plural = objInfo?.plural;
        o.iconUrl = objInfo?.iconUrl;
        o.color = objInfo?.color ?? '#4bc076';
        objQueries.push(this.buildQueryForObject(o));
        if (ind === this.CONFIG.mapObjects.length - 1) {
          this.CONFIG.mapObjects = [...this.CONFIG.mapObjects];
        }
        if (ind === 0) this.setCurrentObjectFilter(o); // the first object is the default one shown
        if (objQueries.length === this.CONFIG.mapObjects.length) {
          this.fullQuery = this.buildFullQuery(objQueries);
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  buildQueryForObject = (obj) => {
    const q = `${obj.value}: ${obj.value} (where: { and: [{ ${obj.latField}: { ne: null } }, { ${obj.longField}: { ne: null } }] }, first: 500) @category(name: "recordQuery") {
                edges {
                  node {
                    Id
                    ${obj.latField} {
                      value
                    }
                    ${obj.longField} {
                      value
                    }
                    ${obj.titleField} {
                      value
                    }
                    ${obj.firstDetailField} {
                      value
                    }
                    ${obj.secondDetailField} {
                      value
                    }
                    ${obj.thirdDetailField} {
                      value
                    }
                  }
                }
              }`;
    return q;
  };

  buildFullQuery = (objQueries) => {
    const q = `query GetLocations {
      uiapi {
        query {
          ${objQueries.join('\n')}
        }
      }
    }`;
    return gql`
      ${q}
    `;
  };

  @wire(graphql, {
    query: '$fullQuery',
  })
  GetObjectLocationsResults({ data, errors }) {
    if (data) {
      let objData;
      let records;
      let fieldsList;
      this.CONFIG.mapObjects.forEach((obj) => {
        objData = data.uiapi?.query[obj.value]?.edges ?? [];
        records = [];
        for (let record of objData) {
          fieldsList = Object.values(record.node).map((v) => v?.value ?? v);
          records.push({
            id: fieldsList[0],
            latitude: fieldsList[1],
            longitude: fieldsList[2],
            titleFieldValue: fieldsList[3],
            firstDetailFieldValue: fieldsList[4],
            secondDetailFieldValue: fieldsList[5],
            thirdDetailFieldValue: fieldsList[6],
          });
        }
        this.addAllObjectsLocations(obj.value, records);
      });
    }
    if (errors) {
      this.handleError(errors);
    }
  }

  async addAllObjectsLocations(objName, records) {
    try {
      const obj = this.CONFIG.mapObjects.find((o) => o.value === objName);
      records?.forEach((rec) => {
        this.createMarker(obj, rec);
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Markers

  createMarker(objDetails, recordDetails) {
    const lat = recordDetails.latitude;
    const long = recordDetails.longitude;
    const navUrl = `com.salesforce.fieldservice://v1/sObject/${recordDetails.id}/details`;
    const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&travelmode=driving`;
    const distance = this.getDistanceFromEng(lat, long);

    const marker = {
      location: { Latitude: lat, Longitude: long },
      mapIcon: this.getMarkerSVG(objDetails.color),
      value: { ...objDetails, ...recordDetails, navUrl, routeUrl, distance },
    };
    this.addToMarkers(marker);
  }

  addToMarkers(marker) {
    this.allMarkers = [...this.allMarkers, marker];
    this.updateFilteredMarkers();
  }

  async updateFilteredMarkers() {
    if (this.currentFieldFilter.isActive) {
      let ids = [];

      try {
        ids = await executeFilterQuery({
          currentObjectFilter: this.currentObjectFilter.value,
          currentFieldFilter: this.currentFieldFilter.field,
        });
      } catch (error) {
        this.handleError(error);
      } finally {
        this.filteredMarkers = this.allMarkers.filter((m) =>
          ids.map((o) => o.Id).includes(m.value.id)
        );
      }
    } else {
      this.filteredMarkers = this.allMarkers.filter(
        (m) => m.value.value === this.currentObjectFilter.value
      );
    }

    this.setCurrentMarker(0, true);
  }

  setCurrentMarker = (ind, init = false) => {
    try {
      this.currentMarkerInd = ind;
      this.currentMarker = { ...this.filteredMarkers[ind] };
      this.template.querySelector('c-locations-list').currentMarkerSet();
      this.template.querySelector('c-mobile-map').currentMarkerSet(init);
    } catch (error) {
      this.handleError(error);
    }
  };

  // Actions Handlers

  redirectToMarkerDetails = async (ind) => {
    const index = ind ?? this.currentMarkerInd;

    let toOpen = true;
    if (this.isIos()) {
      toOpen = await ConfirmModal.open({
        content: 'Opening the record resets your search.',
        header: 'Open Record?',
        okButtonText: 'Open Record',
        cancelButtonText: 'Cancel',
      });
    }

    if (toOpen) {
      this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
        attributes: {
          url: this.filteredMarkers[index].value.navUrl,
        },
      });
    }
  };

  routeToMarkerLocation = (ind) => {
    const index = ind ?? this.currentMarkerInd;
    this[NavigationMixin.Navigate]({
      type: 'standard__webPage',
      attributes: {
        url: this.filteredMarkers[index].value.routeUrl,
      },
    });
  };

  // Filters

  setCurrentObjectFilter = (obj) => {
    this.currentObjectFilter = obj;
    this.updateFilteredMarkers();
  };

  setCurrentFieldFilter = (isActive, field) => {
    this.currentFieldFilter = { isActive, field };
    this.updateFilteredMarkers();
  };

  // Getters & Helpers

  get userIdVariable() {
    return {
      userId: this.userId,
    };
  }

  get currentObject() {
    return this.currentObjectFilter;
  }

  getDistanceFromEng(latitude, longitude) {
    return this.getDistance(
      this.resourceLocation.lat,
      this.resourceLocation.lng,
      latitude,
      longitude,
      this.CONFIG.distanceUnit
    )
      .toFixed(2)
      .concat(` ${this.CONFIG.distanceUnit}`);
  }

  getDistance(lat1, lng1, lat2, lng2, distanceUnit) {
    const deg2rad = (deg) => deg * (Math.PI / 180);

    const R = distanceUnit === 'mi' ? 3958.8 : 6371; // radius of earth
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  isIos = () => {
    const isIpad =
      navigator.userAgent.includes('Macintosh') &&
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 1;
    const isIphone = navigator.platform.includes('iPhone');
    return isIpad || isIphone;
  };

  getMarkerSVG(color) {
    const icon = `<?xml version="1.0"?>
            <svg width="32" height="37" viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_2767_218465" fill="white">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.6725 31.5765C26.739 29.9169 32 23.5728 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 23.6059 5.30716 29.9723 12.4203 31.598L16.1226 36.4212L19.6725 31.5765Z"/>
                </mask>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M19.6725 31.5765C26.739 29.9169 32 23.5728 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 23.6059 5.30716 29.9723 12.4203 31.598L16.1226 36.4212L19.6725 31.5765Z" fill="${color}"/>
                <path d="M19.6725 31.5765L19.2152 29.6295L18.4959 29.7984L18.0592 30.3944L19.6725 31.5765ZM12.4203 31.598L14.0068 30.3802L13.5682 29.8088L12.8659 29.6483L12.4203 31.598ZM16.1226 36.4212L14.5361 37.639L16.1598 39.7542L17.7359 37.6033L16.1226 36.4212ZM30 16C30 22.6236 25.3982 28.1773 19.2152 29.6295L20.1297 33.5236C28.0797 31.6564 34 24.522 34 16H30ZM16 2C23.732 2 30 8.26801 30 16H34C34 6.05887 25.9411 -2 16 -2V2ZM2 16C2 8.26801 8.26801 2 16 2V-2C6.05887 -2 -2 6.05887 -2 16H2ZM12.8659 29.6483C6.64218 28.2259 2 22.6527 2 16H-2C-2 24.5592 3.97214 31.7188 11.9747 33.5478L12.8659 29.6483ZM17.7091 35.2034L14.0068 30.3802L10.8338 32.8158L14.5361 37.639L17.7091 35.2034ZM18.0592 30.3944L14.5093 35.2391L17.7359 37.6033L21.2857 32.7586L18.0592 30.3944Z" fill="white" mask="url(#path-1-inside-1_2767_218465)"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M16.0005 8.61539C12.7697 8.61539 10.1543 11.2308 10.1543 14.4923C10.1543 18.5538 14.3389 22.2769 15.6312 23.2615C15.8466 23.4462 16.1543 23.4462 16.4005 23.2615C17.6928 22.2462 21.8466 18.5538 21.8466 14.4923C21.8466 11.2308 19.2312 8.61539 16.0005 8.61539ZM16.0005 16.923C14.6467 16.923 13.539 15.8153 13.539 14.4614C13.539 13.1076 14.6467 11.9999 16.0005 11.9999C17.3544 11.9999 18.4621 13.1076 18.4621 14.4614C18.4621 15.8153 17.3544 16.923 16.0005 16.923Z" fill="white"/>
            </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(icon);
  }

  handleError(error) {
    console.log(error);
  }
}
