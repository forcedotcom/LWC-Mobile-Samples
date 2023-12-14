export const config = {
  mapObjects: [
    {
      value: "ServiceAppointment",
      latField: "Latitude",
      longField: "Longitude",
      titleField: "AppointmentNumber",
      firstDetailField: "Subject",
      secondDetailField: "Status",
      thirdDetailField: "DurationInMinutes"
    },
    {
      value: "ServiceResource",
      latField: "LastKnownLatitude",
      longField: "LastKnownLongitude",
      titleField: "Name",
      firstDetailField: "ResourceType",
      secondDetailField: "IsActive",
      thirdDetailField: "Description"
    }
  ],
  distanceUnit: "km" // Preferred distance unit: km or mi
};
