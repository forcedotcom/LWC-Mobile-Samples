export class DQM {
  static cpx(s = "") {
    console.log(`%c${s ?? ""}`, "background:#ffcc33;color:#000;");
  }
  static get MaxNumOfTokens() {
    return 26;
  } //number of chars in ABC.
  static get NumOfParsingIterations() {
    return 20;
  }
  static charx(offset = 0) {
    return String.fromCharCode("A".charCodeAt(0) + offset);
  }
  static sanitizex(s = "") {
    return (s ?? "")
      .replaceAll("and", "&")
      .replaceAll("or", "|")
      .replaceAll(" ", "")
      .toLowerCase();
  }

  static calcDateFromToday(numOfDays) {
    //retunrs yyyy-mm-dd
    try {
      numOfDays = parseInt(numOfDays, 10);
      numOfDays = isNaN(numOfDays) ? 0 : numOfDays;
      if (numOfDays === "NaN") numOfDays = 0;
      const dt = new Date();
      dt.setDate(dt.getDate() + numOfDays);
      let ret = dt.toISOString().slice(0, "yyyy-mm-dd".length);
      return ret;
    } catch (ex) {
      let dx = new Date();
      dx.setDate(dx.getDate());
      return dx.toISOString().slice(0, "yyyy-mm-dd".length);
    }
  }

  static isoDayStart(yyyy_mm_dd) {
    //2023-04-05T23:59:59.999Z
    return yyyy_mm_dd + "T00:00:00.000Z";
  }
  static isoDayEnd(yyyy_mm_dd) {
    return yyyy_mm_dd + "T23:59:59.999Z";
  }

  static isValidToken(token = "") {
    try {
      let tokenx = token.slice(1, token.length - 1); //each token has brackets around it but none inside it
      let is_and = tokenx.includes("&");
      let is_or = tokenx.includes("|");
      if (is_and && is_or) return false;
      if (!is_and && !is_or) return true;
      let op = is_and ? "&" : "|";
      let arx = tokenx.split(op);
      if (arx.pop() === "") return false; //happens if op is last char if tokenx or if tokenx is empty
      return true;
    } catch (ex) {
      DQM.cpx("isValidToken() ex: " + ex.message);
      return false;
    }
  }

  static valueFormatter(idx, value, field_type, is_like = false) {
    try {
      if (typeof value == "undefined" || typeof field_type == "undefined") {
        DQM.cpx(`valueFormatter(${idx}) - invalid input 01`);
        return "";
      }

      value = typeof value == "string" ? value.trim() : value;
      field_type = field_type.trim();
      if (value === undefined || field_type === undefined) {
        DQM.cpx(
          `valueFormatter(${idx}) - invalid input 02 - value=[${value}] field_type=[${field_type}] `
        );
        return undefined;
      }

      field_type = field_type.toLowerCase();
      let is_add_quotes =
        [
          "string",
          "picklist",
          "combobox",
          "date",
          "datetime",
          "phone",
          "email",
          "url",
          "address",
          "text"
        ].includes(field_type) || is_like;
      let valuex = is_like ? `%${value}%` : value;
      valuex = is_add_quotes ? `"${valuex}"` : valuex;
      if (field_type === "datetime") {
        const isoString = new Date(value).toISOString();
        valuex = `{value:"${isoString}"}`;
      } else if (field_type === "date") {
        valuex = `{value:${valuex}}`;
      }
      return valuex;
    } catch (ex) {
      DQM.cpx(
        `valueFormatter(${idx}) ex: ${ex.message} value=[${value}] field_type=[${field_type}] `
      );
      return "";
    }
  }

  static singleTokenParser(obx) {
    try {
      const regExp = /\(([^()]+)\)/g;
      let tmp = obx.phrase.match(regExp);
      if (!tmp || obx.is_done) {
        obx.is_done = true;
        return;
      }
      [...tmp].forEach((token) => {
        if (obx.counter >= DQM.MaxNumOfTokens) {
          //the obx.dic is from A to Z. which should be more than enough.
          obx.error_msg = "Invalid expression.";
          obx.error_code = "101";
          obx.is_done = true;
          return;
        }

        if (!DQM.isValidToken(token)) {
          obx.error_msg = "Invalid expression.";
          obx.error_code = "102";
          obx.is_done = true;
          return;
        }

        let qry_obj = DQM.gqlConverter(token.slice(1, token.length - 1));
        if (qry_obj.error_msg) {
          obx.error_msg = qry_obj.error_msg;
          obx.error_code = qry_obj.error_code;
          obx.is_done = true;
          return;
        }
        let tag = DQM.charx(obx.counter++);
        obx.dic[tag] = qry_obj.qry;
        obx.phrase = obx.phrase.replace(token, tag);
      });
    } catch (ex) {
      DQM.cpx("singleTokenParser() ex: " + ex.message);
      obx.error_msg = ex.message;
      obx.error_code = "110";
      obx.is_done = true;
    }
  }

  static gqlConverter(s = "") {
    //failure if ret.error_msg is not empty. success otherwise.
    let ret = { qry: "", error_msg: "", error_code: "" };
    try {
      let is_and = s.includes("&");
      let is_or = s.includes("|");
      if (is_and && is_or) {
        ret.error_msg = "invalid expression.";
        ret.error_code = "201";
        return ret;
      }
      if (!is_and && !is_or) {
        ret.qry = s;
        return ret;
      } //nothing to do. no operators in the string.
      let op = is_and ? "&" : "|";
      let list = s.replaceAll("&", ",").replaceAll("|", ",");
      ret.qry = `{${op}:[${list}]}`;
      return ret;
    } catch (ex) {
      DQM.cpx("gqlConverter() ex: " + ex.message);
      ret.error_msg = ex.message;
      ret.error_code = "202";
      return ret;
    }
  }

  static assembleQuery(obx, ret, main_filter) {
    try {
      // eslint-disable-next-line guard-for-in
      for (const propx in obx.dic) {
        let arx = obx.dic[propx].match(/[A-Z]/g);
        if (!arx) continue;
        arx.forEach((tag) => {
          obx.dic[propx] = obx.dic[propx].replace(tag, obx.dic[tag]);
        });
      }

      let finalx = obx.dic[DQM.charx(obx.counter - 1)]; //the last one
      // eslint-disable-next-line no-useless-escape
      if (/^[1-9&|(){}\[\],:]*$/.test(finalx) !== true) {
        ret.error_msg = "Invalid expression.";
        ret.error_code = "301";
        ret.is_success = false;
        return;
      }
      if (/\d{2}/.test(finalx)) {
        //there should not be 2 or more digits in a row. elements are 1,2,...9 at most
        ret.error_msg = "Invalid expression.";
        ret.error_code = "302 (Filter numbers must be from 1 to 9)";
        ret.is_success = false;
        return;
      }
      finalx = finalx.replaceAll("&", "and").replaceAll("|", "or");

      let all_digits_in_final_phrase = finalx.replace(/\D/g, "");
      let max_allowed_digit = main_filter.length;
      for (let i = max_allowed_digit + 1; i <= 9; i++) {
        if (all_digits_in_final_phrase.includes(i.toString())) {
          ret.error_msg = "Invalid expression.";
          ret.error_code = "303 (Filter numbers with no matching filter)";
          ret.is_success = false;
          return;
        }
      }

      //at this point we have a valid gql phrase with numbers that should be replaced with expressions from main_filter
      for (let i = 1; i <= max_allowed_digit; i++) {
        finalx = finalx.replaceAll(i.toString(), `<<SALESFORCE_${i}>>`);
      }

      for (let i = 1; i <= max_allowed_digit; i++) {
        let filter = main_filter[i - 1];

        //let valuex = DQM.valueFormatter(filter?.value, filter?.fieldType, filter?.operator?.toLowerCase().trim() == 'like');
        //let expx = `{${filter.field}:{${filter.operator}: ${valuex}}}`;

        finalx = finalx.replaceAll(
          `<<SALESFORCE_${i}>>`,
          DQM.expression_maker(filter)
        );
      }
      ret.final_phrase = finalx;
      ret.is_success = true;
    } catch (ex) {
      DQM.cpx("assembleQuery() ex: " + ex.message);
      ret.error_msg = ex.message;
      ret.error_code = "309";
      ret.is_success = false;
    }
  }

  static initialPhraseValidation(phrase = "") {
    try {
      let s = DQM.sanitizex(phrase);
      if (!s || s.includes("&&") || s.includes("||") || s.includes("()"))
        return "031";
      let num_of_left_bracket = s.split("(").length - 1;
      let num_of_right_bracket = s.split(")").length - 1;
      if (num_of_left_bracket !== num_of_right_bracket) return "032";
      return true;
    } catch (ex) {
      DQM.cpx("initialPhraseValidation() ex: " + ex.message);
      return "033";
    }
  }

  static gqlCustomPhraseMaker(phrasex, main_filter) {
    let phrase = (phrasex ?? "").toLowerCase();
    let ret = {
      original_phrase: phrase,
      final_phrase: "",
      is_success: false,
      error_msg: "",
      error_code: ""
    };
    try {
      let valx = DQM.initialPhraseValidation(phrase); //return value === true if valid, error code otherwise
      if (valx !== true) {
        ret.error_msg = "Invalid custom expression";
        ret.error_code = valx;
        return ret;
      }

      let obx = {
        counter: 0,
        phrase: DQM.sanitizex(phrase),
        dic: {},
        is_done: false,
        error_msg: "",
        error_code: ""
      };

      for (let i = 0; i < DQM.NumOfParsingIterations; i++) {
        //20 iterations should be more than enough
        DQM.singleTokenParser(obx);
        if (obx.is_done || obx.error_msg) break;
      }

      if (obx.error_msg) {
        ret.error_msg = "Custom: " + obx.error_msg;
        ret.error_code = "401";
        return ret;
      }
      if (!obx.is_done) {
        ret.error_msg = "Custom: invalid expression.";
        ret.error_code = "402";
        return ret;
      }
      let latest_qry = DQM.gqlConverter(obx.phrase);
      if (latest_qry.error_msg) {
        ret.error_msg = "Custom: " + latest_qry.error_msg;
        ret.error_code = latest_qry.error_code;
      } else {
        obx.dic[DQM.charx(obx.counter++)] = latest_qry.qry;
        DQM.assembleQuery(obx, ret, main_filter);
      }
      return ret;
    } catch (ex) {
      DQM.cpx("gqlCustomPhraseMaker() ex: " + ex.message);
      ret.error_msg = ex.message;
      ret.error_code = "409";
      return ret;
    }
  }

  static isValidDataObject(obj) {
    //todo: add tests
    return !!obj;
  }

  static relativeDateFilterMaker_IsoStyle(operator, filter) {
    try {
      let valuex;
      if (operator === "today") {
        valuex = DQM.calcDateFromToday(0);
        let startx = DQM.isoDayStart(valuex);
        let endx = DQM.isoDayEnd(valuex);
        let ret = `{and: [
                    {${filter.field}: {gte: {value: "${startx}"}}},
                    {${filter.field}: {lte: {value: "${endx}"}}}
                ]}`;
        return ret;
      }

      if (operator === "last" || operator === "next") {
        valuex = DQM.calcDateFromToday(0);

        if (operator === "last") {
          //including today
          valuex = DQM.isoDayEnd(valuex);
        } else {
          //next - including today
          valuex = DQM.isoDayStart(valuex);
        }

        let opx = operator === "last" ? "lte" : "gte";
        let f1 = `{${filter.field}:{${opx}:{value:"${valuex}"}}}`;

        let dirx = operator === "last" ? -1 : 1;
        let num_of_days =
          dirx *
          filter.quantity *
          (filter.unit === "month" ? 30 : 1) *
          (filter.unit === "week" ? 7 : 1);
        valuex = DQM.calcDateFromToday(num_of_days);

        opx = operator === "last" ? "gte" : "lte";
        if (operator === "last") {
          //including today
          valuex = DQM.isoDayStart(valuex);
        } else {
          //next - including today
          valuex = DQM.isoDayEnd(valuex);
        }
        let f2 = `{${filter.field}:{${opx}:{value:"${valuex}"}}}`;

        return `{and: [${f1}, ${f2}]}`;
      }

      DQM.cpx("relativeDateFilterMaker_IsoStyle() - not supported yet");
      return null;
    } catch (ex) {
      DQM.cpx("relativeDateFilterMaker_IsoStyle() - ex: " + ex.message);
      return null;
    }
  }

  static relativeDateFilterMaker(operator, filter) {
    try {
      let valuex;

      if (filter.fieldType.toLowerCase() === "datetime") {
        return DQM.relativeDateFilterMaker_IsoStyle(operator, filter);
      }

      if (operator === "today") {
        valuex = `"${DQM.calcDateFromToday(0)}"`;
        return `{${filter.field}:{eq:{value:${valuex}}}}`;
      }
      if (operator === "last" || operator === "next") {
        valuex = `"${DQM.calcDateFromToday(0)}"`;
        let opx = operator === "last" ? "lte" : "gte";
        let f1 = `{${filter.field}:{${opx}:{value:${valuex}}}}`;

        let dirx = operator === "last" ? -1 : 1;
        let num_of_days =
          dirx *
          filter.quantity *
          (filter.unit === "month" ? 30 : 1) *
          (filter.unit === "week" ? 7 : 1);
        valuex = `"${DQM.calcDateFromToday(num_of_days)}"`;

        opx = operator === "last" ? "gte" : "lte";
        let f2 = `{${filter.field}:{${opx}:{value:${valuex}}}}`;

        return `{and: [${f1}, ${f2}]}`;
      }
      DQM.cpx("relativeDateFilterMaker() - invalid input");
      return null; //should not happen
    } catch (ex) {
      DQM.cpx("relativeDateFilterMaker() - ex: " + ex.message);
      return null;
    }
  }

  static mainFilterExpressionMaker(obj) {
    try {
      let omni_main_filter = `{Id: {ne: "000000000000000000"}}`;
      let main_filter_logic =
        obj?.node?.Main_Filter_Logic__c?.value?.toLowerCase().trim() ?? "";
      let main_filter_array = JSON.parse(obj?.node?.Main_Filter__c?.value);
      if (
        !main_filter_logic ||
        !main_filter_array ||
        !Array.isArray(main_filter_array) ||
        main_filter_array.length < 1 ||
        !["and", "or", "custom"].includes(main_filter_logic)
      ) {
        return omni_main_filter;
      }

      if (main_filter_logic === "custom") {
        let phrase = obj?.node?.Custom_Logic__c?.value ?? "";
        let oQry = DQM.gqlCustomPhraseMaker(phrase, main_filter_array);
        if (!oQry.is_success) {
          DQM.cpx(
            `${oQry.error_msg} - custom phrase:[${phrase}] - Error ${oQry.error_code}`
          );
          return omni_main_filter;
        }
        return oQry.final_phrase;
      }

      let filters = "";
      // eslint-disable-next-line consistent-return
      main_filter_array.forEach((filter) => {
        let operator = filter?.operator?.toLowerCase().trim();
        if (!operator) return ""; //should not happen
        if (["today", "last", "next"].includes(operator)) {
          filters += DQM.relativeDateFilterMaker(operator, filter);
        } else {
          let valuex = DQM.valueFormatter(
            1,
            filter?.value,
            filter?.fieldType,
            operator === "like"
          );
          filters += `{${filter.field}:{${operator}:${valuex}}},`;
        }
      });
      let main_exp = `{ ${main_filter_logic}: [${filters}] }`;
      return main_exp;
    } catch (ex) {
      DQM.cpx(`mainFilterExpressionMaker() ex: ${ex.message}`);
      return "";
    }
  }

  static expression_maker(filter) {
    try {
      let filterx;
      if (!filter?.field || !filter?.operator || !filter?.value) return "";
      let operator = filter?.operator?.toLowerCase().trim();
      if (!operator) return []; //should not happen

      if (["today", "last", "next"].includes(operator)) {
        filterx = DQM.relativeDateFilterMaker(operator, filter);
      } else {
        let valuex = DQM.valueFormatter(
          2,
          filter?.value,
          filter?.fieldType,
          operator === "like"
        );
        filterx = `{${filter.field}: {${filter.operator}: ${valuex}}}`;
      }
      return filterx;
    } catch (ex) {
      DQM.cpx(`expression_maker() ex: ${ex.message}`);
      return [];
    }
  }

  static subFilterExpressionsArrayMaker(obj) {
    try {
      let sub_filters_arr = JSON.parse(obj?.node?.Sub_Filters__c?.value);
      let sub_filter_expressions_array = [];
      // eslint-disable-next-line no-unused-vars
      sub_filters_arr.forEach((filter, idx) => {
        sub_filter_expressions_array.push(DQM.expression_maker(filter));
      });
      return sub_filter_expressions_array;
    } catch (ex) {
      DQM.cpx(`subFilterExpressionsArrayMaker() ex: ${ex.message}`);
      return [];
    }
  }

  static subQueriesMaker(
    obj,
    main_filter_exp,
    sub_filter_expressions_array,
    is_mobile_qry
  ) {
    try {
      let object_name = obj?.node?.Object_Name__c?.value;
      if (!object_name) {
        DQM.cpx("subQueriesMaker() - invalid object name.");
        return "";
      }
      let sub_filters_arr = JSON.parse(obj?.node?.Sub_Filters__c?.value);
      let sub_qrys = "";
      let mobilex = is_mobile_qry ? '@category(name: "recordQuery")' : "";
      sub_filters_arr.forEach((filter, idx) => {
        let wherex = main_filter_exp?.trim() ? `${main_filter_exp}, ` : "";
        let qry = `counter_${idx}: ${object_name}(where: {and: [${wherex}${sub_filter_expressions_array[idx]}] }, first: 2000) ${mobilex} {edges{node{Id}}}`;
        sub_qrys += qry;
      });
      return sub_qrys;
    } catch (ex) {
      DQM.cpx(`subQueriesMaker() ex: ${ex.message}`);
      return "";
    }
  }

  static queryAssembler(object_name, sub_qrys, main_filter_exp, is_mobile_qry) {
    try {
      let mobilex = is_mobile_qry ? '@category(name: "recordQuery")' : "";
      let wherex = main_filter_exp?.trim() ? `where: ${main_filter_exp}, ` : "";
      let main_qry = `counter_main: ${object_name}(${wherex}first: 2000) ${mobilex} {edges{node{Id}}}`;
      let qry = `query ${object_name}{uiapi {query {
                ${main_qry}
                ${sub_qrys}
            }}}`;
      return qry;
    } catch (ex) {
      DQM.cpx(`queryAssembler() ex: ${ex.message}`);
      return "";
    }
  }

  static gqlQueryMaker(obj) {
    try {
      if (!DQM.isValidDataObject(obj)) return "";
      let main_filter_exp = DQM.mainFilterExpressionMaker(obj);
      let sub_filter_expressions_array =
        DQM.subFilterExpressionsArrayMaker(obj);
      let sub_qrys = DQM.subQueriesMaker(
        obj,
        main_filter_exp,
        sub_filter_expressions_array,
        true /*obj.is_mobile_qry*/
      );
      let final_qry = DQM.queryAssembler(
        obj.node.Object_Name__c.value,
        sub_qrys,
        main_filter_exp,
        true /*obj.is_mobile_qry*/
      );
      return final_qry;
    } catch (ex) {
      DQM.cpx(`gqlQueryMaker() ex: ${ex.message}`);
      return "";
    }
  }
}
