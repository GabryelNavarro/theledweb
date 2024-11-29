from flask import Flask, request, make_response, redirect, render_template
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

@app.route("/dashboard", methods=["GET"])
@no_cache
def dashboard():
    logado = autenticar_login()
    if not logado:
        return redirect("/login")

    return render_template("dashboard.html", user=logado)

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
    resposta.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
    resposta.headers["Pragma"] = "no-cache"
    resposta.headers["Expires"] = "0"
    return resposta

app.run(host='0.0.0.0', debug=True, port=9080)
