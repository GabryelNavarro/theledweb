async function criarGraficos(filtro = '') {
    try {
        const response = await fetch('/api/graficos');  // Ajuste o URL conforme sua API
        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }
        const dados = await response.json();

        // Filtra as labels e valores com base no filtro
        const filtroLower = filtro.toLowerCase();

        const dadosFiltradosColaborador = {
            labels: dados.grafico_colaborador.labels.filter(label => label.toLowerCase().includes(filtroLower)),
            valores: dados.grafico_colaborador.valores.filter((_, index) => dados.grafico_colaborador.labels[index].toLowerCase().includes(filtroLower))
        };

        const dadosFiltradosProduto = {
            labels: dados.grafico_produto.labels.filter(label => label.toLowerCase().includes(filtroLower)),
            valores: dados.grafico_produto.valores.filter((_, index) => dados.grafico_produto.labels[index].toLowerCase().includes(filtroLower))
        };

        // Exibe o gráfico de colaboradores
        const ctx1 = document.getElementById('grafico-colaborador').getContext('2d');
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: dadosFiltradosColaborador.labels,
                datasets: [{
                    data: dadosFiltradosColaborador.valores,
                    label: 'QUANTIDADE DE COLABORADORES',
                    backgroundColor: ['#E5BD40', '#EE5E54', '#BC669B', '#4BC0C0', '#5C55A0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 15,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: 'none'
                            }
                        }
                    },
                    datalabels: {  // Aqui adicionamos a configuração para exibir os números dentro das barras
                        color: '#000',
                        align: 'center',
                        anchor: 'center',
                        font: {
                            weight: 'bold',
                            size: 14
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'COLABORADORES'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'QUANTIDADE'
                        }
                    }
                }
            }
        });

        const ctx2 = document.getElementById('grafico_produto').getContext('2d');
new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: dadosFiltradosProduto.labels,
        datasets: [{
            data: dadosFiltradosProduto.valores,
            label: 'QUANTIDADE DE PRODUTOS',
            borderColor: 'rgba(19, 19, 19, 0.781)',
            borderWidth: 2,
            pointRadius: 7,
            pointBackgroundColor: ['#ED6453', '#ED6453', '#ED6453', '#ED6453'],
            backgroundColor: ['#935F9D', '#ED6453', '#ED6453', '#E89F46',''] //Cores barra grafico (jan, fev, marc...)
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 15,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'none'
                    }
                }
            },
            datalabels: {  // Plugin para exibir os números dentro das barras
                color: '#FFFFFF',  // Cor do texto
                align: 'center', // Alinha os números no centro das barras
                anchor: 'center', // Ancoragem no centro da barra
                font: {
                    weight: 'bold',
                    size: 14
                },
                formatter: function(value, context) {
                    // Formata o número com separadores de milhar
                    return new Intl.NumberFormat('pt-BR').format(value);
                },
                display: function(context) {
                    // Exibe os números somente quando o valor for maior que 0
                    return context.dataset.data[context.dataIndex] > 0;
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'PRODUTOS'
                },
                barPercentage: 0.6  // Ajusta o tamanho das barras
            },
            y: {
                title: {
                    display: true,
                    text: 'QUANTIDADE'
                }
            }
        }
    },
    plugins: [ChartDataLabels]  // Assegura que o plugin de datalabels é carregado corretamente
});
        

    } catch (error) {
        console.error('Erro ao obter dados dos gráficos', error);
    }
}

// Chama a função para criar os gráficos ao carregar a página
window.onload = async function () {
    await criarGraficos();
};

