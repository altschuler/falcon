// binding for menu buttons
ko.bindingHandlers.pager = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var pageId = valueAccessor();
        $(element).click(loadPage.bind(this, pageId));
    }
};

var loadPage = function(template) {
    var vm = vmMap[template];
    $('.page-container').load('/templates/' + template + '.html', function() {
        ko.applyBindings(vm, this);
        vm.construct();
    });
}

var vmMap = {
    'publish': new PublishViewModel(),
    'reach': new ReachViewModel()
};


$(document).ready(function() {
    var iosocket = io.connect();
    iosocket.on('connect', function () {
        console.log("Socket connected");

        iosocket.on('update', function(resp) {
            console.log("Socket update");
        });
    });

    ko.applyBindings({}, $('#wrapper')[0]);

    // load default page
    loadPage('publish');
});