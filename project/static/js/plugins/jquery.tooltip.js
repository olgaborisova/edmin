/*
  jQuery Version: jQuery 1.3.2+
  Plugin Name:    tooltip V 1.5
  Plugin by:      Ara Abcarians: http://ara-abcarians.com
  License:        tooltip is licensed under a Creative Commons Attribution 3.0 Unported License
                  Read more about this license at --> http://creativecommons.org/licenses/by/3.0/
*/
(function($) {
  $.fn.tooltip = function(options) {
    var defaults = {
      closeTipBtn: 'tooltip-close',
      toolTipId: 'js-tooltip',
      fixed: true,
      clickIt: false,
      inSpeed: 200,
      outSpeed: 100,
      tipContent: '',
      toolTipClass: 'tooltip-wrap',
      xOffset: 2,
      yOffset: 12,
      onShow: null,
      onHide: null
    },

    // This makes it so the users custom options overrides the default ones
    settings = $.extend({}, defaults, options);

    return this.each(function() {
      var obj = $(this);
      /**
        Decide weather to use a title attr as the tooltip content
      */
      if(obj.attr('title')) {
        // set the tooltip content/text to be the obj title attribute
        var tipContent = obj.attr('title');
      } else {
        // if no title attribute set it to the tipContent option in settings
        var tipContent = settings.tipContent;
      }

      /**
        Build the markup for tooltip
      */
      var buildtooltip = function() {
            $('body').append("<div id='" + settings.toolTipId + "' class='" + settings.toolTipClass + "'><div class='tooltip-content'>" + tipContent + "</div></div>");

            if(tipContent && settings.clickIt) {
              $('#' + settings.toolTipId + ' .tooltip-content')
                  .append("<span id='" + settings.closeTipBtn + "' class='tooltip-close' alt='close'>close</span>");
            }
          },
          /**
            Position tooltip
          */
          positiontooltip = function(){
            $('#' + settings.toolTipId).css({
              top: (obj.offset().top - $('#' + settings.toolTipId).outerHeight() - settings.yOffset) + 'px',
              left: (obj.offset().left + obj.outerWidth() + settings.xOffset) + 'px'
            })
            .stop().fadeIn(settings.inSpeed, function(){
              if ($.isFunction(settings.onShow)){
                settings.onShow(obj);
              }
            });
          },
          /**
            Remove tooltip
          */
          removetooltip = function(){
            // Fade out
            $('#'+settings.toolTipId).stop().fadeOut(settings.outSpeed, function(){
                $(this).remove();
                if($.isFunction(settings.onHide)){
                settings.onHide(obj);
              }
            });
          };

      /**
        Decide what kind of tooltips to display
      */
      // Regular tooltip
      if(tipContent && !settings.clickIt) {
        // Activate on hover
        obj.hover(
          function() {
            // remove already existing tooltip
            $('#'+settings.toolTipId).remove();
            obj.attr({title: ''});
            buildtooltip();
            positiontooltip();
          },
          function() {
            removetooltip();
          });
      }

      // Click activated tooltip
      if(tipContent && settings.clickIt) {
        // Activate on click
        obj.click(function(el){
          // remove already existing tooltip
          $('#'+settings.toolTipId).remove();
          obj.attr({title: ''});
          buildtooltip();
          positiontooltip();
          // Click to close tooltip
          $('#'+settings.closeTipBtn).click(function(){
            removetooltip();
            return false;
          });
          return false;
          });
      }

      // Follow mouse if enabled
      if(!settings.fixed && !settings.clickIt) {
        obj.mousemove(function(el) {
          $('#'+settings.toolTipId).css({
            top: (el.pageY - $('#'+settings.toolTipId).outerHeight() - settings.yOffset),
            left: (el.pageX + settings.xOffset)
          });
        });
      }
    }); // END: return this
  };
})(jQuery);