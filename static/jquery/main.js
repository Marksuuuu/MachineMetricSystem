var table

$('document').ready(function () {
    dataTableController()

    $('#button-addon2').click(function () {
        addController()

    })

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
                        buttonHtml += ' <button type="button" class="btn btn-outline-primary bx bxs-save swal-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>';
                    }
                    buttonHtml += ' <button type="button" class="btn btn-outline-danger bx bx-trash delete-btn" data-id="' + row.id + '"></button>' +
                        '<button type="button" class="btn btn-outline-info bx bx-list-ol show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>'+
                        ' <button type="button" class="btn btn-outline-primary bx bxs-edit swal-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>';

                    return buttonHtml;
                }
            }
        ],
    });



    table.on('click', '.swal-btn', function () {
        var controllerId = $(this).data('id');
        var ip = $(this).data('ip');
        Swal.fire({
            title: 'Enter Controller Name',
            input: 'text',
            inputLabel: 'Your Input:',
            showCancelButton: true,
            confirmButtonText: 'Submit',
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
        var modalDataId = $(this).attr('data-id')
        $('#exLargeModal').attr('modal-id', $(this).attr('data-ip'))
        $('#exLargeModal').modal('toggle')
        var controllerIp = $('#exLargeModal').attr('modal-id')

        var formData = new FormData();

        data = JSON.stringify({
            'controllerIp': controllerIp
        })
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
            '<td>' + row.IP + '</td>' + // Replaced row.PORT with row.IP here
            '<td>' + row.SESSION + '</td>' +
            '<td>' + row.PORT + '</td>' +
            '<td>' + row.MACHINE_SETUP + '</td>' +
            '<td>' + row.TIME_ADDED + '</td>' +
            '<td><span class="badge bg-primary">' + row.STATUS + '</span></td>' +
            '<td>' + row.AREA + '</td>' +
            '<td class="text-nowrap"><button type="button" class="btn btn-outline-primary bx bx-list-ol" data-id="'+ row.ID +'"></button>' +
            '<button type="button" class="btn btn-outline-danger bx bx-trash" data-id="'+ row.ID +'"></button></td>' +
            '</tr>';
        $('#dataTableVarTbody').append(newRow);
    });

    $('#dataTableVar').DataTable({
        processing: true,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        order: [[3, 'desc']]
    });
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

}




