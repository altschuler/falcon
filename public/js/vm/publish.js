var PublishViewModel = BaseViewModel.extend({

    items: ko.observableArray([]),

    socket: null,

    // item creation
    itemTags: ko.observableArray([]),
    itemMessage: ko.observable(''),
    itemType: ko.observable(''),
    itemMedia: ko.observable(''),
    itemNetwork: ko.observable(''),

    tagInput: ko.observable(''),

    availableNetworks: ['facebook', 'instagram', 'myspace', 'twitter'],
    availableTypes: ['photo', 'status', 'audio'],

    // initialization
    construct: function() {
        var self = this;

        this.items([]);

        this.getItems();

        this.socket = io.connect("http://localhost:3000", {'force new connection': true});

        // listen
        this.socket.on('connect', function () {
            console.log("Publish socket connected");
        });

        this.socket.on('publishUpdate', function(data) {
            console.log("Publish socket update");
            self.items.push(ko.mapping.fromJS(data));
        });

        this.socket.on('disconnect', function() {
            console.log("Publish socket disconnected");
        });

        // emit
        this.socket.emit('publishFeed');
    },

    destruct: function() {
        this.socket.disconnect();
    },

    getItems: function() {
        var self = this;

        $.getJSON("/api/item", function(res) {
            self.pushArray(self.items, res.response);
        });
    },

    createItem: function() {
        var self = this;
        $.ajax({
            url: '/api/item',
            method: 'POST',
            dataType: 'json',
            data: self.getFormItem()
        })

        // clear form
        this.itemMessage('');
        this.itemType('');
        this.itemNetwork('');
        this.itemMedia('');
        this.itemTags([]);
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
            media: this.itemMedia(),
            tags: this.itemTags()
        }
    }

});


