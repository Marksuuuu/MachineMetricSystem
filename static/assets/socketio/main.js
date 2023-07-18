// main.js
var socket = io.connect();

socket.on('server_response_controller', function(data){
    console.log("🚀 ~ file: socketio-main.js:4 ~ socket.on ~ data:", data);
});

socket.on('server_response_client', function(data){
    console.log("🚀 ~ file: socketio-main.js:9 ~ socket.on ~ data:", data);
});
