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
                    title: 'Is anyone present?',
                    text: 'You have been idle for an extended period of time.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    allowOutsideClick: false,
                    confirmButtonText: 'Log me out'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/logout'
                    }
                })

            },

            idle: 1800000,
            keepTracking: true,
            startAtIdle: true
        }).start();
    }
})

function addController(controllerId, controllerName) {

    var formData = new FormData();

    formData.append('id', controllerId)
    formData.append('name', controllerName)


    makeAjaxRequestData('/saveController', formData)
}

function dataTableController() {
    console.log('putang ina')
    $('#DataTables_Table_0').DataTable().destroy()
    table = $('#DataTables_Table_0').DataTable({
        processing: true,
        ajax: '/controller',
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
                makeAjaxRequestData('/deleteController', formData)
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
        makeAjaxRequestShow('/showAllMatrix', formData)
    })

    table.on('click', '#button-addon2', function () {
        addController()
    })
}

function makeAjaxRequestShow(url, data) {
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
            console.log("🚀 ~ file: main.js:170 ~ makeAjaxRequestShow ~ response:", response)
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
    console.log("🚀 ~ file: main.js:195 ~ successResponse ~ response:", response)
    $('#dataTableVar').DataTable().destroy()
    var dataResult = response.data;
    dataResult.forEach(function (row) {
        var status = row.STATUS
        var bgBadgeColor = (status == 'CONNECTED') ? 'primary' : 'danger';

        var btnStatus

        btnStatus = (status == 'CONNECTED')
            ? '<button type="button" class="btn btn-outline-success bx bx-edit edit-btn" data-id="' + row.ID + '"></button>' +
            '<button type="button" class="btn btn-outline-info bx bxs-cloud-download request-file-btn" data-id="' + row.ID + '" data-session="' + row.SESSION + '"></button>' +
            '<button type="button" class="btn btn-outline-danger bx bx-trash" data-id="' + row.ID + '"></button>'
            : '<button type="button" class="btn btn-outline-danger bx bx-trash" data-id="' + row.ID + '"></button>';


        var newRow = '<tr>' +
            '<td>' + row.ID + '</td>' +
            '<td><span class="badge bg-' + bgBadgeColor + '">' + row.IP + '</span></td>' +
            '<td><span class="badge bg-' + bgBadgeColor + '">' + row.SESSION + '</span></td>' +
            '<td><span class="badge bg-' + bgBadgeColor + '">' + row.PORT + '</span></td>' +
            '<td><span class="badge bg-' + bgBadgeColor + '">' + row.MACHINE_SETUP + '</span></td>' +
            '<td><span class="badge bg-' + bgBadgeColor + '">' + row.TIME_ADDED + '</span></td>' +
            '<td><span class="badge bg-' + bgBadgeColor + '">' + row.STATUS + '</span></td>' +
            '<td><div class="btn-group" role="group" aria-label="Basic radio toggle button group">'
            + btnStatus + '</div>' +
            '</td>' +
            '</tr>';
        $('#dataTableVarTbody').append(newRow);
    });

    controllerModal = $('#dataTableVar').DataTable({
        processing: true,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        order: [[3, 'desc']]
    });

    $('.request-file-btn').click(function () {
        $('#askForFileModal').modal('toggle')

        console.log('test')
    })

    $('.edit-btn').click(function () {
        var rowId = $(this).data('id');
        var machineSetupCell = $(this).closest('tr').find('td:eq(4)');
        var machineSetupBtn = $(this).closest('tr').find('td:eq(7)');













        var selectMachineName = $('<select class="form-control" id="machine_name_var"></select>');
        machineSetupCell.empty().append(selectMachineName);
        getMachinesNamesApi();

        var btnSave = $('<button type="button" class="btn btn-outline-warning bx bx-save text-nowrap btn-save"></button>');
        machineSetupBtn.empty().append(btnSave);

        $('#dataTableVar').on('click', '.btn-save', function () {
            var machno = $('#machine_name_var option:selected').attr('data-machno');
            console.log("🚀 ~ file: main.js:249 ~ machno:", machno)
            var id = $(this).closest('tr').find('td:eq(0)').text();
            var sessionID = $(this).closest('tr').find('td:eq(2)').text();
            var selectedArea = $('#area_var').val();
            var selectedMachineName = $('#machine_name_var').val();
            console.log("🚀 ~ file: main.js:248 ~ selectedMachineName:", selectedMachineName)

            var formData = new FormData();
            formData.append('id', id);
            formData.append('selectedArea', selectedArea);
            formData.append('selectedMachineName', selectedMachineName);
            formData.append('sessionID', sessionID);
            formData.append('machno', machno);




            makeAjaxRequestData('/updateClientData', formData);


        });



    });

    function getMachinesNamesApi() {
        $.ajax({
            url: "/getMachinesNamesApi",
            type: "GET",
            success: function (response) {
                result = response

                var select = $("#machine_name_var");
                select.empty();

                $.each(result, function (index, name) {
                    select.append($('<option data-machno="' + name.MACHNO + '"></option>').val(name.MACH201_ID).html(name.MACHNO + " ( " + name.CLASS + " )"));
                });

                select.select2({
                    dropdownParent: $('#exLargeModal'),
                    width: '100%'
                });
            },
            error: function (error) {
                console.log("Error in API request:", error);
            }
        });
    }
}

function makeAjaxRequestData(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
        },
        success: function (response) {
            console.log("🚀 ~ file: main.js:309 ~ makeAjaxRequestData ~ response:", response)
            console.log("🚀 ~ file: main.js:303 ~ makeAjaxRequestData ~ response:", response.sessionID)
            console.log("🚀 ~ file: main.js:302 ~ makeAjaxRequestData ~ response:", response.data)



            table.ajax.reload();

            passDataToClient(response)

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


function passDataToClient(response) {
    console.log("🚀 ~ file: main.js:342 ~ passDataToClient ~ response:", response)
    var socket = io.connect();
    dataToPass = response.data
    sessionID = response.sessionID
    machno = response.machno
    console.log("🚀 ~ file: main.js:343 ~ passDataToClient ~ sessionID:", sessionID)
    data = dataToPass[0]
    console.log("🚀 ~ file: main.js:345 ~ passDataToClient ~ data:", data)
    var data = {
        sessionID: sessionID,
        dataToPass: dataToPass,
        machno: machno
    };
    console.log("🚀 ~ file: main.js:346 ~ passDataToClient ~ data:", data)

    socket.emit('sendDataToClient', data);
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




