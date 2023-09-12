import crypto from "node:crypto";
import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";

function generateHash(input: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(input, "utf-8");
  return hash.digest("hex");
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const { rows: rowsCount } = await sql`SELECT count(*) FROM books`;
  if (rowsCount[0].count !== 0) {
    return res.status(200).json({ booksCount: rowsCount[0].count });
  }

  const response = await fetch(`${process.env.NEXTAUTH_URL}/books.csv`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch CSV file: ${response.status} ${response.statusText}`
    );
  }

  const csvData = await response.text();

  Papa.parse(csvData, {
    header: true,
    step: async function (results, parser) {
      const { title = "", author = "" }: { title: string; author: string } =
        results.data as { title: string; author: string };

      if (title !== "" && author !== "") {
        const slug = generateHash(`${title}${author}`);
        try {
          await sql`INSERT INTO books (title, author, slug)
          VALUES (${title}, ${author}, ${slug})
          ON CONFLICT (slug) DO UPDATE
          SET title = EXCLUDED.title, author = EXCLUDED.author;`;
        } catch (error) {
          console.error("Failed to insert/update record:", error);
        }
      }
    },
  });

  const { rows: importedBooksCount } = await sql`SELECT count(*) FROM books`;
  return res
    .status(200)
    .json({ importedBooksCount: importedBooksCount[0].count });
}
