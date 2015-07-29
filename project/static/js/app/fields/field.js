define(['backbone', 'underscore'], function (Backbone, _) {

    var Field = Backbone.View.extend({

      events: {
        'change input': 'save',
      },

      initialize: function(options){
        this.value = options.value;
        this.name = options.name;
        this.required = options.required;
      },

      save: function(event){
        event.preventDefault();
        var $target = $(event.currentTarget);
        var value = $target.val();
        if (this.validate(value)){
          var field_name = this.name;
          var view = this;
          this.model.set(this.name, value);
          this.model.save(this.model.attributes, {
            patch: true,
            success: function(){
              $target.parent().html(value);
            },
            error: function(model, dd, options){
              errors = JSON.parse(dd.responseText);
              error = errors[field_name];
              if (error != undefined){
                view.showError(error);
              }
            }
          })
        }
      },

      validate: function(value){
        this.clearErrors();
        var success = true;
        if (this.required && value == ''){
          success = false;
          var msg = 'Обязательное поле';
          this.showError(msg);
        }
        var extra_success = this.extra_validate(value);
        return success && extra_success;
      },

      clearErrors: function(){
        this.$('.alert-danger').remove();
      },

      showError: function(msg){
        this.$el.append('<div class="alert alert-danger">'+msg+'</div>');
      },

    });

    return Field;

});