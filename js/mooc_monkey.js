// ==UserScript==
// @name         Yeah_学习脚本
// @namespace    https://res.yeah666.com
// @version      4.0
// @description  慕课,头歌脚本，可以显示答案（需要配置题库),一键互评,间接解除头歌禁止复制
// @author       Yeah
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
// @match        https://www.educoder.net/tasks/*
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://lib.baomitu.com/jqueryui/1.13.2/jquery-ui.js
// @run-at       document-end
// @downloadURL  https://res.yeah666.com/js/mooc_monkey.js
// @updateURL    https://res.yeah666.com/js/mooc_monkey_meta.js
// ==/UserScript==

(function () {
  var currentUrl = window.location.href;
  var baseStyle = `
     .script_window {
         position: fixed;
         top: 30vh;
         right: 5vh;
         height: auto;
         max-height:240px;
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
         cursor: pointer;
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
     }`;
  $("style").append(baseStyle);

  if (currentUrl.includes("icourse163")) {
    //获取基础配置信息
    var sc_tk_token = GM_getValue("sc_tk_token", "");
    var sc_judge_count = GM_getValue("sc_judge_count", "5");
    var sc_judge_mode = GM_getValue("sc_judge_mode", "1");
    var sc_judge_sorce = GM_getValue("sc_judge_sorce", "0");
    var sc_judge_msg = GM_getValue("sc_judge_msg", ["好", "good", "1"]);
    $(sc_code);
    function sc_code() {
      "use strict";

      var elementHtml = `
    <div class="script_window sc_scroll_ui" id="script_window_main">
      <div class="script_title">Yeah-MOOC脚本</div>
      <div class="script_desc sc_scroll_ui" id="script_desc">
        此脚本可以用来显示测试答案，一键互评，一键阅读文档（暂不支持）等
      </div>
      <div class="script_but" id="sc_show_ans">显示答案</div>
      <div class="script_but" id="sc_do_judge">一键互评</div>
      <div class="script_but" id="sc_do_test">做测试</div>
      <div class="script_but" id="sc_config">脚本设置</div>
    </div>
    <div class="script_window anspage" id="show_ans_page">
      <div class="script_title" id="sc_back_menu">Yeah-显示答案</div>
      <div class="script_desc sc_scroll_ui" id="sc_log_info"></div>
      <div class="ans_textarea sc_scroll_ui" id="sc_ans_textarea"></div>
    </div>
    <div class="script_window sc_scroll_ui" id="script_setting">
      <div class="script_title">Yeah-脚本设置</div>
      <div class="script_desc " id="script_setting_info">
        脚本设置页，双击此处可显示其帮助信息<br />
        设置完成后双击标题（脚本设置）即可保存关闭
      </div>
      <table class="sc_scroll_ui" id="script_setting_body">
        <tr class="script_setting_node">
          <td id="sc_conf_tk_token_title">题库token:</td>
          <td>
            <input
              type="text"
              name=""
              id="sc_conf_tk_token_value"
              placeholder="输入题库token"
            />
          </td>
        </tr>
        <tr class="script_setting_node">
          <td id="sc_conf_judge_count_title">每次互评作业量:</td>
          <td>
            <input
              type="number"
              id="sc_conf_judge_count_value"
              value="5"
              max="30"
              min="1"
            />
          </td>
        </tr>
        <tr class="script_setting_node">
          <td id="sc_conf_judge_mode_title">互评模式:</td>
          <td>
            <select id="sc_conf_judge_mode_value">
              <option>---请选择---</option>
              <option value="1">固定分数</option>
              <option value="2">随机分数</option>
            </select>
          </td>
        </tr>
        <tr class="script_setting_node">
          <td id="sc_conf_judge_sorce_title">互评分数</td>
          <td>
            <input
              type="number"
              name=""
              id="sc_conf_judge_sorce_value"
              min="-1"
            />
          </td>
        </tr>
        <tr class="script_setting_node">
          <td>互评评语:</td>
          <td><input type="text" id="sc_conf_judge_msg" /></td>
        </tr>
      </table>
      </div>
                  `;
      // 将元素插入至body
      $("body").append(elementHtml);

      // 追加样式到已有的 <style> 标签
      $("style").append(`
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
                      }
                      .sc_scroll_ui{
                        overflow: auto;
                        padding-right: 4px;
                        word-wrap: break-word;
                        word-break: break-all;
                      }
                      .sc_scroll_ui::-webkit-scrollbar:horizontal {
                        display: none;
                      }
                      .sc_scroll_ui::-webkit-scrollbar {
                        width: 4px;
                      }
  
                      .sc_scroll_ui::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.5);
                        border-radius: 4px;
                      }
  
                      .sc_scroll_ui::-webkit-scrollbar-track {
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
                      #script_setting {
                        display:none;
                        width: max-content;
                      }
                      .script_setting_node {
                        height: 30px;
                        margin: 5px 5px;
                      }
                      .script_window input,
                      select {
                        outline: none;
                        width: 150px;
                        height: 25px;
                        margin-left: 20px;
                        background-color: rgba(211, 211, 211, 0.3);
                        border: none;
                        border-radius: 5px;
                      }
                      .script_window input:focus,
                      select:focus {
                        background: whitesmoke;
                      } 
                  `);
      //设置窗口可移动
      $("#script_window_main").draggable();
      $("#show_ans_page").draggable();
      $("#script_setting").draggable();
      //主菜单跳转
      $("#sc_show_ans").click(sc_showAns);
      $("#sc_do_test").click(sc_do_test);
      $("#sc_config").click(sc_setting);
      $("#sc_back_menu").dblclick(() => {
        if (confirm("返回菜单主界面？搜索记录将被清空!!!")) {
          $("#script_window_main").show();
          $("#show_ans_page").hide();
        }
      });
      let sc_set_token = () => {
        let sc_tokenTemp = prompt(`当前token值为${sc_tk_token},请填写新的token(token获取地址：https://q.icodef.com/)`);
        if (sc_tokenTemp == null || sc_tokenTemp == "") {
          $("#script_desc").text("输入的token值为空,token未被修改");
        } else {
          sc_tk_token = sc_tokenTemp;
          GM_setValue("sc_tk_token", sc_tk_token);
          $("#script_desc").text(`token配置成功:token=${sc_tk_token}`);
        }
        return;
      };
      function sc_showAns() {
        if (sc_tk_token == `` || sc_tk_token == null || sc_tk_token == undefined) {
          sc_set_token();
          return;
        }
        alert(
          "已进入答案显示模式，带有图片的题目可能会搜索不完全，使用时请授权跨域请求权限（设置为允许全部），否则题目搜索将不可用！（第一次使用时可能会因为授权问题导致题目错位或搜索不完整）"
        );
        $("#script_window_main").hide();
        $("#show_ans_page").show();
        $("#sc_log_info").text("当前状态：显示答案,答案不一定正确，需配置题库信息！");
        $("#sc_ans_textarea").empty();
        //获取题目
        let questionsHTML = document.querySelector(".j-list").children[0].children;
        let sc_questions = [];
        //解析题目并存储
        $("#sc_log_info").text("正在解析题目");
        for (let tempVar of questionsHTML) {
          tempVar = tempVar.textContent;
          let parseOut = "";
          try {
            parseOut = tempVar.substring(tempVar.indexOf("分)") + 2, tempVar.indexOf("得分")).trim();
            //移除控制字符等无效字符
            var unwantedChars = /[\u200B\u200C\u200D\u200E\u200F\u0000\uFFFD\u000B\u000C\u2060\u2028\u2029]/g;
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
                      $("#sc_ans_textarea").append($(`<div>${searchIndex}.${sc_question}</div><div class='sc_ans'>${sc_result}</div>`));
                    } catch (err) {
                      sc_result += "未搜索到该题目";
                      $("#sc_ans_textarea").append($(`<div>${searchIndex}.${sc_question}</div><div class='sc_ans'>${sc_result}</div>`));
                    }
                  },
                  onerror: () => {
                    sc_result += "未找到该题目";
                    $("#sc_ans_textarea").append($(`<div>${searchIndex}.${sc_question}</div><div class='sc_ans'>${sc_result}</div>`));
                  },
                });
              }
            } else {
              $("#sc_log_info").text("全部题目解答完成,可双击题目返回脚本主菜单");
            }
          } catch (err) {
            $("#sc_log_info").text(`处理第${searchIndex}时发生异常,异常内容以输出至终端`);
            console.error(err);
          }
        }, 2000);
      }
      //互评模块

      $("#sc_do_judge").click(() => {
        $("#script_desc").text("互评开始");
        var sc_interval_times = 0;
        //设置2500ms为周期，确保页面被正确加载后执行（不是ikun）
        var sc_intervalId = setInterval(() => {
          try {
            if (sc_interval_times < sc_judge_count) {
              $("#script_desc").text(`正在进行第${++sc_interval_times}次互评`);
              let sc_judgeList = document.querySelectorAll(".m-homeworkQuestionList .s");

              //分数值0:满分；超界：满分：-1：0分;其余值:均为倒数第n个选项（随机或固定）
              if (sc_judge_mode == 1) {
                //固定分数模式评分
                for (let sc_judgeNode of sc_judgeList) {
                  let sc_temp_count = sc_judgeNode.childElementCount;
                  let sc_check_index = sc_temp_count - 1;
                  if (sc_judge_sorce == -1) sc_check_index = 0;
                  else {
                    sc_check_index -= sc_judge_sorce;
                    if (sc_check_index <= 0) sc_check_index = sc_temp_count - 1;
                  }
                  sc_judgeNode.children[sc_check_index].click();
                }
              } else {
                //随机分数模式评分
                for (let sc_judgeNode of sc_judgeList) {
                  let sc_temp_count = sc_judgeNode.childElementCount;
                  let sc_check_index = sc_temp_count - 1;
                  if (sc_judge_sorce == -1) sc_check_index = 0;
                  else {
                    sc_check_index -= randomInt(0, sc_judge_sorce);
                    if (sc_check_index <= 0) sc_check_index = sc_temp_count - 1;
                  }
                  sc_judgeNode.children[sc_check_index].click();
                }
              }
              //写评语
              let sc_judgeMessageList = document.querySelectorAll(".m-homeworkQuestionList textarea");
              for (let sc_judgeMessageNode of sc_judgeMessageList) {
                sc_judgeMessageNode.value = sc_judge_msg[randomInt(0, sc_judge_msg.length)];
              }
              document.querySelector(".u-btn.u-btn-default.f-fl.j-submitbtn").click();
              document.querySelector(".j-gotonext").click();
            } else {
              clearInterval(sc_intervalId);
              $("#script_desc").text("互评完成！");
            }
          } catch (err) {
            $("#script_desc").text("互评出错，请确保正处于互评页面");
            clearInterval(sc_intervalId);
          }
        }, 2500);

        //获取分数模块
      });

      //做视频测试部分
      function sc_do_test() {
        alert("正在做了...");
      }
      //显示设置页面,并加载信息
      function sc_setting() {
        $("#script_setting").show();
        $("#script_window_main").hide();
        let sc_conf_tk_token_value = $("#sc_conf_tk_token_value");
        let sc_conf_judge_count_value = $("#sc_conf_judge_count_value");
        let sc_conf_judge_mode_value = $("#sc_conf_judge_mode_value");
        let sc_conf_judge_sorce_value = $("#sc_conf_judge_sorce_value");
        let sc_conf_judge_msg = $("#sc_conf_judge_msg");
        if (sc_tk_token == `` || sc_tk_token == null || sc_tk_token == undefined) {
        } else {
          sc_conf_tk_token_value.val(sc_tk_token);
        }
        sc_conf_judge_count_value.val(sc_judge_count);
        sc_conf_judge_mode_value.val(sc_judge_mode);
        sc_conf_judge_sorce_value.val(sc_judge_sorce);
        sc_conf_judge_msg.val(arrToString(sc_judge_msg));
      }
      //设置页面
      //双击标题保存信息并返回主界面
      $("#script_setting .script_title").dblclick(() => {
        let sc_conf_tk_token_value = $("#sc_conf_tk_token_value");
        let sc_conf_judge_count_value = $("#sc_conf_judge_count_value");
        let sc_conf_judge_mode_value = $("#sc_conf_judge_mode_value");
        let sc_conf_judge_sorce_value = $("#sc_conf_judge_sorce_value");
        let sc_conf_judge_msg = $("#sc_conf_judge_msg");
        if (sc_conf_tk_token_value.val() == "" || sc_conf_tk_token_value.val() == null) {
        } else {
          sc_tk_token == sc_conf_tk_token_value.val();
          GM_setValue("sc_tk_token", sc_tk_token);
        }
        sc_judge_count = sc_conf_judge_count_value.val();
        sc_judge_mode = sc_conf_judge_mode_value.val();
        sc_judge_sorce = sc_conf_judge_sorce_value.val();
        sc_judge_msg = sc_conf_judge_msg.val().split("|");
        GM_setValue("sc_judge_sorce", sc_judge_sorce);
        GM_setValue("sc_judge_count", sc_judge_count);
        GM_setValue("sc_judge_mode", sc_judge_mode);
        GM_setValue("sc_judge_msg", sc_judge_msg);
        $("#script_setting").hide();
        $("#script_window_main").show();
      });
      //显示帮助信息
      $("#script_setting_info").dblclick(() => {
        window.open("https://res.yeah666.com/js_conf_help.html", "_blank").focus();
      });
    }
    function arrToString(arr) {
      let sc_out = "";
      for (let sc_var_temp of arr) {
        sc_out += "|" + sc_var_temp;
      }
      return sc_out.substring(1);
    }
    function randomInt(start, size) {
      return Math.floor(Math.random() * size) + start;
    }
  }else{
    var insertHtml = `
    <div class="script_window" id="script_window_main">
    <div class="script_title">Yeah-头歌脚本</div>
    <div class="script_desc sc_scroll_ui" id="script_desc">此脚本使用fetch拦截请求以代替头歌文本区域，间接解除不允许粘贴的限制</div>
    <div class="script_but" id="script_start">开始替换</div>`;
    $("body").append(insertHtml);
    $("#script_window_main").draggable();
  $("#script_start").click(() => {
    let replaceWorld = prompt("请输入要键入的文本(注意！替换过程页面会强制刷新，请自行保存当前工作内容)：");
    const originFetch = fetch;
    console.log(originFetch)
    window.unsafeWindow.fetch = (url, options) => {
        return originFetch(url, options).then(async (response) => {
            console.log(url)
            if(url.includes("reset_original_code.json")&&replaceWorld.length>0){
                const responseClone = response.clone();
                let res = await responseClone.json();
                res.content = replaceWorld;
                replaceWorld="";
                const responseNew = new Response(JSON.stringify(res), response);
                return responseNew;
            }else{
                return response;
            }
        });
    };
    document.querySelector('a[title="恢复初始代码"]').click();
    setTimeout(() => {
        const confirmButton = document.querySelector('button.ant-btn-primary');
        if (confirmButton) {
            confirmButton.click();
        } else {
        }
    }, 100);
  });
  }

  // Your code here...
})();
