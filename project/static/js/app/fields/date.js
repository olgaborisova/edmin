define(['backbone'], function (Backbone) {

    var TextField = Backbone.View.extend({

      initialize: function(options){
        this.value = options.value;
        this.name = options.name;
        this.required = options.required;
      },

      render: function(){
        this.$el.append("<input type='text' name='"+this.name+"' value='"+this.value+"'>");
        return this;
      },

    });

    return TextField;

});