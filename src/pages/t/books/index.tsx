import { useEffect, useState } from "react";
import { PAGE_SIZE } from "../../..//constants";
import { GetServerSideProps } from "next";
import Link from "next/link";

export default function Books({ page }: { page: number }) {
  const [currentPage, setCurrentPage] = useState(page);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { books: booksData, booksCount } = await fetch(
        `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/books?page=${currentPage}`
      ).then((res) => res.json());

      const total = Math.ceil(booksCount / PAGE_SIZE);
      setBooks(booksData);
    }

    fetchData();
  }, [currentPage]);

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = context.query?.page || 1;

  return {
    props: {
      page,
    },
  };
};
