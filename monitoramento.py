import requests
import time
from datetime import datetime
import os
import matplotlib.pyplot as plt
import pandas as pd

# Configurações
URL = "https://jolly-beach-0238f9a1e.5.azurestaticapps.net/"  
INTERVALO = 60  
NUMERO_DE_MEDICOES = 10  
LOG_FILE = "monitoramento_joi_patrio.log" 

status = []  
tempo_resposta = [] 
erros = 0  

# Função para inicializar o arquivo de log
def inicializar_log():
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w") as log_file:
            log_file.write("Início do monitoramento:\n")

# Função para registrar logs
def registrar_erro(mensagem):
    with open(LOG_FILE, "a") as log_file:
        log_file.write(f"[{datetime.now()}] {mensagem}\n")

# Função para monitorar o site
def monitorar_site(url):
    global erros
    try:
        inicio = time.time()
        resposta = requests.get(url, timeout=10)
        tempo = time.time() - inicio

        if resposta.status_code == 200:
            status.append(1)  # Site online
            tempo_resposta.append(tempo)
            print(f"[{datetime.now()}] O site está online. Tempo de resposta: {tempo:.2f}s")
            registrar_erro(f"O site está online. Tempo de resposta: {tempo:.2f}s")
        else:
            status.append(0)  
            tempo_resposta.append(tempo)
            print(f"[{datetime.now()}] Erro no site: {resposta.status_code}")
            registrar_erro(f"Erro no site: {resposta.status_code}")
            erros += 1
    except Exception as e:
        status.append(0)  
        tempo_resposta.append(None)  
        print(f"[{datetime.now()}] Não foi possível acessar o site. Erro: {e}")
        registrar_erro(f"Não foi possível acessar o site. Erro: {e}")
        erros += 1

# Função para gerar gráficos
def gerar_graficos():
    df = pd.DataFrame({
        'Status': status,
        'Tempo de Resposta': tempo_resposta
    })

    # Gráfico de Status (1 = online, 0 = erro)
    plt.figure(figsize=(10, 6))
    plt.bar(range(len(status)), status, color=['green' if s == 1 else 'red' for s in status])
    plt.title('Status do Site')
    plt.xlabel('Verificação')
    plt.ylabel('Status (1 = online, 0 = erro)')
    plt.tight_layout()
    plt.savefig('grafico_status.png')
    plt.show()

    # Gráfico de Tempo de Resposta
    plt.figure(figsize=(10, 6))
    plt.plot(tempo_resposta, marker='o', linestyle='-', color='b')
    plt.title('Tempo de Resposta do Site')
    plt.xlabel('Verificação')
    plt.ylabel('Tempo (segundos)')
    plt.tight_layout()
    plt.savefig('grafico_tempo_resposta.png')
    plt.show()

    # Gráfico de erros
    plt.figure(figsize=(10, 6))
    plt.bar([0, 1], [status.count(0), status.count(1)], color=['red', 'green'])
    plt.title('Número de Erros vs Status do Site')
    plt.xlabel('Status')
    plt.ylabel('Contagem')
    plt.xticks([0, 1], ['Erro', 'Online'])
    plt.tight_layout()
    plt.savefig('grafico_erros.png')
    plt.show()

if __name__ == "__main__":
    inicializar_log()
    print("Iniciando o monitoramento do site Joi Patrio...")

    while True:
        monitorar_site(URL)
        if len(status) >= NUMERO_DE_MEDICOES:
            gerar_graficos()
            status.clear()  
            tempo_resposta.clear()  
        time.sleep(INTERVALO)
