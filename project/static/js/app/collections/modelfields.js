define(['backbone'], function(Backbone){
    var ModelFieldsCollection = Backbone.Collection.extend({
      url: "/api/fields/",
  });
    return ModelFieldsCollection;
});