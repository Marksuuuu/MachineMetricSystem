var table
var controllerModal
$('document').ready(function () {
    dataTableController()

    $('#button-addon2').click(function () {
        addController()

    })

    let currentPath = $(location).attr('href');
    if (currentPath.endsWith('/')) {
        console.log('no comment')
    } else {
        idle({
            onIdle: function () {
                Swal.fire({
                    title: 'You have been log out!',
                    text: "You have been idle for a long time..",
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    allowOutsideClick: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/logout'
                    }
                })

            },
            idle: 3000,
            // idle: 1800000,
            keepTracking: true,
            startAtIdle: true
        }).start();
    }
})


function addController(controllerId, controllerName) {

    var formData = new FormData();

    formData.append('id', controllerId)
    formData.append('name', controllerName)


    makeAjaxRequest('/saveController', formData)
}

function dataTableController() {
    table = $('#DataTables_Table_0').DataTable({
        processing: true,
        ajax: '/controller',
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        columns: [
            { data: 'id' },
            { data: 'ip_address' },
            {
                data: 'controller_name'
            },
            { data: 'time_added' },
            { data: 'session' },
            {
                data: null,
                className: 'text-center',
                render: function (row) {
                    var buttonHtml = '';
                    if (row.controller_name === null) {
                        buttonHtml += ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                            ' <button type="button" class="btn btn-outline-success bx bxs-pencil swal-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>' +
                            '<button type="button" class="btn btn-outline-info bx bx-list-ol show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>' +
                            '<button type="button" class="btn btn-outline-danger bx bx-trash delete-btn" data-id="' + row.id + '"></button>' +
                            '</div>';
                    } else {
                        buttonHtml += ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                            ' <button type="button" class="btn btn-outline-primary bx bxs-edit swal-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '" show-controller="' + row.controller_name + '"></button>' +
                            '<button type="button" class="btn btn-outline-info bx bx-list-ol show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '" show-controller="' + row.controller_name + '"></button>' +
                            '<button type="button" class="btn btn-outline-danger bx bx-trash delete-btn" data-id="' + row.id + '"></button>' +
                            '</div>';
                    }


                    return buttonHtml;
                }
            }
        ],
        order: [[3, 'desc']]
    });

    table.on('click', '.delete-btn', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                )
                var id = $(this).attr('data-id')
                var formData = new FormData();
                formData.append('id', id)
                makeAjaxRequest('/deleteController', formData)
            }
        })

    })

    table.on('click', '.swal-btn', function () {
        var controllerId = $(this).data('id');
        var machineSetupCell = $(this).closest('tr').find('td:eq(2)').text();
        var ip = $(this).data('ip');
        Swal.fire({
            title: 'Enter Controller Name',
            input: 'text',
            inputPlaceholder: machineSetupCell,
            inputLabel: 'Your Input:',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            inputValue: machineSetupCell,
            showLoaderOnConfirm: true,
            preConfirm: function (value) {
                return value;
            },
            allowOutsideClick: () => !Swal.isLoading(),
        }).then(function (result) {
            if (result.isConfirmed) {
                var controllerName = result.value;
                addController(controllerId, controllerName)
            }
        });
    });

    table.on('click', '.show-btn', function () {
        var controllerIp = $(this).attr('data-ip')
        var showController = $(this).attr('show-controller')
        $("#exampleModalLabel4").text(showController);
        $('#exLargeModal').modal('toggle')

        var formData = new FormData();
        formData.append('controllerIp', controllerIp)
        makeRequest('/showAll', formData)
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
            $('#dataTableVar').DataTable().destroy()
            $('#dataTableVarTbody').html('')
        },
        success: function (response) {
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
}

function successResponse(response) {
    var dataResult = response.data;
    dataResult.forEach(function (row) {
        var newRow = '<tr>' +
            '<td>' + row.ID + '</td>' +
            '<td>' + row.IP + '</td>' +
            '<td>' + row.SESSION + '</td>' +
            '<td>' + row.PORT + '</td>' +
            '<td>' + row.MACHINE_SETUP + '</td>' +
            '<td>' + row.TIME_ADDED + '</td>' +
            '<td><span class="badge bg-primary">' + row.STATUS + '</span></td>' +
            '<td>' + row.AREA + '</td>' +
            '<td><div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
            '<button type="button" class="btn btn-outline-primary bx bx-list-ol" data-id="' + row.ID + '"></button>' +
            '<button type="button" class="btn btn-outline-success bx bx-edit edit-btn" data-id="' + row.ID + '"></button>' +
            '<button type="button" class="btn btn-outline-danger bx bx-trash" data-id="' + row.ID + '"></button>' +
            '</div>' +
            '</td>' +
            '</tr>';
        $('#dataTableVarTbody').append(newRow);
    });

    controllerModal = $('#dataTableVar').DataTable({
        processing: true,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        order: [[3, 'desc']]
    });

    $('.edit-btn').click(function () {
        var rowId = $(this).data('id');
        var machineSetupCell = $(this).closest('tr').find('td:eq(4)');
        var machineSetupBtn = $(this).closest('tr').find('td:eq(8)');
        var area = $(this).closest('tr').find('td:eq(7)');

        var areaField = $('<select class="form-control" id="area_var"></select>');
        area.empty().append(areaField);

        var areaOptions = ['Die Prep', 'Die Attach', 'Wirebond', 'Mold', 'EOL1', 'EOL2'];
        areaOptions.forEach(function (option) {
            var optionElement = $('<option></option>').text(option);
            areaField.append(optionElement);
        });
        areaField.val(area.text());
        area.empty().append(areaField);

        var selectMachineName = $('<select class="form-control" id="machine_name_var"></select>');
        machineSetupCell.empty().append(selectMachineName);
        getMachinesNamesApi();

        var btnSave = $('<button type="button" class="btn btn-outline-warning bx bx-save text-nowrap btn-save"></button>');
        machineSetupBtn.empty().append(btnSave);

        $(document).on('click', '.btn-save', function () {
            var id = $(this).closest('tr').find('td:eq(0)').text();
            var sessionID = $(this).closest('tr').find('td:eq(2)').text();
            var selectedArea = $('#area_var').val();
            var selectedMachineName = $('#machine_name_var').val();

            var formData = new FormData();
            formData.append('id', id);
            formData.append('selectedArea', selectedArea);
            formData.append('selectedMachineName', selectedMachineName);

            makeAjaxRequest('/updateClientData', formData);
            passDataToClient(sessionID, selectedMachineName);
        });

    });

    function passDataToClient(sessionID, selectedMachineName) {
        var socket = io.connect();

        console.log("Session ID:", sessionID);
        socket.emit('sendDataToClient', { 'sessionID': sessionID, 'selectedMachineName': selectedMachineName });

        socket.on('response', function (data) {
            console.log('Received server response:', data);
        });
    }


    function getMachinesNamesApi() {
        $.ajax({
            url: "/getMachinesNamesApi",
            type: "GET",
            success: function (response) {
                var machineNames = response;
                var select = $("#machine_name_var");
                select.select2({
                    dropdownParent: $('#exLargeModal')
                })

                $.each(machineNames, function (index, name) {
                    select.append($('<option></option>').val(name).html(name));
                });
            },
            error: function (error) {
                console.log("Error in API request:", error);
            }
        });
    }

}

function makeAjaxRequest(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
        },
        success: function (response) {
            table.ajax.reload();
            $('#DataTables_Table_0').DataTable().ajax.reload();
            // controllerModal.ajax.reload();dataTableVar
            responseResponse(response)

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

function responseResponse(response) {
    Swal.fire({
        position: 'center',
        icon: 'info',
        title: 'Notice',
        text: response,
        showConfirmButton: true,
    })
    $('#exLargeModal').modal('hide')
}




