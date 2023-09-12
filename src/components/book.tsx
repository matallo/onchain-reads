import Link from "next/link";
import { useEffect, useState } from "react";

export default function Book({ slug }: { slug: string }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { books: booksData } = await fetch(
        `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/books/${slug}`
      ).then((res) => res.json());

      setBooks(booksData);
    }

    fetchData();
  }, [slug]);

  return (
    <>
      {books.map(
        ({
          title,
          author,
          slug,
        }: {
          slug: string;
          title: string;
          author: string;
        }) => (
          <li key={slug}>
            <Link href={`/t/books/${slug}`}>
              {title} - {author}
            </Link>
          </li>
        )
      )}
    </>
  );
}
