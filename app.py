from flask import Flask, request, make_response, redirect, render_template, jsonify
import pyodbc
from functools import wraps

app = Flask(__name__)

# Configurações de conexão com o SQL Server
dados_conexao = {
    "Driver": "SQL Server",
    "Server": "25.38.43.94",  # VPN ATIVA (IP REMOTO DO SERVIDOR OU IP DO SERVIDOR)
    "Database": "Cadastro_projeto",
    "timeout": 60,
    "UID": "admin_cadastro",
    "PWD": "itel11TH_proTheled@2025"
}

# Função para verificar o login no banco de dados
def verificar_login_banco(nome, senha):
    try:
        with pyodbc.connect(**dados_conexao) as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT COUNT(1) FROM Adm WHERE usuario=? AND senha_usuario=?", (nome, senha))
            usuario = cursor.fetchone()
            return usuario and usuario[0] > 0
    except Exception as e:
        print(f"Erro ao verificar login no banco de dados: {str(e)}")
        return False

# Função para buscar o nome completo de um usuário com base no login
def buscar_nome_completo(login):
    try:
        with pyodbc.connect(**dados_conexao) as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT nome_completo FROM Adm WHERE usuario=?", (login,))
            usuario = cursor.fetchone()
            return usuario[0] if usuario else None
    except Exception as e:
        print(f"Erro ao buscar nome completo no banco de dados: {str(e)}")
        return None

# Função de verificação de login, usada nas rotas
def autenticar_login():
    login = request.cookies.get("login", "")
    senha = request.cookies.get("senha", "")
    return verificar_login_banco(login, senha) if login and senha else False

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
    if autenticar_login():
        return redirect("/dashboard")
    return render_template("index.html", err="")

@app.route("/login", methods=["POST"])
def fazer_login():
    login = request.form.get("login", "")
    senha = request.form.get("senha", "")
    if verificar_login_banco(login, senha):
        resposta = make_response(redirect("/dashboard"))
        resposta.set_cookie("login", login, httponly=True, samesite="Strict")
        resposta.set_cookie("senha", senha, httponly=True, samesite="Strict")
        return resposta
    return render_template("index.html", err="Usuário ou senha inválidos"), 302

@app.route("/dashboard", methods=["GET"])
@no_cache
def dashboard():
    if not autenticar_login():
        return redirect("/login")
    login = request.cookies.get("login", "")
    nome_completo = buscar_nome_completo(login)
    return render_template("dashboard.html", user=True, nome_completo=nome_completo)

@app.route("/api/graficos", methods=["GET"])
def api_graficos():
    try:
        with pyodbc.connect(**dados_conexao) as conexao:
            cursor = conexao.cursor()

            filtro_mes = request.args.get("mes", "").strip()
            filtro_produto = request.args.get("produto", "").strip()

            # Consulta total de colaboradores
            cursor.execute("SELECT COUNT(*) AS total FROM colaboradores")
            grafico_colaborador_total = cursor.fetchone()[0]

            # Consulta funções de colaboradores
            cursor.execute("""
                SELECT Funcao, COUNT(*) AS quantidade
                FROM colaboradores
                GROUP BY Funcao
            """)
            grafico_colaborador_funcoes = cursor.fetchall()
            grafico_colaborador_labels = ['TOTAL'] + [row[0] for row in grafico_colaborador_funcoes]
            grafico_colaborador_values = [grafico_colaborador_total] + [row[1] for row in grafico_colaborador_funcoes]

            # Consulta para gráfico de produtos
            query_produtos = """
                SELECT DATENAME(MONTH, data_inicio) AS mes, SUM(Qtd_produto) AS total_quantidade
                FROM cadastro_producao_produto WHERE 1=1
            """
            params = []
            if filtro_mes:
                query_produtos += " AND DATENAME(MONTH, data_inicio) = ?"
                params.append(filtro_mes.lower())
            if filtro_produto:
                query_produtos += " AND produto_modelo = ?"
                params.append(filtro_produto)
            query_produtos += """
                GROUP BY YEAR(data_inicio), MONTH(data_inicio), DATENAME(MONTH, data_inicio)
                ORDER BY YEAR(data_inicio), MONTH(data_inicio)
            """
            cursor.execute(query_produtos, params)
            grafico_produtos_data = cursor.fetchall()
            grafico_produtos_labels = [row[0] for row in grafico_produtos_data]
            grafico_produtos_values = [row[1] for row in grafico_produtos_data]

            # Soma total de produtos de todos os meses (aplicando o filtro de produto, se houver)
            query_total_produtos = "SELECT SUM(Qtd_produto) AS total_produtos FROM cadastro_producao_produto WHERE 1=1"
            if filtro_produto:
                query_total_produtos += " AND produto_modelo = ?"
                params_total = [filtro_produto]
            else:
                params_total = []
            cursor.execute(query_total_produtos, params_total)
            total_produtos = cursor.fetchone()[0]

            # Adiciona a barra "Total"
            grafico_produtos_labels.append("TOTAL")
            grafico_produtos_values.append(total_produtos)


            # Consulta para projetos
            cursor.execute("SELECT DISTINCT Projeto FROM cadastro_producao_produto")
            projetos = [row[0] for row in cursor.fetchall()]

            return jsonify({
                "grafico_colaborador": {
                    "labels": grafico_colaborador_labels,
                    "valores": grafico_colaborador_values
                },
                "grafico_produto": {
                    "labels": grafico_produtos_labels,
                    "valores": grafico_produtos_values
                },
                "projetos": projetos
            })
    except Exception as e:
        print(f"Erro ao buscar dados para os gráficos: {str(e)}")
        return jsonify({"error": "Erro ao buscar dados para os gráficos"}), 500

@app.route("/api/produto", methods=["GET"])
def get_produtos():
    try:
        with pyodbc.connect(**dados_conexao) as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT DISTINCT produto_modelo FROM cadastro_producao_produto")
            produtos = [row[0] for row in cursor.fetchall()]
            return jsonify(produtos)
    except Exception as e:
        print(f"Erro ao buscar produtos_modelo: {str(e)}")
        return jsonify({"error": "Erro ao buscar produtos"}), 500
    





@app.route("/logout", methods=["GET"])
def logout():
    resposta = make_response(redirect("/login"))
    resposta.set_cookie("login", "", expires=0)
    resposta.set_cookie("senha", "", expires=0)
    return resposta

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=1433)
