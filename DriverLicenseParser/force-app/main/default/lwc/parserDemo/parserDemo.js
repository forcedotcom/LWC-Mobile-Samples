import { LightningElement } from "lwc";
import { getBarcodeScanner } from "lightning/mobileCapabilities";
import { AAMVAParser } from "c/aamvaParser";

export default class ParserDemo extends LightningElement {
  aamvaResult;
  error;

  scanBarcode() {
    // reset the states before starting to scan
    this.aamvaResult = undefined;
    this.error = undefined;

    const myScanner = getBarcodeScanner();

    if (myScanner && myScanner.isAvailable()) {
      // AAMVA data is only stored in PDF417 barcodes
      let scanningOptions = { barcodeTypes: ["pdf417"] };
      myScanner
        .beginCapture(scanningOptions)
        .then((barcode) => {
          const result = AAMVAParser.parseBarcode(barcode.value);
          this.aamvaResult = JSON.stringify(result, null, 2);
        })
        .catch((error) => {
          this.error = JSON.stringify(error, null, 2);
        })
        .finally(() => {
          myScanner.endCapture();
        });
    } else {
      this.error = "Problem initiating scanner. Are you using a mobile device?";
    }
  }
}
