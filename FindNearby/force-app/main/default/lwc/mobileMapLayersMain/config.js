export const config = {
    mapObjects: [
        {
            value: 'ServiceAppointment',
            latField: 'Latitude',
            longField: 'Longitude',
            majorField: 'AppointmentNumber',
            secondField: 'Subject'
        },
        {
            value: 'Asset',
            latField: 'Latitude',
            longField: 'Longitude',
            majorField: 'Name',
            secondField: 'Quantity'
        }
    ],
    distanceUnit: 'km' // Preferred distance unit: km or mi
};