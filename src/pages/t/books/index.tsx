import { useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { SidebarLeft, SidebarMenu } from "@/components";

export default function Books({ page }: { page: number }) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setBooks([]);

    await fetch(
      `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/books?page=${currentPage}`
    )
      .then((res) => res.json())
      .then(({ books: booksData, errorMessage }) => {
        if (errorMessage) {
          console.log({ errorMessage });
          setError(errorMessage);

          setBooks([]);
        } else {
          setBooks(booksData);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);

  const hasBooks = books?.length > 0;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div>
      <Head>
        <title>Onchain Reads</title>
        <meta name="description" content="Your virtual bookshelf onchain" />
      </Head>

      <main className="flex">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-20"
            onClick={(event) => {
              event.preventDefault();

              closeSidebar();
            }}
          ></div>
        )}

        <div
          className={`z-30 fixed h-screen w-64 p-4 bg-white ${
            isSidebarOpen ? "left-0" : "-left-64"
          }`}
        >
          <SidebarMenu />
        </div>

        <SidebarLeft />

        <div className="w-[674px] min-h-screen max-w-full border-l border-r border-slate-100">
          <div className="p-4">
            <div className="flex justify-between min-[826px]:hidden mb-6">
              <div className="flex items-center justify-center h-[44px]">
                <Link
                  href="/"
                  className="inline-block"
                  onClick={(event) => {
                    event.preventDefault();

                    toggleSidebar();
                  }}
                >
                  <Image
                    src="/onchainreads.png"
                    alt="Onchain Reads Logo"
                    width={32}
                    height={32}
                  />
                </Link>
              </div>
            </div>

            <h1 className="text-2xl font-medium">Onchain Reads</h1>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-[calc(100%-223px)] sm:h-96 w-full p-4">
              <svg
                className="animate-spin h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {!loading && error && (
            <p className="flex items-center justify-center h-96 w-full p-4">
              Oh no... {error}
            </p>
          )}
          {!loading && !error && !hasBooks && (
            <p className="flex items-center justify-center h-96 w-full p-4">
              No results.
            </p>
          )}

          {!loading && !error && hasBooks && (
            <ol className="flex flex-wrap p-4 gap-x-[1rem] gap-y-[2rem] text-sm">
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
                      <p className="mt-1 text-slate-500 line-clamp-2">
                        {author}
                      </p>
                    </Link>
                  </li>
                )
              )}
            </ol>
          )}
        </div>

        <div className="flex flex-1"></div>
      </main>
    </div>
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
