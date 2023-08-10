$(document).ready(function () {
    var socket = io.connect();

    socket.on('details', function (data) {
        console.log('Received server response:', data);
        if ('error' in data) {
            $('#card-container').html('<div class="card"><div class="card-body"><p class="card-text">' + data.error + '</p></div></div>');
        } else {
            for (x = 0; x < data.length; x++) {
                var cardHTML =  '<div class="col-md-4 pb-4">'
                cardHTML += '<div class="card">'
                cardHTML += '<div class="card-header">Real-time Card</div>';
                cardHTML += '<div class="card-body">';
                cardHTML += '<p class="card-text">ID: ' + data[x].ID + '</p>';
                cardHTML += '<p class="card-text">IP Address: ' + data[x].IP + '</p>';
                cardHTML += '<p class="card-text">Session: ' + data[x].SESSION + '</p>';
                cardHTML += '<p class="card-text">Status: ' + data[x].STATUS + '</p>';
                cardHTML += '</div>'
                cardHTML += '</div>'
                cardHTML += '</div>'
                cardHTML += '</div>';
                $('.machineCard').append(cardHTML);
            }

        }

    });

    socket.on('passingDataToJs', function(data){
        console.log("🚀 ~ file: main.js:30 ~ socket.on ~ data:", data)
    })
});