import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const { rows: rowsCount } = await sql`SELECT count(*) FROM books`;
  if (rowsCount[0].count !== 0) {
    return res.status(200).json({ booksCount: rowsCount[0].count });
  }

  try {
    const result =
      await sql`CREATE TABLE IF NOT EXISTS books ( title varchar(255), author varchar(255), description text, slug char(255) UNIQUE );`;
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
