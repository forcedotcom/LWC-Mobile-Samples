import { LightningElement, wire, api } from "lwc";
import getAllObjects from "@salesforce/apex/DashboardSettingsService.getAllObjects";
import insertNewCard from "@salesforce/apex/DashboardSettingsService.insertNewCard";
import updateCard from "@salesforce/apex/DashboardSettingsService.updateCard";
import deleteCard from "@salesforce/apex/DashboardSettingsService.deleteCard";
import updateCardsOrder from "@salesforce/apex/DashboardSettingsService.updateCardsOrder";
import getAllObjLabels from "@salesforce/apex/DashboardSettingsService.getAllObjLabels";
import { gql, graphql } from "lightning/uiGraphQLApi";
import EditCardModal from "c/editCardModal";
import AlertMessage from "c/alertMessage";
import overrideCSS from "./overrideCSS";
import customLabels from "./labels";

export default class DashboardSettingsMain extends LightningElement {
  LABELS = customLabels;
  dashboardCards = [];

  EMPTY_CARD = {
    key: "",
    title: "",
    object: { value: "", label: "" },
    filter: {
      conditionLogic: "",
      subFilters: [],
      customLogic: ""
    },
    layout: "SIDE",
    subFilters: [
      {
        key: "",
        field: "",
        operator: "",
        value: "",
        color: "#747474",
        label: "",
        icon: ""
      }
    ]
  };

  objectsOptions = [];
  toastService;
  GET_DASHBOARD_SETTINGS_QRY = "";

  async connectedCallback() {
    const myStyle = document.createElement("style");
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    myStyle.innerHTML = overrideCSS;
    document.head.appendChild(myStyle);

    this.GET_DASHBOARD_SETTINGS_QRY = gql`
      ${this.getDashboardQuery()}
    `;

    const allObjects = await getAllObjects();
    this.objectsOptions =
      allObjects?.sort((f1, f2) => (f1.label < f2.label ? -1 : 1)) ?? [];
  }

  renderedCallback() {
    this.toastService = this.template.querySelector(
      "c-dashboard-toast-message"
    );
  }

  getDashboardQuery() {
    return `query GetAllDashboardSettings {
      uiapi {
        query {
          Mobile_Dashboard_Setting__c {
            edges {
              node {
                Id,
                Object_Name__c {
                  value
                }
                Title__c {
                  value
                }
                Main_Filter__c {
                  value
                }
                Main_Filter_Logic__c {
                  value
                }
                Custom_Logic__c {
                  value
                }
                Layout__c {
                  value
                }
                Sub_Filters__c {
                  value
                }
                Order__c {
                  value
                }
              }
            }
          }
        }
      }
    }`;
  }

  @wire(graphql, {
    query: "$GET_DASHBOARD_SETTINGS_QRY"
  })
  GetAllDashboardSettings({ data, errors }) {
    if (data) {
      const dbDashboardSettings =
        data?.uiapi?.query.Mobile_Dashboard_Setting__c?.edges;
      this.buildDashboardCards(dbDashboardSettings);
    }
    if (errors) {
      console.log(JSON.stringify(errors));
    }
  }

  get loading() {
    return !this.objectsOptions?.length;
  }

  handleEditCardClick = (index) => {
    this.openEditCardModal(true, index);
  };

  handleAddCardClick = () => {
    this.openEditCardModal(false);
  };

  @api moveCardUp = (ind) => {
    this.moveCardFromTo(ind, ind - 1);
  };

  @api moveCardDown = (ind) => {
    this.moveCardFromTo(ind, ind + 1);
  };

  moveCardFromTo = async (from, to) => {
    const card = this.dashboardCards[from];
    this.dashboardCards.splice(from, 1);
    this.dashboardCards.splice(to, 0, card);
    this.dashboardCards = [...this.dashboardCards];
    await updateCardsOrder({ cardsIds: this.dashboardCards.map((c) => c.Id) });
  };

  @api duplicateCard = async (ind) => {
    try {
      const card = this.dashboardCards[ind];
      const newCard = { ...card, key: this.generateUniqueID() };
      const Id = await insertNewCard({
        data: this.buildDataForServer(newCard)
      });
      this.dashboardCards.splice(ind + 1, 0, { ...newCard, Id });
      this.dashboardCards = [...this.dashboardCards];
      await updateCardsOrder({
        cardsIds: this.dashboardCards.map((c) => c.Id)
      });
    } catch (error) {
      console.log(JSON.stringify(error));
      this.toastService.showToast(
        "error",
        this.LABELS.MobileDashboard_settings_error_duplicate_card
      );
    }
  };

