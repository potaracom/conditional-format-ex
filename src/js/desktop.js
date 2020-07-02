/* eslint-disable max-depth */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/*
 * New Condition Format plug-in
 * Copyright (c) 2016 Cybozu
 * https://developer.cybozu.io/hc/ja/articles/208236353
 *
 * Feature modified are following
 *  - Configure condition format priority
 *  - Add all field to format
 *  - Add Link style
 *  - Selectable multiple fields
 * Copyright (c) 2019 potara
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
  "use strict";

  var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG) {
    return false;
  }

  var RECORDS = [];

  var TEXT_ROW_NUM = Number(CONFIG.text_row_number);
  for (var t = 1; t < TEXT_ROW_NUM + 1; t++) {
    CONFIG["text_row" + t] = JSON.parse(CONFIG["text_row" + t]);
  }

  function changeFieldColor(el, color) {
    if (color) {
      el.style.color = color;
    }
  }

  function changeFieldBackgroundColor(el, backgroundcolor, event_type) {
    if (backgroundcolor) {
      el.style.backgroundColor = backgroundcolor;
    }
    if (event_type === "index") {
      el.style.borderBottom = "solid 1px #F5F5F5";
    }
  }

  function changeFieldFontSize(el, size) {
    if (size) {
      el.style.fontSize = size;
    } else {
      el.style.fontSize = "14px";
    }
  }

  function changeFieldStyle(el, font) {
    switch (font) {
      case "bold":
        el.style.fontWeight = font;
        el.style.textDecoration = "none";
        break;
      case "underline":
        el.style.fontWeight = "normal";
        el.style.textDecoration = font;
        break;
      case "line-through":
        el.style.fontWeight = "normal";
        el.style.textDecoration = font;
        break;
      case "link":
        el.style.cursor = "pointer";
        el.style.textDecoration = "underline";
        $(el)
          .find("a")
          .contents()
          .unwrap();
        $(el).on("click", function() {
          window.open($(el).text(), "_blank");
        });
        break;
      case "":
        el.style.fontWeight = "normal";
        el.style.textDecoration = "none";
        break;
    }
  }

  function changeFieldElement(el, row_obj, event_type) {
    changeFieldColor(el, row_obj.targetcolor);
    changeFieldBackgroundColor(el, row_obj.targetbgcolor, event_type);
    changeFieldFontSize(el, row_obj.targetsize);
    changeFieldStyle(el, row_obj.targetfont);
  }

  function checkTextConditionFormat(field, value, type) {
    var field_value = "";
    var condition_value = "";
    if (field && field.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
      if (type === "match" || type === "unmatch") {
        field_value = field;
      } else {
        field_value = Number(field);
      }
    } else {
      field_value = field;
    }

    // Change condition value format
    if (value && value.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
      if (type === "match" || type === "unmatch") {
        condition_value = value;
      } else {
        condition_value = Number(value);
      }
    } else {
      condition_value = value;
    }

    switch (type) {
      case "match":
        if (field_value.indexOf(condition_value) !== -1) {
          return true;
        }
        break;
      case "unmatch":
        if (field_value.indexOf(condition_value) === -1) {
          return true;
        }
        break;
      case "==":
        if (field_value === condition_value) {
          return true;
        }
        break;
      case "!=":
        if (field_value !== condition_value) {
          return true;
        }
        break;
      case "<=":
        if (field_value <= condition_value) {
          return true;
        }
        break;
      case "<":
        if (field_value < condition_value) {
          return true;
        }
        break;
      case ">=":
        if (field_value >= condition_value) {
          return true;
        }
        break;
      case ">":
        if (field_value > condition_value) {
          return true;
        }
        break;
      default:
        return false;
    }
    return false;
  }

  function checkDateConditionFormat(
    field,
    value,
    condition_type,
    condition_type2
  ) {
    if (!field) {
      return false;
    }

    // Change values format
    var num = Number(value);
    if (condition_type2 === "before") {
      num = -num;
    }

    var field_value = moment(field).format("YYYY-MM-DD 00:00");
    var condition_value = moment()
      .add(num, "days")
      .format("YYYY-MM-DD 00:00");
    var diff = moment(field_value).diff(moment(condition_value), "days");

    switch (condition_type) {
      case "==":
        if (diff === 0) {
          return true;
        }
        break;
      case "!=":
        if (diff !== 0) {
          return true;
        }
        break;
      case "<=":
        if (diff <= 0) {
          return true;
        }
        break;
      case "<":
        if (diff < 0) {
          return true;
        }
        break;
      case ">=":
        if (diff >= 0) {
          return true;
        }
        break;
      case ">":
        if (diff > 0) {
          return true;
        }
        break;
      default:
        return false;
    }
    return false;
  }

  function checkIndexConditionFormat(records) {
    var text_obj, el_text, field_obj, all_el_text;

    all_el_text = Object.keys(records[0])
      .map(function(fieldcode) {
        return kintone.app.getFieldElements(fieldcode);
      })
      .filter(function(el) {
        return el !== null;
      });

    for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
      text_obj = CONFIG["text_row" + ti];
      for (var tf = 0; tf < text_obj.targetfield.length; tf++) {
        var targetfield = text_obj.targetfield[tf];
        if (targetfield === "--detail--") {
          continue;
        }

        el_text = kintone.app.getFieldElements(targetfield);
        if (
          !el_text &&
          targetfield !== "--all--" &&
          targetfield !== "--list--"
        ) {
          continue;
        }

        var dataType = text_obj["data-type"];
        if (dataType === "text") {
          for (var tn = 0; tn < records.length; tn++) {
            field_obj = records[tn][text_obj.field];
            if (
              field_obj.type === "CHECK_BOX" ||
              field_obj.type === "MULTI_SELECT"
            ) {
              if (field_obj.value.length === 0) {
                field_obj.value[0] = "";
              }
              for (var i = 0; i < field_obj.value.length; i++) {
                if (
                  checkTextConditionFormat(
                    field_obj.value[i],
                    text_obj.value,
                    text_obj.type
                  )
                ) {
                  if (targetfield !== "--all--" && targetfield !== "--list--") {
                    changeFieldElement(el_text[tn], text_obj, "index");
                  } else {
                    for (var m = 0; m < all_el_text.length; m++) {
                      changeFieldElement(all_el_text[m][tn], text_obj, "index");
                    }
                  }
                }
              }
              continue;
            }
            if (
              checkTextConditionFormat(
                field_obj.value,
                text_obj.value,
                text_obj.type
              )
            ) {
              if (targetfield !== "--all--" && targetfield !== "--list--") {
                changeFieldElement(el_text[tn], text_obj, "index");
              } else {
                for (var m = 0; m < all_el_text.length; m++) {
                  changeFieldElement(all_el_text[m][tn], text_obj, "index");
                }
              }
            }
          }
        } else if (dataType === "date") {
          for (var dn = 0; dn < records.length; dn++) {
            field_obj = records[dn][text_obj.field];
            if (
              checkDateConditionFormat(
                field_obj.value,
                text_obj.value,
                text_obj.type,
                text_obj.type2
              )
            ) {
              if (targetfield !== "--all--" && targetfield !== "--list--") {
                changeFieldElement(el_text[dn], text_obj, "index");
              } else {
                for (var m = 0; m < all_el_text.length; m++) {
                  changeFieldElement(all_el_text[m][dn], text_obj, "index");
                }
              }
            }
          }
        }
      }
    }
  }

  function checkDetailConditionFormat(record) {
    var text_obj, el_text, field_obj, all_el_text;

    all_el_text = Object.keys(record)
      .map(function(fieldcode) {
        return kintone.app.record.getFieldElement(fieldcode);
      })
      .filter(function(el) {
        return el !== null;
      });

    for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
      text_obj = CONFIG["text_row" + ti];
      for (var tf = 0; tf < text_obj.targetfield.length; tf++) {
        var targetfield = text_obj.targetfield[tf];
        if (targetfield === "--list--") {
          continue;
        }

        el_text = kintone.app.record.getFieldElement(targetfield);
        if (
          !el_text &&
          targetfield !== "--all--" &&
          targetfield !== "--detail--"
        ) {
          continue;
        }

        var dataType = text_obj["data-type"];
        if (dataType === "text") {
          field_obj = record[text_obj.field];
          if (
            field_obj.type === "CHECK_BOX" ||
            field_obj.type === "MULTI_SELECT"
          ) {
            if (field_obj.value.length === 0) {
              field_obj.value[0] = "";
            }
            for (var i = 0; i < field_obj.value.length; i++) {
              if (
                checkTextConditionFormat(
                  field_obj.value[i],
                  text_obj.value,
                  text_obj.type
                )
              ) {
                if (targetfield !== "--all--" && targetfield !== "--detail--") {
                  changeFieldElement(el_text, text_obj, "detail");
                } else {
                  for (var m = 0; m < all_el_text.length; m++) {
                    changeFieldElement(all_el_text[m], text_obj, "detail");
                  }
                }
              }
            }
            continue;
          }
          if (
            checkTextConditionFormat(
              field_obj.value,
              text_obj.value,
              text_obj.type
            )
          ) {
            if (targetfield !== "--all--" && targetfield !== "--detail--") {
              changeFieldElement(el_text, text_obj, "detail");
            } else {
              for (var m = 0; m < all_el_text.length; m++) {
                changeFieldElement(all_el_text[m], text_obj, "detail");
              }
            }
          }
        } else if (dataType === "date") {
          field_obj = record[text_obj.field];
          if (
            checkDateConditionFormat(
              field_obj.value,
              text_obj.value,
              text_obj.type,
              text_obj.type2
            )
          ) {
            if (targetfield !== "--all--" && targetfield !== "--detail--") {
              changeFieldElement(el_text, text_obj, "detail");
            } else {
              for (var m = 0; m < all_el_text.length; m++) {
                changeFieldElement(all_el_text[m], text_obj, "detail");
              }
            }
          }
        }
      }
    }
  }

  kintone.events.on("app.record.index.show", function(event) {
    if (event.records.length <= 0) {
      return;
    }

    checkIndexConditionFormat(event.records);
    RECORDS = event.records;
  });

  kintone.events.on("app.record.index.delete.submit", function(event) {
    RECORDS = RECORDS.filter(function(record) {
      return record.$id.value != event.recordId;
    });
  });

  kintone.events.on("app.record.detail.show", function(event) {
    if (!event.record) {
      return;
    }
    checkDetailConditionFormat(event.record);
  });

  kintone.events.on("app.record.index.edit.submit.success", function(event) {
    if (!event.record) {
      return;
    }
    var index = -1;
    RECORDS.forEach(function(record, i) {
      if (record.$id.value === event.record.$id.value) {
        index = i;
      }
    });
    RECORDS[index] = event.record;
    setTimeout(function() {
      checkIndexConditionFormat(RECORDS);
    }, 10);

    return event;
  });
})(jQuery, kintone.$PLUGIN_ID);
