define(['backbone'], function (Backbone) {

    var DjangoModelListView = Backbone.View.extend({

      tagName: "table",
      className: "table table-hover",

      render: function(){
        this.$el.html('<tbody></tbody>');
        this.addEmptyTable();
        this.renderRows();
        return this;
      },

      addEmptyTable: function(){
        if (this.collection.length == 0){
          this.$('tbody').html('<tr><td>Нет данных для отображения</tr></td>');
        }
      },

      renderRows: function(){
        for (i=0; i<this.collection.length; i++){
            model = this.collection.at(i);
            name = model.get('name');
            this.$('tbody').append('<tr><td><a href="#' + name + '">' + name + '</a></td></tr>');
        }
      },

    });

    return DjangoModelListView;

});