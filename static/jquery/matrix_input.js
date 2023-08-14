var matrix_tbl
$(document).ready(function () {
    matrixDatatable()
    $('#matrixInputBtn').click(function () {
        $('#matrixInputModal').modal('toggle')
    })
    $('#saveInputtedMatrix').click(function () {
        submitMatrixInput()
    })
});

function matrixDatatable() {
    $('#matrix_maintainance_tbl_data').DataTable().destroy()
    matrix_tbl = $('#matrix_maintainance_tbl_data').DataTable({
        processing: true,
        ajax: '/matrixData',
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        columns: [
            { data: 'id' },
            { data: 'area' },
            { data: 'time_added' },
            { data: 'matrix1' },
            { data: 'matrix2' },
            { data: 'matrix3' },
            { data: 'matrix4' },
            { data: 'matrix5' },
            { data: 'matrix6' },
            {
                data: null,
                className: 'text-center',
                render: function (row) {
                    var buttonHtml = '';
                    if (row.controller_name === null) {
                        buttonHtml += ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                            '<button type="button" class="btn btn-outline-danger bx bx-trash delete-btn" data-id="' + row.id + '"></button>' +
                            '</div>';
                    } else {
                        buttonHtml += ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                            '<button type="button" class="btn btn-outline-danger bx bx-trash delete-btn" data-id="' + row.id + '"></button>' +
                            '</div>';
                    }


                    return buttonHtml;
                }
            }
        ],
        order: [[0, 'desc']]
    });

}



function submitMatrixInput() {
    var matrix1 = $('#basic-default-matrix1').val()
    var matrix2 = $('#basic-default-matrix2').val()
    var matrix3 = $('#basic-default-matrix3').val()
    var matrix4 = $('#basic-default-matrix4').val()
    var matrix5 = $('#basic-default-matrix5').val()
    var matrix6 = $('#basic-default-matrix6').val()
    var defaultSelect = $('#defaultSelect').val()

    var formData = new FormData();
    formData.append('matrix1', matrix1)
    formData.append('matrix2', matrix2)
    formData.append('matrix3', matrix3)
    formData.append('matrix4', matrix4)
    formData.append('matrix5', matrix5)
    formData.append('matrix6', matrix6)
    formData.append('defaultSelect', defaultSelect)

    matrixInputAjaxRequest('/matrixMaintenanceInputs', formData)
}



function matrixInputAjaxRequest(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
        },
        success: function (response) {
            console.log("🚀 ~ file: matrix_input.js:92 ~ matrixInputAjaxRequest ~ response:", response)
            matrix_tbl.ajax.reload()

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