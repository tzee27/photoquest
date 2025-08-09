# PhotoQuest Subgraph Integration

This document explains how The Graph subgraph is integrated into the PhotoQuest dApp.

## Overview

The PhotoQuest dApp now uses The Graph protocol to efficiently query blockchain data instead of making direct contract calls. This provides:

- ⚡ **Faster Data Access**: Pre-indexed data loads much faster than on-chain queries
- 📊 **Rich Querying**: Complex filtering, sorting, and pagination capabilities
- 🔄 **Real-time Updates**: Automatic data synchronization with blockchain events
- 🚀 **Better UX**: Reduced loading times and improved responsiveness

## Architecture

```
Blockchain Events → The Graph Node → Subgraph → Apollo Client → React Components
```

### Key Components

1. **Subgraph** (`packages/photo-quest/`): Indexes blockchain events
2. **Apollo Client** (`services/graphql/apollo-client.ts`): GraphQL client configuration
3. **Queries** (`services/graphql/queries.ts`): Pre-defined GraphQL queries
4. **Hooks** (`hooks/useSubgraph.ts`): React hooks for data fetching
5. **Types** (`types/subgraph.ts`): TypeScript type definitions

## Setup Instructions

### 1. Deploy Your Subgraph

First, make sure your subgraph is deployed:

```bash
# Navigate to the subgraph package
cd packages/photo-quest

# Install dependencies
yarn install

# Generate code from schema
yarn codegen

# Build the subgraph
yarn build

# Deploy to The Graph Studio (update the deploy script with your subgraph slug)
yarn deploy
```

### 2. Configure Environment Variables

Create a `.env.local` file in `packages/nextjs/` with your subgraph URLs:

```env
# Replace <your-subgraph-id> with your actual ID from The Graph Studio
NEXT_PUBLIC_SUBGRAPH_URL_SEPOLIA=https://api.studio.thegraph.com/query/<your-subgraph-id>/photo-quest/version/latest

# For local development
NEXT_PUBLIC_SUBGRAPH_URL_LOCALHOST=http://localhost:8000/subgraphs/name/photo-quest

# Set target network
NEXT_PUBLIC_TARGET_NETWORK=sepolia
```

### 3. Update Contract Address in Subgraph

Make sure your `packages/photo-quest/subgraph.yaml` has the correct contract address:

```yaml
dataSources:
  - kind: ethereum
    name: YourContract
    network: sepolia
    source:
      address: "YOUR_DEPLOYED_CONTRACT_ADDRESS" # Update this
      abi: YourContract
      startBlock: YOUR_START_BLOCK # Update this
```

## Usage Examples

### Using Subgraph Hooks in Components

```tsx
import { useGetActiveQuests, useGetUserStats } from "~~/hooks/useSubgraph";

function MyComponent() {
  // Get all active quests
  const { data: quests, loading, error } = useGetActiveQuests();

  // Get user statistics
  const userStats = useGetUserStats(userAddress);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Active Quests: {quests?.length}</h2>
      <h3>User Created: {userStats.createdQuestsCount}</h3>
      {/* Render quest data */}
    </div>
  );
}
```

### Direct GraphQL Queries

```tsx
import { useQuery } from "@apollo/client";
import { GET_QUESTS } from "~~/services/graphql/queries";

function DirectQueryExample() {
  const { data, loading, error } = useQuery(GET_QUESTS, {
    variables: { first: 10 },
  });

  return <div>{data?.questCreateds?.map(quest => <div key={quest.id}>{quest.title}</div>)}</div>;
}
```

## Available Hooks

- `useGetQuests()` - Get all quests with pagination
- `useGetActiveQuests()` - Get only active (not completed/cancelled) quests
- `useGetQuestsByRequester(address)` - Get quests created by a user
- `useGetQuestSubmissions(questId)` - Get submissions for a quest
- `useGetPhotosByPhotographer(address)` - Get photos submitted by a user
- `useGetUserStats(address)` - Get aggregated user statistics
- `useGetQuestWithSubmissions(questId)` - Get comprehensive quest data

## Data Types

All subgraph entities are typed in `types/subgraph.ts`:

- `QuestCreated` - Quest creation events
- `PhotoSubmitted` - Photo submission events
- `QuestCompleted` - Quest completion events
- `QuestCancelled` - Quest cancellation events
- `SubmissionsSelected` - Submission selection events
- `PlatformFeeUpdated` - Platform fee update events

## Migration from Direct Contract Calls

To migrate existing components from direct contract calls to subgraph:

### Before (Direct Contract Calls)

```tsx
const { data: questIds } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "getOpenQuests",
});
```

### After (Subgraph)

```tsx
const { data: quests } = useGetActiveQuests();
```

## Benefits of Migration

1. **Performance**: ~10x faster than direct contract calls
2. **Rich Data**: Access to historical events and relationships
3. **Offline Support**: Data remains available during network issues
4. **Advanced Filtering**: Complex queries not possible with contracts
5. **Real-time**: Automatic updates when new events occur

## Troubleshooting

### Common Issues

1. **"Network Error"**: Check if subgraph URL is correct
2. **"No data returned"**: Verify contract address and start block
3. **"GraphQL errors"**: Check query syntax and field names

### Health Check

Use the utility function to check subgraph health:

```tsx
import { checkSubgraphHealth } from "~~/services/graphql/config";

const isHealthy = await checkSubgraphHealth();
console.log("Subgraph healthy:", isHealthy);
```

### Debug Mode

Enable Apollo Client dev tools for debugging:

1. Install Apollo Client DevTools browser extension
2. Open browser dev tools → Apollo tab
3. View queries, cache, and performance metrics

## Best Practices

1. **Use Pagination**: Always use `first` and `skip` for large datasets
2. **Cache Management**: Let Apollo handle caching, avoid manual cache writes
3. **Error Handling**: Always handle loading and error states
4. **Polling Strategy**: Use appropriate polling intervals based on data freshness needs
5. **Type Safety**: Use TypeScript types for all subgraph data

## Development Workflow

1. **Contract Changes**: Update subgraph schema and mappings
2. **Deploy Subgraph**: Redeploy after contract updates
3. **Update Frontend**: Add new queries and hooks as needed
4. **Test Integration**: Verify data consistency between contract and subgraph

For more information, see:

- [The Graph Documentation](https://thegraph.com/docs/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
