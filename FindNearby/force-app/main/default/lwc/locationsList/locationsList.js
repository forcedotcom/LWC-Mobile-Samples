import { LightningElement, api } from 'lwc';

export default class LocationsList extends LightningElement {

    @api filteredMarkers;
    @api currentObject;
    @api setCurrentMarker;
    @api redirectToMarkerDetails;
    @api routeToMarkerLocation;
    @api handleError;

    mainTemplate;
    headerElement;
    listElement;
    
    showPopover = false;
    actionButtonIndexClicked;

    init = false;
    renderedCallback() {
        if (!this.init) {
            this.init = true;
            this.mainTemplate = this.template.querySelector('.main-container');
            this.headerElement = this.template.querySelector('.header');
            this.listElement = this.template.querySelector('.list');
            this.listElement.style.paddingBottom = this.isIOS ? '34px' : '0';
            this.detectDrag();
        }
    }

    @api currentMarkerSet() {
        this.closeLocationsList();
    }

    // Handlers

    handleItemClick = (e) => {
        try {
            e.preventDefault();
            e.stopPropagation();
            const index = e?.currentTarget?.dataset?.index;
            if (index) this.setCurrentMarker(parseInt(index));   
        } catch (error) {
            this.handleError(error);
        }
    }

    handleActionsButtonClick = (e) => {
        try {
            e.stopPropagation();
            const el = e.currentTarget;
            const markerInd = parseInt(el.closest('li')?.dataset?.index);
            this.template.querySelector('.popover-container').style.bottom =
                `${el.offsetParent?.offsetHeight - el.offsetTop - el.offsetHeight + this.listElement.scrollTop}px`;
            if (!this.showPopover || markerInd === this.actionButtonIndexClicked) this.showPopover = !this.showPopover;
            this.actionButtonIndexClicked = markerInd;
        } catch (error) {
            this.handleError(error);
        }
    }

    handlePopoverMaskClick = () => {
        this.showPopover = false;
    }

    handleViewClick = () => {
        this.redirectToMarkerDetails(this.actionButtonIndexClicked);
        this.showPopover = false;
    }

    handleDirectionsClick = () => {
        this.routeToMarkerLocation(this.actionButtonIndexClicked);
        this.showPopover = false;
    }

    // Getters
    
    get popoverClass() {
        return this.showPopover ? 'popover-shown' : 'popover-hidden';
    }

    get titleObjectText() {
        if (!this.currentObject.label) return 'Locations';
        return this.filteredMarkers.length === 1 ? this.currentObject.label : this.currentObject.plural;
    }

    get isIOS() {
        const isIpad = navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
        const isIphone = navigator.platform.includes('iPhone');
        return isIpad || isIphone;
    }

    // List Opening & Closing

    openLocationsList() {
        const top = this.mainTemplate.style.top;
        if (this.listElement.clientHeight > window.innerHeight * 85 / 100) {
            this.mainTemplate.style.transform = `translateY(calc(20% - ${top}))`;
            setTimeout(() => {
                this.setListHeight();
            }, 800);
        } else {
            this.mainTemplate.style.transform = `translateY(calc((90% - ${this.listElement.clientHeight}px) - ${top}))`;
        }
    }

    closeLocationsList() {
        const top = this.mainTemplate.style.top;
        this.mainTemplate.style.transform = `translateY(calc(85% - ${top})`;
        this.showPopover = false;
    }

    setListHeight() {
        const containerH = window.innerHeight;
        const listBounds = this.listElement.getBoundingClientRect();
        const newHeight = containerH - listBounds.top;
        this.listElement.style.height = `${newHeight}px`;
    }
    
    detectDrag = () => {
		let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		
		const dragTouchStart = (e) => {
            this.listElement.style.height = 'fit-content';
            this.showPopover = false;
			e = e || window.event;
			e.preventDefault();
			pos3 = e.touches[0].clientX;
			pos4 = e.touches[0].clientY;
			this.headerElement.addEventListener('touchend', dragEnd);
			this.headerElement.addEventListener('touchmove', dragMove);
		}

		const dragMove = (e) => {
			e = e || window.event;
			e.preventDefault();
			pos1 = pos3 - e.touches[0].clientX;
			pos2 = pos4 - e.touches[0].clientY;
			pos3 = e.touches[0].clientX;
			pos4 = e.touches[0].clientY;
			this.mainTemplate.style.top = `${this.mainTemplate.offsetTop - pos2}px`;
		}

		const dragEnd = () => {
			if (pos2 > 0) this.openLocationsList();
            else this.closeLocationsList();
            this.headerElement.removeEventListener('touchend', dragEnd);
			this.headerElement.removeEventListener('touchmove', dragMove);
		}

		this.headerElement.addEventListener('touchstart', dragTouchStart);
	}
}