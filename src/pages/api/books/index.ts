import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { rows: books } = await sql`SELECT * FROM books ORDER BY title ASC`;

  const { rows: booksCount } = await sql`SELECT count(*) FROM books`;

  try {
    return res.status(200).json({ books, booksCount: booksCount[0].count });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
