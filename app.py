from flask import Flask, request, make_response, redirect, render_template, jsonify
import pyodbc
from functools import wraps

app = Flask(__name__)

# Configurações de conexão com o SQL Server
dados_conexao = {
    "Driver": "SQL Server",
    "Server": "10.1.0.112",  # Substitua pelo nome do servidor SQL
    "Database": "Cadastro_projeto",  # Substitua pelo nome do banco de dados
    "timeout": 60,
    "UID": "admin_cadastro",  # --> Usuário BD
    "PWD": "itel11TH_proTheled@2025"  # --> Senha BD
}

# Função para verificar o login no banco de dados
def verificar_login_banco(nome, senha):
    try:
        # Conectar ao banco de dados
        conexao = pyodbc.connect(**dados_conexao)
        cursor = conexao.cursor()

        # Consultar o banco de dados para verificar se as credenciais existem
        cursor.execute("SELECT COUNT(1) FROM Adm WHERE usuario=? AND senha_usuario=?", (nome, senha))
        usuario = cursor.fetchone()

        # Fechar a conexão
        conexao.close()

        if usuario and usuario[0] > 0:  # Verifica se encontrou o usuário
            return True
        else:
            return False

    except Exception as e:
        print(f"Erro ao verificar login no banco de dados: {str(e)}")
        return False

# Função para buscar o nome completo de um usuário com base no login
def buscar_nome_completo(login):
    try:
        # Conectar ao banco de dados
        conexao = pyodbc.connect(**dados_conexao)
        cursor = conexao.cursor()

        # Consultar o banco de dados para buscar o nome completo
        cursor.execute("SELECT nome_completo FROM Adm WHERE usuario=?", (login,))
        usuario = cursor.fetchone()

        # Fechar a conexão
        conexao.close()

        if usuario:  # Se encontrou o usuário, retorna o nome completo
            return usuario[0]
        else:
            return None  # Caso não encontre, retorna None
    except Exception as e:
        print(f"Erro ao buscar nome completo no banco de dados: {str(e)}")
        return None

# Função de verificação de login, usada nas rotas
def autenticar_login():
    login = request.cookies.get("login", "")
    senha = request.cookies.get("senha", "")
    if login and senha:
        # Verifica no banco de dados se o login e a senha são válidos
        return verificar_login_banco(login, senha)
    return False

