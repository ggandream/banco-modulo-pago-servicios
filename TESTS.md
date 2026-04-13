# Tests a ejecutar en el BackEnd:

Resultados
7 suites de test creadas - 37 tests pasando - 0 fallos

Archivos creados:
Archivo	Tests	Cobertura Servicio
auth.service.spec.ts	4	100% stmts/lines
users.service.spec.ts	6	100% stmts/lines
cuentas.service.spec.ts	3	100% stmts/lines
servicios.service.spec.ts	5	100% stmts/lines
pagos.service.spec.ts	13	81% stmts, 80% lines
metrics.service.spec.ts	6	100% stmts/lines
tasks.controller.spec.ts	2	100% stmts/lines


## ¿Qué cubren los tests?
Auth: login exitoso, usuario no encontrado, usuario desactivado, contraseña incorrecta
Users: listar, buscar por id, crear con hash de password, soft-delete, roles, actualizar con password
Cuentas: buscar por usuario, buscar individual, cuenta no encontrada
Servicios: tipos activos, filtro por tipo, sin filtro, empresa individual, actualización de tarifa (3 pasos)
Pagos: cálculo de deuda, validaciones (cuenta no encontrada, empresa no encontrada, saldo insuficiente, pago duplicado), comprobante, stats de usuario/admin/empresa
Metrics: inicialización de métricas HTTP y de negocio, obtener métricas como string, content type
Tasks: respuesta correcta del controller
Archivos de soporte:
mocks/prisma-client.ts - Mock del cliente Prisma generado
Se actualizó package.json con moduleNameMapper para resolver generated/prisma/client
El reporte de coverage queda en backend/coverage/ listo para ser consumido por SonarQube.

## ¿Cómo ejecutarlos?

### LOCAL

cd backend/
pnpm test:cov

### SonarCloud

Se han incluido en el job del BackEnd para ser ejecutado del ci.yml