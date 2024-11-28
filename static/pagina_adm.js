// MENU LATERAL DASHBORD

function mostrardiv() {
    const sidebar = document.getElementById('menu_lateral');
    sidebar.classList.toggle('fecharmenu');
  };


  //SUB MENU DASHBOARD COLABORADOR
  function submenu() {
    const submenu = document.getElementById('usuarios_submenu');
    
    // Verifica o estado atual do submenu
    if (submenu.style.display === 'block') {
        submenu.style.display = 'none'; // Oculta o submenu
    } else {
        submenu.style.display = 'block'; // Exibe o submenu
    }
};
 //SUB MENU DASHBOARD PRODUTOS
 function submenu_produtos (){
    const submenu = document.getElementById('sub-produtos');
    if (submenu.style.display ==='block'){
        submenu.style.display = 'none';
    } else{
        submenu.style.display = 'block';
    }
 };



