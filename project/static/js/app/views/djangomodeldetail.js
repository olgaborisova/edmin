define(['backbone', 'app/collections/objects', 'app/collections/modelfields',
        'app/fields/text', 'app/fields/integer', 'app/fields/date', 'app/models/field'], 
  function (Backbone, Objects, ModelFields, TextField, IntegerField, DateField, FieldModel) {

    var FIELDS = {
      'CharField': TextField,
      'IntegerField': IntegerField,
      //'DateField': DateField,
    }

    var ObjectRowView = Backbone.View.extend({

      tagName: 'tr',

      events: {
        'click .view': 'edit',
      },

      initialize: function(options){
        this.fields = options.fields;
        this.model_name = options.model_name;
      },

      render: function(){
        for (var i=0; i<this.fields.length; i++){
          var field =  this.fields.at(i);
          var fieldName = field.get('name');
          var fieldType = field.get('type');
          var value = this.model.get(fieldName);
          var obj_id = this.model.get('id');
          if (fieldType == 'ForeignKey' || fieldType == 'OneToOneField'){
            value = value.title;
          }
          this.$el.append('<td class="view" data-id="'+obj_id+'" data-type="'+fieldType+'" data-name="'+fieldName+'">'+value+'</td>');
        }
        return this;
      },

      edit: function(event){
        event.preventDefault();
        var $target = $(event.currentTarget);
        $target.removeClass('view').addClass('edit');
        var field_name = $target.data('name');
        var field_type = $target.data('type');
        var obj_id = $target.data('id');

        var fieldView = FIELDS[field_type];
        if (fieldView === undefined){
          alert('Не реализовано изменение для поля типа ' + field_type);
        }
        else{
          var model = new FieldModel({id: obj_id, model: this.model_name});
          var value = $target.text();
          model.set(field_name, value);
          var field_view = new fieldView({name: field_name, value: value, required: true, model: model});
          $target.html(field_view.render().el);

          this.listenTo(model, 'sync', function(){
            $target.removeClass('edit').addClass('view');
          });
        }
      }
    });

    var ObjectHeaderView = Backbone.View.extend({

      tagName: 'tr',

      render: function(){
        for (var i=0; i<this.collection.length; i++){
          field =  this.collection.at(i);
          fieldName = field.get('name');
          this.$el.append('<th>'+fieldName+'</th>');
        }
        return this;
      },
    });

    var DjangoModelTableView = Backbone.View.extend({

      tagName: 'table',
      className: 'table table-hover',

      initialize: function(options){
        this.model_name = options.model_name;
        this.collection = new Objects();
        this.collection.fetch({data: {model: options.model_name}, async: false});

        this.fields = new ModelFields();
        this.fields.fetch({data: {model: options.model_name}, async: false});
      },

      render: function(){
        this.$el.html('<thead></thead><tbody></tbody>');
        this.renderHeaders();
        this.addEmptyTable();
        this.renderRows();
        return this;
      },

      addEmptyTable: function(){
        if (this.collection.length == 0){
          this.$('tbody').html('<tr><td>Нет данных для отображения</tr></td>');
        }
      },

      renderHeaders: function(){
        object_headers_view = new ObjectHeaderView({collection: this.fields});
        this.$('thead').append(object_headers_view.render().el);
      },

      renderRows: function(){
        for (var i=0; i<this.collection.length; i++){
          model = this.collection.at(i);
          object_row_view = new ObjectRowView({
            model: model, fields: this.fields, model_name: this.model_name});
          this.$('tbody').append(object_row_view.render().el);
        }
      },

    });


    var DjangoModelDetailView = Backbone.View.extend({

      initialize: function(options){
        this.model_name = options.model_name;
      },

      render: function(){
        this.$el.html('<h2>' + this.model_name + '</h2>');
        table_view = new DjangoModelTableView({model_name: this.model_name});
        this.$el.append(table_view.render().el);
        return this;
      },
    })

    return DjangoModelDetailView;

});