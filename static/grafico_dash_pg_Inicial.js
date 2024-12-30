document.addEventListener('DOMContentLoaded', async function () {
    // Função para carregar os produtos para o filtro
    async function carregarProdutos(filtroProduto = '') {
        try {
            const response = await fetch(`/api/produto?filtro=${filtroProduto}`);
            if (!response.ok) throw new Error('Erro ao carregar produtos');

            const produtos = await response.json();
            console.log('Produtos recebidos:', produtos);

            const filtroProdutoSelect = document.getElementById('filtroProduto');
            if (filtroProdutoSelect) {
                filtroProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>';
                produtos.forEach(produto => {
                    const option = document.createElement('option');
                    option.value = produto;  // Usa o nome ou ID do produto como valor
                    option.textContent = produto;  // O nome do produto será exibido
                    filtroProdutoSelect.appendChild(option);
                });
            } else {
                console.error('Elemento filtroProduto não encontrado!');
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // Função para criar ou atualizar os gráficos com filtros aplicados
    async function criarGraficos(filtroProduto = '') {
        try {
            console.log(`Buscando dados com: Produto - ${filtroProduto}`);

            const response = await fetch(`/api/graficos?produto=${filtroProduto}`);
            if (!response.ok) throw new Error('Erro na resposta da API');

            const dados = await response.json();
            console.log('Dados recebidos para os gráficos:', dados);

            const filtroLower = filtroProduto.toLowerCase().trim();

            // Verificar se temos dados de produto
            if (!dados.grafico_produto || !dados.grafico_produto.labels || !dados.grafico_produto.valores) {
                console.error('Dados de gráfico de produto ausentes');
                return;
            }

            // Dados do gráfico de colaboradores (não depende do filtro)
            const dadosColaborador = {
                labels: dados.grafico_colaborador.labels,
                valores: dados.grafico_colaborador.valores
            };

            // Filtrar e agrupar dados de produto por mês
            const dadosFiltradosProduto = {
                labels: dados.grafico_produto.labels.filter((label, index) => {
                    const corresponde = filtroProduto ? label.toLowerCase().includes(filtroLower) : true;
                    return corresponde || filtroProduto === ''; // Mostra tudo se não houver filtro
                }),
                valores: dados.grafico_produto.valores.filter((valor, index) => {
                    const label = dados.grafico_produto.labels[index];
                    return filtroProduto ? label.toLowerCase().includes(filtroLower) : true;
                })
            };

            console.log('Labels filtrados (meses):', dadosFiltradosProduto.labels);
            console.log('Valores filtrados (quantidade de produtos):', dadosFiltradosProduto.valores);

            // Caso não existam dados filtrados, exibe uma mensagem
            if (dadosFiltradosProduto.labels.length === 0) {
                console.warn('Nenhum dado encontrado para o filtro aplicado.');
                dadosFiltradosProduto.labels = ['Sem dados'];
                dadosFiltradosProduto.valores = [0];
            }

            // Remove gráficos antigos
            if (window.graficoColaborador) {
                window.graficoColaborador.destroy();
            }
            if (window.graficoProduto) {
                window.graficoProduto.destroy();
            }

            // Criar gráfico de colaboradores
            const ctx1 = document.getElementById('grafico-colaborador');
            if (ctx1) {
                window.graficoColaborador = new Chart(ctx1.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: dadosColaborador.labels,
                        datasets: [{
                            data: dadosColaborador.valores,
                            label: 'Quantidade de Colaboradores',
                            backgroundColor: ['#E5BD40', '#EE5E54', '#BC669B', '#4BC0C0', '#5C55A0'],
                            barThickness:25
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'none',
                                labels: {
                                    boxWidth: 15,
                                    padding: 20,
                                    font: { size: 12, weight: 'none' }
                                }
                            },
                            datalabels: {
                                anchor: 'end',
                                align: 'end',
                                formatter: function(value){
                                    return value.toLocaleString('pt-br');
                                },
                                font: { size: 12, weight: 'bold' },
                                color: '#DFDDDD'
                            }
                        },
                        scales: {
                            x: { 
                                title: { display: true, padding:25, text: 'COLABORADORES' },
                                grid: {
                                    drawOnChartArea: false, // Remove as linhas principais do gráfico no eixo X
                                    drawTicks: false, // Remove os ticks no eixo X
                                    drawOnChartArea: false
                                },

                                border: {
                                    display: false
                                }
                               

                                
                            },
                            
                            y: { 
                                title: { display: true, text: 'QUANTIDADE' },
                                ticks:{display: false},
                                grid: {
                                    drawOnChartArea: false, // Remove as linhas principais do gráfico no eixo X
                                    drawTicks: false, // Remove os ticks no eixo X
                                    drawOnChartArea: false
                                },

                                border: {
                                    display: false
                                }
                        }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            } else {
                console.error('Elemento grafico-colaborador não encontrado!');
            }

            // Criar gráfico de produtos (quantidades por mês)
            const ctx2 = document.getElementById('grafico_produto');
            if (ctx2) {
                window.graficoProduto = new Chart(ctx2.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: dadosFiltradosProduto.labels,  // Meses
                        datasets: [{
                            data: dadosFiltradosProduto.valores,  // Quantidades de produto por mês
                            label: 'Produtos no Sistemas',
                            backgroundColor: ['#935F9D', '#ED6453', '#E89F46', '#4BC0C0', '#5C55A0'],
                            barThickness: 24
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'none',
                              
                            },
                            datalabels: {
                                anchor: 'end',
                                align: 'end',
                                formatter: function(value){
                                    return value.toLocaleString('pt-br');
                                },
                                font: { size: 12, weight: 'bold' },
                                color: '#DFDDDD'
                            }
                        },
                        scales: {
                            x: 
                            { 
                                title: { display: true,padding:25, text: 'PRODUTOS'},
                                grid: {
                                    drawOnChartArea: false, // Remove as linhas principais do gráfico no eixo X
                                    drawTicks: false, // Remove os ticks no eixo X
                                    drawOnChartArea: false
                                },

                                border: {
                                    display: false
                                }
                            
                            },
                            
                            y: { 
                                title: { display: true, text: 'QUANTIDADE' },
                                grid: {
                                    drawOnChartArea: false, // Remove as linhas principais do gráfico no eixo X
                                    drawTicks: false, // Remove os ticks no eixo X
                                    drawOnChartArea: false
                                },

                                ticks:{
                                    display:false
                                },

                                border: {
                                    display: false
                                }
                            }
                        }

                    },
                    plugins: [ChartDataLabels]
                });
            } else {
                console.error('Elemento grafico_produto não encontrado!');
            }

        } catch (error) {
            console.error('Erro ao obter dados dos gráficos:', error);
        }
    }

    // Chama as funções ao carregar a página
    await carregarProdutos();
    await criarGraficos();

    // Adiciona evento para o filtro
    const filtroForm = document.getElementById('filtro-form');
    if (filtroForm) {
        filtroForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const produto = document.getElementById('filtroProduto').value;
            console.log(`Produto selecionado: ${produto}`);
            await criarGraficos(produto);
        });
    } else {
        console.error('Elemento filtro-form não encontrado!');
    }
});
