define(['backbone'], function(Backbone){
    var ObjectsCollection = Backbone.Collection.extend({
      url: "/api/objects/",
  });
    return ObjectsCollection;
});