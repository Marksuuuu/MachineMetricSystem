$(document).ready(function () {
  $('#sign-in').click(function () {
    var username = $('#username').val();
    var password = $('#password').val();

    var formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    ajaxLogin('/', formData);
  });
});

function ajaxLogin(url, data) {
  $.ajax({
    url: url,
    method: 'POST',
    data: data,
    processData: false,
    contentType: false,
    beforeSend: function () {
    },
    success: function (data) {
      if (data.data == 1) {
        showNotification('warning', 'Invalid input');
      } else if (data.data == 2) {
        showNotification('warning', 'Employee Details not Found, please check');
      } else {
        showNotification('success', 'Logging in', data);
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      console.error('Error during login request:', errorThrown);
    },
    complete: function () {
    }
  });
}

function showNotification(icon, title, data) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: icon,
    title: title,
  }).then(function () {
    window.location.href = data.data;

  });

}