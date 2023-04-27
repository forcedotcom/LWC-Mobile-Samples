/**
 * Created by pliuzzi on 27/04/23.
 */
import {EXIF} from './exifjs';

function convertDMSToDD(degrees, minutes, seconds, direction) {

    let dd = degrees + (minutes/60) + (seconds/3600);
    if (direction === "S" || direction === "W") {
        dd = dd * -1;
    }
    return dd;

}

class ExifReader {

    static readMetadata(file){
        return new Promise((resolve) => {
            EXIF.getData(file, function() {
                const allMetaData = EXIF.getAllTags(this);
                resolve(allMetaData);
            });
        });
    }



    static extractGpsInformation(metadata){

        function divide(gpsElement){
            let denominator = gpsElement.denominator || 1;
            let numerator = gpsElement.numerator || gpsElement || 0;
            return numerator / denominator;
        }
        return new Promise((resolve, reject) => {
            if(!(metadata.GPSLatitude && metadata.GPSLatitudeRef && metadata.GPSLongitude && metadata.GPSLongitudeRef)) reject('No GPS info found in exif metadata');
            // Calculate latitude decimal
            const latDegree = divide(metadata.GPSLatitude[0]);
            const latMinute = divide(metadata.GPSLatitude[1]);
            const latSecond = divide(metadata.GPSLatitude[2]);
            const latDirection = metadata.GPSLatitudeRef;

            const latFinal = convertDMSToDD(latDegree, latMinute, latSecond, latDirection);

            // Calculate longitude decimal
            const lonDegree = divide(metadata.GPSLongitude[0]);
            const lonMinute = divide(metadata.GPSLongitude[1]);
            const lonSecond = divide(metadata.GPSLongitude[2]);
            const lonDirection = metadata.GPSLongitudeRef;

            const lonFinal = convertDMSToDD(lonDegree, lonMinute, lonSecond, lonDirection);
            resolve({
                latitude: latFinal,
                longitude: lonFinal
            });
        });

    }

}

export {ExifReader}