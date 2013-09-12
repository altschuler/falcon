$(document).ready(function() {

    var ViewModel = (function(io) {
        var self = this;

        this.pageTitle = ko.observable("Falcon Social test");
        this.items = ko.observableArray();
        this.reaches = ko.observableArray();

        // items
        this.getItems = function() {
            $.getJSON("/item/list", function(resp) {
                self.pushArray(self.items, resp.response);
            });
        };

        this.addItem = function() {
            io.send($('#message').val());
        };

        // reaches
        this.getReach = function() {
            $.getJSON("/reach/list", function(resp) {
                self.pushArray(self.reaches, resp.response);

                self.renderReaches();
            });
        };

        this.renderReaches = function() {
            // filter away empty reach data
            var filtered = _.filter(self.reaches(), function(obj) {
                return typeof obj.post_impressions === 'function';
            });

            // graph properties
            var gprop = {
                width: 800,
                height: 300,
                margin: {left: 80, right: 20, top: 20, bottom: 20}
            }

            // parse data
            var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ');

            var imprs = _.map(filtered, function(obj) {
                var data = ko.mapping.toJS(obj.post_impressions()[0]);
                return {
                    date: dateFormat.parse(data.timestamp),
                    value: parseInt(data.value)
                }
            });

            // sort data
            imprs = _.sortBy(imprs, function(obj) {
                return obj.date;
            });

            // scale functions
            var x = d3.time.scale().range([0, gprop.width - gprop.margin.left - gprop.margin.right]);
            var y = d3.scale.linear().range([gprop.height, 0]);


            // axis
            var xAxis = d3.svg.axis().scale(x).orient('bottom');
            var yAxis = d3.svg.axis().scale(y).orient('left');

            var line = d3.svg.line()
                .x(function(d) {return x(d.date)})
                .y(function(d) {return y(d.value)});

            x.domain(d3.extent(imprs, function(d) { return d.date; }));
            y.domain(d3.extent(imprs, function(d) { return d.value; }));

            var svg = d3.select('.graph').append('svg:svg')
                .attr('width', gprop.width + gprop.margin.top + gprop.margin.bottom)
                .attr('height', gprop.height + gprop.margin.left + gprop.margin.right)
                    .append("g")
                    .attr("transform", "translate(" + gprop.margin.left + "," + gprop.margin.top + ")");

            // draw axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + gprop.height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)

            // draw line graph
            svg.append('path')
                .datum(imprs)
                .attr('class', 'line')
                .attr('d', line);

        };

        this.pushArray = function(arr, items) {
            _.each(items, function (obj) {
                arr.push(ko.mapping.fromJS(obj));
            });
        }
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
    vm.getReach();

    ko.applyBindings(vm, $('#wrapper')[0]);
});