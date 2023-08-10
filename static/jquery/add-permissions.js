$(document).ready(function () {
    $('#submit').click(function () {
        getInputs()
    })
});

$("#user-emp-id").on("keypress", function (event) {
    if (event.which == 13) {
        var emp_id = $('#user-emp-id').val();
        var formData = new FormData();
        formData.append('emp_id', emp_id);
        ajaxRequest('/get_emp_id', formData);
    }
});

function ajaxRequest(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        contentType: false,
        processData: false, // Correct option name
        beforeSend: function () {
            $('#user-emp-id').val()
            $('#firstname').val()
            $('#lastname').val()
            $('#department').val()
            $('#possition').val()
        },
        success: function (response) {
            response = response.data
            console.log("🚀 ~ file: add-permissions.js:26 ~ ajaxRequest ~ response:", response[0])
            console.log("🚀 ~ file: add-permissions.js:25 ~ ajaxRequest ~ response:", response)
            $('#user-emp-id').val(response[3])
            $('#firstname').val(response[1])
            $('#lastname').val(response[2])
            $('#department').val(response[0])
            $('#possition').val(response[4])
        }
    }).done(function () {

    });
}

function getInputs() {
    var emp_id = $('#user-emp-id').val()
    var fistname = $('#firstname').val(response[1])
    var lastname = $('#lastname').val(response[2])
    var deparment = $('#department').val(response[0])
    var possition = $('#possition').val(response[4])

}






