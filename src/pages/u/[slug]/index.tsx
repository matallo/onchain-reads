import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useAccount } from "wagmi";
import Book from "@/components/book";
import { SCHEMA } from "@/constants";
import { useSigner } from "@/utils/wagmi-utils";

export default function Books({ slug }: { slug: string }) {
  const [attesting, setAttesting] = useState(false);
  const [attestations, setAttestations] = useState([]);
  const { status } = useAccount();
  const signer = useSigner();

  useEffect(() => {
    async function fetchData() {
      setAttesting(true);

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
        }
      ).then((res) => res.json());

      setAttestations(
        data.attestations.map(({ decodedDataJson }: any) =>
          JSON.parse(decodedDataJson)[0].value.value.slice(2)
        )
      );

      setAttesting(false);
    }

    fetchData();
  }, [slug]);

  return (
    <>
      {attesting ? (
        "Loading..."
      ) : status === "connected" ? (
        <ul>
          {attestations.map((attestation) => (
            <li key={attestation}>
              <Book slug={attestation} />
            </li>
          ))}
        </ul>
      ) : (
        "Connect wallet"
      )}
    </>
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
