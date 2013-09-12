var BaseViewModel = Class.extend({
    // default empty initializor
    construct: function() {},

    pushArray: function(arr, items) {
        _.each(items, function (obj) {
            arr.push(ko.mapping.fromJS(obj));
        });
    }
});
