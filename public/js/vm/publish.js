var PublishViewModel = BaseViewModel.extend({

    items: ko.observableArray([]),

    // item creation
    item: ko.observable(),
    tags: ko.observableArray(),

    // initialization
    construct: function() {
        this.items([]);

        this.getItems();
    },

    getItems: function() {
        var self = this;

        $.getJSON("/api/item", function(resp) {
            self.pushArray(self.items, resp.response);
        });
    },

    createItem: function() {

    }
});


