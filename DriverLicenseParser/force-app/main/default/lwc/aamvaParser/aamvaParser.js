/**
 * Copyright (c) 2023, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export class AAMVAParser {
  /**
   * Given a valid input that is the payload from scanning a driver's license barcode
   * which conforms to the AAMVA 2020 Specification, this function parses the  input
   * and returns the parsed result. For details on AAMVA 2020 Specification see
   * https://www.aamva.org/assets/best-practices,-guides,-standards,-manuals,-whitepapers/aamva-dl-id-card-design-standard-(2020)
   *
   * NOTE: This parser does not support parsing of AAMVA subfile entries and will skip them.
   *
   * @param {string} aamvaData - The input data which is the payload of a PDF417 barcode on a driver's license
   * @returns {object} The parsed AAMVA data
   */
  static parseBarcode(aamvaData) {
    // The following are all of the standard required and optional elements as defined
    // by the 2020 AAMVA specification documentation. Jurisdictions may add their own
    // custom elements in addition to these. According to the AAMVA specifications, all
    // jurisdiction-specific elements must have 3-character codes that start with Z.
    const aamvaElements = [
      { code: "DAQ", fieldName: "customerId" }, // aka the driver's license number
      { code: "DCF", fieldName: "documentId" },
      { code: "DCG", fieldName: "issueingCountry" },
      { code: "DBA", fieldName: "expirationDate" },
      { code: "DBD", fieldName: "issueDate" },
      { code: "DDB", fieldName: "revisionDate" },
      { code: "DDC", fieldName: "hazmatEndorsementExpirationDate" },
      { code: "DAC", fieldName: "firstName" },
      { code: "DAD", fieldName: "middleName" },
      { code: "DCS", fieldName: "familyName" },
      { code: "DCU", fieldName: "nameSuffix" },
      { code: "DBG", fieldName: "firstNameAlias" },
      { code: "DBN", fieldName: "familyNameAlias" },
      { code: "DBS", fieldName: "nameSuffixAlias" },
      { code: "DDF", fieldName: "firstNameTruncation" },
      { code: "DDG", fieldName: "middleNameTruncation" },
      { code: "DDE", fieldName: "familyNameTruncation" },
      { code: "DBB", fieldName: "dateOfBirth" },
      { code: "DCI", fieldName: "placeOfBirth" },
      { code: "DAG", fieldName: "addressStreet1" },
      { code: "DAH", fieldName: "addressStreet2" },
      { code: "DAI", fieldName: "addressCity" },
      { code: "DAJ", fieldName: "addressStateCode" },
      { code: "DAK", fieldName: "addressPostalCode" },
      { code: "DAU", fieldName: "height" },
      { code: "DAW", fieldName: "weightPounds" },
      { code: "DAX", fieldName: "weightKilograms" },
      { code: "DAY", fieldName: "eyeColor" },
      { code: "DAZ", fieldName: "hairColor" },
      { code: "DBC", fieldName: "gender" },
      { code: "DCE", fieldName: "weightRange" },
      { code: "DCM", fieldName: "standardVehicleClass" },
      { code: "DCN", fieldName: "standardEndorsementCode" },
      { code: "DCO", fieldName: "standardRestrictionCode" },
      { code: "DCA", fieldName: "jurisdictionVehicleClass" },
      { code: "DCP", fieldName: "jurisdictionVehicleClassDescription" },
      { code: "DCD", fieldName: "jurisdictionEndorsementCode" },
      { code: "DCQ", fieldName: "jurisdictionEndorsementCodeDescription" },
      { code: "DCB", fieldName: "jurisdictionRestrictionCode" },
      { code: "DCR", fieldName: "jurisdictionRestrictionCodeDescription" },
      { code: "DCJ", fieldName: "auditInfo" },
      { code: "DCK", fieldName: "inventoryControlNumber" },
      { code: "DCL", fieldName: "ethnicity" },
      { code: "DDA", fieldName: "complianceType" },
      { code: "DDD", fieldName: "isLimitedDurationDocument" },
      { code: "DDH", fieldName: "under18Until" },
      { code: "DDI", fieldName: "under19Until" },
      { code: "DDJ", fieldName: "under21Until" },
      { code: "DDK", fieldName: "isOrganDonor" },
      { code: "DDL", fieldName: "isVeteran" }
    ];

    // Create a map from the elements
    let aamvaCodeMap = new Map();
    aamvaElements.forEach((element) => {
      aamvaCodeMap[element.code] = element.fieldName;
    });

    let result = {}; // holds the result of parsing

    const lines = aamvaData.replace(/@/, "").trim().split("\n");
    lines.forEach((line) => {
      let item = line.trim();
      const ansiIdx = item.toUpperCase().indexOf("ANSI");
      if (ansiIdx >= 0) {
        const headerFields = item
          .substring(ansiIdx + 4)
          .toUpperCase()
          .trim();

        // As per the specifications, the first 12 characters are as below:
        //   1. 6-digit Issuer Identification Number
        //   2. 2-digit AAMVA Version Number
        //   3. 2-digit Jurisdiction Version Number
        //   4. 2-digit Number of subfile entries
        result.issuerId = headerFields.substring(0, 6);
        result.aamvaVersionNumber = Number(headerFields.substring(6, 8));
        result.jurisdictionVersionNumber = Number(
          headerFields.substring(8, 10)
        );

        if (result.aamvaVersionNumber < 8) {
          console.warn(
            `Parser supports AAMVA data versions 8 or greater but input is of version ${result.aamvaVersionNumber}. Parsing of AAMVA data may yeild inaccurate results.`
          );
        }

        const numSubfileEntries = Number(headerFields.substring(10, 12));
        // Each subfile entry is 10 characters which we should skip over + 2 characters that
        // indicate the end of subfile entries which we should also skip over.
        const firstElementField = headerFields.substring(
          12 + numSubfileEntries * 10 + 2
        );
        item = firstElementField; // replace the item with the actual first element to be parsed further below
      }

      // All AAMVA elements are 3 characters or more
      if (item.length >= 3) {
        const itemCode = item.substring(0, 3).toUpperCase();
        const itemValue = item.substring(3).trim();
        const matchedFieldName = aamvaCodeMap[itemCode];
        if (matchedFieldName) {
          // It's one of the standard fields
          result[matchedFieldName] = itemValue;
        } else if (item.charAt(0) === "Z") {
          // It's a jurisdiction-specific field
          if (!result.jurisdictionCustomFields) {
            result.jurisdictionCustomFields = {};
          }
          result.jurisdictionCustomFields[itemCode] = itemValue;
        } else {
          console.warn(`Unable to parse AAMVA field: ${item}`);
        }
      } else {
        console.warn(`Unable to parse AAMVA field: ${item}`);
      }
    });

    // now perform some post-processing to further resolve field values.
    this.postProcess(result);

    return result;
  }

  /**
   * Given the parsed AAMVA data, this function will take a second pass at the parsed data
   * and performs a basic post-processing to further resolve field values. The values are
   * resolved in-place and will overwrite the previous values of the input fields.
   *
   * If you wish to  perform a more in-depth post processing, you should refer to the D20
   * Data Dictionary (https://www.aamva.org/technology/technology-standards/data-element-dictionary)
   * to better understand the data format for different fields and then expand on the code logic here.
   *
   * @param {object} parsedData - The input data
   */
  static postProcess(parsedData) {
    // For AAMVA compliant payload, country code can either be USA or CAN
    // and it determines the format for date values and postal code.
    const country = parsedData.issueingCountry?.toUpperCase().trim();
    if (country) {
      const isCA = country === "CAN";

      if (parsedData.expirationDate) {
        parsedData.expirationDate = this.parseDate(
          parsedData.expirationDate,
          isCA
        );
      }

      if (parsedData.issueDate) {
        parsedData.issueDate = this.parseDate(parsedData.issueDate, isCA);
      }

      if (parsedData.revisionDate) {
        parsedData.revisionDate = this.parseDate(parsedData.revisionDate, isCA);
      }

      if (parsedData.hazmatEndorsementExpirationDate) {
        parsedData.hazmatEndorsementExpirationDate = this.parseDate(
          parsedData.hazmatEndorsementExpirationDate,
          isCA
        );
      }

      if (parsedData.dateOfBirth) {
        parsedData.dateOfBirth = this.parseDate(parsedData.dateOfBirth, isCA);
      }

      if (parsedData.under18Until) {
        parsedData.under18Until = this.parseDate(parsedData.under18Until, isCA);
      }

      if (parsedData.under19Until) {
        parsedData.under19Until = this.parseDate(parsedData.under19Until, isCA);
      }

      if (parsedData.under21Until) {
        parsedData.under21Until = this.parseDate(parsedData.under21Until, isCA);
      }

      if (parsedData.addressPostalCode) {
        parsedData.addressPostalCode = this.parsePostalCode(
          parsedData.addressPostalCode,
          isCA
        );
      }
    }

    if (parsedData.firstNameTruncation) {
      parsedData.firstNameTruncation = this.parseTruncation(
        parsedData.firstNameTruncation
      );
    }

    if (parsedData.middleNameTruncation) {
      parsedData.middleNameTruncation = this.parseTruncation(
        parsedData.middleNameTruncation
      );
    }

    if (parsedData.familyNameTruncation) {
      parsedData.familyNameTruncation = this.parseTruncation(
        parsedData.familyNameTruncation
      );
    }

    if (parsedData.gender) {
      parsedData.gender = this.parseGender(parsedData.gender);
    }

    if (parsedData.weightPounds?.trim()) {
      parsedData.weightPounds = parseInt(parsedData.weightPounds.trim(), 10);
    }

    if (parsedData.weightKilograms?.trim()) {
      parsedData.weightKilograms = parseInt(
        parsedData.weightKilograms.trim(),
        10
      );
    }

    if (parsedData.eyeColor) {
      parsedData.eyeColor = this.parseColor(parsedData.eyeColor);
    }

    if (parsedData.hairColor) {
      parsedData.hairColor = this.parseColor(parsedData.hairColor);
    }

    if (parsedData.ethnicity) {
      parsedData.ethnicity = this.parseEthnicity(parsedData.ethnicity);
    }

    if (parsedData.complianceType) {
      parsedData.complianceType = this.parseComplianceType(
        parsedData.complianceType
      );
    }

    if (parsedData.isLimitedDurationDocument?.trim()) {
      parsedData.isLimitedDurationDocument = true;
    }

    if (parsedData.isOrganDonor?.trim()) {
      parsedData.isOrganDonor = true;
    }

    if (parsedData.isVeteran?.trim()) {
      parsedData.isVeteran = true;
    }
  }

  /**
   * Given an input (in either MMDDYYYY or YYYYMMDD format) it returns a Date object representing the input string.
   *
   * @param {string} input - The input date as a string
   * @param {boolean} isCanadianFormat - Indicates if the input represent a Canadian-formatted date (i.e YYYYMMDD)
   * @returns {Date} A date object representing the input string.
   */
  static parseDate(input, isCanadianFormat) {
    if (isCanadianFormat) {
      // YYYYMMDD
      const year = parseInt(input.substring(0, 4), 10);
      const month = parseInt(input.substring(4, 2), 10) - 1; // Month is zero-based
      const day = parseInt(input.substring(6, 2), 10);
      return new Date(year, month, day);
    }

    // MMDDYYYY
    const month = parseInt(input.substring(0, 2), 10) - 1; // Month is zero-based
    const day = parseInt(input.substring(2, 4), 10);
    const year = parseInt(input.substring(4, 8), 10);
    return new Date(year, month, day);
  }

  /**
   * Given an input string containing a postal code, it returns the formated postal code for USA or CAN.
   *
   * @param {string} input - The input postal code as a string
   * @param {boolean} isCanadianFormat - Indicates if the postal code is to be formatted for Canada.
   * @returns {string} A string representing the formatted postal code.
   */
  static parsePostalCode(input, isCanadianFormat) {
    const normalized = input.trim();
    if (!isCanadianFormat && normalized.length > 5) {
      // For USA, the postal code has a mandatory 5 digits part followed by
      // an optional 4 digit part which is separated by a hyphen
      return `${normalized.substring(0, 5)}-${normalized.substring(5)}`;
    } else if (isCanadianFormat && normalized.length === 6) {
      // For CAN, the postal code is always 6 characters (3 characters followed by a space and then 3 more characters)
      return `${normalized.substring(0, 3)} ${normalized.substring(3)}`;
    }
    return input;
  }

  /**
   * Given an input containing an ANSI D-20 color code, it returns a string containing the color name.
   *
   * @param {string} input - The input containing an ANSI D-20 color code
   * @returns {string} A string containing the color name
   */
  static parseColor(input) {
    switch (input?.trim()?.toUpperCase()) {
      case "BAL":
        return "Bald";
      case "DIC":
        return "Dichromatic";
      case "BLK":
        return "Black";
      case "BLN":
        return "Blond";
      case "BLU":
        return "Blue";
      case "BRO":
        return "Brown";
      case "GRY":
        return "Gray";
      case "GRN":
        return "Green";
      case "HAZ":
        return "Hazel";
      case "MAR":
        return "Maroon";
      case "PNK":
        return "Pink";
      case "RED":
        return "Red";
      case "SDY":
        return "Sandy";
      case "WHI":
        return "White";
      default:
        return "Unknown";
    }
  }

  /**
   * Given an input containing a 1-character truncation code, it returns a string containing the truncation type name.
   *
   * @param {string} input - The input containing a 1-character truncation code
   * @returns {string} A string containing the truncation type name
   */
  static parseTruncation(input) {
    const normalized = input?.trim()?.toUpperCase()?.charAt(0);
    switch (normalized) {
      case "T":
        return "Truncated";
      case "N":
        return "None";
      default:
        return "Unknown";
    }
  }

  /**
   * Given an input containing an ANSI D-20 gender code, it returns a string containing the gender name.
   *
   * @param {string} input - The input containing an ANSI D-20 gender code
   * @returns {string} A string containing the gender name
   */
  static parseGender(input) {
    const normalized = input.trim().toUpperCase().charAt(0);
    switch (normalized) {
      case "1":
      case "M":
        return "Male";
      case "2":
      case "F":
        return "Female";
      default:
        return "Other";
    }
  }

  /**
   * Given an input containing an ANSI D-20 race/ethnicity code, it returns a string containing the ethnicity name.
   *
   * @param {string} input - The input containing an ANSI D-20 race/ethnicity code
   * @returns {string} A string containing the ethnicity name
   */
  static parseEthnicity(input) {
    switch (input?.trim()?.toUpperCase()) {
      case "AI":
        return "Alaskan or American Indian";
      case "AP":
        return "Asian or Pacific Islander";
      case "BK":
        return "Black";
      case "H":
        return "Hispanic Origin";
      case "O":
        return "Non-hispanic";
      case "W":
        return "White";
      default:
        return "Unknown";
    }
  }

  /**
   * Given an input containing a 1-character compliance type code, it returns a string containing the compliance type name.
   *
   * @param {string} input - The input containing a 1-character compliance type code
   * @returns {string} A string containing the compliance type name
   */
  static parseComplianceType(input) {
    const normalized = input?.trim()?.toUpperCase().substring(0, 1);
    switch (normalized) {
      case "F":
        return "Compliant";
      case "N":
        return "Non-compliant";
      default:
        return "Unknown";
    }
  }
}
