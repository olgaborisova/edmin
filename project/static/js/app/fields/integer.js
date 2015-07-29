define(['app/fields/field'], function (Field) {

    var IntegerField = Field.extend({

      render: function(){
        this.$el.append("<input type='text' name='"+this.name+"' value='"+this.value+"'>");
        return this;
      },

      extra_validate: function(value){
        return true;
      },

    });

    return IntegerField;

});