-- CreateTable
CREATE TABLE "rol" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "nombre_usuario" VARCHAR(50) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_bancaria" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "numero_cuenta" VARCHAR(20) NOT NULL,
    "saldo" DECIMAL(12,2) NOT NULL,
    "tipo_cuenta" VARCHAR(50) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuenta_bancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_servicio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3),

    CONSTRAINT "tipo_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa_servicio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo_servicio_id" INTEGER NOT NULL,
    "tarifa_mensual" DECIMAL(10,2) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3),

    CONSTRAINT "empresa_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contador_servicio" (
    "id" SERIAL NOT NULL,
    "numero_contador" VARCHAR(50) NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "alias" VARCHAR(100),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contador_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "numero_contador" VARCHAR(50) NOT NULL,
    "cuenta_bancaria_id" INTEGER NOT NULL,
    "monto_pagado" DECIMAL(10,2) NOT NULL,
    "mes_correspondiente" INTEGER NOT NULL,
    "anio_correspondiente" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'aprobado',
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_pagos" (
    "id" SERIAL NOT NULL,
    "pago_id" INTEGER NOT NULL,
    "empresa_id" INTEGER,
    "usuario_id" INTEGER,
    "contador_id" INTEGER,
    "tipo_servicio_id" INTEGER,
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas_servicio" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "monto_mensual" DECIMAL(10,2) NOT NULL,
    "fecha_inicio_vigencia" DATE NOT NULL,
    "fecha_fin_vigencia" DATE,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tarifas_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobante" (
    "id" SERIAL NOT NULL,
    "pago_id" INTEGER NOT NULL,
    "numero_comprobante" VARCHAR(50) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(10,2) NOT NULL,
    "empresa" VARCHAR(150) NOT NULL,
    "numero_contador" VARCHAR(50) NOT NULL,

    CONSTRAINT "comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_nombre_usuario_key" ON "usuario"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_bancaria_numero_cuenta_key" ON "cuenta_bancaria"("numero_cuenta");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_servicio_nombre_key" ON "tipo_servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "contador_servicio_numero_contador_key" ON "contador_servicio"("numero_contador");

-- CreateIndex
CREATE UNIQUE INDEX "pago_numero_contador_empresa_id_mes_correspondiente_anio_co_key" ON "pago"("numero_contador", "empresa_id", "mes_correspondiente", "anio_correspondiente");

-- CreateIndex
CREATE UNIQUE INDEX "comprobante_pago_id_key" ON "comprobante"("pago_id");

-- CreateIndex
CREATE UNIQUE INDEX "comprobante_numero_comprobante_key" ON "comprobante"("numero_comprobante");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_bancaria" ADD CONSTRAINT "cuenta_bancaria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresa_servicio" ADD CONSTRAINT "empresa_servicio_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipo_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contador_servicio" ADD CONSTRAINT "contador_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_cuenta_bancaria_id_fkey" FOREIGN KEY ("cuenta_bancaria_id") REFERENCES "cuenta_bancaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pagos" ADD CONSTRAINT "historial_pagos_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pagos" ADD CONSTRAINT "historial_pagos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pagos" ADD CONSTRAINT "historial_pagos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pagos" ADD CONSTRAINT "historial_pagos_contador_id_fkey" FOREIGN KEY ("contador_id") REFERENCES "contador_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_pagos" ADD CONSTRAINT "historial_pagos_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipo_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifas_servicio" ADD CONSTRAINT "tarifas_servicio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobante" ADD CONSTRAINT "comprobante_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
