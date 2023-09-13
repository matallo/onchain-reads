import { useCallback, useEffect, useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useModal } from "connectkit";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";
import { Book, SidebarLeft, SidebarMenu } from "@/components";
import { CONTRACT_ADDRESS, SCHEMA } from "@/constants";
import { useSigner } from "@/utils/wagmi-utils";

const eas = new EAS(CONTRACT_ADDRESS);

export default function Books({
  author,
  image_url,
  slug,
  title,
}: {
  author: string;
  image_url: string;
  slug: string;
  title: string;
}) {
  const [attestations, setAttestations] = useState([]);
  const [attesting, setAttesting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { status } = useAccount();
  const modal = useModal();
  const signer = useSigner();

  const fetchData = useCallback(async () => {
    const { data } = await fetch(
      "https://optimism-goerli-bedrock.easscan.org/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query Attestations($where: AttestationWhereInput) {
              attestations(where: $where) {
                attester
              }
            }`,
          variables: {
            where: {
              data: {
                startsWith: `0x${slug}`,
              },
              revoked: {
                equals: false,
              },
            },
          },
        }),
      }
    ).then((res) => res.json());

    setAttestations(data.attestations.map(({ attester }: any) => attester));

    setAttesting(false);
  }, [slug]);

  useEffect(() => {
    setAttesting(true);

    fetchData();
  }, [fetchData, slug]);

  const handleButtonOnclick = async () => {
    if (status !== "connected") {
      modal.setOpen(true);
    } else {
      setAttesting(true);

      try {
        const schemaEncoder = new SchemaEncoder("bytes32 bookId, bool isRead");
        const encoded = schemaEncoder.encodeData([
          {
            name: "bookId",
            value: `0x${slug}`,
            type: "bytes32",
          },
          { name: "isRead", value: true, type: "bool" },
        ]);

        invariant(signer, "signer must be defined");
        eas.connect(signer);

        const tx = await eas.attest({
          data: {
            recipient: "0x0000000000000000000000000000000000000000",
            data: encoded,
            revocable: true,
          },
          schema: SCHEMA,
        });

        const uid = await tx.wait();

        fetchData();
      } catch (e) {}

      setAttesting(false);
    }
  };

  const hasAttestations = attestations?.length > 0;

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
          <div className="bg-white border-b border-slate-100">
            <div className="p-4">
              <div className="flex justify-between mb-6">
                <Link
                  href="/t/books"
                  className="flex items-center justify-center shrink-0 w-10 h-10 border border-slate-100 hover:border-slate-200 rounded-full bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 hover:text-slate-900 transition-all"
                >
                  ←
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                <div className="shrink-0 w-[150px] rounded-md overflow-hidden ring-1 ring-slate-900/5 shadow-sm hover:shadow-md transition-all">
                  <img
                    src={`https://res.cloudinary.com/dcuclvhyb/image/fetch/c_fill,f_auto,h_450,w_300/${image_url}`}
                    className="object-cover w-[150px] aspect-[2/3]"
                    alt={`${title} by ${author}`}
                  />
                </div>

                <div className="mt-6 sm:mt-0 sm:ml-6">
                  <h1 className="text-2xl font-medium text-center sm:text-left">
                    {title}
                  </h1>

                  <p className="mt-1 mb-4 text-[15px] text-slate-500 text-center sm:text-left">
                    by {author}
                  </p>

                  <p className="mb-4 text-sm text-center sm:text-left">
                    <button
                      onClick={handleButtonOnclick}
                      className="inline-flex items-center justify-center px-4 py-2 border rounded-full font-medium transition-all border-slate-100 hover:border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
                    >
                      {attesting
                        ? "Attesting..."
                        : status === "connected"
                        ? "Mark as read"
                        : "Connect wallet"}
                    </button>
                  </p>

                  <p className="text-slate-500 text-center sm:text-left text-sm">
                    {!attesting && attestations.length > 0
                      ? `${attestations.length} people have marked ${title} as read`
                      : `Nobody has has marked ${title} as read yet`}
                  </p>
                </div>
              </div>
            </div>
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
            {!attesting && !hasAttestations && (
              <p className="flex items-center justify-center h-96 w-full">
                No results.
              </p>
            )}

            {!attesting && hasAttestations && (
              <ol className="flex flex-col gap-[1rem] text-sm mb-6">
                {attestations.map((attestation: string, i) => (
                  <li key={i}>
                    <Link href={`/u/${attestation}`} title={attestation}>
                      <pre className="inline">{`${attestation.slice(
                        0,
                        6
                      )}...${attestation.slice(attestation.length - 4)}`}</pre>
                    </Link>
                  </li>
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const slug = query?.slug || "";

  const { books } = await fetch(
    `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/books/${slug}`
  ).then((res) => res.json());

  if (books?.length < 1) {
    return {
      notFound: true,
    };
  }

  const author = books[0].author;
  const image_url = books[0].image_url;
  const title = books[0].title;

  return {
    props: {
      author,
      image_url,
      slug,
      title,
    },
  };
};
