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
            labels: dados.grafico_colaborador.labels.filter(label => label.toLowerCase().includes(filtroLower)),
            valores: dados.grafico_colaborador.valores.filter((_, index) => dados.grafico_colaborador.labels[index].toLowerCase().includes(filtroLower))
        };

        const dadosFiltradosProduto = {
            labels: dados.grafico_produto.labels.filter(label => label.toLowerCase().includes(filtroLower)),
            valores: dados.grafico_produto.valores.filter((_, index) => dados.grafico_produto.labels[index].toLowerCase().includes(filtroLower))
        };

        // Exibe os gráficos com os dados filtrados
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
                        position: 'top', // Coloca a legenda no topo
                        labels: {
                            boxWidth: 15, // Ajuste do tamanho da caixa da legenda
                            padding: 20,   // Espaçamento entre as legendas
                            font: {
                                size: 12,   // Ajuste do tamanho da fonte
                                weight: 'none' // Peso da fonte
                            }
                        

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
            type: 'line',
            data: {
                labels: dadosFiltradosProduto.labels,
                datasets: [{
                    data: dadosFiltradosProduto.valores,
                    label: 'QUANTIDADE DE PRODUTOS',
                    borderColor: ' rgba(19, 19, 19, 0.781)',
                    borderWidth: 2,
                    pointRadius: 7,
                    pointBackgroundColor: ['#E5BD40','#EE5E54', 'BC669B', '#5C55A0'],
                    backgroundColor: ['#E5BD40', ' #EE5E54', '#BC669B', '#5C55A0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top', // Coloca a legenda no topo
                        labels: {
                            boxWidth: 20, // Ajuste do tamanho da caixa da legenda
                            padding: 10,   // Espaçamento entre as legendas
                            font: {
                                size: 12,  // Ajuste do tamanho da fonte
                                weight: 'none', // Peso da fonte
                                
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'PODUTO MODELO',
                            padding: {
                                bottom: 150

                            },
                            offset: true
                            
                        },
                        grid:{
                            color:'#F2F1F1',
                            lineWidth:1,
                            borderColor: '#F2F1F1',
                            borderWidth:5,
                            tickColor: '#F2F1F1'


                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'QUANTIDADE'
                        
                        }
                    },
                    

                    
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter dados dos gráficos', error);
    }
}

window.onload = async function () {
    await criarGraficos();
};