  deleteCard = async (ind) => {
    const toDelete = await AlertMessage.open({
      size: "small",
      modalTitle:
        this.LABELS.MobileDashboard_settings_delete_card_warning_title,
      message: this.LABELS.MobileDashboard_settings_delete_card_warning_body,
      discardButtonText: this.LABELS.MobileDashboard_settings_cancel_button,
      isDeleteMsg: true
    });

    if (toDelete) {
      try {
        await deleteCard({ Id: this.dashboardCards[ind].Id });
        this.dashboardCards.splice(ind, 1);
        this.dashboardCards = [...this.dashboardCards];
        await updateCardsOrder({
          cardsIds: this.dashboardCards.map((c) => c.Id)
        });
      } catch (error) {
        console.log(JSON.stringify(error));
        this.toastService.showToast(
          "error",
          this.LABELS.MobileDashboard_settings_error_delete_card
        );
      }
    }
  };

  openEditCardModal = async (isEdit, cardIndex) => {
    const result = await EditCardModal.open({
      size: "medium",
      modalTitle: isEdit
        ? this.LABELS.MobileDashboard_settings_edit_card_modal_title
        : this.LABELS.MobileDashboard_settings_new_card_modal_title,
      objectsOptions: this.objectsOptions,
      card: this.dashboardCards[cardIndex] ?? {
        ...this.EMPTY_CARD,
        key: this.generateUniqueID()
      },
      generateUniqueID: this.generateUniqueID
    });

    if (result) {
      try {
        const data = this.buildDataForServer(result, cardIndex);
        if (isEdit) {
          await updateCard({ Id: result.Id, data });
          this.dashboardCards[cardIndex] = result;
          this.dashboardCards = [...this.dashboardCards];
        } else {
          const Id = await insertNewCard({ data });
          this.dashboardCards = [...this.dashboardCards, { Id, ...result }];
        }
      } catch (error) {
        console.log(JSON.stringify(error));
        this.toastService.showToast(
          "error",
          isEdit
            ? this.LABELS.MobileDashboard_settings_error_save_card
            : this.LABELS.MobileDashboard_settings_error_add_card
        );
      }
    }
  };

  async buildDashboardCards(dbDashboardSettings) {
    const objLabels = await this.getAllObjLabels(dbDashboardSettings);
    dbDashboardSettings?.forEach((settings) => {
      settings = settings.node;
      const mainFilter = JSON.parse(settings.Main_Filter__c.value);
      const subFilters = JSON.parse(settings.Sub_Filters__c.value);
      this.dashboardCards[settings.Order__c.value] = {
        Id: settings.Id,
        key: this.generateUniqueID(),
        title: settings.Title__c.value,
        object: {
          value: settings.Object_Name__c.value,
          label: objLabels[settings.Object_Name__c.value]
        },
        filter: {
          conditionLogic: settings.Main_Filter_Logic__c.value,
          subFilters: mainFilter.map((sf) => ({
            key: this.generateUniqueID(),
            ...sf
          })),
          customLogic: settings.Custom_Logic__c.value
        },
        layout: settings.Layout__c.value,
        subFilters: subFilters.map((sf) => ({
          key: this.generateUniqueID(),
          ...sf
        }))
      };
    });
    this.dashboardCards = [...this.dashboardCards];
  }

  async getAllObjLabels(dbDashboardSettings) {
    const allApiNames = dbDashboardSettings?.map(
      (s) => s.node.Object_Name__c.value
    );
    const labels = await getAllObjLabels({ apiNames: allApiNames });
    return labels;
  }

  buildDataForServer = (data, cardIndex) => ({
    customLogic: data.filter.customLogic,
    layout: data.layout,
    mainFilterLogic: data.filter.conditionLogic,
    mainFilter: JSON.stringify(data.filter.subFilters),
    objectName: data.object.value,
    index: cardIndex ?? this.dashboardCards.length,
    subFilters: JSON.stringify(data.subFilters),
    title: data.title
  });

  generateUniqueID() {
    return Math.random().toString(36).substring(2, 8);
  }
}
