var resultDatatable

$('document').ready(function () {
    dataTableMatrixControllers()
    getMatrixSelectData()
    $('#saveBtn').click(function () {
        dataValues()
        console.log('test')
    })

    $('#matrix_setup_tbl_id').on('click', '.selectall', function () {
        console.log('clicked')
        var allPages = resultDatatable.cells().nodes();
        $(allPages).find('.checkBox').prop('checked', this.checked);






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
                            '<button type="button" class="btn btn-outline-info bx bx-sync show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '" show-controller="' + row.controller_name + '"></button>' +

                            '</div>';
                    }


                    return buttonHtml;
                }
            }
        ],
        order: [[1, 'desc']]
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
                '<td><span class="badge bg-label-primary">' + row.AREA + '</span></td>' +
                '<td><span class="badge bg-label-primary">' + row.DATE_UPDATE + '</span></td>' +
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
    var selectID = $('#single-select-field').val()

    var checkedSessionIDs = [];
    var clientID = [];

    $('#matrix_setup_tbl_idTbody input[type="checkbox"]').each(function () {
        var sessionID = $(this).closest('tr').find('td:eq(3)').text();
        var clientId = $(this).closest('tr').find('td:eq(1)').text();
        console.log("🚀 ~ file: matrix_setup.js:162 ~ clientID:", clientID)
        console.log("🚀 ~ file: matrix_setup.js:171 ~ sessionID:", sessionID)
        checkedSessionIDs.push(sessionID);
        clientID.push(clientId);
    });

    if (checkedSessionIDs.length === 0 || clientID.length === 0) {
        console.log("No checkboxes are checked.");
    } else {
        console.log("Checked Session IDs:", checkedSessionIDs, clientID);
    }


    var formData = new FormData();
    formData.append('selectID', selectID);
    formData.append('clientID', clientID);
    formData.append('sessionID', checkedSessionIDs);


    matrixAjaxRequest('/matrixInput', formData)
}


function getMatrixSelectData() {
    $.ajax({
        url: "/matrixSelect",
        type: "GET",
        success: function (response) {
            result = response['data']
            console.log("🚀 ~ file: matrix_input.js:88 ~ getMatrixSelectData ~ result:", result)
            var options = ''
            var select = $("#single-select-field");
            select.empty();

            $('#single-select-field').select2({
                dropdownParent: $('#matrixShowModal'),
                width: '100%',
                data: result
            });
        },
        error: function (error) {
            console.log("Error in API request:", error);
        }
    });
}

function matrixAjaxRequest(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
            $('#waitMeContainerMatrix').waitMe({
                effect: 'rotateplane',
                text: 'Please wait...',
                bg: 'rgba(255,255,255,0.7)',
                color: '#435ebe',
                maxSize: '',
                waitTime: -1,
                textPos: 'vertical',
                fontSize: '',
                source: ''
            });

        },
        success: function (response) {

            sendMatrixToClient(response)


            $('#matrixShowModal').modal('hide')

            Swal.fire(
                'Saved!',
                'Your file has been saved.',
                'success'
            )

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
        $('#waitMeContainerMatrix').waitMe('hide');

    })
}

function sendMatrixToClient(response) {

    var matrixData = response.data[0]
    console.log("🚀 ~ file: matrix_setup.js:269 ~ sendMatrixToClient ~ matrixData:", matrixData)
    var matrixInput1 = matrixData['MATRIX1']
    var matrixInput2 = matrixData['MATRIX2']
    var matrixInput3 = matrixData['MATRIX3']
    var matrixInput4 = matrixData['MATRIX4']
    var matrixInput5 = matrixData['MATRIX5']
    var matrixInput6 = matrixData['MATRIX6']
    console.log("🚀 ~ file: matrix_setup.js:276 ~ sendMatrixToClient ~ matrixInput6:", matrixInput6)
    var sessionID = response.sessionID

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
    console.log("🚀 ~ file: matrix_setup.js:279 ~ sendMatrixToClient ~ data:", data)


    socket.emit('sendMatrixDataToClient', data);
}




