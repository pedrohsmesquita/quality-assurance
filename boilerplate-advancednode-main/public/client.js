/*global io*/
let socket = io();

socket.on('user', function (data) {
    $('#num-users').text(data.currentUsers + ' users online');
    message = data.username + (data.connected ? ' has joined the chat.' : 'has left the chat.');
    $('#messages').append($('<li>').html('<b>' + message + '<b>'));
});

$(document).ready(function () {
    // Form submittion with new message in field with id 'm'
    $('form').submit(function () {
        var messageToSend = $('#m').val();

        $('#m').val('');
        return false; // prevent form submit from refreshing page
    });
});
