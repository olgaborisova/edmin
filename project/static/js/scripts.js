requirejs(['jquery', 'backbone', 'app/router'], 
  function ($, Backbone, Router) {
    $(document ).ready(function() {
        window.router = new Router();
        Backbone.history.start();
  });
});