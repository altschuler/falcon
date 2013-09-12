var MainViewModel = BaseViewModel.extend({
    currentPage: ko.observable(''),

    init: function(initialPage) {
        this.currentPage(initialPage);
    }
})
