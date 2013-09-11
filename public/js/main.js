$(document).ready(function() {

    var ViewModel = (function(io) {
        var self = this;

        this.pageTitle = ko.observable("Falcon Social test");
        this.items = ko.observableArray();

        this.getItems = function() {
            $.getJSON("/item/list", function(resp) {
                _.each(resp.response, function (obj) {
                    console.log(obj);
                    self.items.push(ko.mapping.fromJS(obj));
                });
            });
        };

        this.addItem = function() {
            io.send($('#message').val());
        };
    });

    var iosocket = io.connect();
    iosocket.on('connect', function () {
        console.log("Socket connected");

        iosocket.on('update', function(resp) {
            console.log("Socket update");
        });
    });

    var vm = new ViewModel(iosocket);
    vm.getItems();

    ko.applyBindings(vm, $('#wrapper')[0]);
});