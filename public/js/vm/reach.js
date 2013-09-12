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

        var getData = function(key) {
            return _.map(filtered, function(obj) {
                var data = ko.mapping.toJS(obj[key]()[0]);
                return { date: dateFormat.parse(data.timestamp), value: parseInt(data.value) }
            });
        }

        var imprs = getData('post_impressions');
        var imprs_org = getData('post_impressions_organic');
        var imprs_vir = getData('post_impressions_viral');
        var imprs_pay = getData('post_impressions_paid');

        // sort data
        var sort = function (coll) {
            return _.sortBy(coll, function(obj) {
                return obj.date;
            });
        };

        imprs = sort(imprs);
        imprs_org = sort(imprs_org);
        imprs_vir = sort(imprs_vir);
        imprs_pay = sort(imprs_pay);

        // create merged collection to calculate graph domain
        var merged = _.union(imprs, imprs_org, imprs_vir, imprs_pay);

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

        // add 100 to height to make room for legend
        var svg = d3.select('.graph').append('svg')
            .attr('width', gprop.width + gprop.margin.top + gprop.margin.bottom)
            .attr('height', gprop.height + gprop.margin.left + gprop.margin.right + 100)
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

        var drawPath = function (data, color) {
            svg.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line)
                .style('stroke', color);
        };

        // draw impressions data
        drawPath(imprs, 'steelblue');
        drawPath(imprs_org, 'darkred');
        drawPath(imprs_vir, 'darkgreen');
        drawPath(imprs_pay, 'cyan');

        // legend
        var legend = function (x, y, color, label) {
            svg.append('rect')
                .attr('width', 50)
                .attr('height', 10)
                .attr('x', x)
                .attr('y', y)
                .style('fill', color);

            svg.append('text')
                .attr('x', x + 60)
                .attr('y', y + 9)
                .text(label)
        };

        legend(0, gprop.height + 50, 'steelblue', 'impressions');
        legend(0, gprop.height + 70, 'darkred', 'organic');
        legend(0, gprop.height + 90, 'darkgreen', 'viral');
        legend(0, gprop.height + 110, 'cyan', 'paid');


    }
});