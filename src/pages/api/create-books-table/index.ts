import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const result =
      await sql`CREATE TABLE IF NOT EXISTS books ( title varchar(255), author varchar(255), image_url text, slug char(255) UNIQUE );`;
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
