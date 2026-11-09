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
  // 1. Ler e popular a tabela Species com SQL Nativo (consulta2_especies.csv)
  const speciesLines = readCsvLines("consulta2_especies.csv");
  const speciesData = speciesLines.map((line) => {
    const [code, description, type] = line.split(";");
    return {
      code,
      description,
      type: type as SpeciesType,
    };
  });

  for (const item of speciesData) {
    await prisma.$executeRaw`
      INSERT INTO especies (codespecie, descricao, obrigdireito)
      VALUES (${item.code}, ${item.description}, ${item.type}::obrigdireito_enum)
      ON CONFLICT (codespecie) DO NOTHING
    `;
  }

  // 2. Ler o CSV de títulos e normalizar Fornecedores (3FN)
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

  // 3. Popular os Fornecedores com SQL Nativo (senha padrão: queiroz@2026)
  const passwordHash = await hash("queiroz@2026", 8);

  for (const [id, companyName] of suppliersMap.entries()) {
    await prisma.$executeRaw`
      INSERT INTO fornecedores (seqpessoa, nomerazao, senha)
      VALUES (${id}, ${companyName}, ${passwordHash})
      ON CONFLICT (seqpessoa) DO UPDATE
      SET nomerazao = EXCLUDED.nomerazao
    `;
  }

  // 4. Popular os Títulos com SQL Nativo
  for (const title of titlesData) {
    await prisma.$executeRaw`
      INSERT INTO titulos (seqtitulo, seqpessoa, codespecie, dtaemissao, dtavencimento, vlrnominal, vlrpago)
      VALUES (
        ${title.id},
        ${title.supplierId},
        ${title.speciesCode},
        ${title.issueDate}::date,
        ${title.dueDate}::date,
        ${title.nominalValue}::decimal,
        ${title.paidValue}::decimal
      )
      ON CONFLICT (seqtitulo) DO NOTHING
    `;
  }

  // 5. Fornecedor extra 5001 para testes de isolamento de dados
  await prisma.$executeRaw`
    INSERT INTO fornecedores (seqpessoa, nomerazao, senha)
    VALUES (5001, 'LATICINIOS SERTAO NORDESTINO LTDA', ${passwordHash})
    ON CONFLICT (seqpessoa) DO NOTHING
  `;

  await prisma.$executeRaw`
    INSERT INTO titulos (seqtitulo, seqpessoa, codespecie, dtaemissao, dtavencimento, vlrnominal, vlrpago)
    VALUES
      (90000001, 5001, 'DVFORN', '2026-10-01'::date, '2026-10-25'::date, 450.00::decimal, 0.00::decimal),
      (90000002, 5001, 'VBSELL', '2026-11-01'::date, '2026-12-15'::date, 1200.50::decimal, 200.50::decimal)
    ON CONFLICT (seqtitulo) DO NOTHING
  `;

  console.log(
    `Seed finalizado com SQL nativo: ${speciesData.length} espécies, ${suppliersMap.size} fornecedor(es) e ${titlesData.length} títulos processados.`,
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
