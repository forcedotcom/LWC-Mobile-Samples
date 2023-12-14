import { LightningElement, api } from "lwc";

export default class LocationsList extends LightningElement {
  @api filteredMarkers;
  @api currentObject;
  @api setCurrentMarker;
  @api redirectToMarkerDetails;
  @api routeToMarkerLocation;
  @api isIos;
  @api handleError;

  mainTemplate;
  headerElement;
  listElement;

  showPopover = false;
  actionButtonIndexClicked;
  IOS_MARGIN = "34px";

  init = false;
  renderedCallback() {
    this.setSpinner();
    this.mainTemplate = this.template.querySelector(".main-container");
    this.headerElement = this.template.querySelector(".header");
    this.listElement = this.template.querySelector(".list");
    if (this.listElement)
      this.listElement.style.paddingBottom = this.isIos()
        ? this.IOS_MARGIN
        : "0";
    if (!this.init && this.headerElement) {
      this.detectDrag();
      this.init = true;
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
      if (index) this.setCurrentMarker(parseInt(index, 10));
    } catch (error) {
      this.handleError(error);
    }
  };

  handleActionsButtonClick = (e) => {
    try {
      e.stopPropagation();
      const el = e.currentTarget;
      const markerInd = parseInt(el.closest("li")?.dataset?.index, 10);
      this.template.querySelector(".popover-container").style.bottom = `${
        el.offsetParent?.offsetHeight -
        el.offsetTop -
        el.offsetHeight +
        this.listElement.scrollTop
      }px`;
      if (!this.showPopover || markerInd === this.actionButtonIndexClicked)
        this.showPopover = !this.showPopover;
      this.actionButtonIndexClicked = markerInd;
    } catch (error) {
      this.handleError(error);
    }
  };

  handlePopoverMaskClick = () => {
    this.showPopover = false;
  };

  handleViewClick = () => {
    this.redirectToMarkerDetails(this.actionButtonIndexClicked);
    this.showPopover = false;
  };

  handleDirectionsClick = () => {
    this.routeToMarkerLocation(this.actionButtonIndexClicked);
    this.showPopover = false;
  };

  // Getters

  get loaded() {
    return !!this.currentObject?.label;
  }

  get popoverClass() {
    return this.showPopover ? "popover-shown" : "popover-hidden";
  }

  get titleObjectText() {
    if (!this.currentObject.label) return "Locations";
    return this.filteredMarkers.length === 1
      ? this.currentObject.label
      : this.currentObject.plural;
  }

  // List Opening & Closing

  openLocationsList() {
    const top = this.mainTemplate.style.top;
    if (this.listElement.clientHeight > (window.innerHeight * 85) / 100) {
      this.mainTemplate.style.transform = `translateY(calc(20% - ${top}))`;
      // eslint-disable-next-line @lwc/lwc/no-async-operation
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
    // eslint-disable-next-line no-unused-vars
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const dragMove = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      this.mainTemplate.style.top = `${this.mainTemplate.offsetTop - pos2}px`;
    };

    const dragEnd = () => {
      if (pos2 > 0) this.openLocationsList();
      else this.closeLocationsList();
      this.headerElement.removeEventListener("touchend", dragEnd);
      this.headerElement.removeEventListener("touchmove", dragMove);
    };

    const dragTouchStart = (e) => {
      this.listElement.style.height = "fit-content";
      this.showPopover = false;
      e = e || window.event;
      e.preventDefault();
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      this.headerElement.addEventListener("touchend", dragEnd);
      this.headerElement.addEventListener("touchmove", dragMove);
    };

    this.headerElement.addEventListener("touchstart", dragTouchStart);
  };

  // Helpers

  setSpinner() {
    // set same id (if set in html, it changes dynamically)
    const g = this.template.querySelector(".spinner-g");
    const mask = this.template.querySelector(".spinner-mask");
    const id = "spinner-mask-id";
    mask?.setAttribute("id", id);
    g?.setAttribute("mask", `url(#${id})`);
  }
}
