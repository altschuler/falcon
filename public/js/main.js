$(document).ready(function() {
    var ViewModel = (function() {
        this.pageTitle = ko.observable("Falcon Social test");
    });

    var iosocket = io.connect();
    iosocket.on('connect', function () {
        console.log("Socket connected");

        iosocket.on('update', function(resp) {
            console.log("Socket update");
        });
    });

    ko.applyBindings(new ViewModel(), $('#wrapper')[0]);
});