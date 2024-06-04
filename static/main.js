let input = document.querySelector('input');
let icon = document.querySelector('img');
const password = document.getElementById('campo_login');

icon.addEventListener('click', function() {
    container.classList.toggle('visible');
    if(container.classList.contains('visible')) {
        icon.src = 'static/visivel.png';
        input.type = 'text';
    } else {
        icon.src = 'static/oculto.png';
        input.type = 'password';
    }
});

function view() {
    const campoSenha = document.getElementById('campo_senha');
    const icon = document.getElementById('olho');
    

    if (campoSenha.type === 'password') {
        campoSenha.type = 'text';
        icon.src = 'static/img/oculto.png'; // Altera a imagem para o ícone de senha visível
    } else {
        campoSenha.type = 'password';
        icon.src = 'static/img/visivel.png'; // Altera a imagem de volta para o ícone de senha oculta
    }
}

let mostrarSenhaButton = document.getElementById('mostrarSenha');
mostrarSenhaButton.addEventListener('click', view);