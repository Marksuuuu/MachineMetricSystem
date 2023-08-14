var resultDatatable

$('document').ready(function () {
    dataTableMatrixControllers()

    $('#saveBtn').click(function () {
        dataValues()
        console.log('test')
    })

    $('#matrix_setup_tbl_id').on('click', '.selectall', function () {
        console.log('clicked')
        var allPages = resultDatatable.cells().nodes();
        $(allPages).find('.checkBox').prop('checked', this.checked);

        // if ($(this).is(':checked')) {
        //     $('#matrix_setup_tbl_idTbody').find('.checkBox').prop('checked', true);
        // } else {
        //     $('#matrix_setup_tbl_idTbody').prop('checked', false);
        // }
    });
})

function dataTableMatrixControllers() {
    $('#matrix_setup_tbl').DataTable().destroy()
    var table = $('#matrix_setup_tbl').DataTable({
        processing: true,
        ajax: '/matrixControllers',
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        columns: [
            { data: 'id' },
            { data: 'ip_address' },
            { data: 'controller_name' },
            { data: 'time_added' },
            { data: 'session' },
            {
                data: null,
                className: 'text-center',
                render: function (row) {
                    var buttonHtml = '';
                    if (row.controller_name === null) {
                        buttonHtml += ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                            '<button type="button" class="btn btn-outline-info bx bx-list-ol show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>' +
                            '</div>';
                    } else {
                        buttonHtml += ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                            '<button type="button" class="btn btn-outline-info bx bx-list-ol show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '" show-controller="' + row.controller_name + '"></button>' +
                            '</div>';
                    }


                    return buttonHtml;
                }
            }
        ],
        order: [[3, 'desc']]
    });


    table.on('click', '.show-btn', function () {
        var controllerIp = $(this).attr('data-ip')
        var showController = $(this).attr('show-controller')
        $("#matrix_modal").text(showController);
        $('#matrixShowModal').modal('toggle')

        var formData = new FormData();
        formData.append('controllerIp', controllerIp)
        makeRequest('/showAllMatrix', formData)
    })

    table.on('click', '#button-addon2', function () {
        addController()
    })

}

function makeRequest(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
            $('#matrix_setup_tbl').DataTable().destroy();
            $('#matrix_setup_tbl_idTbody').html('')
        },
        success: function (response) {
            console.log("🚀 ~ file: matrix_setup.js:71 ~ makeRequest ~ response:", response)
            successResponse(response)

        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 0) {
                alert('No internet connection.')
            } else if (jqXHR.status === 404) {
                alert('Requested page not found [404].')
            } else if (jqXHR.status === 500) {
                alert('Internal Server Error [500].')
            } else if (textStatus === 'parsererror') {
                alert('Requested JSON parsing failed.')
            } else if (textStatus === 'timeout') {
                alert('Time out error.')
            } else if (textStatus === 'abort') {
                alert('Ajax request aborted.')
            } else {
                alert('Uncaught Error: ' + errorThrown)
            }
        }
    }).done(function () {
    })


    function successResponse(response) {
        $('#matrix_setup_tbl_id').DataTable().destroy();
        $('#matrix_setup_tbl_idTbody').html('')
        var dataResult = response.data;
        console.log("🚀 ~ file: matrix_setup.js:99 ~ successResponse ~ dataResult:", dataResult)
        dataResult.forEach(function (row) {
            var buttonHtml = '';
            if (row.controller_name === null) {
                buttonHtml = '<input class="form-check-input" type="checkbox" name="sample[]" value="' + row.SESSION + '" id="checkBox" disabled />';
            } else {
                buttonHtml = '<input class="form-check-input checkBox" type="checkbox" name="sample[]" value="' + row.SESSION + '" id="checkBox" />';
            }

            var newRow = '<tr>' +
                '<td>' + buttonHtml + '</td>' +
                '<td><span class="badge bg-label-primary">' + row.ID + '</span></td>' +
                '<td><span class="badge bg-label-primary">' + row.IP + '</span></td>' +
                '<td><span class="badge bg-label-primary">' + row.SESSION + '</span></td>' +
                '<td><span class="badge bg-label-primary">' + row.PORT + '</span></td>' +
                '<td><span class="badge bg-label-primary">' + row.MACHINE_SETUP + '</span></td>' +
                '<td><span class="badge bg-label-primary">' + row.TIME_ADDED + '</span></td>' +
                '<td><span class="badge bg-primary">' + row.STATUS + '</span></td>' +
                '</tr>';

            $('#matrix_setup_tbl_idTbody').append(newRow);
        });

        resultDatatable = $('#matrix_setup_tbl_id').DataTable({
            processing: true,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            order: [[3, 'desc']]
        });

    }
}

function dataValues() {
    var matrixInput1 = $('#formtabs-matrix1').val()
    var matrixInput2 = $('#formtabs-matrix2').val()
    var matrixInput3 = $('#formtabs-matrix3').val()
    var matrixInput4 = $('#formtabs-matrix4').val()
    var matrixInput5 = $('#formtabs-matrix5').val()
    var matrixInput6 = $('#formtabs-matrix6').val()

    var formData = new FormData();
    formData.append('matrixInput1', matrixInput1);
    formData.append('matrixInput2', matrixInput2);
    formData.append('matrixInput3', matrixInput3);
    formData.append('matrixInput4', matrixInput4);
    formData.append('matrixInput5', matrixInput5);
    formData.append('matrixInput6', matrixInput6);


    var checkedSessionIDs = [];

    $('#matrix_setup_tbl_idTbody input[type="checkbox"]').each(function () {
        var sessionID = $(this).closest('tr').find('td:eq(3)').text(); // Update index to match the correct column
        console.log("🚀 ~ file: matrix_setup.js:171 ~ sessionID:", sessionID)
        checkedSessionIDs.push(sessionID);
    });

    if (checkedSessionIDs.length === 0) {
        console.log("No checkboxes are checked.");
    } else {
        console.log("Checked Session IDs:", checkedSessionIDs);
    }

    sendMatrixToClient(matrixInput1, matrixInput2, matrixInput3, matrixInput4, matrixInput5, matrixInput6, checkedSessionIDs)
    // ajaxRequest('/matrixInput', formData) 
}


function sendMatrixToClient(matrixInput1, matrixInput2, matrixInput3, matrixInput4, matrixInput5, matrixInput6, sessionID) {
    var socket = io.connect();
    var data = {
        'matrixInput1': matrixInput1,
        'matrixInput2': matrixInput2,
        'matrixInput3': matrixInput3,
        'matrixInput4': matrixInput4,
        'matrixInput5': matrixInput5,
        'matrixInput6': matrixInput6,
        'sessionID': sessionID,
    };

    socket.emit('sendMatrixToClient', data);
}

function ajaxRequest(url,data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
        },
        success: function (response) {

        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 0) {
                alert('No internet connection.')
            } else if (jqXHR.status === 404) {
                alert('Requested page not found [404].')
            } else if (jqXHR.status === 500) {
                alert('Internal Server Error [500].')
            } else if (textStatus === 'parsererror') {
                alert('Requested JSON parsing failed.')
            } else if (textStatus === 'timeout') {
                alert('Time out error.')
            } else if (textStatus === 'abort') {
                alert('Ajax request aborted.')
            } else {
                alert('Uncaught Error: ' + errorThrown)
            }
        }
    }).done(function () {
    })
}




