$(document).ready(function () {
    var user = 'user1'
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    // var chatSocket = new WebSocket(ws_scheme + '://' + window.location.host + "/window/");

    // chatSocket.onmessage = function (e) {
    //     var data = JSON.parse(e.data);
    //     var message = data['template'];
    //     console.log(message)
    // };

    // chatSocket.onclose = function (e) {
    //     console.error('Chat socket closed unexpectedly');
    // };
    // $('.item').click(function () {
    //     var template = 'hui';
    //     var data = {
    //         'type': 'Line',
    //         'pk': '1',
    //         'model_name': 'Line'
    //     };
    //     chatSocket.send(JSON.stringify(data));

    // });



    let tooltips = [];
    window.links = [];
    downloadLinkedItems();
    let WW = new WindowWorkflow(
        new WindowController($('#window-container'), $('#hidden-window-container')),
        new WebSocket(ws_scheme + '://' + window.location.host + "/window/"),
        new WebSocket(ws_scheme + '://' + window.location.host + "/windowSave/"),
        new WebSocket(ws_scheme + '://' + window.location.host + "/createPin/"),
        new WebSocket(ws_scheme + '://' + window.location.host + "/search/"),
    );

    WW.makeItemsDraggable($('.item'));
    $(".block .item").hover(
        function () {
            highlightElements([[$(this), 0]], "rgb(36,51,60)", "white", false);
            let links = getLineLinkedItems(this);
            if (links[0].length > 0 || links[1].length > 0) {
                highlightElements(links[0], "#ff4641", "white", true, "Родитель");
                highlightElements(links[1], "#00bfa5", "white", true, "Потомок");
            }


        }, function () {
            highlightElements([[$(".block .item")], 0], "white", "rgb(36,51,60)", false);
            $(".item").tipso('hide');
            $(".item").tipso('destroy');
        }
    );
});


function downloadLinkedItems() {
    var data = {
        pk: $("#block").data("pk"),
    };
    $.ajax({
        type: "GET",
        url: "/annotation_tool/getLineDependencies",
        async: false,
        data: data,
        success: function (response) {
            window.links = response.links;
        },

        error: function (response, error) {
            alert(error);
        }
    });
}

function getLineLinkedItems(item) {
    let pk = parseInt($(item).data('pk'));
    let masters = [];
    let slaves = [];
    var result = [];
    window.links.forEach(function (el) {
        if (el.first_item__object_id === pk) {
            slaves.push([$(".block .item[data-pk='" + el.second_item__object_id + "']"), el.relation__name]);
        }
        if (el.second_item__object_id === pk)
            masters.push([$(".block .item[data-pk='" + el.first_item__object_id + "']"), el.relation__name])
    });
    result[0] = masters;
    result[1] = slaves;
    return result
}

function highlightElements(elements, color, text_color, apply_tooltip, type) {

    elements.forEach(function (node, i, masters) {
        if (apply_tooltip) {
            $(node[0]).tipso({
                background: color,
                speed: 1,
                width: "150px",
                animationIn: 'fadeInLeft',
                animationOut: 'fadeOutLeft',
                position: 'left',
                useTitle: false,
                content: node[1]
            });
            $(node[0]).tipso('show');
        }

        $(node[0]).next().find('p').css("background-color", color);
        $(node[0]).next().find('p').css("color", text_color);
        $(node[0]).next().next().find('p').css("background-color", color);
        $(node[0]).next().next().find('p').css("color", text_color);
    })
}

function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}




