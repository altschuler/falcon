var ReachViewModel = BaseViewModel.extend({
    reaches: ko.observableArray(),
    isLive: ko.observable(false),
    socket: null,

    construct: function() {
        this.getReach();
    },

    destruct: function() {
        if (this.socket != null)
            this.socket.disconnect();
    },

    stopLiveFeed: function() {
        if (this.socket != null)
            this.socket.disconnect();

        this.isLive(false);
    },

    startLiveFeed: function() {
        var self = this;

        this.isLive(true);

        this.socket = io.connect("http://localhost:3000", {'force new connection': true});

        // listen
        this.socket.on('connect', function () {
            console.log("Reach socket connected");
        });

        this.socket.on('update', function(data) {
            console.log("Reach socket update");
            self.reaches.push(ko.mapping.fromJS(data));
            self.renderReaches();
        });

        this.socket.on('disconnect', function() {
            console.log("Reach socket disconnected");
        });

        // emit
        this.socket.emit('reachFeed');
    },

    // reaches
    getReach: function() {
        var self = this;

        $.getJSON("/api/reach", function(resp) {
            self.pushArray(self.reaches, resp.response);

            self.renderReaches();
        });
    },

    renderReaches: function() {
        // empty graph container
        $('.graph').empty();

        // filter away empty reach data
        var filtered = _.filter(this.reaches(), function(obj) {
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
            return { date: dateFormat.parse(data.timestamp), value: parseInt(data.value) }
        });

        var imprs_org = _.map(filtered, function(obj) {
            var data = ko.mapping.toJS(obj.post_impressions_organic()[0]);
            return { date: dateFormat.parse(data.timestamp), value: parseInt(data.value) }
        });

        var sort = function (coll) {
            return _.sortBy(coll, function(obj) {
                return obj.date;
            });
        };

        // sort data
        imprs = sort(imprs);
        imprs_org = sort(imprs_org);

        // create merged collection to calculate graph domain
        var merged = _.union(imprs, imprs_org);

        // scale functions
        var x = d3.time.scale().range([0, gprop.width - gprop.margin.left - gprop.margin.right]);
        var y = d3.scale.linear().range([gprop.height, 0]);


        // axis
        var xAxis = d3.svg.axis().scale(x).orient('bottom');
        var yAxis = d3.svg.axis().scale(y).orient('left');

        var line = d3.svg.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) });

        // use the merged collection to calculate the doman
        x.domain(d3.extent(merged, function(d) { return d.date; }));
        y.domain(d3.extent(merged, function(d) { return d.value; }));

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

        // draw impressions graph
        svg.append('path')
            .datum(imprs)
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke', 'steelblue');

        // draw organic impressions graph
        svg.append('path')
            .datum(imprs_org)
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke', 'darkred');
    }
});