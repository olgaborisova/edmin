define(['backbone'], function(Backbone){
    var DjangoModelCollection = Backbone.Collection.extend({
      url: "/api/models/",
  });
    var django_models = new DjangoModelCollection();
    django_models.fetch({async: false});
    return django_models;
});