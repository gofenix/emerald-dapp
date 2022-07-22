import { config } from "@onflow/fcl";

config()
    .put("accessNode.api", "https://rest-testnet.onflow.org") // This connects us to Flow TestNet
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn/") // Allows us to connect to Blocto & Lilico Wallet