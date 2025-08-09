# Pinata IPFS Integration

This project uses Pinata for IPFS file uploads. To enable photo uploads, you need to configure your Pinata credentials.

## Setup Instructions

1. Create a [Pinata](https://pinata.cloud/) account
2. Generate a JWT token from your Pinata dashboard
3. (Optional) Set up a dedicated gateway for faster loading

## Environment Variables

Create a `.env.local` file in the `packages/nextjs` directory with the following variables:

```bash
# Required: Your Pinata JWT token
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here

# Optional: Your custom Pinata gateway URL
NEXT_PUBLIC_PINATA_GATEWAY=https://your-gateway.mypinata.cloud
```

### How to get these values:

1. **Pinata JWT Token:**

   - Go to [Pinata Dashboard](https://app.pinata.cloud/)
   - Navigate to "API Keys"
   - Click "New Key"
   - Give it a name and select permissions (Admin recommended for development)
   - Copy the JWT token

2. **Pinata Gateway (Optional):**
   - Go to "Gateways" in your Pinata dashboard
   - Create or use an existing gateway
   - Copy the gateway URL (e.g., `https://example.mypinata.cloud`)

## API Usage

The integration uses the current Pinata SDK with the following API:

```typescript
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

// Upload a file
const upload = await pinata.upload.public
  .file(file)
  .name("custom-name")
  .keyvalues({ questId: "123", type: "submission" });

// Result format:
// {
//   id: "file-id",
//   cid: "bafkrei...",
//   name: "filename.jpg",
//   size: 12345,
//   created_at: "2024-01-15T10:30:00Z",
//   ...
// }
```

## Features

- ✅ File validation (type, size)
- ✅ IPFS upload with metadata
- ✅ Progress feedback
- ✅ Error handling with fallbacks
- ✅ Smart contract integration
- ✅ Gateway URL optimization
- 🚧 Image watermarking (coming soon)
- 🚧 Camera capture (coming soon)

## File Requirements

- **Supported formats:** JPEG, PNG, GIF, WebP
- **Maximum size:** 10MB
- **Recommended:** High-quality images for better quest submissions

## Usage

Once configured, users can:

1. Select a photo file or take a picture
2. Upload automatically to IPFS via Pinata
3. Submit the IPFS hash to the smart contract
4. Track submission status on the blockchain

## Troubleshooting

**Error: "NEXT_PUBLIC_PINATA_JWT environment variable is required"**

- Make sure you have created a `.env.local` file in `packages/nextjs/`
- Add your JWT token: `NEXT_PUBLIC_PINATA_JWT=your_jwt_here`
- Restart your development server

**Error: "pinata.upload.file is not a function"**

- This means you're using an older API pattern
- The current API is: `pinata.upload.public.file(file)`

**Slow IPFS loading**

- Set up a custom Pinata gateway for faster loading
- Add `NEXT_PUBLIC_PINATA_GATEWAY=https://your-gateway.mypinata.cloud`
