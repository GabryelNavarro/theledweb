from flask import Flask, request, make_response, redirect, render_template,jsonify
import pyodbc
import hashlib
import binascii
import os
import subprocess
from functools import wraps
from flask import Response

app = Flask(__name__)

# Configurações de conexão com o SQL Server
dados_conexao = {
    "Driver": "SQL Server",
    "Server": "10.1.0.112",  # Substitua pelo nome do servidor SQL
    "Database": "Cadastro_projeto",  # Substitua pelo nome  banco de dados
    "timeout": 60,
    "UID": "admin_cadastro",# --> Usuario BD
    "PWD": "itel11TH_proTheled@2025" # --> Senha BD
}
# 10.1.0.112
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



def no_cache(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    return wrapped_view






# Função para autenticar o login
def autenticar_login():
    login = request.cookies.get("login", "")
    senha = request.cookies.get("senha", "")

    if login and senha:
        # Verifica no banco de dados se o login e a senha são válidos
        return verificar_login_banco(login, senha)
    return False



@app.route("/")
@app.route("/login", methods=["GET"])

@app.route("/")
@app.route("/login", methods=["GET"])
def form_login():
    logado = autenticar_login()
    if logado:
        return redirect("/dashboard")

    return render_template("index.html", err="")


def buscar_nome_completo(login):
    try:
        # CONEXÃO BANCO DE DADOS
        conexao = pyodbc.connect(**dados_conexao)
        cursor = conexao.cursor()

        # CONSULTA SQL PARA BUSCAR NOME COMPLETO DE ACORDO COM LOGIN(usuario.dbo)
        cursor.execute("SELECT nome_completo from Adm WHERE usuario=?", (login))
        usuario = cursor.fetchone() #Busca uma única linha

        #fechar conexão
        conexao.close()
        
        if usuario: # SE ENCONTROU O USUARIO, RETORNA O NOME COMPLETO
            return usuario[0] #Retorna o 'campo nome_completo'
        else:
            return None # CASO NÃO ENCONTRE, RETORNA NONE
    except Exception as e:
        print(f"Erro ao buscar nome completo no banco de dados: {str(e)}")
        return None


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

  
    

    

    return render_template("dashboard.html", user=logado, nome_completo = nome_completo)


  # CONFIGURAÇÃO PARA GRÁFICOS PAGINA INICIAL
@app.route("/api/graficos", methods=["GET"])
def api_graficod():
    # dados necessários para os gráficos
   try:
        conexao = pyodbc.connect(**dados_conexao)
        cursor = conexao.cursor()

        # CONSULTA PARA O TOTAL DE COLABORADORES
        cursor.execute("SELECT COUNT(*) AS total FROM colaboradores")
        grafico_colaborador_data = cursor.fetchone()  # Obtém o total de colaboradores
        grafico_colaborador_total = grafico_colaborador_data[0]

        # CONSULTA PARA AS FUNÇÕES DISTINTAS DOS COLABORADORES COM CONTAGEM
        cursor.execute("""
            SELECT Funcao, COUNT(*) AS quantidade
            FROM colaboradores
            GROUP BY Funcao
        """)
        grafico_colaborador_funcoes = cursor.fetchall()

        # Processando as funções para o gráfico de colaboradores
        grafico_colaborador_labels = ['Total de Colaboradores'] + [row[0] for row in grafico_colaborador_funcoes]
        grafico_colaborador_values = [grafico_colaborador_total] + [row[1] for row in grafico_colaborador_funcoes]

        # CONSULTA PARA O GRÁFICO PRODUTOS (contagem por modelo e soma total)
        cursor.execute("""
            SELECT Produto_modelo, SUM(Qtd_produto) AS total_quantidade
            FROM cadastro_producao_produto
            GROUP BY Produto_modelo
        """)
        grafico_produtos_data = cursor.fetchall()

        # Processando os dados para o gráfico de produtos
        grafico_produtos_labels = [row[0] for row in grafico_produtos_data]
        grafico_produtos_values = [row[1] for row in grafico_produtos_data]

        # CONSULTA PARA O TOTAL GERAL DE PRODUTOS
        cursor.execute("SELECT SUM(Qtd_produto) AS total_geral FROM cadastro_producao_produto")
        total_geral_produtos = cursor.fetchone()[0]

        conexao.close()

        # Retornando os dados dos gráficos
        return jsonify({
            "grafico_colaborador": {
                "labels": grafico_colaborador_labels,
                "valores": grafico_colaborador_values
            },
            "grafico_produto": {
                "labels": grafico_produtos_labels + ["TOTAL DE PRODUTOS"],  # Adiciona o rótulo do total geral
                "valores": grafico_produtos_values + [total_geral_produtos]  # Adiciona o valor do total geral
            }
        })
   except Exception as s:
        print(f"Erro ao buscar dados para os gráficos: {s}")
        return jsonify({"error": "Erro ao buscar dados para os gráficos"}), 500










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

@app.route("/logout", methods=["GET"])
def logout():
    resposta = make_response(redirect("/login"))
    resposta.set_cookie("login", "", expires=0)
    resposta.set_cookie("senha", "", expires=0)
    resposta.headers["Catche-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
    resposta.headers["Pragma"] = "no-cache"
    resposta.headers["Expires"] = "0"
    return resposta

app.run(host='0.0.0.0', debug=True, port=9080)
