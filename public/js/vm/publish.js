var PublishViewModel = BaseViewModel.extend({

    items: ko.observableArray([]),

    socket: null,

    // item creation
    itemTags: ko.observableArray(),
    itemMessage: ko.observable(),
    itemType: ko.observable(),
    itemNetwork: ko.observable(),

    tagInput: ko.observable(),

    availableNetworks: ['facebook', 'instagram', 'myspace', 'twitter'],
    availableTypes: ['photo', 'status', 'audio'],

    // initialization
    construct: function() {
        this.items([]);

        this.getItems();

        this.socket = io.connect("http://localhost:3000", {'force new connection': true});

        // listen
        this.socket.on('connect', function () {
            console.log("Publish socket connected");
        });

        this.socket.on('publishUpdate', function(data) {
            console.log("Publish socket update");
            self.reaches.push(ko.mapping.fromJS(data));
            self.renderReaches();
        });

        this.socket.on('disconnect', function() {
            console.log("Publish socket disconnected");
        });

        // emit
        this.socket.emit('publishFeed');
    },

    getItems: function() {
        var self = this;

        $.getJSON("/api/item", function(resp) {
            self.pushArray(self.items, resp.response);
        });
    },

    createItem: function() {

        console.log(this.getFormItem());
    },

    addTag: function() {
        if (_.contains(this.itemTags(), this.tagInput()) || this.tagInput().length < 1)
            return;

        this.itemTags.push(this.tagInput());
        this.tagInput('');
    },

    removeTag: function() {
        console.log(this);
    },

    getFormItem: function() {
        return {
            message: this.itemMessage(),
            type: this.itemType(),
            network: this.itemNetwork(),
            tags: this.itemTags()
        }
    }

});


