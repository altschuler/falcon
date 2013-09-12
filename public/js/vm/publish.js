var PublishViewModel = BaseViewModel.extend({

    items: ko.observableArray(),

    // initialization
    construct: function() {
        this.getItems();
    },

    // items
    getItems: function() {
        var self = this;
        $.getJSON("/api/item", function(resp) {
            console.log(resp);
            self.pushArray(self.items, resp.response);
        });
    }
});


