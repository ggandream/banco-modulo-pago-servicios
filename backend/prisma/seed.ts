// import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';
import "dotenv/config";
import { PrismaClient } from "generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Seeding database...');

  // ──────────────────────────────────────────────────────────────────────────
  // ROLES
  // ──────────────────────────────────────────────────────────────────────────
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'administrador' },
    update: {},
    create: { nombre: 'administrador' },
  });
  const rolCuentahabiente = await prisma.rol.upsert({
    where: { nombre: 'cuentahabiente' },
    update: {},
    create: { nombre: 'cuentahabiente' },
  });
  const rolEmpresa = await prisma.rol.upsert({
    where: { nombre: 'empresa_servicio' },
    update: {},
    create: { nombre: 'empresa_servicio' },
  });

  console.log('Roles creados');

  // ──────────────────────────────────────────────────────────────────────────
  // TIPOS DE SERVICIO
  // ──────────────────────────────────────────────────────────────────────────
  const tipoElectricidad = await prisma.tipoServicio.upsert({
    where: { nombre: 'Electricidad' },
    update: {},
    create: { nombre: 'Electricidad' },
  });
  const tipoAgua = await prisma.tipoServicio.upsert({
    where: { nombre: 'Agua Potable' },
    update: {},
    create: { nombre: 'Agua Potable' },
  });

  console.log('Tipos de servicio creados');

  // ──────────────────────────────────────────────────────────────────────────
  // EMPRESAS DE SERVICIO
  // ──────────────────────────────────────────────────────────────────────────
  const empresas = [
    { nombre: 'Energuate de Occidente', tipoServicioId: tipoElectricidad.id, tarifaMensual: 150.0 },
    { nombre: 'Energuate de Oriente', tipoServicioId: tipoElectricidad.id, tarifaMensual: 175.0 },
    { nombre: 'Empresa Electrica de Guatemala', tipoServicioId: tipoElectricidad.id, tarifaMensual: 200.0 },
    { nombre: 'Empagua', tipoServicioId: tipoAgua.id, tarifaMensual: 80.0 },
    { nombre: 'Agua de Oriente', tipoServicioId: tipoAgua.id, tarifaMensual: 65.0 },
    { nombre: 'Agua de Occidente', tipoServicioId: tipoAgua.id, tarifaMensual: 70.0 },
  ];

  const empresasCreadas: Record<string, { id: number }> = {};
  for (const emp of empresas) {
    const created = await prisma.empresaServicio.upsert({
      where: { id: 0 }, // force create
      update: {},
      create: emp,
    }).catch(() =>
      prisma.empresaServicio.create({ data: emp }),
    );
    empresasCreadas[emp.nombre] = created;
  }

  // Re-fetch all companies to get correct IDs
  const allEmpresas = await prisma.empresaServicio.findMany();
  for (const emp of allEmpresas) {
    empresasCreadas[emp.nombre] = emp;
  }

  console.log('Empresas de servicio creadas');

  // ──────────────────────────────────────────────────────────────────────────
  // TARIFAS DE SERVICIO
  // ──────────────────────────────────────────────────────────────────────────
  for (const emp of allEmpresas) {
    await prisma.tarifasServicio.create({
      data: {
        empresaId: emp.id,
        montoMensual: emp.tarifaMensual,
        fechaInicioVigencia: new Date('2026-01-01'),
        estado: true,
      },
    }).catch(() => {
      // Already exists
    });
  }

  console.log('Tarifas creadas');

  // ──────────────────────────────────────────────────────────────────────────
  // USUARIOS
  // ──────────────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);

  const admin = await prisma.usuario.upsert({
    where: { nombreUsuario: 'admin' },
    update: {},
    create: {
      nombreCompleto: 'Administrador del Sistema',
      nombreUsuario: 'admin',
      correo: 'admin@banco.gt',
      passwordHash: await bcrypt.hash('admin123', salt),
      rolId: rolAdmin.id,
    },
  });

  const juan = await prisma.usuario.upsert({
    where: { nombreUsuario: 'juan.perez' },
    update: {},
    create: {
      nombreCompleto: 'Juan Carlos Perez Lopez',
      nombreUsuario: 'juan.perez',
      correo: 'juan.perez@correo.gt',
      passwordHash: await bcrypt.hash('user123', salt),
      rolId: rolCuentahabiente.id,
    },
  });

  const maria = await prisma.usuario.upsert({
    where: { nombreUsuario: 'maria.garcia' },
    update: {},
    create: {
      nombreCompleto: 'Maria Fernanda Garcia',
      nombreUsuario: 'maria.garcia',
      correo: 'maria.garcia@correo.gt',
      passwordHash: await bcrypt.hash('user123', salt),
      rolId: rolCuentahabiente.id,
    },
  });

  const empresaUser = await prisma.usuario.upsert({
    where: { nombreUsuario: 'energuate.admin' },
    update: {},
    create: {
      nombreCompleto: 'Admin Energuate de Occidente',
      nombreUsuario: 'energuate.admin',
      correo: 'admin@energuate.gt',
      passwordHash: await bcrypt.hash('empresa123', salt),
      rolId: rolEmpresa.id,
    },
  });

  console.log('Usuarios creados');

  // ──────────────────────────────────────────────────────────────────────────
  // CUENTAS BANCARIAS
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.cuentaBancaria.upsert({
    where: { numeroCuenta: '1001-0001' },
    update: {},
    create: {
      usuarioId: juan.id,
      numeroCuenta: '1001-0001',
      saldo: 5000.0,
      tipoCuenta: 'Ahorro',
    },
  });

  await prisma.cuentaBancaria.upsert({
    where: { numeroCuenta: '1001-0002' },
    update: {},
    create: {
      usuarioId: juan.id,
      numeroCuenta: '1001-0002',
      saldo: 12000.0,
      tipoCuenta: 'Monetaria',
    },
  });

  await prisma.cuentaBancaria.upsert({
    where: { numeroCuenta: '1002-0001' },
    update: {},
    create: {
      usuarioId: maria.id,
      numeroCuenta: '1002-0001',
      saldo: 3500.0,
      tipoCuenta: 'Ahorro',
    },
  });

  console.log('Cuentas bancarias creadas');

  // ──────────────────────────────────────────────────────────────────────────
  // CONTADORES DE SERVICIO
  // ──────────────────────────────────────────────────────────────────────────
  const energuateOcc = allEmpresas.find((e) => e.nombre === 'Energuate de Occidente')!;
  const empagua = allEmpresas.find((e) => e.nombre === 'Empagua')!;
  const energuateOri = allEmpresas.find((e) => e.nombre === 'Energuate de Oriente')!;

  const contadores = [
    { numeroContador: 'CTR-E-001', empresaId: energuateOcc.id, alias: 'Casa Juan - Electricidad' },
    { numeroContador: 'CTR-E-002', empresaId: energuateOri.id, alias: 'Casa Maria - Electricidad' },
    { numeroContador: 'CTR-A-001', empresaId: empagua.id, alias: 'Casa Juan - Agua' },
    { numeroContador: 'CTR-A-002', empresaId: empagua.id, alias: 'Casa Maria - Agua' },
    { numeroContador: 'CTR-E-003', empresaId: energuateOcc.id, alias: 'Oficina Central' },
  ];

  for (const cnt of contadores) {
    await prisma.contadorServicio.upsert({
      where: { numeroContador: cnt.numeroContador },
      update: {},
      create: cnt,
    });
  }

  console.log('Contadores creados');

  // ──────────────────────────────────────────────────────────────────────────
  // PAGOS DE EJEMPLO (Juan pago enero y febrero de electricidad)
  // ──────────────────────────────────────────────────────────────────────────
  const cuentaJuan = await prisma.cuentaBancaria.findFirst({
    where: { usuarioId: juan.id, numeroCuenta: '1001-0001' },
  });

  if (cuentaJuan) {
    for (const mes of [1, 2]) {
      const existingPago = await prisma.pago.findUnique({
        where: {
          numeroContador_empresaId_mesCorrespondiente_anioCorrespondiente: {
            numeroContador: 'CTR-E-001',
            empresaId: energuateOcc.id,
            mesCorrespondiente: mes,
            anioCorrespondiente: 2026,
          },
        },
      });

      if (!existingPago) {
        const pago = await prisma.pago.create({
          data: {
            usuarioId: juan.id,
            empresaId: energuateOcc.id,
            numeroContador: 'CTR-E-001',
            cuentaBancariaId: cuentaJuan.id,
            montoPagado: 150.0,
            mesCorrespondiente: mes,
            anioCorrespondiente: 2026,
            estado: 'aprobado',
          },
        });

        await prisma.comprobante.create({
          data: {
            pagoId: pago.id,
            numeroComprobante: `COMP-2026${String(mes).padStart(2, '0')}-${String(pago.id).padStart(6, '0')}`,
            monto: 150.0,
            empresa: 'Energuate de Occidente',
            numeroContador: 'CTR-E-001',
          },
        });

        const contadorRef = await prisma.contadorServicio.findUnique({
          where: { numeroContador: 'CTR-E-001' },
        });

        await prisma.historialPagos.create({
          data: {
            pagoId: pago.id,
            empresaId: energuateOcc.id,
            usuarioId: juan.id,
            contadorId: contadorRef?.id,
            tipoServicioId: tipoElectricidad.id,
          },
        });
      }
    }
  }

  console.log('Pagos de ejemplo creados');
  console.log('Seed completado exitosamente!');
  console.log('');
  console.log('Usuarios de prueba:');
  console.log('  Admin:          admin / admin123');
  console.log('  Cuentahabiente: juan.perez / user123');
  console.log('  Cuentahabiente: maria.garcia / user123');
  console.log('  Empresa:        energuate.admin / empresa123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
