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
 * Copyright (c) 2019 potara
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
  "use strict";

  var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

  var TEXT_ROW_NUM = Number(CONF.text_row_number);
  for (var t = 1; t < TEXT_ROW_NUM + 1; t++) {
    CONF["text_row" + t] = JSON.parse(CONF["text_row" + t]);
  }

  function getDataType($tr) {
    var dataType = $tr
      .find(".cf-plugin-column1 option:selected")
      .attr("data-type");

    return dataType;
  }

  var defaultColorPickerConfig = {
    opacity: false,
    doRender: false,
    buildCallback: function($elm) {
      $elm.addClass("kintone-ui");

      var colorInstance = this.color;
      var colorPicker = this;

      $elm
        .prepend(
          '<div class="cp-panel">' +
            '<div><label>R</label> <input type="number" max="255" min="0" class="cp-r" /></div>' +
            '<div><label>G</label> <input type="number" max="255" min="0" class="cp-g" /></div>' +
            '<div><label>B</label> <input type="number" max="255" min="0" class="cp-b" /></div>' +
            "<hr>" +
            '<div><label>H</label> <input type="number" max="360" min="0" class="cp-h" /></div>' +
            '<div><label>S</label> <input type="number" max="100" min="0" class="cp-s" /></div>' +
            '<div><label>V</label> <input type="number" max="100" min="0" class="cp-v" /></div>' +
            "</div>"
        )
        .on("change", "input", function(e) {
          var value = this.value,
            className = this.className,
            type = className.split("-")[1],
            color = {};

          color[type] = value;
          colorInstance.setColor(
            type === "HEX" ? value : color,
            type === "HEX" ? "HEX" : /(?:r|g|b)/.test(type) ? "rgb" : "hsv"
          );
          colorPicker.render();
        });

      var buttons = $elm.append(
        '<div class="cp-disp">' +
          '<button type="button" id="cp-submit">OK</button>' +
          '<button type="button" id="cp-cancel">Cancel</button>' +
          "</div>"
      );

      buttons.on("click", "#cp-submit", function(e) {
        var colorCode = "#" + colorPicker.color.colors.HEX;

        $elm.css("border-bottom-color", colorCode);
        $elm.attr("value", colorCode);

        var $el = colorPicker.$trigger.parent("div").find('input[type="text"]');
        $el.val(colorCode);

        if ($el.hasClass("cf-plugin-column6")) {
          $el.css("background-color", colorCode);
        }

        if ($el.hasClass("cf-plugin-column5")) {
          $el.css("color", colorCode);
        }

        colorPicker.$trigger.css("border-bottom-color", colorCode);
        colorPicker.toggle(false);
      });

      buttons.on("click", "#cp-cancel", function(e) {
        colorPicker.toggle(false);
      });
    },
    renderCallback: function($elm, toggled) {
      var colors = this.color.colors.RND;
      var colorCode = "#" + this.color.colors.HEX;

      var modes = {
        r: colors.rgb.r,
        g: colors.rgb.g,
        b: colors.rgb.b,
        h: colors.hsv.h,
        s: colors.hsv.s,
        v: colors.hsv.v,
        HEX: colorCode
      };

      $("input", ".cp-panel").each(function() {
        this.value = modes[this.className.substr(3)];
      });

      this.$trigger = $elm;
    },
    positionCallback: function($elm) {
      this.color.setColor($elm.attr("value"));
    }
  };

  $(document).ready(function() {
    var terms = {
      ja: {
        cf_text_title: "文字条件書式",
        cf_date_title: "日付条件書式",
        cf_text_column1: "書式条件フィールド",
        cf_text_column2: "条件式",
        cf_text_column3: "条件値",
        cf_text_column4: "書式変更フィールド",
        cf_text_column5: "文字色",
        cf_text_column6: "背景色",
        cf_text_column7: "文字サイズ",
        cf_text_column8: "文字装飾",
        cf_status_option: "ステータス(プロセス管理)",
        cf_text_column2_option1: "条件値を含む",
        cf_text_column2_option2: "条件値を含まない",
        cf_text_column2_option3: "=(等しい)",
        cf_text_column2_option4: "≠(等しくない)",
        cf_text_column2_option5: "≦(以下)",
        cf_text_column2_option6: "<(より小さい)",
        cf_text_column2_option7: "≧(以上)",
        cf_text_column2_option8: ">(より大きい)",
        cf_text_column4_option1: "全フィールド",
        cf_text_column7_option1: "変更なし",
        cf_text_column7_option2: "小さい",
        cf_text_column7_option3: "やや小さい",
        cf_text_column7_option4: "やや大きい",
        cf_text_column7_option5: "大きい",
        cf_text_column8_option1: "変更なし",
        cf_text_column8_option2: "太字",
        cf_text_column8_option3: "下線",
        cf_text_column8_option4: "打ち消し線",
        cf_text_column8_option5: "リンク",
        cf_date_column2_desc1: "今日から",
        cf_date_column2_desc2: "日",
        cf_date_column2_option1: "=(等しい)",
        cf_date_column2_option2: "≠(等しくない)",
        cf_date_column2_option3: "≦(以前)",
        cf_date_column2_option4: "<(より前)",
        cf_date_column2_option5: "≧(以後)",
        cf_date_column2_option6: ">(より後)",
        cf_date_column3_option1: "前",
        cf_date_column3_option2: "後",
        cf_plugin_submit: "     保存   ",
        cf_plugin_cancel: "  キャンセル   ",
        cf_required_field: "必須項目が入力されていません。"
      },
      en: {
        cf_text_title: "Text Format Conditions",
        cf_date_title: "Date Format Conditions",
        cf_text_column1: "Field with condition",
        cf_text_column2: "Condition",
        cf_text_column3: "Value",
        cf_text_column4: "Field to format",
        cf_text_column5: "Font Color",
        cf_text_column6: "Background Color",
        cf_text_column7: "Font Size",
        cf_text_column8: "Style",
        cf_status_option: "Status(Process Management)",
        cf_text_column2_option1: "includes",
        cf_text_column2_option2: "doesn't include",
        cf_text_column2_option3: "= (equal to)",
        cf_text_column2_option4: "≠ (doesn't equal)",
        cf_text_column2_option5: "≦ (equal or less)",
        cf_text_column2_option6: "< (less than)",
        cf_text_column2_option7: "≧ (equal or greater)",
        cf_text_column2_option8: "> (greater than)",
        cf_text_column4_option1: "All Fields",
        cf_text_column7_option1: "Normal",
        cf_text_column7_option2: "Very Small",
        cf_text_column7_option3: "Small",
        cf_text_column7_option4: "Large",
        cf_text_column7_option5: "Very Large",
        cf_text_column8_option1: "Normal",
        cf_text_column8_option2: "Bold",
        cf_text_column8_option3: "Underline",
        cf_text_column8_option4: "Strikethrough",
        cf_text_column8_option5: "Link",
        cf_date_column2_desc1: "",
        cf_date_column2_desc2: "days",
        cf_date_column2_option1: "= (equal to)",
        cf_date_column2_option2: "≠ (doesn't equal)",
        cf_date_column2_option3: "≦ (equal or less)",
        cf_date_column2_option4: "< (less than)",
        cf_date_column2_option5: "≧ (equal or greater)",
        cf_date_column2_option6: "> (greater than)",
        cf_date_column3_option1: "before today",
        cf_date_column3_option2: "after today",
        cf_plugin_submit: "     Save   ",
        cf_plugin_cancel: "  Cancel   ",
        cf_required_field: "Required field is empty."
      },
      zh: {
        cf_text_title: "文字条件格式",
        cf_date_title: "日期条件格式",
        cf_text_column1: "条件字段",
        cf_text_column2: "条件公式",
        cf_text_column3: "条件值",
        cf_text_column4: "要更改格式的字段",
        cf_text_column5: "字体颜色",
        cf_text_column6: "背景色",
        cf_text_column7: "文字大小",
        cf_text_column8: "字体装饰",
        cf_status_option: "状态(流程管理)",
        cf_text_column2_option1: "包含条件值",
        cf_text_column2_option2: "不包含条件值",
        cf_text_column2_option3: "=(等于)",
        cf_text_column2_option4: "≠(不等于)",
        cf_text_column2_option5: "≦(小于或等于)",
        cf_text_column2_option6: "<(小于)",
        cf_text_column2_option7: "≧(大于或等于)",
        cf_text_column2_option8: ">(大于)",
        cf_text_column4_option1: "全部",
        cf_text_column7_option1: "不更改",
        cf_text_column7_option2: "小",
        cf_text_column7_option3: "稍小",
        cf_text_column7_option4: "稍大",
        cf_text_column7_option5: "大",
        cf_text_column8_option1: "不更改",
        cf_text_column8_option2: "粗体",
        cf_text_column8_option3: "下划线",
        cf_text_column8_option4: "删除线",
        cf_text_column8_option5: "链接",
        cf_date_column2_desc1: "今日起",
        cf_date_column2_desc2: "天",
        cf_date_column2_option1: "=(等于)",
        cf_date_column2_option2: "≠(不等于)",
        cf_date_column2_option3: "≦(以前)",
        cf_date_column2_option4: "<(早于)",
        cf_date_column2_option5: "≧(以后)",
        cf_date_column2_option6: ">(晚于)",
        cf_date_column3_option1: "前",
        cf_date_column3_option2: "后",
        cf_plugin_submit: "     保存   ",
        cf_plugin_cancel: "  取消   ",
        cf_required_field: "有必填项未填写。"
      }
    };

    // To switch the display by the login user's language (English display in the case of Chinese)
    var lang = kintone.getLoginUser().language;
    var i18n = lang in terms ? terms[lang] : terms.en;

    var configHtml = $("#cf-plugin").html();
    var tmpl = $.templates(configHtml);
    $("div#cf-plugin").html(tmpl.render({ terms: i18n }));

    function escapeHtml(htmlstr) {
      return htmlstr
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function checkRowNumber() {
      if ($("#cf-plugin-text-tbody > tr").length === 2) {
        $("#cf-plugin-text-tbody > tr .removeList")
          .eq(1)
          .hide();
      } else {
        $("#cf-plugin-text-tbody > tr .removeList")
          .eq(1)
          .show();
      }
    }

    function setTextDefault() {
      for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
        $("#cf-plugin-text-tbody > tr")
          .eq(0)
          .clone(true)
          .insertAfter($("#cf-plugin-text-tbody > tr").eq(ti - 1));

        var $tr = $("#cf-plugin-text-tbody > tr:eq(" + ti + ")");
        var row = "text_row" + ti;
        $tr
          .find(".cf-plugin-column1")
          .val(CONF[row].field)
          .change();

        var dataType = getDataType($tr);
        if (dataType === "text") {
          $tr.find(".cf-plugin-column2-text").val(CONF[row].type);
          $tr.find(".cf-plugin-column3-text").val(CONF[row].value);
        } else if (dataType === "date") {
          $tr.find(".cf-plugin-column2-date").val(CONF[row].type);
          $tr.find(".cf-plugin-column3-date").val(CONF[row].value);
          $tr.find(".cf-plugin-column3-date-select2").val(CONF[row].type2);
        }

        $tr.find(".cf-plugin-column4").val(CONF[row].targetfield);
        $tr.find(".cf-plugin-column5").val(CONF[row].targetcolor);
        $tr.find(".cf-plugin-column6").val(CONF[row].targetbgcolor);
        $tr.find(".cf-plugin-column7").val(CONF[row].targetsize);
        $tr.find(".cf-plugin-column8").val(CONF[row].targetfont);
        $tr.find(".cf-plugin-column5").css("color", CONF[row].targetcolor);
        $tr
          .find(".cf-plugin-column6")
          .css("background-color", CONF[row].targetbgcolor);

        $tr
          .find(".cf-plugin-column5-td i")
          .css("border-bottom-color", CONF[row].targetcolor)
          .attr("value", CONF[row].targetcolor);

        var $bgColorPicker = $tr.find(".cf-plugin-column6-td i");
        $bgColorPicker.css("border-bottom-color", CONF[row].targetbgcolor);
        if (CONF[row].targetbgcolor !== "#") {
          $bgColorPicker.attr("value", CONF[row].targetbgcolor);
        } else {
          $bgColorPicker.attr("value", "#808080");
        }
      }
    }

    function setDefault() {
      if (TEXT_ROW_NUM > 0) {
        setTextDefault();
      } else {
        // Insert Row
        $("#cf-plugin-text-tbody > tr")
          .eq(0)
          .clone(true)
          .insertAfter($("#cf-plugin-text-tbody > tr"))
          .eq(0);
      }
      checkRowNumber();
    }

    function setDropdown() {
      var param = { app: kintone.app.getId() };
      kintone.api(
        kintone.api.url("/k/v1/preview/app/form/fields", true),
        "GET",
        param,
        function(resp) {
          for (var key in resp.properties) {
            if (!resp.properties.hasOwnProperty(key)) {
              continue;
            }
            var prop = resp.properties[key];
            var $option = $("<option>");

            switch (prop.type) {
              case "SINGLE_LINE_TEXT":
              case "NUMBER":
              case "CALC":
              case "RADIO_BUTTON":
              case "DROP_DOWN":
              case "RECORD_NUMBER":
              case "MULTI_LINE_TEXT":
              case "CHECK_BOX":
              case "MULTI_SELECT":
                $option.attr("value", escapeHtml(prop.code));
                $option.attr("data-type", "text");
                $option.text(escapeHtml(prop.label));
                $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1").append(
                  $option.clone()
                );
                $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4").append(
                  $option.clone()
                );
                break;

              case "DATE":
              case "DATETIME":
              case "CREATED_TIME":
              case "UPDATED_TIME":
                $option.attr("value", escapeHtml(prop.code));
                $option.attr("data-type", "date");
                $option.text(escapeHtml(prop.label));
                $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1").append(
                  $option.clone()
                );
                $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4").append(
                  $option.clone()
                );
                break;

              case "STATUS":
                if (prop.enabled) {
                  $option.attr("value", escapeHtml(prop.code));
                  $option.attr("data-type", "text");
                  $option.text(terms[lang].cf_status_option);
                  $(
                    "#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1"
                  ).append($option.clone());
                  $(
                    "#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4"
                  ).append($option.clone());
                }
                break;
              default:
                break;
            }
          }

          setDefault();
        }
      );
    }

    // Change color
    $(".cf-plugin-column5").change(function() {
      var $el = $(this);

      $el.css("color", $(this).val());
      $el
        .parent("div")
        .find("i")
        .css("border-bottom-color", $(this).val());

      return true;
    });

    // Change backgroundcolor
    $(".cf-plugin-column6").change(function() {
      var $el = $(this);

      $el.css("background-color", $(this).val());
      $el
        .parent("div")
        .find("i")
        .css("border-bottom-color", $(this).val());

      return true;
    });

    $(".cf-plugin-column5, .cf-plugin-column6").bind("paste", function(event) {
      var $el = $(this);
      $el.attr("maxLength", "50");
      setTimeout(function() {
        var val = $el.val();
        $el.attr("maxLength", "7");
        $el.val(val.replace(/\s/g, ""));
        $el.trigger("change");
      });
    });

    // Color Picker
    var $colorPicker = $(".color-paint-brush").colorPicker(
      defaultColorPickerConfig
    );

    $(document).keyup(function(event) {
      var TAB_KEY_CODE = 9;
      var ENTER_KEY_CODE = 13;
      var ESC_KEY_CODE = 27;
      if (
        event.keyCode === TAB_KEY_CODE ||
        event.keyCode === ENTER_KEY_CODE ||
        event.keyCode === ESC_KEY_CODE
      ) {
        $colorPicker.colorPicker.toggle(false);
      }
    });

    // Add Row
    $("#cf-plugin-text-tbody .addList").click(function() {
      $("#cf-plugin-text-tbody > tr")
        .eq(0)
        .clone(true)
        .insertAfter(
          $(this)
            .parent()
            .parent()
        );
      checkRowNumber();
    });

    // Remove Row
    $(".removeList").click(function() {
      $(this)
        .parent("td")
        .parent("tr")
        .remove();
      checkRowNumber();
    });

    function createErrorMessage(type, error_num, row_num) {
      var user_lang = kintone.getLoginUser().language;
      var error_messages = {
        ja: {
          text: {
            "1":
              "文字条件書式の" +
              row_num +
              "行目の必須入力項目を入力してください",
            "2":
              "文字条件書式の" +
              row_num +
              "行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください",
            "3":
              "文字条件書式の" +
              row_num +
              "行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください",
            "4":
              "文字条件書式の" +
              row_num +
              "行目の条件値または色に\n" +
              "HTML特殊文字(&, <, >, \", ')を入力することはできません"
          },
          date: {
            "1":
              "日付条件書式の" +
              row_num +
              "行目の必須入力項目を入力してください",
            "2":
              "日付条件書式の" +
              row_num +
              "行目の条件値には\n半角数字を入力してください",
            "3":
              "日付条件書式の" +
              row_num +
              "行目の条件値には\n整数を入力してください",
            "4":
              "日付条件書式の" +
              row_num +
              "行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください",
            "5":
              "日付条件書式の" +
              row_num +
              "行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください",
            "6":
              "日付条件書式の" +
              row_num +
              "行目の条件値または色に\nHTML特殊文字(&, <, >, \", ')を入力することはできません"
          }
        },
        en: {
          text: {
            "1":
              "Required fields for Text Format Conditions row " +
              row_num +
              " are empty.",
            "2":
              'Input "#000000 ~ #FFFFFF" for Font Color in Text Format Conditions row ' +
              row_num +
              ".",
            "3":
              'Input "#000000 ~ #FFFFFF" for Background Color in Text Format Conditions row ' +
              row_num +
              ".",
            "4":
              "Text Format Conditions row " +
              row_num +
              " includes HTML Characters."
          },
          date: {
            "1":
              "Required fields for Date Format Conditions row " +
              row_num +
              " are empty.",
            "2":
              "Input integers for Value of Date Format Conditions row " +
              row_num +
              ".",
            "3":
              "Input integers for Value of Date Format Conditions row " +
              row_num +
              ".",
            "4":
              'Input "#000000 ~ #FFFFFF" for Font Color of Date Format Conditions row ' +
              row_num +
              ".",
            "5":
              'Input "#000000 ~ #FFFFFF" for Background Color of Date Format Conditions row ' +
              row_num +
              ".",
            "6":
              "Date Format Conditions row " +
              row_num +
              " includes HTML Characters."
          }
        },
        zh: {
          text: {
            "1": "文字条件格式的第" + row_num + "行有必填项未填写",
            "2":
              "文字条件格式的第" +
              row_num +
              "行的字体颜色框中\n请输入颜色代码[#000000-#FFFFFF]",
            "3":
              "文字条件格式的第" +
              row_num +
              "行的背景色框中\n请输入颜色代码[#000000-#FFFFFF]",
            "4":
              "文字条件格式的第" +
              row_num +
              "行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, \", ')"
          },
          date: {
            "1": "日期条件格式的第" + row_num + "行有必填项未填写",
            "2": "日期条件格式的第" + row_num + "行的条件值\n仅可输入半角数字",
            "3": "日期条件格式的第" + row_num + "行的条件值\n仅可输入整数",
            "4":
              "日期条件格式的第" +
              row_num +
              "行的字体颜色\n请输入颜色代码[#000000-#FFFFFF]",
            "5":
              "日期条件格式的第" +
              row_num +
              "行的背景色\n请输入颜色代码[#000000-#FFFFFF]",
            "6":
              "日期条件格式的第" +
              row_num +
              "行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, \", ')"
          }
        }
      };

      if (!error_messages[user_lang]) {
        user_lang = "en";
      }

      return error_messages[user_lang][type][error_num];
    }

    function checkConfigTextValues(config) {
      var text_row_num = Number(config.text_row_number);
      for (var ct = 1; ct <= text_row_num; ct++) {
        var text = JSON.parse(config["text_row" + ct]);
        if (text["data-type"] === "text") {
          if (!text.field || !text.type || !text.targetfield) {
            throw new Error(createErrorMessage("text", "1", ct));
          }

          if (text.targetcolor.slice(0, 1) !== "#") {
            throw new Error(createErrorMessage("text", "2", ct));
          }

          if (text.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
            if (text.targetcolor !== "#000000") {
              throw new Error(createErrorMessage("text", "2", ct));
            }
          }

          if (text.targetbgcolor.slice(0, 1) !== "#") {
            throw new Error(createErrorMessage("text", "3", ct));
          }

          if (text.targetbgcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
            if (text.targetbgcolor !== "#") {
              throw new Error(createErrorMessage("text", "3", ct));
            }
          }
          if (
            text.value.match(/&|<|>|"|'/g) !== null ||
            text.targetcolor.match(/&|<|>|"|'/g) !== null ||
            text.targetbgcolor.match(/&|<|>|"|'/g) !== null
          ) {
            throw new Error(createErrorMessage("text", "4", ct));
          }
        } else if (text["data-type"] === "date") {
          var date = text;
          if (!date.field || !date.type || !date.targetfield || !date.value) {
            throw new Error(createErrorMessage("date", "1", ct));
          }
          if (isNaN(date.value)) {
            throw new Error(createErrorMessage("date", "2", ct));
          }
          if (date.value.indexOf(".") > -1) {
            throw new Error(createErrorMessage("date", "3", ct));
          }
          if (date.targetcolor.slice(0, 1) !== "#") {
            throw new Error(createErrorMessage("date", "4", ct));
          }
          if (date.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
            if (date.targetcolor !== "#000000") {
              throw new Error(createErrorMessage("date", "4", ct));
            }
          }
          if (date.targetbgcolor.slice(0, 1) !== "#") {
            throw new Error(createErrorMessage("date", "5", ct));
          }
          if (date.targetbgcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
            if (date.targetbgcolor !== "#") {
              throw new Error(createErrorMessage("date", "5", ct));
            }
          }
          if (
            date.value.match(/&|<|>|"|'/g) !== null ||
            date.targetcolor.match(/&|<|>|"|'/g) !== null ||
            date.targetbgcolor.match(/&|<|>|"|'/g) !== null
          ) {
            throw new Error(createErrorMessage("date", "6", ct));
          }
        }
      }
    }

    function getValues(dataType, $tr) {
      var config = {
        "data-type": dataType,
        field: $tr.find(".cf-plugin-column1").val(),
        targetfield: $tr.find(".cf-plugin-column4").val(),
        targetcolor: $tr.find(".cf-plugin-column5").val(),
        targetbgcolor: $tr.find(".cf-plugin-column6").val(),
        targetsize: $tr.find(".cf-plugin-column7").val(),
        targetfont: $tr.find(".cf-plugin-column8").val()
      };

      if (dataType === "text") {
        config.type = $tr.find(".cf-plugin-column2-text").val();
        config.value = $tr
          .find(".cf-plugin-column3-text")
          .val()
          .toString();
      } else if ((dataType = "date")) {
        config.type = $tr.find(".cf-plugin-column2-date").val();
        config.value = $tr
          .find(".cf-plugin-column3-date")
          .val()
          .toString();
        config.type2 = $tr.find(".cf-plugin-column3-date-select2").val();
      }

      return config;
    }

    function createConfig() {
      var config = {};
      var text_row_num = $("#cf-plugin-text-tbody > tr").length - 1;
      for (var ct = 1; ct <= text_row_num; ct++) {
        var $tr = $("#cf-plugin-text-tbody > tr:eq(" + ct + ")");
        var dataType = getDataType($tr);

        var text = getValues(dataType, $tr);
        if (text.field === "" && text.type === "" && text.targetfield === "") {
          // Remove unnecessary row
          $("#cf-plugin-text-tbody > tr:eq(" + ct + ")").remove();
          text_row_num -= 1;
          ct--;
          continue;
        }
        config["text_row" + ct] = JSON.stringify(text);
      }
      config.text_row_number = String(text_row_num);
      return config;
    }

    $("select.cf-plugin-column1").on("change", function(e) {
      var $tr = $(this).closest("tr");
      var type = $("option:selected", this).attr("data-type");
      if (type === "text") {
        $tr.find(".cf-plugin-integration-text").removeClass("hide");
        $tr.find(".cf-plugin-integration-date").addClass("hide");
      } else if (type === "date") {
        $tr.find(".cf-plugin-integration-text").addClass("hide");
        $tr.find(".cf-plugin-integration-date").removeClass("hide");
      } else {
        // 初期値（未選択）の場合
        $tr.find(".cf-plugin-integration-text").addClass("hide");
        $tr.find(".cf-plugin-integration-date").addClass("hide");
      }
    });

    // Save
    $("#cf-submit").click(function() {
      try {
        var config = createConfig();
        checkConfigTextValues(config);
        kintone.plugin.app.setConfig(config);
      } catch (error) {
        alert(error.message);
      }
    });

    // Cancel
    $("#cf-cancel").click(function() {
      window.history.back();
    });
    setDropdown();
  });
})(jQuery, kintone.$PLUGIN_ID);
