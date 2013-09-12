// binding for menu buttons
ko.bindingHandlers.pager = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var pageId = valueAccessor();

        $(element).click(loadPage.bind(this, pageId));
    }
};

var vm = new MainViewModel('publish');
var container = $('.page-container');

// load and construct new page via ajax
var loadPage = function (template) {
    vm.currentPage(template);
    // destruct current viewmodel (if present)
    var currentVM = ko.dataFor(container.get(0));
    if (typeof currentVM.destruct === 'function')
        currentVM.destruct();

    var nextVM = new vmMap[template];
    container.load('/templates/' + template + '.html', function () {
        ko.applyBindings(nextVM, this);

        // construct new vm
        nextVM.construct();
    });
}

var vmMap = {
    'publish': PublishViewModel,
    'reach': ReachViewModel,
    'about': BaseViewModel
};

$(document).ready(function () {
    // route to hash if set
    var hash = window.location.hash.substr(1);
    if (hash.length > 0)
        vm.currentPage(hash);

    ko.applyBindings(vm, $('#wrapper')[0]);

    // load default page
    loadPage(vm.currentPage());
});