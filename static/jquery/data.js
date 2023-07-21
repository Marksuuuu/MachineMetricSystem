$('document').ready(function () {
    dataGatherTableFunction()

})

function dataGatherTableFunction() {
    table = $('#dataTbl').DataTable({
        processing: true,
        ajax: '/data-gather-data',
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        columns: [
            { data: 'id' },
            { data: 'area' },
            { data: 'class' },
            { data: 'emp_no' },
            { data: 'machine_id' },
            { data: 'machine_name' },
            { data: 'mo' },
            { data: 'running_qty' },
            { data: 'status' },
            { data: 'sub_opt_name' },
            { data: 'photo' },
            { data: 'start_date' },
            { data: 'uid' },
            { data: 'machine_status' },
            { data: 'from_client' },
            { data: 'from_client_ip' },
            { data: 'from_client_sid' },
            {
                data: null,
                className: 'text-center',
                render: function (row) {
                    return ' <div class="btn-group" role="group" aria-label="Basic radio toggle button group">' +
                        ' <button type="button" class="btn btn-outline-success bx bxs-pencil swal-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>' +
                        '<button type="button" class="btn btn-outline-info bx bx-list-ol show-btn" data-id="' + row.id + '" data-ip="' + row.ip_address + '"></button>' +
                        '<button type="button" class="btn btn-outline-danger bx bx-trash delete-btn" data-id="' + row.id + '"></button>' +
                        '</div>';
                }
            }

        ],
        columnDefs: [
            { targets: [1, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16], visible: false }
        ],
    });

    $('#toggle-column').on('change', function () {
        var selectedColumn = parseInt($(this).val());

        if (selectedColumn === -1) {
            table.columns().visible(true);
        } else {
            table.columns().visible(false);
            table.column(selectedColumn).visible(true);
        }
    });

}