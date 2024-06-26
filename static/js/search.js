﻿
//===========================头部搜索JS函数开始================================

/**
* @description 百度suggestion功能
*/

var inputField = document.forms["headfForm"].ky;
var suggestionDiv = document.getElementById("headsuggestion_div");
var suggestionsUl = document.getElementById("headsuggestions_ul");
var suggestionLi = null;

function clearSuggestions() {
    for (var i = suggestionsUl.childNodes.length - 1; i >= 0; i--)
        suggestionsUl.removeChild(suggestionsUl.childNodes[i]);
    suggestionDiv.className = "hide";

}

function setSuggestions(the_suggestions) {// 动态生成suggestion下拉框
    clearSuggestions(); // 每输入一个字符就先清除原先的提示
    suggestionDiv.className = "show";
    for (var i = 0; i < the_suggestions.length; i++) {// 将匹配的提示结果逐一显示给用户
        suggestionLi = document.createElement("li");
        suggestionsUl.appendChild(suggestionLi);
        suggestionLi.appendChild(document.createTextNode(the_suggestions[i].name));
        mouseEvent(); // 对每个<li>触发鼠标事件
    }
}

function mouseEvent() {
    suggestionLi.onmouseover = function () {
        this.className = "mouseOver"; // 鼠标经过时高亮onmouseout   
    }
    suggestionLi.onmouseout = function () {
        this.className = "mouseOut"; // 离开时恢复原样
    }
    suggestionLi.onclick = function () {// 用户点击某个匹配项时清除提示框   
        clearSuggestions();
       
    }
    suggestionLi.onmousedown = function () {
        inputField.value = this.firstChild.nodeValue; // 同时将当前的选中值赋值给百度输入框 
        //window.location = '/home/search?ky=' + inputField.value;
        SiteSearch('/home/search', '#ky', 0);
    }
}
 

function fillUrls(strdomin) {
    //var strdomin = $.trim($("#ky").val());
    $.ajax({
        async: false,
        dataType: 'json',
        url: '/Home/SearchFillUrls?k=' + strdomin,
        success: function (data) {
            findSuggestions(data);
        }
    });
}

function debounce(fun, delay) {
    return function (args) {
        let that = this
        let _args = args
        clearTimeout(fun.id)
        fun.id = setTimeout(function () {
            fun.call(that, _args)
        }, delay)
    }
}

function findSuggestions(strurls) {

    var aResult = []; // 用于存放匹配结果

    if (strurls == "") {
        setSuggestions(aResult);
        return;
    }

    var urls = strurls;// eval('([' + strurls + '])'); //
    //var urls = obj[0].s;
    if (inputField.value.length > 0) {
        for (var i = 0; i < urls.length; i++) { // 从数据源中找匹配的数据
          //  if (urls[i].indexOf(inputField.value) == 0) {
                aResult.push(urls[i]); // 压入结果
          //  }
        }
        if (aResult.length > 0) // 如果有匹配的数据则显示出来
            setSuggestions(aResult);
    } else
        clearSuggestions(); // 此步用作用户输入（Backspace健）将输入框清除完时的处理
    inputField.onblur = function () {
        clearSuggestions(); // 输入框失去焦点时，清除suggestion下拉提示框
    }
    inputField.onfocus = function () {// 输入框获取焦点时，显示suggestion内容
        if (aResult.length > 0)
            setSuggestions(aResult);
    }
}


var selectedSuggestion = -1; // 索引值

function moveUp(suggestionNodes) {
   suggestionNodes.eq(selectedSuggestion).css("background-color", "RGBA(33,33,33,0.1)"); //先将上面一个<li>变成白色
    selectedSuggestion++; // 每向下移一位，selectedSuggestion就+1
    if (selectedSuggestion == suggestionNodes.length) {
        selectedSuggestion = 0; //如果索引值变成suggestionNodes.length，则将索引值指向第一个元素
    } 
    suggestionNodes.eq(selectedSuggestion).css("background-color", "#eee");
    var comText = suggestionNodes.eq(selectedSuggestion).text();
    $("#ky").val(comText); //向输入框赋值 
}

function moveDown(suggestionNodes) { 
    suggestionNodes.eq(selectedSuggestion).css("background-color", "RGBA(33, 33, 33, 0.1)"); //先将下面一个<li>变成白色
    selectedSuggestion--; // 每向上移一位，selectedSuggestion就-1
    if (selectedSuggestion == -1) {
        selectedSuggestion = suggestionNodes.length - 1; //如果索引值变成-1，则将索引值指向最后一个元素
    }
    //console.log(selectedSuggestion);
    //  suggestionNodes.eq(selectedSuggestion +1).removeClass("background-color"); //再将上面一个<li>变成灰色
    suggestionNodes.eq(selectedSuggestion).css("background-color", "#eee");
    var comText = suggestionNodes.eq(selectedSuggestion).text();
    $("#ky").val(comText); //向输入框赋值 
}

function keyEvent(event) { 
    var myEvent = event || window.event;
    var keyCode = myEvent.keyCode;
    var suggestionNodes = $("#headsuggestion_div").children("ul").children("li");
    //console.log(keyCode);
    if (keyCode == 40) { // 向下
        moveUp(suggestionNodes);
    } else if (keyCode == 38) {       //向上
        moveDown(suggestionNodes);
    } else {
        let debounceAjax = debounce(fillUrls, 500);
        debounceAjax(event.target.value);
        //fillUrls(); //加载下拉列表
        selectedSuggestion = -1; // 同时将selectedSuggestion调整为初始值-1
    }
}
 


//===========================头部JS函数结束================================