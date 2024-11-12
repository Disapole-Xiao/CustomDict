// ==UserScript==
// @name         Custom Dict
// @namespace    https://github.com/Disapole-Xiao/
// @version      2.7
// @author       Disapole
// @description  选中任何词语添加到你的词库中，支持高亮显示页面上所有单词，悬停高亮单词显示释义，词典修改和删除
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js
// ==/UserScript==

(function () {
  'use strict';

  // 初始化词库
  let wordList = GM_getValue('wordList', {});
  console.log('已加载词库：', wordList);

  // 创建悬浮菜单
  const menu = document.createElement('div');
  menu.id = 'custom-dictionary-menu';
  menu.style.position = 'absolute';
  menu.style.background = '#fffae6';
  menu.style.border = '1px solid #d1d1d1';
  menu.style.padding = '5px';
  menu.style.cursor = 'pointer';
  menu.style.display = 'none';
  menu.innerText = '添加';
  document.body.appendChild(menu);

  // 创建自定义输入框容器
  const inputContainer = document.createElement('div');
  inputContainer.style.position = 'absolute';
  inputContainer.style.background = '#ffffff';
  inputContainer.style.border = '1px solid #d1d1d1';
  inputContainer.style.padding = '10px';
  inputContainer.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
  inputContainer.style.display = 'none';
  inputContainer.style.zIndex = '1000';
  inputContainer.style.cursor = 'move';
  document.body.appendChild(inputContainer);

  // 文本区域和按钮
  const textArea = document.createElement('textarea');
  textArea.placeholder = '输入释义';
  textArea.style.width = '250px';
  textArea.style.height = '100px';
  textArea.style.marginRight = '10px';
  textArea.style.display = 'block';
  textArea.style.marginBottom = '10px';
  inputContainer.appendChild(textArea);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'right';
  inputContainer.appendChild(buttonContainer);

  const confirmButton = document.createElement('button');
  confirmButton.innerText = '确定';
  confirmButton.style.cursor = 'pointer';
  confirmButton.style.marginRight = '5px';
  buttonContainer.appendChild(confirmButton);

  const cancelButton = document.createElement('button');
  cancelButton.innerText = '取消';
  cancelButton.style.cursor = 'pointer';
  buttonContainer.appendChild(cancelButton);

  // 监听选中文本事件
  document.addEventListener('mouseup', function (e) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      menu.style.display = 'block';
      const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
      menu.style.left = `${rect.right + window.scrollX}px`;
      menu.style.top = `${rect.bottom + window.scrollY}px`;

      menu.onclick = function () {
        inputContainer.style.left = `${rect.right + window.scrollX}px`;
        inputContainer.style.top = `${rect.bottom + window.scrollY}px`;
        inputContainer.style.display = 'block';
        textArea.value = ''; // 清空输入框
        textArea.focus();
        inputContainer.selectedText = selectedText; // 保存当前选择文本
        menu.style.display = 'none';
      };
    } else {
      menu.style.display = 'none';
    }
  });

  // 点击确定按钮存储释义
  confirmButton.onclick = function () {
    const definition = textArea.value.trim();
    const selectedText = inputContainer.selectedText.trim();
    if (definition) {
      let key = selectedText.toLowerCase();
      wordList[key] = {
        origin: selectedText,
        definition: definition,
      };
      GM_setValue('wordList', wordList);
      console.log(`词 "${selectedText}" 已添加到词库！释义为：${definition}`);
    }
    inputContainer.style.display = 'none';
  };

  // 点击取消按钮关闭输入框
  cancelButton.onclick = function () {
    inputContainer.style.display = 'none';
  };

  // 使输入框容器可拖动
  inputContainer.addEventListener('mousedown', function (e) {
    let offsetX = inputContainer.offsetLeft - e.clientX;
    let offsetY = inputContainer.offsetTop - e.clientY;

    function onMouseMove(e) {
      inputContainer.style.left = `${e.clientX+offsetX}px`;
      inputContainer.style.top = `${e.clientY+offsetY}px`;
      inputContainer.style.transform = ''; // 取消居中对齐的 transform
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // 修改词典
  function modifyDictionary() {
    const dictionaryContainer = document.createElement('div');
    dictionaryContainer.style.position = 'fixed';
    dictionaryContainer.style.top = '10%';
    dictionaryContainer.style.right = '10px';
    dictionaryContainer.style.background = '#ffffff';
    dictionaryContainer.style.border = '1px solid #d1d1d1';
    dictionaryContainer.style.padding = '20px';
    dictionaryContainer.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    dictionaryContainer.style.zIndex = '1000';
    dictionaryContainer.style.width = '400px';
    dictionaryContainer.style.height = '80%';
    dictionaryContainer.style.overflowY = 'auto';
    document.body.appendChild(dictionaryContainer);

    const deleteSelectedButton = document.createElement('button');
    deleteSelectedButton.innerText = '删除选中';
    deleteSelectedButton.style.cursor = 'pointer';
    deleteSelectedButton.style.marginBottom = '10px';
    dictionaryContainer.appendChild(deleteSelectedButton);

    const checkboxes = [];

    for (const word in wordList) {
      const itemDiv = document.createElement('div');
      itemDiv.style.display = 'flex';
      itemDiv.style.alignItems = 'flex-start';
      itemDiv.style.marginBottom = '10px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.cursor = 'pointer';
      checkbox.style.marginRight = '10px';
      checkbox.style.flex = '0 0 auto';
      checkbox.style.alignSelf = 'flex-start';
      checkboxes.push({ checkbox, itemDiv: itemDiv, word });
      itemDiv.appendChild(checkbox);

      const wordContent = document.createElement('div');
      wordContent.style.flex = '1';
      wordContent.style.display = 'flex';
      wordContent.style.flexDirection = 'column';
      wordContent.style.marginRight = '10px';

      const wordLabel = document.createElement('strong');
      wordLabel.innerText = wordList[word].origin;
      wordContent.appendChild(wordLabel);

      const definitionLabel = document.createElement('label');
      definitionLabel.innerText = wordList[word].definition;
      definitionLabel.style.whiteSpace = 'pre-wrap';
      wordContent.appendChild(definitionLabel);

      itemDiv.appendChild(wordContent);

      const buttonDiv = document.createElement('div');
      buttonDiv.style.display = 'flex';
      buttonDiv.style.flexDirection = 'column';
      buttonDiv.style.gap = '5px';

      const editButton = document.createElement('span');
      editButton.innerText = '修改';
      editButton.style.cursor = 'pointer';
      editButton.style.color = '#007bff';
      buttonDiv.appendChild(editButton);

      const deleteButton = document.createElement('span');
      deleteButton.innerText = '删除';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.color = '#dc3545';
      buttonDiv.appendChild(deleteButton);

      itemDiv.appendChild(buttonDiv);
      dictionaryContainer.appendChild(itemDiv);

      // 删除按钮功能
      deleteButton.onclick = function () {
        if (confirm(`确认要删除词 "${wordList[word].origin}" 吗？`)) {
          delete wordList[word];
          GM_setValue('wordList', wordList);
          dictionaryContainer.removeChild(itemDiv);
        }
      };

      // 修改按钮功能
      editButton.onclick = function () {
        const editTextArea = document.createElement('textarea');
        editTextArea.value = wordList[word].definition;
        editTextArea.style.width = '100%';
        editTextArea.style.height = '60px';
        wordContent.replaceChild(editTextArea, definitionLabel);

        const confirmEditButton = document.createElement('span');
        confirmEditButton.innerText = '确定';
        confirmEditButton.style.cursor = 'pointer';
        confirmEditButton.style.color = '#007bff';
        confirmEditButton.style.marginRight = '5px';
        buttonDiv.replaceChild(confirmEditButton, editButton);

        const cancelEditButton = document.createElement('span');
        cancelEditButton.innerText = '取消';
        cancelEditButton.style.cursor = 'pointer';
        cancelEditButton.style.color = '#6c757d';
        buttonDiv.replaceChild(cancelEditButton, deleteButton);

        // 确认修改
        confirmEditButton.onclick = function () {
          wordList[word].definition = editTextArea.value.trim();
          GM_setValue('wordList', wordList);
          definitionLabel.innerText = wordList[word].definition;
          wordContent.replaceChild(definitionLabel, editTextArea);
          buttonDiv.replaceChild(editButton, confirmEditButton);
          buttonDiv.replaceChild(deleteButton, cancelEditButton);
        };

        // 取消修改
        cancelEditButton.onclick = function () {
          wordContent.replaceChild(definitionLabel, editTextArea);
          buttonDiv.replaceChild(editButton, confirmEditButton);
          buttonDiv.replaceChild(deleteButton, cancelEditButton);
        };
      };
    }

    deleteSelectedButton.onclick = function () {
      checkboxes.forEach(({ checkbox, itemDiv, word }) => {
        if (checkbox.checked) {
          delete wordList[word];
          GM_setValue('wordList', wordList);
          dictionaryContainer.removeChild(itemDiv);
        }
      });
    };

    // 点击非列表区域时关闭列表
    document.addEventListener(
      'click',
      function (e) {
        if (!dictionaryContainer.contains(e.target) && dictionaryContainer.parentNode) {
          document.body.removeChild(dictionaryContainer);
        }
      },
      { capture: true }
    );
  }

  // 高亮功能
  function highlightWords() {
    console.log('高亮页面触发');
    const words = Object.keys(wordList);
    if (words.length === 0) {
      console.log('词库为空，无法高亮。');
      return;
    }

    const context = document.querySelector('body');
    const instance = new Mark(context);
    instance.unmark({
      done: function () {
        instance.mark(words, {
          acrossElements: true,
          separateWordSearch: false,
          className: 'highlight-word',
          each: function (element) {
            element.style.backgroundColor = 'yellow';
            element.style.cursor = 'pointer';
            element.title = wordList[element.innerText.toLowerCase()].definition;
            //console.log("查找词典："+element.innerText.toLowerCase());
          },
        });
      },
    });
  }

  // 将“高亮页面”和“修改词典”添加到 Tampermonkey 菜单
  GM_registerMenuCommand('高亮页面', highlightWords);
  GM_registerMenuCommand('修改词典', modifyDictionary);
})();

/* TODO:
[] 高亮bug
[] 匹配时避开列表
[] 回车自动确定
[] 批量删除没有确认
[] 批量删除按钮应该 sticky


*/
