// binding for menu buttons
ko.bindingHandlers.pager = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var pageId = valueAccessor();
        $(element).click(loadPage.bind(this, pageId));
    }
};

var container = $('.page-container');

var loadPage = function(template) {
    // destruct current viewmodel (if present)
    var currentVM = ko.dataFor(container.get(0));
    if (currentVM.destruct !== undefined)
        currentVM.destruct();

    var nextVM = vmMap[template];
    container.load('/templates/' + template + '.html', function() {
        ko.applyBindings(nextVM, this);

        // construct new vm
        nextVM.construct();
    });
}

var vmMap = {
    'publish': new PublishViewModel(),
    'reach': new ReachViewModel()
};


$(document).ready(function() {
    ko.applyBindings({}, $('#wrapper')[0]);

    // load default page
    loadPage('publish');
});