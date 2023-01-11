import { LightningElement, api, track } from 'lwc';

export default class MobileMaps extends LightningElement {

    // Markers
    @api filteredMarkers = [];
    @api currentMarker;
    @api currentMarkerInd = 0;
    @api setCurrentMarker;
    @api redirectToMarkerDetails;
    @api routeToMarkerLocation;
    @api handleError;
    resourceMarker;
    markersWithResource = [];
    located = false;

    @track showCard;
    @api currentMarkerSet(init) {
        this.located = false;
        this.setCardState(!init);
    }

    // Map options
    zoom = 15;
    listView = '';
    mapOptions = {
        disableDefaultUI: true,
        zoomControl: false
    };

    renderedCallback() {
        if (!this.isMarkersListEqual()) {
            this.markersWithResource =
                this.resourceMarker ?
                [...this.filteredMarkers, this.resourceMarker] :
                [...this.filteredMarkers];
        }
    }

    isMarkersListEqual() {
        const markers = this.markersWithResource.filter(m => m.value !== undefined);
        return (
            this.filteredMarkers.length === markers.length &&
            this.filteredMarkers.every((m, ind) => m.value.id === markers[ind].value.id)
        );
    }

    @api setResourceMarker({ lat, lng }) {
        this.resourceMarker = {
            location: { Latitude: lat.substring(0, 10), Longitude: lng.substring(0, 10) },
            mapIcon: this.getResourceMarkerSVG()
        };
    }

    onMarkerSelect(event) {
        try {
            if (!event.target.selectedMarkerValue) return;
            const ind = this.filteredMarkers.findIndex(m => m.value.id === event.target.selectedMarkerValue.id);
            this.setCurrentMarker(ind);
        } catch (error) {
            this.handleError(error);
        }
    }

    // Buttons Handlers

    handleLocatorClick() {
        this.located = true;
        this.setCardState(false);
    }

    handleCloseCardClick() {
        this.setCardState(false);
    }

    handleRedirectClick = () => {
        this.redirectToMarkerDetails();
    }

    handleRouteClick = () => {
        this.routeToMarkerLocation();
    }

    handleBackCardClick() {  
        let ind = this.currentMarkerInd - 1;
        if (ind < 0) ind = this.filteredMarkers.length - 1;
        this.setCurrentMarker(ind);
    }

    handleNextCardClick() {
        const ind = (this.currentMarkerInd + 1) % this.filteredMarkers.length;
        this.setCurrentMarker(ind);
    }

    // Getters & Helpers

    get center() {
        return this.located ? this.resourceMarker : this.currentMarker;
    }

    get currentMarkerTitle() {
        return this.currentMarker?.value?.title;
    }

    get currentMarkerDetailFieldName() {
        return this.currentMarker?.value?.detailFieldName;
    }

    get currentMarkerDetailFieldValue() {
        return this.currentMarker?.value?.detailFieldValue;
    }

    get currentMarkerIndexUi() {
        const indUi = this.currentMarkerInd + 1;
        return isNaN(indUi) ? 0 : indUi;
    }

    get currentMarkerDistance() {
        return this.currentMarker?.value?.distance;
    }

    get currentMarkerIconUrl() {
        return this.currentMarker?.value?.iconUrl;
    }

    setCardState = (state) => {
        this.showCard = state;
    }

    getResourceMarkerSVG() {
        const icon =
            `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_2956_82705)">
                    <rect x="4" width="24" height="24" rx="12" fill="white" shape-rendering="crispEdges"/>
                    <rect x="8" y="4" width="16" height="16" rx="8" fill="#0176D3"/>
                </g>
                <defs>
                    <filter id="filter0_d_2956_82705" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4"/>
                        <feGaussianBlur stdDeviation="2"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2956_82705"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2956_82705" result="shape"/>
                    </filter>
                </defs>
            </svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(icon);
    }
}