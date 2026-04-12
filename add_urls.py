import time

def zap_started(zap, target):
    urls = [
        "http://localhost:8080/login",
        "http://localhost:8080/dashboard",
        "http://localhost:8080/dashboard/pagos/nuevo",
        "http://localhost:8080/dashboard/pagos/historial",
        "http://localhost:8080/dashboard/perfil",
    ]
    for url in urls:
        print(f"Agregando URL: {url}")
        zap.core.access_url(url=url)
        time.sleep(1)