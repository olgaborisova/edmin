define(['backbone', 'app/views/djangomodelslist', 'app/collections/djangomodels', 'app/views/djangomodeldetail'], 
  function(Backbone, DjangoModelsListView, django_models_collection, DjangoModelDetailView){

    var Router = Backbone.Router.extend({

      initialize: function(){
        this.container = $('#content');
      },

      routes: {
        '':        'modelList', 
        ':model':   'modelDetail',
      },

      modelList: function(){
        view = new DjangoModelsListView({collection: django_models_collection});
        this.renderView(view);
      },

      modelDetail: function(model) {
        view = new DjangoModelDetailView({model_name: model});
        this.renderView(view);
      },

      renderView: function(view){
        this.container.html(view.render().el);
      }
  });
    
    return Router;
});