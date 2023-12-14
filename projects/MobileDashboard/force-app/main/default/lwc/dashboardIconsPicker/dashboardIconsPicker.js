/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api } from "lwc";
import customLabels from "./labels";

export default class DashboardIconsPicker extends LightningElement {
  @api selectedIcon;
  @api setIcon;

  LABELS = customLabels;

  iconGroups = [
    {
      label: this.LABELS.MobileDashboard_icons_list_subtitle_status,
      icons: [
        {
          label: this.LABELS.MobileDashboard_icons_list_info,
          name: "utility:info"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_success,
          name: "utility:success"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_warning,
          name: "utility:warning"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_error,
          name: "utility:error"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_new,
          name: "utility:routing_offline"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_in_progress,
          name: "utility:away"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_cannot_complete,
          name: "utility:ban"
        }
      ]
    },
    {
      label: this.LABELS.MobileDashboard_icons_list_subtitle_sentiment,
      icons: [
        {
          label: this.LABELS.MobileDashboard_icons_list_positive,
          name: "utility:emoji"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_neutral,
          name: "utility:sentiment_neutral"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_negative,
          name: "utility:sentiment_negative"
        }
      ]
    },
    {
      label: this.LABELS.MobileDashboard_icons_list_subtitle_record_types,
      icons: [
        {
          label: this.LABELS.MobileDashboard_icons_list_case,
          name: "utility:case"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_lead,
          name: "utility:lead"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_opportunity,
          name: "utility:opportunity"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_quote,
          name: "utility:quote"
        }
      ]
    },
    {
      label: this.LABELS.MobileDashboard_icons_list_subtitle_other,
      icons: [
        {
          label: this.LABELS.MobileDashboard_icons_list_approval,
          name: "utility:approval"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_clock,
          name: "utility:clock"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_event,
          name: "utility:event"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_favorite,
          name: "utility:favorite"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_like,
          name: "utility:like"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_dislike,
          name: "utility:dislike"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_location,
          name: "utility:checkin"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_priority,
          name: "utility:priority"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_user,
          name: "utility:user"
        },
        {
          label: this.LABELS.MobileDashboard_icons_list_people,
          name: "utility:people"
        }
      ]
    }
  ];

  handleIconClick = (e) => {
    this.selectedIcon = e.target.value;
    this.setIcon(this.selectedIcon);
  };

  get selectedIconLabel() {
    const icon = this.iconGroups
      .flatMap((group) => group.icons)
      .find((icn) => icn.name === this.selectedIcon);
    return icon ? icon.label : null;
  }

  get menuLabel() {
    return (
      this.selectedIconLabel ??
      this.LABELS.MobileDashboard_settings_select_placeholder
    );
  }
}
