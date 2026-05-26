import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const getMariaDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está definida");
  }
  
  const urlObj = new URL(url);
  
  return {
    host: urlObj.hostname || "localhost",
    port: parseInt(urlObj.port) || 3306,
    user: urlObj.username || "root",
    password: urlObj.password || "",
    database: urlObj.pathname?.replace("/", "") || "",
  };
};

const config = getMariaDbConfig();
const adapter = new PrismaMariaDb(config);

const prisma = new PrismaClient({ adapter });

export default prisma;