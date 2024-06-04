from flask import Flask, request, make_response, redirect, render_template
import pyodbc
import hashlib
import binascii
import os

app = Flask(__name__)

# Configurações de conexão com o SQL Server
dados_conexao = {
    "Driver": "SQL Server",
    "Server": "DESKTOP-UF5M8IT",  # Substitua pelo nome do seu servidor SQL
    "Database": "Usuarios",  # Substitua pelo nome do seu banco de dados
    "timeout": 60
}

# Função para verificar o login no banco de dados
def verificar_login_banco(nome, senha):
    try:
        # Conectar ao banco de dados
        conexao = pyodbc.connect(**dados_conexao)
        cursor = conexao.cursor()

        # Consultar o banco de dados para verificar se as credenciais existem
        cursor.execute("SELECT * FROM Usuario WHERE nome_usuario = ? AND senha_hash = ?", (nome,senha))
        usuario = cursor.fetchone()

        # Fechar a conexão
        conexao.close()

        if usuario:
            # Verificar se o usuário foi encontrado no banco de dados
            return usuario
        else:
            return None

    except Exception as e:
        print(f"Erro ao verificar login no banco de dados: {str(e)}")
        return None


# Função para autenticar o login
def autenticar_login():
    login = request.cookies.get("login", "")
    senha = request.cookies.get("senha", "")
    return verificar_login_banco(login, senha)

@app.route("/")
@app.route("/login", methods=["GET"])
def form_login():
    logado = autenticar_login()
    if logado:
        return redirect("/dashboard")

    return render_template("404.html", err="")

@app.route("/dashboard", methods=["GET"])
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
        return render_template("404.html", err="Usuário ou senha inválidos"), 302

@app.route("/logout", methods=["POST"])
def logout():
    resposta = make_response(render_template("404.html"))
    resposta.set_cookie("login", "", expires=0)
    resposta.set_cookie("senha", "", expires=0)
    return resposta

app.run(host='localhost', debug=True)