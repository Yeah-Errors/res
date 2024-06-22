// ==UserScript==
// @name         yeah_MOOC脚本
// @namespace    https://res.yeah666.com
// @version      2.1.3
// @description  慕课脚本，可以显示答案（题库），刷文档，做测试
// @author       yeah
// @icon         https://res.yeah666.com/img/logocore.png
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @connect      *
// @match        https://www.icourse163.org/learn/*
// @match        http://www.icourse163.org/learn/*
// @match        http://www.icourse163.org/spoc/learn/*
// @match        https://www.icourse163.org/spoc/learn/*
// @match        https://www.icourse163.org/mooc/*
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://lib.baomitu.com/jqueryui/1.13.2/jquery-ui.js
// @run-at       document-end
// @updateURL    https://res.yeah666.com/js/mooc_monkey_meta.js
// @downloadURL  https://res.yeah666.com/js/mooc_monkey.js
// ==/UserScript==

//答题前请配token
var sc_tk_token = GM_getValue("sc_tk_token", "");

(function () {
  $(sc_code);
  function sc_code() {
    "use strict";

    var elementHtml = `
                      <div class="script_window" id="script_window">
                          <div class="script_title">Yeah-MOOC脚本</div>
                          <div class="script_desc" id="script_desc">此脚本可以用来刷文档，显示答案，刷课程等</div>
                          <div class="script_but" id="sc_show_ans">显示答案</div>
                          <div class="script_but" id="sc_read_doc">刷文档</div>
                          <div class="script_but" id="sc_do_test">做测试</div>
                      </div>
                      <div class="script_window anspage" id="show_ans_page">
                            <div class="script_title" id="sc_back_menu">Yeah-显示答案</div>
                            <div class="script_desc" id="sc_log_info"></div>
                            <div class="ans_textarea" id="sc_ans_textarea"></div>
                        </div>
                  `;

    // 将元素插入至body
    $("body").append(elementHtml);

    // 追加样式到已有的 <style> 标签
    $("style").append(`
                      .script_window {
                          position: fixed;
                          top: 30vh;
                          right: 5vh;
                          height: 210px;
                          width: 160px;
                          background-color: rgba(200, 200, 200, 0.2);
                          z-index: 9999;
                          padding: 10px 10px 20px 10px;
                          border-radius: 10px;
                          text-align: center;
                          cursor:default;
                      }
                      .script_window:hover {
                          background-color: rgba(200, 200, 200, 0.4);
                      }
                      .script_title {
                          height: 25px;
                          line-height: 25px;
                          font-size: 20px;
                          margin-bottom: 10px;
                      }
                      .script_desc {
                          color: rgb(114, 114, 114);
                          font-size: 14px;
                          height: 50px;
                      }
                      .script_but {
                          height: 30px;
                          line-height: 30px;
                          border-radius: 15px;
                          margin: 5px 0px;
                          cursor: pointer;
                      }
                      .script_but:hover {
                          background-color: #ffffffaa;
                      }
                      .anspage {
                        display:none;
                        width: 240px;
                        height: auto;
                        max-height: 360px;
                      }
                      .ans_textarea {
                        text-align: left;
                        padding-left: 8px;
                        max-height: 260px;
                        overflow: auto;
                        padding-right: 4px;
                        word-wrap: break-word;
                        word-break: break-all;
                      }
                      .ans_textarea::-webkit-scrollbar:horizontal {
                        display: none;
                      }
                      .ans_textarea::-webkit-scrollbar {
                        width: 4px;
                      }
  
                      .ans_textarea::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.5);
                        border-radius: 4px;
                      }
  
                      .ans_textarea::-webkit-scrollbar-track {
                        background-color: rgba(114, 114, 114, 0.1);
                        border-radius: 4px;
                      }
                      .sc_ans {
                        color: red;
                        border-bottom: 1px dotted rgba(114, 114, 114, 0.3);
                        font-size:16px;
                      }
                      #sc_back_menu {
                        cursor: pointer;
                      }
                  `);
    $("#script_window").draggable();
    $("#show_ans_page").draggable();
    $("#sc_show_ans").click(sc_showAns);
    $("#sc_read_doc").click(sc_read_document);
    $("#sc_do_test").click(sc_do_test);
    $("#sc_back_menu").click(() => {
      if(confirm("返回菜单主界面？搜索记录将被清空!!!")){
      $("#script_window").show();
      $("#show_ans_page").hide();
      }
    });
    function sc_showAns() {
      if (
        sc_tk_token == `` ||
        sc_tk_token == null ||
        sc_tk_token == undefined
      ) {
        $("#script_desc").text("未配置token，请配置token后重试");
        sc_tk_token = prompt("未配置token，请设置题库token值:");
        GM_setValue("sc_tk_token", sc_tk_token);
        $("#script_desc").text(`token配置成功:${sc_tk_token}`);
        return;
      }
      alert(
        "已进入，答案显示模式，带有图片的题目可能会搜索不完全，使用时请授权跨域跨域请求权限，否则题目搜索将不可用！"
      );
      $("#script_window").hide();
      $("#show_ans_page").show();
      $("#sc_log_info").text(
        "当前状态：显示答案,答案不一定正确，需配置题库信息！"
      );
      $("#sc_ans_textarea").empty();
      //获取题目
      let questionsHTML =
        document.querySelector(".j-list").children[0].children;
      let sc_questions = [];
      //解析题目并存储
      $("#sc_log_info").text("正在解析题目");
      for (let tempVar of questionsHTML) {
        tempVar = tempVar.textContent;
        let parseOut = "";
        try {
          parseOut = tempVar
            .substring(tempVar.indexOf("分)") + 2, tempVar.indexOf("得分"))
            .trim();
          //移除控制字符等无效字符
          var unwantedChars =
            /[\u200B\u200C\u200D\u200E\u200F\u0000\uFFFD\u000B\u000C\u2060\u2028\u2029]/g;
          parseOut = parseOut.replace(unwantedChars, "");
        } catch (error) {}
        sc_questions.push(parseOut);
      }
      $("#sc_log_info").text("解析题目完成");
      //处理每一道题，并显示答案
      let searchIndex = 0;

      var sc_IntervalId = setInterval(() => {
        try {
          if (searchIndex < sc_questions.length) {
            $("#sc_log_info").text(`正在处理第${searchIndex + 1}题`);
            let sc_question = sc_questions[searchIndex++];

            let sc_result = "结果为：";
            if (sc_question != "") {
              GM_xmlhttpRequest({
                method: "GET",
                url: "https://q.icodef.com/api/v1/q/" + encodeURI(sc_question),
                headers: {
                  "Content-type": "application/x-www-form-urlencoded",
                  Authorization: `${sc_tk_token}`,
                },
                timeout: 2000,
                onload: (res) => {
                  try {
                    let sc_response = JSON.parse(res.response);
                    let sc_response_data = sc_response.data;
                    sc_question = sc_response_data.question;
                    let sc_correct = sc_response_data.correct;
                    for (let sc_varTemp of sc_correct) {
                      sc_result += `${sc_varTemp.option} : ${sc_varTemp.content};`;
                    }
                    $("#sc_ans_textarea").append(
                      $(
                        `<div>${searchIndex}.${sc_question}</div><div class='sc_ans'>${sc_result}</div>`
                      )
                    );
                  } catch (err) {
                    $("#sc_ans_textarea").append(
                      $(
                        `<div>${searchIndex}.${sc_question}</div><div class='sc_ans'>${sc_result}</div>`
                      )
                    );
                  }
                },
                onerror: () => {
                  sc_result += "未找到该题目";
                  $("#sc_ans_textarea").append(
                    $(
                      `<div>${searchIndex}.${sc_question}</div><div class='sc_ans'>${sc_result}</div>`
                    )
                  );
                },
              });
            } else {
              $("#sc_log_info").text("全部题目解答完成");
            }
          }
        } catch (err) {
          $("#sc_log_info").text(
            `处理第${searchIndex}时发生异常,异常内容以输出至终端`
          );
          console.error(err);
        }
      }, 2000);
    }
    function sc_read_document() {
      alert("正在做了...");
    }
    function sc_do_test() {
      alert("正在做了...");
    }
  }

  // Your code here...
})();
