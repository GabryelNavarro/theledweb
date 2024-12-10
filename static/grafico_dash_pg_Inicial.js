document.addEventListener('DOMContentLoaded', async function () {
    // Função para carregar os produtos para o filtro
    async function carregarProdutos(filtroProduto = '') {
        try {
            // Fazer requisição para obter os produtos_modelo com filtro, se houver
            const response = await fetch(`/api/produto?filtro=${filtroProduto}`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos_modelo');
            }
            
            const produtos = await response.json();

            // Log para verificar os dados recebidos
            console.log('Produtos recebidos:', produtos);

            // Verifique se existem produtos antes de preencher o select
            const filtroProdutoSelect = document.getElementById('filtroProduto');
            if (filtroProdutoSelect) {
                // Limpa o conteúdo anterior
                filtroProdutoSelect.innerHTML = '<option value="">Selecione um produto...</option>';

                // Preenche o filtro de produtos no <select>
                produtos.forEach(produto => {
                    const option = document.createElement('option');
                    option.value = produto; // Valor do produto
                    option.textContent = produto; // Texto exibido na lista
                    filtroProdutoSelect.appendChild(option);
                });
            } else {
                console.error('Elemento filtroProduto não encontrado!');
            }
        } catch (error) {
            console.error('Erro ao carregar produtos_modelo:', error);
        }
    }

    // Função para criar os gráficos com filtros aplicados
    async function criarGraficos(filtroProduto = '') {
        try {
            console.log(`Buscando dados com: Produto - ${filtroProduto}`);
            
            const response = await fetch(`/api/graficos?produto=${filtroProduto}`);
            if (!response.ok) {
                throw new Error('Erro na resposta da API');
            }

            const dados = await response.json();
            console.log('Dados recebidos para os gráficos:', dados);

            const filtroLower = filtroProduto.toLowerCase();

            const dadosFiltradosColaborador = {
                labels: dados.grafico_colaborador.labels,
                valores: dados.grafico_colaborador.valores
            };

            const dadosFiltradosProduto = {
                labels: dados.grafico_produto.labels.filter(label => {
                    if (filtroProduto && !label.toLowerCase().includes(filtroLower)) {
                        return false;
                    }
                    return true;
                }),
                valores: dados.grafico_produto.valores.filter((_, index) => {
                    const label = dados.grafico_produto.labels[index];
                    return filtroProduto ? label.toLowerCase().includes(filtroLower) : true;
                })
            };

            // Verifique se os elementos dos gráficos existem antes de criar os gráficos
            const ctx1 = document.getElementById('grafico-colaborador');
            if (ctx1) {
                if (window.graficoColaborador) {
                    window.graficoColaborador.destroy();  // Destrói o gráfico existente antes de criar um novo
                }
                window.graficoColaborador = new Chart(ctx1.getContext('2d'), {
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
                                    font: { size: 12, weight: 'none' }
                                }
                            },
                            datalabels: {
                                color: '#000',
                                align: 'center',
                                anchor: 'center',
                                font: { weight: 'bold', size: 14 }
                            }
                        },
                        scales: {
                            x: { title: { display: true, text: 'COLABORADORES' }},
                            y: { title: { display: true, text: 'QUANTIDADE' }}
                        }
                    }
                });
            } else {
                console.error('Elemento grafico-colaborador não encontrado!');
            }

            const ctx2 = document.getElementById('grafico_produto');
            if (ctx2) {
                if (window.graficoProduto) {
                    window.graficoProduto.destroy();  // Destrói o gráfico existente antes de criar um novo
                }
                window.graficoProduto = new Chart(ctx2.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: dadosFiltradosProduto.labels,
                        datasets: [{
                            data: dadosFiltradosProduto.valores,
                            label: 'QUANTIDADE DE PRODUTOS',
                            backgroundColor: ['#935F9D', '#ED6453', '#ED6453', '#E89F46', '']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: { boxWidth: 15, padding: 20, font: { size: 12, weight: 'none' } }
                            },
                            datalabels: {
                                color: '#FFFFFF',
                                align: 'center',
                                anchor: 'center',
                                font: { weight: 'bold', size: 14 },
                                display: (context) => context.dataset.data[context.dataIndex] > 0
                            }
                        },
                        scales: {
                            x: { title: { display: true, text: 'PRODUTOS' }, barPercentage: 0.6 },
                            y: { title: { display: true, text: 'QUANTIDADE' }}
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            } else {
                console.error('Elemento grafico_produto não encontrado!');
            }

        } catch (error) {
            console.error('Erro ao obter dados dos gráficos', error);
        }
    }

    // Chama as funções ao carregar a página
    await carregarProdutos();  // Carrega os produtos para o filtro
    await criarGraficos();     // Chama a função para carregar os gráficos iniciais

    // Adiciona evento para o filtro
    const filtroForm = document.getElementById('filtro-form');
    if (filtroForm) {
        filtroForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const produto = document.getElementById('filtroProduto').value;
            console.log(`Aplicando filtro: Produto - ${produto}`);

            // Recarrega os gráficos com o filtro aplicado
            await criarGraficos(produto);
        });
    } else {
        console.error('Elemento filtro-form não encontrado!');
    }
});
