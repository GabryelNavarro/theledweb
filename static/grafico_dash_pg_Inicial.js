async function criarGraficos(filtro = '') {
    try {
        const response = await fetch('/api/graficos');
        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }
        const dados = await response.json();

        // Filtra as labels e valores com base no filtro
        const filtroLower = filtro.toLowerCase();

        const dadosFiltradosColaborador = {
            labels: ["Total de Colaboradores"], // Como há apenas um valor, não há necessidade de filtrar labels
            valores: dados.grafico_colaborador.valores // Apenas o total
        };

        const dadosFiltradosProduto = {
            labels: dados.grafico_produto.labels.filter(label => label.toLowerCase().includes(filtroLower)),
            valores: dados.grafico_produto.valores.filter((_, index) => dados.grafico_produto.labels[index].toLowerCase().includes(filtroLower))
        };

        // Exibe os gráficos com os dados filtrados
        const ctx1 = document.getElementById('grafico-colaborador').getContext('2d');
        new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: dadosFiltradosColaborador.labels,
                datasets: [{
                    data: dadosFiltradosColaborador.valores,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            }
        });

        const ctx2 = document.getElementById('grafico_produto').getContext('2d');
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: dadosFiltradosProduto.labels,
                datasets: [{
                    data: dadosFiltradosProduto.valores,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            }
        });

    } catch (error) {
        console.error('Erro ao obter dados dos gráficos', error);
    }
}

window.onload = async function () {
    await criarGraficos();
};
