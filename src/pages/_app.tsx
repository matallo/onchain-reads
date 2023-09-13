import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiConfig, createConfig } from "wagmi";
import { base } from "wagmi/chains";

const config = createConfig(
  getDefaultConfig({
    alchemyId: process.env.ALCHEMY_API_KEY,
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || "",
    appName: "Onchain Reads",
    chains: [base],
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        theme={"soft"}
        options={{
          hideQuestionMarkCTA: true,
          hideTooltips: true,
        }}
      >
        <Component {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
