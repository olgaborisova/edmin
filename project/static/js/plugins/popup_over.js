(function(){
  this.popup_options = false;

  var default_options = {
    'class_show': 'visible',
    'callback': false,
    'callback_start': false
  };

  var doc = $(document);

  function clear_popup(){
    doc.off('.over');
    if (this.popup_options) {
      this.popup_options['window'].removeClass(this.popup_options['class_show']);
      this.popup_options = false;
    }
  }

  // usage:
  // popup_over({
  //   'window': $popupover,
  //   'link': $this,
  //   'callback': callback
  // });

  this.popup_over = function(options) {
    var opt = this.popup_options;
    if (typeof(opt['callback']) == 'function') {
      opt['callback'](opt['window']);
    }

    if (options == 'undefined' || !options) {
      clear_popup();
    } else
    {
      var vars = $.extend({}, default_options, options),
          identity = false;

      if(opt['link']) {
        if (opt['link'].get(0) == vars['link'].get(0)) {
          identity = true;
        }
      }

      if (identity) {
        clear_popup();
      } else {
        if (opt['window']) {
          opt['window'].removeClass(opt['class_show']);
        }
        vars['window'].addClass(vars['class_show']);
        this.popup_options = vars;

        if (typeof(vars['callback_start']) == 'function') {
          vars['callback_start'](vars['window']);
        }

        doc.off('.over').on('keydown.over', function (e) {
          var code   = e.which || e.keyCode;
          if (code === 27) {
            popup_over();
          }
        });

        doc.on('click.over', function(event){
          var target = $(event.target);

          if (!target.closest(vars['window']).length && !target.closest(vars['link']).length) {
            popup_over();
          }
        });
      }

    }
  }

}());