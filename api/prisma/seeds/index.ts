import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, SpeciesType } from "@/generated/prisma/client";
import * as dotenv from "dotenv";
import { hash } from "bcryptjs";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function readCsvLines(fileName: string): string[] {
  const filePath = path.join(__dirname, "data", fileName);
  const content = fs.readFileSync(filePath, "utf-8");

  return content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(1);
}

function parseBrDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

function parseBrDecimal(valueStr: string): string {
  return valueStr.replace(",", ".");
}

async function seed() {
  // 1. Ler e popular a tabela Species (consulta2_especies.csv)
  const speciesLines = readCsvLines("consulta2_especies.csv");
  const speciesData = speciesLines.map((line) => {
    const [code, description, type] = line.split(";");
    return {
      code,
      description,
      type: type as SpeciesType,
    };
  });

  await prisma.species.createMany({
    data: speciesData,
    skipDuplicates: true,
  });

  // 2. Ler o CSV de títulos e separar Fornecedores (normalizado) dos Títulos
  const titlesLines = readCsvLines("consulta1_titulos.csv");
  const suppliersMap = new Map<number, string>();

  const titlesData = titlesLines.map((line) => {
    const [
      seqpessoa,
      nomerazao,
      seqtitulo,
      codespecie,
      dtaemissao,
      dtavencimento,
      vlrnominal,
      vlrpago,
    ] = line.split(";");

    const supplierId = Number(seqpessoa);

    // Guarda o fornecedor único (normalização 3FN)
    if (!suppliersMap.has(supplierId)) {
      suppliersMap.set(supplierId, nomerazao);
    }

    return {
      id: Number(seqtitulo),
      supplierId,
      speciesCode: codespecie,
      issueDate: parseBrDate(dtaemissao),
      dueDate: parseBrDate(dtavencimento),
      nominalValue: parseBrDecimal(vlrnominal),
      paidValue: parseBrDecimal(vlrpago),
    };
  });

  // 3. Popular os Fornecedores extraídos com a senha padrão (queiroz@2026)
  const passwordHash = await hash("queiroz@2026", 8);

  for (const [id, companyName] of suppliersMap.entries()) {
    await prisma.supplier.upsert({
      where: { id },
      update: { companyName },
      create: {
        id,
        companyName,
        password: passwordHash,
      },
    });
  }

  // 4. Popular todos os Títulos relacionando com Supplier e Species
  await prisma.title.createMany({
    data: titlesData,
    skipDuplicates: true,
  });

  console.log(
    `Seed finalizado: ${speciesData.length} espécies, ${suppliersMap.size} fornecedor(es) e ${titlesData.length} títulos processados.`,
  );
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
