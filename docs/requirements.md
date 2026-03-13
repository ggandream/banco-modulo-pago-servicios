# Especificación del Proyecto: Modulo bancario de Pago de Servicios de Luz y Agua

## 1. Descripción general
Este proyecto consiste en desarrollar un modulo de sistema web para el pago de servicios de luz y agua por parte de cuentahabientes.

## 2. Objetivos
- Facilitar el pago de servicios a los cuentahabientes.
- Mostrar historial de pagos realizados por servicio.
- Generar comprobante de pago realizado. 

## 3. Alcance

### Incluye
- Autenticacion de usuarios.
- Historial de pago de servicios.
- Formulario por cada pago de servicios.
- Menu de seleccion de servicios a pagar con las siguientes opciones: Electricidad y Agua Potable.
- Menu de seleccion de empresas por cada servicio con la siguientes opciones:
    - Electricidad: 
        - Energuate de Occidente
        - Energuate de Oriente
        - Empresa Electrica de Guatemala

    - Agua Potable:
        - Empagua
        - Agua de Oriente
        - Agua de Occidente

- Pagina Home despues de inicio de sesión.
- Menu lateral con las opciones: Perfil, Pagos.

## 4. Roles de usuario
- Cuentahabiente
- Administrador

### 4.1 Administrador
Puede: 
- Crear, editar y desactivar usuarios.
- Ver todos los registros.

### 4.2 Cuentahabiente
Puede:
- Iniciar sesión
- Ver historial de movimientos
- Realizar pagos a empresa de servicios ingresando numero de contador


### 4.3 Empresa de Servicios
Puede:
- Iniciar sesión
- Consultar pagos realizados por cuentahabiente a su empresa de servicios sin ver el nombre del cuentahabiente pero si el numero del contador.
- Establecer el precio del servicio por mes. 


## 5. Módulos del sistema

### 5.1 Autenticación y acceso
- Inicio de sesion
- Cierre de sesion
- Recuperacion de contraseña
- Control de acceso por roles

### 5.2 Gestión de usuarios
- Crear usuario
- Editar usuario
- Cambiar estado de usuario de activo/inactivo
- Asignar rol

### 5.3 Pago de servicios
- Seleccion de servicio
- Seleccion de empresa
- Formulario de Pago
- Registro de pago
- Historial de pagos

### 5.4 Gestion de pagos
- Seleccion de cliente (numero de contador)
- Historial de pagos por numero de contador.

## 6. Requerimientos funcionales
### RF-001 Inicio de sesion
El sistema debe permitir el inicio de sesión mediante nombre de usuario y contraseña.

### RF-002 Acceso y Roles
El sistema debe restringir el acceso según el rol del usuario autenticado.

### RF-003 Gestion de Usuarios
El sistema debe permitir crear, editar, consultar y desactivar usuarios.

### RF-004 Pago de Servicio registrado
El sistema debe registrar cada pago con fecha, hora, usuario, estado, numero de contador y cuenta debitada.

### RF-005 Formulario de Pago de Servicios
El formulario de pagos debe contar con nombre de la empresa, nombre alias, cuenta a debitar, numero de contador y monto a cancelar. 

- Nombre de la empresa, debe ser preseleccionado de un menu anterior.
- Cuenta a debitar, dropdown con todas las cuentas del cuentahabiente.
- Numero de contador, entrada de texto.
- Monto a cancelar, generado por el historial de pago del sistema. Donde cada empresa tiene su tarifa y dependiendo de la fecha y el historial se genera el monto a pagar.

### RF-006 Gestion de Pagos
El modulo de gestion de pagos para el rol de empresa de servicio, debe permitir ver el historial de pagos por numero de contador, monto pagado y fecha de pago realizado.

Resaltar el perfil de numeros de contador con atraso en el pago, calculado a partir del mes y el histoial de pago. 

## 7. Requerimientos no funcionales

### RNF-001 Seguridad
- Contraseñas cifradas
- Validación de permisos por rol
- Protección contra inyección SQL y XSS
- Manejo seguro de sesiones o tokens

### RNF-002 Usabilidad
- Interfaz responsive
- Formularios claros
- Mensajes de error comprensibles

## 8. Entidades principales

### Usuario
Campos sugeridos:
- id
- nombre completo
- nombre de cuenta
- correo
- contraseña_hash
- rol
- estado
- fecha_creacion
- fecha_actualizacion

### Cuenta bancaria
- id
- usuario_id
- numero_cuenta
- saldo
- tipo_cuenta
- estado

### Empresa de servicio
- id
- nombre
- tipo_servicio
- tarifa_mensual
- estado

### Pago
- id
- usuario_id
- empresa_id
- numero_contador
- cuenta_debitada
- monto
- estado
- fecha_pago
- comprobante_id

### Comprobante
- id
- numero_autorizacion
- fecha
- monto
- empresa
- numero_contador


## 9. Reglas de negocio

## 10. Flujos principales

## 11. Validaciones

## 12. Estructura técnica

## 13. Interfaz

## 14. Entregables esperados

## 15. Restricciones importantes

