import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  const { rows: books } = await sql`
  SELECT * FROM books
  WHERE slug=${`${slug}`}`;

  try {
    return res.status(200).json({ books });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
