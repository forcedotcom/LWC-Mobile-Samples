export const config = {
  mapObjects: [
    {
      value: 'ServiceAppointment',
      latField: 'Latitude',
      longField: 'Longitude',
      titleField: 'AppointmentNumber',
      detailField: 'Subject',
    },
    {
      value: 'Asset',
      latField: 'Latitude',
      longField: 'Longitude',
      titleField: 'Name',
      detailField: 'Quantity',
    },
  ],
  distanceUnit: 'km', // Preferred distance unit: km or mi
};
