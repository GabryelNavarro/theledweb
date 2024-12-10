// Função para mostrar/ocultar o menu lateral
function mostrardiv() {
    const sidebar = document.getElementById('menu_lateral');
    sidebar.classList.toggle('fecharmenu');
}

// Submenu Dashboard Colaborador
function submenu() {
    const submenu = document.getElementById('usuarios_submenu');
    
    // Verifica o estado atual do submenu
    if (submenu.style.display === 'block') {
        submenu.style.display = 'none'; // Oculta o submenu
    } else {
        submenu.style.display = 'block'; // Exibe o submenu
    }
}

// Submenu Dashboard Produtos
function submenu_produtos() {
    const submenu = document.getElementById('sub-produtos');
    if (submenu.style.display === 'block') {
        submenu.style.display = 'none';
    } else {
        submenu.style.display = 'block';
    }
}


//  MOSTRAR EM QUAL PAGINA VC TA PELO MENU LATERAL

// Função para atualizar a seleção do menu
function updateMenuSelection() {
    // Captura a URL ou hash atual
    const currentRoute = window.location.hash;
  
    // Mapeamento de rotas para IDs do menu VINCULADO COM ID DE MENU(LISTA)
    const routeToIdMap = {
      '#home': 'home',             // ROTA,ID LISTA
      '#dashboard.html': 'dashboard',        // Rota para Dashboard
      '#usuarios': 'usuarios',    // Rota para Colaboradores
      '#produtos': 'produtos',    // Rota para Produtos
      '#configuracao': 'configuracao' // Rota para Configurações
    };
  
    // Obtém o ID do menu correspondente à rota atual
    const currentMenuId = routeToIdMap[currentRoute];
  
    // Remove a classe 'selected' de todos os itens
    const allMenuItems = document.querySelectorAll('#menu_lateral li');
    allMenuItems.forEach(item => item.classList.remove('selected'));
  
    // Se o ID existir, adiciona a classe 'selected' para destacar o item
    if (currentMenuId) {
      const menuItem = document.getElementById(currentMenuId);
      if (menuItem) {
        menuItem.classList.add('selected');
      }
    }
}

// Atualiza a seleção do menu na carga da página
window.addEventListener('load', updateMenuSelection);

// Atualiza a seleção do menu quando o hash mudar
window.addEventListener('hashchange', updateMenuSelection);





