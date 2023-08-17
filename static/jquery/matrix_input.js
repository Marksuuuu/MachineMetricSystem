var matrix_tbl
$(document).ready(function () {
    matrixDatatable()
    // getClientSelectData()
    Select2Area()

    $('#matrixInputBtn').click(function () {
        $('#matrixInputModal').modal('toggle')
        getMatrixSelectData()
    })
    $('#saveInputtedMatrix').click(function () {
        submitMatrixInput()
    })

    $('#putangInangSelect').select2({
        dropdownParent: $('#matrixInputModal'),
        width: '100%'
    });

    $('#defaultSelect').select2({
        dropdownParent: $('#matrixInputModal'),
        width: '100%'
    });



});

function Select2Area() {
    $('#areaSelect').select2({
        placeholder: "Select a area",
        dropdownParent: $('#matrixInputModal'),
        width: '100%',
    });

    function addOption(value, text) {
        var newOption = new Option(text, value, false, false);
        $('#areaSelect').append(newOption).trigger('change');
    }
    addOption('', '');
    addOption('Wirebond', 'Wirebond');
    addOption('EOL1', 'EOL1');
    addOption('EOL2', 'EOL2');
    addOption('Die Attach', 'Die Attach');
    addOption('Mold', 'Mold');
    addOption('Die Prep', 'Die Prep');

    $('#areaSelect').on('change', function () {
        var selectedValue = $(this).val();

        var formData = new FormData();
        formData.append('selectedValue', selectedValue)
        AjaxSelectDataRequest('/requestDataFromApi', formData)
    });
}

function AjaxSelectDataRequest(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
            $('#putangInangSelect').select2().html();
            $('#defaultSelect').select2().html();
        },
        success: function (response) {
            console.log("🚀 ~ file: matrix_input.js:69 ~ AjaxSelectDataRequest ~ response:", response)
            // var formattedData = [];

            // if (Array.isArray(response.data) && response.data == 1) {
            //     response = [{ id: 'no-data', text: 'No Data Available' }];
            //     formattedData = response.data.map(function (item) {
            //         return { id: item, text: item };
            //     });
            // } else {
            //     formattedData = response.data.map(function (item) {
            //         return { id: item, text: item };
            //     });
            // }

            // $('#putangInangSelect').select2({
            //     dropdownParent: $('#matrixInputModal'),
            //     width: '100%',
            //     data: formattedData,
            //     // multiple:true
            // });
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



// function getClientSelectData() {
//     $.ajax({
//         url: "/clientSelect",
//         type: "GET",
//         success: function (response) {
//             result = response
//             console.log("🚀 ~ file: matrix_input.js:24 ~ getClientSelectData ~ result:", result)
//             var options = ''
//             var select = $("#clientSelect");
//             select.empty();

//             $('#groupSelect').select2({
//                 dropdownParent: $('#matrixInputModal'),
//                 width: '100%',
//                 data: result
//             });
//         },
//         error: function (error) {
//             console.log("Error in API request:", error);
//         }
//     });
// }


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
            { data: 'group_name' },
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
                            '<button type="button" class="btn btn-outline-success bx bx-sync sync-btn" data-id="' + row.id + '" data-grp-name = "' + row.group_name + '"></button>' +
                            '<button type="button" class="btn btn-outline-primary bx bx-pencil delete-btn" data-id="' + row.id + '"></button>' +
                            '</div>';
                    }


                    return buttonHtml;
                }
            }
        ],
        order: [[0, 'desc']]
    });

    matrix_tbl.on('click', '.sync-btn', function () {
        var id = $(this).attr('data-id')
        var grp_name = $(this).attr('data-grp-name')
        console.log("🚀 ~ file: matrix_input.js:177 ~ grp_name:", grp_name)

        var formData = new FormData()

        formData.append('grp_name', grp_name)
        SyncRequestAjax('/SyncRequestAjax', formData)

    })


}

function SyncRequestAjax(url, data) {
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function () {
        },
        success: function (response) {
            sendMatrixToClient(response)

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


function sendMatrixToClient(response) {
    console.log("🚀 ~ file: matrix_input.js:226 ~ sendMatrixToClient ~ response:", response)



    var sessionIDS = [];
    if (Array.isArray(response.data)) {
        sessionIDS = response.data.map(function (item) {
            return item.session;
        });
    }


    var matrixValues = [];

    if (Array.isArray(response.matrix)) {
        matrixValues = response.matrix.map(function (matrixItem) {
            return Object.values(matrixItem);
        });
    }
    console.log("🚀 ~ file: matrix_input.js:239 ~ sendMatrixToClient ~ matrixValues:", matrixValues)

    console.log("🚀 ~ file: matrix_input.js:231 ~ sessionIDS ~ sessionIDS:", sessionIDS)

    var socket = io.connect();
    var data = {
        'sessionID': sessionIDS,
        'matrix': matrixValues
    };


    socket.emit('sendMatrixDataToClient', data);
}


function submitMatrixInput() {
    var matrix1 = $('#basic-default-matrix1').val()
    var matrix2 = $('#basic-default-matrix2').val()
    var matrix3 = $('#basic-default-matrix3').val()
    var matrix4 = $('#basic-default-matrix4').val()
    var matrix5 = $('#basic-default-matrix5').val()
    var matrix6 = $('#basic-default-matrix6').val()
    var defaultSelect = $('#areaSelect').val()
    console.log("🚀 ~ file: matrix_input.js:189 ~ submitMatrixInput ~ defaultSelect:", defaultSelect)
    var putangInangSelect = $('#putangInangSelect').val()
    console.log("🚀 ~ file: matrix_input.js:190 ~ submitMatrixInput ~ putangInangSelect:", putangInangSelect)

    // console.log("🚀 ~ file: matrix_input.js:177 ~ submitMatrixInput ~ defaultSelect:", defaultSelect)


    var formData = new FormData();
    formData.append('matrix1', matrix1)
    formData.append('matrix2', matrix2)
    formData.append('matrix3', matrix3)
    formData.append('matrix4', matrix4)
    formData.append('matrix5', matrix5)
    formData.append('matrix6', matrix6)
    formData.append('defaultSelect', defaultSelect)
    formData.append('groupSelect', putangInangSelect)

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