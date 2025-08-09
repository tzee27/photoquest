// Configuration for The Graph subgraph integration

export const subgraphConfig = {
  // Subgraph URLs for different networks
  endpoints: {
    // Local development (The Graph Node)
    localhost: process.env.NEXT_PUBLIC_SUBGRAPH_URL_LOCALHOST || "http://localhost:8000/subgraphs/name/photo-quest",

    // Sepolia testnet (The Graph Studio)
    sepolia:
      process.env.NEXT_PUBLIC_SUBGRAPH_URL_SEPOLIA ||
      "https://api.studio.thegraph.com/query/<your-subgraph-id>/photo-quest/version/latest",

    // Mainnet (The Graph Network)
    mainnet:
      process.env.NEXT_PUBLIC_SUBGRAPH_URL_MAINNET ||
      "https://gateway.thegraph.com/api/<your-api-key>/subgraphs/id/<your-subgraph-id>",
  },

  // Default polling intervals
  polling: {
    defaultInterval: 30000, // 30 seconds
    fastInterval: 10000, // 10 seconds for critical data
    slowInterval: 60000, // 1 minute for less critical data
  },

  // Default query limits
  pagination: {
    defaultPageSize: 100,
    maxPageSize: 1000,
  },
};

// Get the current network's subgraph endpoint
export const getCurrentSubgraphEndpoint = (): string => {
  const network = process.env.NEXT_PUBLIC_TARGET_NETWORK || "sepolia";

  switch (network) {
    case "localhost":
    case "hardhat":
      return subgraphConfig.endpoints.localhost;
    case "sepolia":
      return subgraphConfig.endpoints.sepolia;
    case "mainnet":
      return subgraphConfig.endpoints.mainnet;
    default:
      return subgraphConfig.endpoints.sepolia; // fallback
  }
};

// Utility function to check if subgraph is available
export const checkSubgraphHealth = async (): Promise<boolean> => {
  try {
    const endpoint = getCurrentSubgraphEndpoint();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ _meta { block { number } } }",
      }),
    });

    const result = await response.json();
    return !result.errors && result.data?._meta?.block?.number;
  } catch (error) {
    console.error("Subgraph health check failed:", error);
    return false;
  }
};
