var sharedSocket = require('../socket/sharedSocket');

var data = {
    "version":"5.3.9",
    "status":"OK",
    "error":"",
    "response":[
        {"id":"8a1330c93e31b8af013e360d6a2106ea","content":{"message":"Her er den perfekte gave","id":"8a1330c93e31b8af013e360d6a2106ea","network":"facebook","postType":"photo","media":{"fileName":"konfirmationsgave til hende.jpg","url":"http://s3.amazonaws.com/mingler.falcon.scheduled_post_pictures/25c69cba-8881-4147-9fc9-d61a9c2de676"}},"tags":["converstaion","sales"],"status":"draft","channels":[{"name":"Konfirmanden","id":433104606739910}],"scheduled":"2013-08-08T08:00:00.000Z","geo":{"countries":[{"value":"Afghanistan","key":"134"}],"languages":[{"value":"Afrikaans","key":"31"}],"cities":[],"regions":[]}}
    ]
};

exports.list = function(req, res) {
    res.json(data);
};

exports.create = function(req, res) {
    // no validation whatsoever
    var item = createItem(req.body);
    data.response.push(item);

    // emit the update via web socket
    sharedSocket.broadcast.publishingItem(item);

    res.json({status:0});
};

var createItem = function(data) {
    return {
        "id": "8a1330c93e31b8af013e360d6a2106ea",
        "content": {
            "message": data.message,
            "id": "8a1330c93e31b8af013e360d6a2106ea",
            "network": data.network,
            "postType": data.type,
            "media": {
                "fileName": "some_image.jpg",
                "url": data.media || ""
            }
        },
        "tags": data.tags || [],
        "status": "draft",
        "channels": [
            {"name": "Konfirmanden", "id": 433104606739910}
        ],
        "scheduled": "2013-08-08T08:00:00.000Z",
        "geo": {
            "countries": [
                {"value": "Afghanistan", "key": "134"}
            ],
            "languages": [
                {"value": "Afrikaans", "key": "31"}
            ],
            "cities": [],
            "regions": []
        }
    }


}