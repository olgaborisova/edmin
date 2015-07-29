define(['backbone'], function(Backbone){
    var FieldModel = Backbone.Model.extend({
      urlRoot: function(){
        return '/api/objects/' + this.get('model');      
      }

    });
    return FieldModel;
});