
document.addEventListener('DOMContentLoaded', async function () {
    // Função para carregar os produtos para o filtro
    async function carregarProdutos(filtro_produto = '') {
        try {
            const response = await fetch(`/api/produto`);
            if (!response.ok) throw new Error('Erro ao carregar produtos');

            const produtos = await response.json();
            console.log('Produtos recebidos:', produtos);  // Verifique os dados recebidos

            const filtroProdutoSelect = document.getElementById('filtro_produto');
            filtroProdutoSelect.innerHTML = '<option value="">Selecione um produto</option>';
            produtos.forEach(produto => {
                const option = document.createElement('option')
                option.value = produto;
                option.textContent = produto;
                filtroProdutoSelect.appendChild(option);
            });
            
           
           
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // Função para criar ou atualizar os gráficos com filtros aplicados
    async function criarGraficos() {
        let filtro_produto = '';
        let elemento_selector  = document.getElementById('filtro_produto');
        filtro_produto = elemento_selector.value;

        try {
            

            const response = await fetch(`/api/graficos?produto=${filtro_produto}`);
            
            if (!response.ok) throw new Error('Erro na resposta da API');

            const dados = await response.json();
            //console.log('Dados recebidos para os gráficos:', dados);

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

            // Filtrar dados de produto por nome ou código do produto (insensível ao caso)
            const dadosFiltradosProduto = {
                labels: dados.grafico_produto.labels,
                valores: dados.grafico_produto.valores
            };

            //console.log('Labels filtrados (produtos):', dadosFiltradosProduto.labels);
            //console.log('Valores filtrados (quantidade de produtos):', dadosFiltradosProduto.valores);

            // Caso não existam dados filtrados, exibe uma mensagem
            if (dadosFiltradosProduto.labels.length === 0) {
                alert('Nenhum produto encontrado para o filtro selecionado!');
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
                            barThickness: 25
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
                                    font: { size: 12, weight: 'normal' }
                                }
                            },
                            datalabels: {
                                anchor: 'end',
                                align: 'end',
                                formatter: function (value) {
                                    return value.toLocaleString('pt-br');
                                },
                                font: { size: 12, weight: 'bold' },
                                color: '#DFDDDD'
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, padding: 25, text: 'COLABORADORES' },
                                grid: {
                                    drawOnChartArea: false,
                                    drawTicks: false
                                },
                                border: {
                                    display: false
                                }
                            },
                            y: {
                                title: { display: true, text: 'QUANTIDADE' },
                                ticks: { display: false },
                                grid: {
                                    drawOnChartArea: false,
                                    drawTicks: false
                                },
                                border: {
                                    display: false
                                },
                                beginAtZero: true,
                                suggestedMax: Math.max(...dadosColaborador.valores) * 1.1 

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
                        labels: dadosFiltradosProduto.labels,
                        datasets: [{
                            data: dadosFiltradosProduto.valores,
                            label: 'Produtos no Sistema',
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
                                formatter: function (value) {
                                    return value.toLocaleString('pt-br');
                                },
                                font: { size: 12, weight: 'bold' },
                                color: '#DFDDDD'
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, padding: 25, text: 'PRODUTOS' },
                                grid: {
                                    drawOnChartArea: false,
                                    drawTicks: false
                                },
                                border: {
                                    display: false
                                }
                            },
                            y: {
                                title: { display: true, text: 'QUANTIDADE' },
                                grid: {
                                    drawOnChartArea: false,
                                    drawTicks: false
                                },
                                ticks: {
                                    display: false
                                },
                                border: {
                                    display: false
                                },
                                beginAtZero: true,
                                suggestedMax: Math.max(...dadosFiltradosProduto.valores) * 1.1 
                              
                                
                               
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
            const produto = document.getElementById('filtro_produto').value;
            console.log(`Produto selecionado: ${produto}`);
            await criarGraficos(produto);
        });
    } else {
        console.error('Elemento filtro-form não encontrado!');
    }


    
    




});

// FILTRO POR DATA







// INPUT DATA FIM, PUXAR DATA FIM ATUAL AUTOMATICAMENTE 

function verificarData(event) {
    const dataInput = document.getElementById('data_termino');

    // Verificar se o input está vazio
    if (!dataInput.value) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda
        const dia = String(hoje.getDate()).padStart(2, '0'); // Adiciona zero à esquerda
        const dataAtual = `${ano}-${mes}-${dia}`; // Corrigido o template string

        dataInput.value = dataAtual; // Define a data atual
    }

    console.log(`Data enviada: ${dataInput.value}`); // Corrigido o template string
    
}
document.addEventListener('DOMContentLoaded', verificarData);


// FILTRAR AUTOMATICAMENTE
const filtroProduto = document.getElementById('filtro_produto');
const filtroForm = document.getElementById('filtro-form');

filtroProduto.addEventListener('change', () => {
    if (filtroProduto.value) {
        filtroForm.submit(); // Envia o formulário automaticamente
    }
});
