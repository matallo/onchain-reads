import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function Book({ slug }: { slug: string }) {
  const [books, setBooks] = useState([]);

  const fetchData = useCallback(async () => {
    const { books: booksData } = await fetch(
      `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/books/${slug}`
    ).then((res) => res.json());

    setBooks(booksData);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData, slug]);

  return (
    <>
      {books.map(
        ({
          author,
          image_url,
          slug,
          title,
        }: {
          author: string;
          image_url: string;
          slug: string;
          title: string;
        }) => (
          <li
            key={slug}
            className="w-[calc(50%-0.5rem)] min-[342px]:w-[calc(33.3333%-0.6667rem)] min-[512px]:w-[calc(25%-0.75rem)] flex"
          >
            <Link
              href={`/t/books/${slug}`}
              className="w-[calc(100%+1rem)] hover:bg-slate-100 p-2 pb-4 -m-2 rounded-md transition-all"
              title={`${title} by ${author}`}
            >
              <div className="relative mb-4 cursor-pointer rounded-md ring-1 ring-slate-900/5 overflow-hidden shadow-sm hover:shadow-none bg-white">
                <img
                  src={`https://res.cloudinary.com/dcuclvhyb/image/fetch/c_fill,f_auto,h_450,w_300/${image_url}`}
                  className="object-cover w-[150px] aspect-[2/3]"
                  alt={`${title} by ${author}`}
                />
              </div>

              <p className="line-clamp-2 text-ellipsis overflow-hidden">
                {title}
              </p>
              <p className="mt-1 text-slate-500 line-clamp-2">{author}</p>
            </Link>
          </li>
        )
      )}
    </>
  );
}
