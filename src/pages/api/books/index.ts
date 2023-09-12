import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";
import { PAGE_SIZE } from "@/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;
  const pageNum = parseInt(`${page}`, 10) || 1;
  const offset = (pageNum - 1) * PAGE_SIZE;

  const { rows: books } = await sql`
  SELECT * FROM books
  ORDER BY title ASC
  LIMIT ${PAGE_SIZE} OFFSET ${offset}`;

  const { rows: booksCount } = await sql`SELECT count(*) FROM books`;

  try {
    return res.status(200).json({ books, booksCount: booksCount[0].count });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
