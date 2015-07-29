define(['app/fields/field'], function (Field) {

    var TextField = Field.extend({

      render: function(){
        this.$el.append("<input type='text' name='"+this.name+"' value='"+this.value+"'>");
        return this;
      },

      extra_validate: function(value){
        var success = true;
        if (value.length > 255){
          success = false;
          var msg = 'Длина строки не должна превышать 255 символов';
          this.showError(msg);
        }
        return success;
      },

    });

    return TextField;

});