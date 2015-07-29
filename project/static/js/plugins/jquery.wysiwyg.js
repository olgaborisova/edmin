/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function ($) {
  'use strict';
  var $win = $(window);
  var readFileIntoDataUrl = function (fileInfo) {
    var loader = $.Deferred(),
      fReader = new FileReader();
    fReader.onload = function (e) {
      loader.resolve(e.target.result);
    };
    fReader.onerror = loader.reject;
    fReader.onprogress = loader.notify;
    fReader.readAsDataURL(fileInfo);
    return loader.promise();
  };
  $.fn.cleanHtml = function () {
    var html = $(this).html();
    return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
  };
  $.fn.wysiwyg = function (userOptions) {
    var editor = this,
      selectedRange,
      options,
      toolbarBtnSelector,
      updateToolbar = function () {
        if (options.activeToolbarClass && $win.data('edit')) {
          $(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
            var command = $(this).data(options.commandRole);
            if (document.queryCommandState(command)) {
              $(this).addClass(options.activeToolbarClass);
            } else {
              $(this).removeClass(options.activeToolbarClass);
            }
          });
        }
      },
      execCommand = function (commandWithArgs, valueArg) {
        var commandArr = commandWithArgs.split(' '),
          command = commandArr.shift(),
          args = commandArr.join(' ') + (valueArg || '');
        document.execCommand(command, 0, args);
        updateToolbar();
      },
      bindHotkeys = function (hotKeys) {
        $.each(hotKeys, function (hotkey, command) {
          editor.keydown(hotkey, function (e) {
            if (editor.attr('contenteditable') && editor.is(':visible')) {
              e.preventDefault();
              e.stopPropagation();
              execCommand(command);
            }
          }).keyup(hotkey, function (e) {
            if (editor.attr('contenteditable') && editor.is(':visible')) {
              e.preventDefault();
              e.stopPropagation();
            }
          });
        });
      },
      getCurrentRange = function () {
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          return sel.getRangeAt(0);
        }
      },
      saveSelection = function () {
        selectedRange = getCurrentRange();
      },
      restoreSelection = function () {
        var selection = window.getSelection();
        if (selectedRange) {
          try {
            selection.removeAllRanges();
          } catch (ex) {
            document.body.createTextRange().select();
            document.selection.empty();
          }

          selection.addRange(selectedRange);
        }
      },
      insertFiles = function (files) {
        editor.focus();
        $.each(files, function (idx, fileInfo) {
          if (/^image\//.test(fileInfo.type)) {
            $.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
              execCommand('insertimage', dataUrl);
            }).fail(function (e) {
              options.fileUploadError("file-reader", e);
            });
          } else {
            options.fileUploadError("unsupported-file-type", fileInfo.type);
          }
        });
      },
      markSelection = function (input, color) {
        restoreSelection();
        if (document.queryCommandSupported('hiliteColor')) {
          document.execCommand('hiliteColor', 0, color || 'transparent');
        }
        saveSelection();
        input.data(options.selectionMarker, color);
      },
      bindToolbar = function (toolbar, options) {
        toolbar.find(toolbarBtnSelector).click(function () {
          restoreSelection();
          editor.focus();
          execCommand($(this).data(options.commandRole));
          saveSelection();
        });
        toolbar.find('[data-toggle=dropdown]').click(restoreSelection);

        toolbar.find('input[type=text][data-' + options.commandRole + '], input[type=hidden][data-' + options.commandRole + ']').on('webkitspeechchange change', function () {
          var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
          this.value = '';
          restoreSelection();
          if (newValue) {
            editor.focus();
            var role = $(this).data(options.commandRole)

            if (role == 'createLink') {
              role = 'insertHTML'
              var reg = /^(https?):\/\//
              if (!reg.test(newValue)) {
                newValue = 'http://' + newValue
              }

              var onclick = "javascript:window.open('" + newValue + "', '_system');"

              newValue = '<a href="javascript:;" onClick="' + onclick + '">' + document.getSelection() + '</a>'
            }
            execCommand(role, newValue);
          }
          saveSelection();
        }).on('focus', function () {
          var input = $(this);
          if (!input.data(options.selectionMarker)) {
            markSelection(input, options.selectionColor);
            input.focus();
          }
        }).on('blur', function () {
          var input = $(this);
          if (input.data(options.selectionMarker)) {
            markSelection(input, false);
          }
        });
        toolbar.find('input[type=file][data-' + options.commandRole + ']').change(function () {
          restoreSelection();
          if (this.type === 'file' && this.files && this.files.length > 0) {
            insertFiles(this.files);
          }
          saveSelection();
          this.value = '';
        });
      },


      // removes MS Office generated guff
      cleanHTML = function(input) {
        // 1. remove line breaks / Mso classes
        var stringStripper = /(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/g;
        var output = input.replace(stringStripper, ' ');

        // 2. strip Word generated HTML comments
        var commentSripper = new RegExp('<!--(.*?)-->','g');
        var output = output.replace(commentSripper, '');

        // 2-1. strip Word generated HTML comments
        var doctype = new RegExp('<!DOCTYPE(.*?)>','g');
        var output = output.replace(doctype, '');

        // 3. remove tags leave content if any
        var tagStripper = new RegExp('<(/)*(tr|td||th|table|thead|meta|body|head|html|link|span|b|i|a|strong|h1|h2|h3|h4|h5|h6|hr|address|article|aside|section|blockquote|div|p|pre|dd|dt\\?xml:|st1:|o:|font)(.*?)>','gi');
        output = output.replace(tagStripper, '');

        // 4. Remove everything in between and including tags '<style(.)style(.)>'
        var badTags = ['style', 'head', 'title', 'script','applet','embed','noframes','noscript'];
        for (var i=0; i< badTags.length; i++) {
          tagStripper = new RegExp('<'+badTags[i]+'.*?'+badTags[i]+'(.*?)>', 'gi');
          output = output.replace(tagStripper, '');
        }

        return output;
      },

      pasteHandler = function (elem, event) {

        var text = event.originalEvent.clipboardData.getData("text");

        console.log(text);

        // console.log(event.originalEvent.clipboardData.getData("text"));
        // if (!text) {
        //   text = event.originalEvent.clipboardData.getData("text");
        //   document.execCommand("insertHTML", false, text);
        //   return;
        // }

        // var text = '<div id="paste">' + cleanHTML(text) + '</div>';

        document.execCommand("insertHTML", false, text);

        // setTimeout(function() {
        //   var paste = $('#paste', elem);

        //   var elements = paste.find('*');

        //   elements.each(function(){
        //     var $this = $(this);
        //     $this.removeAttr('style');
        //     $this.removeAttr('class');
        //     $this.removeAttr('id');
        //     $this.removeAttr('name');
        //     $this.removeAttr('href');
        //     $this.removeAttr('language');
        //     $this.removeAttr('onmouseout');
        //   });

        //   paste.removeElemTags();

        // }, 550);

      },

      initFileDrops = function () {
        editor.on('dragenter dragover', false)
          .on('drop', function (e) {
            var dataTransfer = e.originalEvent.dataTransfer;
            e.stopPropagation();
            e.preventDefault();
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
              insertFiles(dataTransfer.files);
            }
          });
      };
    options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
    toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
    bindHotkeys(options.hotKeys);
    if (options.dragAndDropImages) {
      initFileDrops();
    }
    bindToolbar($(options.toolbarSelector), options);
    editor.attr('contenteditable', true)
      .on('mouseup keyup mouseout', function () {
        saveSelection();
        updateToolbar();
      })
      .on('paste', function(event) {
        event.preventDefault();
        var $this = $(this);
        pasteHandler($this, event);
      });

    $(window).bind('touchend', function (e) {
      var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
        currentRange = getCurrentRange(),
        clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
      if (!clear || isInside) {
        saveSelection();
        updateToolbar();
      }
    });
    return this;
  };
  $.fn.wysiwyg.defaults = {
    hotKeys: {
      'ctrl+b meta+b': 'bold',
      'ctrl+i meta+i': 'italic',
      'ctrl+u meta+u': 'underline',
      'ctrl+z meta+z': 'undo',
      'ctrl+y meta+y meta+shift+z': 'redo',
      'ctrl+l meta+l': 'justifyleft',
      'ctrl+r meta+r': 'justifyright',
      'ctrl+e meta+e': 'justifycenter',
      'ctrl+j meta+j': 'justifyfull',
      'shift+tab': 'outdent',
      'tab': 'indent'
    },
    toolbarSelector: '[data-role=editor-toolbar]',
    commandRole: 'edit',
    activeToolbarClass: 'btn-info',
    selectionMarker: 'edit-focus-marker',
    selectionColor: 'darkgrey',
    dragAndDropImages: true,
    fileUploadError: function (reason, detail) { console.log("File upload error", reason, detail); }
  };
}(window.jQuery));
