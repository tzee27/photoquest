import { getCurrentSubgraphEndpoint } from "./config";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Get the appropriate subgraph endpoint based on current network
const SUBGRAPH_URL = getCurrentSubgraphEndpoint();

const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    // Optimize cache configuration for memory efficiency
    typePolicies: {
      Query: {
        fields: {
          // Implement smart caching and pagination for quest queries
          questCreateds: {
            keyArgs: ["where", "orderBy", "orderDirection"],
            merge(existing = [], incoming) {
              // Deduplicate based on questId to prevent duplicates
              const existingMap = new Map();
              existing.forEach((item: any) => {
                existingMap.set(item.questId, item);
              });

              incoming.forEach((item: any) => {
                existingMap.set(item.questId, item);
              });

              const deduped = Array.from(existingMap.values());
              return deduped.slice(-1000); // Keep only last 1000 items
            },
          },
          photoSubmitteds: {
            keyArgs: ["where", "orderBy", "orderDirection"],
            merge(existing = [], incoming) {
              // Deduplicate based on unique submission key
              const existingMap = new Map();
              existing.forEach((item: any) => {
                const key = `${item.questId}-${item.submissionIndex}`;
                existingMap.set(key, item);
              });

              incoming.forEach((item: any) => {
                const key = `${item.questId}-${item.submissionIndex}`;
                existingMap.set(key, item);
              });

              const deduped = Array.from(existingMap.values());
              return deduped.slice(-500); // Smaller limit for submissions
            },
          },
          questCompleteds: {
            // Completed quests don't change, can cache aggressively
            keyArgs: ["where", "orderBy", "orderDirection"],
            merge(existing = [], incoming) {
              // Deduplicate based on questId
              const existingMap = new Map();
              existing.forEach((item: any) => {
                existingMap.set(item.questId, item);
              });

              incoming.forEach((item: any) => {
                existingMap.set(item.questId, item);
              });

              return Array.from(existingMap.values());
            },
          },
          questCancelleds: {
            // Cancelled quests don't change, can cache aggressively
            keyArgs: ["where", "orderBy", "orderDirection"],
            merge(existing = [], incoming) {
              // Deduplicate based on questId
              const existingMap = new Map();
              existing.forEach((item: any) => {
                existingMap.set(item.questId, item);
              });

              incoming.forEach((item: any) => {
                existingMap.set(item.questId, item);
              });

              return Array.from(existingMap.values());
            },
          },
        },
      },
    },
    // Configure garbage collection
    possibleTypes: {},
    dataIdFromObject: (object: any) => {
      // Use consistent IDs for better caching
      if (object.__typename === "QuestCreated") {
        return `QuestCreated:${object.questId}`;
      }
      if (object.__typename === "PhotoSubmitted") {
        return `PhotoSubmitted:${object.questId}:${object.submissionIndex}`;
      }
      if (object.__typename === "QuestCompleted") {
        return `QuestCompleted:${object.questId}`;
      }
      if (object.__typename === "QuestCancelled") {
        return `QuestCancelled:${object.questId}`;
      }
      return object.id || null;
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: false, // Reduce unnecessary re-renders
      fetchPolicy: "cache-first", // Use cache when possible
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  // Configure connection pooling and request optimization
  ssrMode: typeof window === "undefined",
  connectToDevTools: process.env.NODE_ENV === "development",
});
