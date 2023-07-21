function loginFunction(){
    function submitForm(event) {
        document.getElementById('loginForm').addEventListener('submit', function(event) {
          event.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const data = {
            username: username,
            password: password
          };
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                  window.location.href = '/index?success=true';
                } else {
                  alert(response.error);
                }
              } else {
                alert('An error occurred: ' + xhr.statusText);
              }
            }
          };
          xhr.send(JSON.stringify(data));
        });
      }
}