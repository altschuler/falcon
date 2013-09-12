var BaseViewModel = Class.extend({
    // default empty constructor and destructor
    construct: function() {},
    destruct: function() {},

    pushArray: function(arr, items) {
        _.each(items, function (obj) {
            arr.push(ko.mapping.fromJS(obj));
        });
    }
});
