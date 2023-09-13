import { useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Book, SidebarLeft, SidebarMenu } from "@/components";
import { SCHEMA } from "@/constants";

export default function Books({ slug }: { slug: string }) {
  const [attesting, setAttesting] = useState(false);
  const [attestations, setAttestations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setAttesting(true);

    const { data } = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
            query Attestations($where: AttestationWhereInput) {
              attestations(where: $where) {
                decodedDataJson
              }
            }`,
        variables: {
          where: {
            attester: {
              equals: slug,
            },
            revoked: {
              equals: false,
            },
            schemaId: {
              equals: SCHEMA,
            },
          },
        },
      }),
    }).then((res) => res.json());

    setAttestations(
      data.attestations.map(({ decodedDataJson }: any) =>
        JSON.parse(decodedDataJson)[0].value.value.slice(2)
      )
    );

    setAttesting(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData, slug]);

  const hasBooks = attestations?.length > 0;

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

          {attesting && (
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

          <div className="p-4">
            <h2 className="mb-6 text-xl font-medium">
              Books read by{" "}
              <pre className="inline" title={slug}>{`${slug.slice(
                0,
                6
              )}...${slug.slice(slug.length - 4)}`}</pre>
            </h2>

            {!attesting && !hasBooks && (
              <p className="flex items-center justify-center h-96 w-full">
                No results.
              </p>
            )}

            {!attesting && hasBooks && (
              <ol className="flex flex-wrap gap-x-[1rem] gap-y-[2rem] text-sm mb-6">
                {attestations.map((attestation, i) => (
                  <Book key={i} slug={attestation} />
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="flex flex-1"></div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug || "";

  return {
    props: {
      slug,
    },
  };
};
