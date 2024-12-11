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
                    option.value = produto;
                    option.textContent = produto;
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

            const filtroLower = filtroProduto.toLowerCase();

            // Dados do gráfico de colaboradores (não depende do filtro)
            const dadosColaborador = {
                labels: dados.grafico_colaborador.labels,
                valores: dados.grafico_colaborador.valores
            };

            // Dados do gráfico de produtos, aplicando o filtro
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

            console.log('Labels filtrados:', dadosFiltradosProduto.labels);
            console.log('Valores filtrados:', dadosFiltradosProduto.valores);

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
                                anchor: 'end',
                                align: 'end',
                                formatter: (value) => value,
                                font: { size: 12, weight: 'bold' },
                                color: '#000'
                            }
                        },
                        scales: {
                            x: { title: { display: true, text: 'COLABORADORES' }},
                            y: { title: { display: true, text: 'QUANTIDADE' }}
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            } else {
                console.error('Elemento grafico-colaborador não encontrado!');
            }

            // Criar gráfico de produtos
            const ctx2 = document.getElementById('grafico_produto');
            if (ctx2) {
                window.graficoProduto = new Chart(ctx2.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: dadosFiltradosProduto.labels,
                        datasets: [{
                            data: dadosFiltradosProduto.valores,
                            label: 'QUANTIDADE DE PRODUTOS',
                            backgroundColor: ['#935F9D', '#ED6453', '#E89F46', '#4BC0C0', '#5C55A0']
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
                                anchor: 'end',
                                align: 'end',
                                formatter: (value) => value,
                                font: { size: 12, weight: 'bold' },
                                color: '#000'
                            }
                        },
                        scales: {
                            x: { title: { display: true, text: 'PRODUTOS' }},
                            y: { title: { display: true, text: 'QUANTIDADE' }}
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
