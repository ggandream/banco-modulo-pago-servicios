export class PrismaClient {}

export const Prisma = {
  Decimal: class Decimal {
    private value: number;
    constructor(val: number | string) {
      this.value = typeof val === 'string' ? parseFloat(val) : val;
    }
    toString() {
      return String(this.value);
    }
  },
};
