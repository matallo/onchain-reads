import { useEffect, useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useAccount } from "wagmi";
import { useModal } from "connectkit";
import { GetServerSideProps } from "next";
import invariant from "tiny-invariant";
import { CONTRACT_ADDRESS, SCHEMA } from "@/constants";
import { useSigner } from "@/utils/wagmi-utils";
import Link from "next/link";

const eas = new EAS(CONTRACT_ADDRESS);

export default function Books({
  author,
  slug,
  title,
}: {
  author: string;
  slug: string;
  title: string;
}) {
  const { status } = useAccount();
  const modal = useModal();
  const [attesting, setAttesting] = useState(false);
  const [attestations, setAttestations] = useState([]);
  const signer = useSigner();

  useEffect(() => {
    async function fetchData() {
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
    }

    fetchData();
  }, [slug]);

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
      } catch (e) {}

      setAttesting(false);
    }
  };

  return (
    <div>
      <p>{title}</p>
      <p>{author}</p>
      <p>
        <button onClick={handleButtonOnclick}>
          {attesting
            ? "Attesting..."
            : status === "connected"
            ? "Mark as read"
            : "Connect wallet"}
        </button>
      </p>
      <ul>
        {attestations.map((attestation: string) => (
          <li key={attestation}>
            <Link href={`/u/${attestation}`} title={attestation}>
              <pre>{`${attestation.slice(0, 6)}...${attestation.slice(
                attestation.length - 4
              )}`}</pre>
            </Link>
          </li>
        ))}
      </ul>
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
  const title = books[0].title;

  return {
    props: {
      author,
      slug,
      title,
    },
  };
};