# Configuração de cache para a página de dashboard
def no_cache(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    return wrapped_view

@app.route("/")
@app.route("/login", methods=["GET"])
def form_login():
    logado = autenticar_login()
    if logado:
        return redirect("/dashboard")
    return render_template("index.html", err="")

@app.route("/login", methods=["POST"])
def fazer_login():
    login = request.form.get("login", "")
    senha = request.form.get("senha", "")

    # Validar login no banco de dados
    usuario = verificar_login_banco(login, senha)

    if usuario:
        resposta = make_response(redirect("/dashboard"))
        resposta.set_cookie("login", login, httponly=True, samesite="Strict")
        resposta.set_cookie("senha", senha, httponly=True, samesite="Strict")
        return resposta
    else:
        return render_template("index.html", err="Usuário ou senha inválidos"), 302

@app.route("/dashboard", methods=["GET"])
@no_cache
def dashboard():
    logado = autenticar_login()
    if not logado:
        return redirect("/login")
    
    # Obtém o login do cookie
    login = request.cookies.get("login", "")

    # Busca o nome completo associado ao login
    nome_completo = buscar_nome_completo(login)
    return render_template("dashboard.html", user=logado, nome_completo=nome_completo)

@app.route("/api/graficos", methods=["GET"])
def api_graficos():
    try:
        conexao = pyodbc.connect(**dados_conexao)
        cursor = conexao.cursor()
        
        # Filtros da requisição
        filtro_projeto = request.args.get("projeto", "").strip()
        filtro_mes = request.args.get("mes", "").strip()

        # Consulta total de colaboradores
        cursor.execute("SELECT COUNT(*) AS total FROM colaboradores")
        grafico_colaborador_data = cursor.fetchone()
        grafico_colaborador_total = grafico_colaborador_data[0]

        # Consulta das funções dos colaboradores
        cursor.execute("""
            SELECT Funcao, COUNT(*) AS quantidade
            FROM colaboradores
            GROUP BY Funcao
        """)
        grafico_colaborador_funcoes = cursor.fetchall()

        # Processando os dados para o gráfico de colaboradores
        grafico_colaborador_labels = ['Total de Colaboradores'] + [row[0] for row in grafico_colaborador_funcoes]
        grafico_colaborador_values = [grafico_colaborador_total] + [row[1] for row in grafico_colaborador_funcoes]

        # Consulta para gráfico de produtos com filtros
        query_produtos = """
            SELECT DATENAME(MONTH, data_inicio) AS mes, SUM(Qtd_produto) AS total_quantidade
            FROM cadastro_producao_produto WHERE 1=1
        """
        params = []

        if filtro_projeto:
            query_produtos += " AND Projeto = ? "
            params.append(filtro_projeto)

        if filtro_mes:
            query_produtos += " AND DATENAME(MONTH, data_inicio) = ?"
            params.append(filtro_mes.lower())  # Garantindo que o mês seja em minúsculas

        query_produtos += """
            GROUP BY YEAR(data_inicio), MONTH(data_inicio), DATENAME(MONTH, data_inicio)
            ORDER BY YEAR(data_inicio), MONTH(data_inicio)
        """
        cursor.execute(query_produtos, params)
        grafico_produtos_data = cursor.fetchall()

        # Processando os dados para o gráfico de produtos
        grafico_produtos_labels = [row[0] for row in grafico_produtos_data]
        grafico_produtos_values = [row[1] for row in grafico_produtos_data]

        # Consulta para total de produtos
        cursor.execute("SELECT SUM(Qtd_produto) AS total_geral FROM cadastro_producao_produto")
        total_geral_produtos = cursor.fetchone()[0]

        # Consulta para projetos existentes
        cursor.execute("SELECT DISTINCT Projeto FROM cadastro_producao_produto")
        projetos = cursor.fetchall()

        # Transformando os projetos em uma lista de dicionários
        lista_projeto = [projeto[0] for projeto in projetos]

        conexao.close()

        return jsonify({
            "grafico_colaborador": {
                "labels": grafico_colaborador_labels,
                "valores": grafico_colaborador_values
            },
            "grafico_produto": {
                "labels": grafico_produtos_labels + ["TOTAL DE PRODUTOS"],
                "valores": grafico_produtos_values + [total_geral_produtos]
            },
            "projetos": lista_projeto
        })

    except Exception as e:
        print(f"Erro ao buscar dados para os gráficos: {str(e)}")
        return jsonify({"error": "Erro ao buscar dados para os gráficos"}), 500
    
@app.route("/api/produto", methods=["GET"])
def api_produto():
        try:
            conexao = pyodbc.connect(**dados_conexao)
            cursor = conexao.cursor()
            #CONSULTA OBTER DADOS PARA A SELEÇÃO NA PAGINA DASHBOARD GRAFICO
            cursor.execute("SELECT DISTINCT produto_modelo FROM cadastro_producao_produto")
            produtos = cursor.fetchall()
            conexao.close()
            lista_produtos = [produto[0] for produto in produtos]
            return jsonify(lista_produtos)
        
        except Exception as e:
            print(f"Erro ao buscar produtos_modelo: {str(e)}")
            return jsonify({"error": "Erro ao buscar produtos"}),500

@app.route("/logout", methods=["GET"])
def logout():
    resposta = make_response(redirect("/login"))
    resposta.set_cookie("login", "", expires=0)
    resposta.set_cookie("senha", "", expires=0)
    return resposta

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=9080)
