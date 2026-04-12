# Monitoreo con kubernetes (continuación de la fase 4)

Resulta que, el anterior devops está ligado al docker-compose. 

En la fase 3, se configuró Kubernetes. Pero, luego en la fase 4, volvemos a tocker docker-compose.

Estas instrucciones son para continuar en línea de Kubernetes.

Necesitamos incluir esas herramientas a kubectl.

# Iniciar con:

Agregando los repons de hml

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

Esto me retornó:
banco-modulo-pago-servicios on  fix/kubernetes [!] via 🐳 tcp://127.0.0.1:32769
❯ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
"prometheus-community" has been added to your repositories

banco-modulo-pago-servicios on  fix/kubernetes [!] via 🐳 tcp://127.0.0.1:32769
❯ helm repo add grafana https://grafana.github.io/helm-charts
"grafana" has been added to your repositories

banco-modulo-pago-servicios on  fix/kubernetes [!] via 🐳 tcp://127.0.0.1:32769 took 3s
❯ helm repo update
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "grafana" chart repository
...Successfully got an update from the "prometheus-community" chart repository
Update Complete. ⎈Happy Helming!⎈


# Ahora instalamos Prometheus y Grafana:

kubectl create namespace monitoring

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin


## Resultado:

banco-modulo-pago-servicios on  fix/kubernetes [!] via 🐳 tcp://127.0.0.1:32769
❯ kubectl create namespace monitoring
namespace/monitoring created

banco-modulo-pago-servicios on  fix/kubernetes [!] via 🐳 tcp://127.0.0.1:32769
❯
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin
NAME: prometheus
LAST DEPLOYED: Thu Apr  9 00:13:59 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace monitoring get pods -l "release=prometheus"

Get Grafana 'admin' user password by running:

  kubectl --namespace monitoring get secrets prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo

Access Grafana local instance:

  export POD_NAME=$(kubectl --namespace monitoring get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=prometheus" -oname)
  kubectl --namespace monitoring port-forward $POD_NAME 3000

Get your grafana admin user password by running:

  kubectl get secret --namespace monitoring -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo


Visit https://github.com/prometheus-operator/kube-prometheus for instructions on how to create & configure Alertmanager and Prometheus instances using the Operator.

# Ahora, para Loki:

helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false

## Resultado:

banco-modulo-pago-servicios on  fix/kubernetes [!] via 🐳 tcp://127.0.0.1:32769 took 21s
❯ helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false
WARNING: This chart is deprecated
NAME: loki
LAST DEPLOYED: Thu Apr  9 00:15:13 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
NOTES:
The Loki stack has been deployed to your cluster. Loki can now be added as a datasource in Grafana.

See http://docs.grafana.org/features/datasources/loki/ for more detail.

# Acceder a Grafana:

En una nueva terminal:

kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring

Entrá a http://localhost:3001 con admin / admin.

Un dashboard interesante a ver son los de "Kubernetes / Compute Resources"

# Conectar el BackEnd con Grafana (se le conoce como ServiceMonitor):

Ejecutar en la terminal lo siguiente:

cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: banco-backend
  namespace: default
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: banco-app-backend
  endpoints:
    - port: http
      path: /api/metrics
      interval: 15s
EOF

## Resultado:
servicemonitor.monitoring.coreos.com/banco-backend created

# ¿Qué pasó con docker-compose?

Al final, ya no se usó, pues se migró a Kubernetes.

Con los comandos anteriores, se cubre todo lo que se hizo para docker-compose.

Por eso necesario ejecutar el anterior comando.

Así mismo, también podría ser relevante ejecutar este comando que abarca las alert-rules.yml (pero, no es obligatorio):

cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: banco-alerts
  namespace: default
  labels:
    release: prometheus
spec:
  groups:
    - name: banco-alerts
      rules:
        - alert: HighErrorRate
          expr: (sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High HTTP error rate detected"
            description: "Error rate is above 5% for the last 5 minutes"
        - alert: BackendDown
          expr: up{job="banco-backend"} == 0
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "Backend is down"
            description: "The NestJS backend has been unreachable for more than 1 minute"
        - alert: SlowPayments
          expr: histogram_quantile(0.95, rate(payment_processing_duration_seconds_bucket[5m])) > 5
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Payment processing is slow"
            description: "95th percentile of payment processing time is above 5 seconds"
EOF

# Estado actual.

## Apagar con:

minikube stop

## Volver a encender con:

minikube start
eval $(minikube docker-env)

### En WSL2, activar los port-forward (una en cada una terminal)

kubectl port-forward svc/banco-frontend 8080:80
kubectl port-forward svc/banco-backend 3000:3000
kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring