import { PrismaClient, EntryType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERS = [
  { name: "Usuária", username: "usuaria", password: "Florluz971!" },
  { name: "André", username: "andre", password: "Florrio676!" },
];

const EXPENSE_CATEGORIES = [
  "Academia",
  "Água",
  "Energia",
  "Celular",
  "Plano de Saúde",
  "Condomínio",
  "Cartão de Crédito",
  "Outros Gastos",
];

const INCOME_CATEGORIES = ["Salário", "Bolsa", "Dividendos/Investimentos"];

async function main() {
  for (const user of USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        name: user.name,
        username: user.username,
        passwordHash,
      },
    });
  }

  for (const name of EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: { name, type: EntryType.EXPENSE } },
      update: {},
      create: { name, type: EntryType.EXPENSE },
    });
  }

  for (const name of INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: { name, type: EntryType.INCOME } },
      update: {},
      create: { name, type: EntryType.INCOME },
    });
  }

  console.log("Seed concluído.");
  console.log("Login usuária -> usuário: usuaria | senha: Florluz971!");
  console.log("Login André   -> usuário: andre   | senha: Florrio676!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
