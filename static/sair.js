document.getElementById('logoutForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    try {
        // Realiza uma requisição assíncrona para o servidor para efetuar o logout
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Inclua quaisquer outros headers necessários, como tokens de autenticação
            },
            // Adicione quaisquer dados necessários no corpo da requisição (por exemplo, tokens)
            // body: JSON.stringify({ token: 'seu_token' }),
        });

        // Verifica se a requisição foi bem-sucedida
        if (response.ok) {
            // Redireciona para a página de login após o logout
            window.location.href = '/login';
        } else {
            // Lida com erros (exemplo: exibindo uma mensagem de erro)
            const data = await response.json();
            console.error('Erro durante o logout:', data.message);
        }
    } catch (error) {
        // Lida com erros de rede ou outros
        console.error('Erro durante o logout:', error.message);
    }
});

// Limpa o histórico de navegação
if (typeof history.pushState === "function") {
    history.pushState({}, "Hide", null);
    window.onpopstate = function () {
        history.pushState({}, "Hide", null);
    };
}

// Desativa o cache ao carregar a página
window.onload = function () {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
};

// Evita que o usuário navegue para a página anterior usando o botão Voltar do navegador
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL);
});
