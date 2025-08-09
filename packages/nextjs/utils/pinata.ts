import { PinataSDK } from "pinata";

// Initialize Pinata client
const initializePinata = () => {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

  if (!jwt) {
    throw new Error("NEXT_PUBLIC_PINATA_JWT environment variable is required");
  }

  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: gateway,
  });
};

/**
 * Upload a file to IPFS using Pinata
 * @param file - The file to upload
 * @param options - Optional metadata and configuration
 * @returns Promise with IPFS hash and other upload details
 */
export const uploadToIPFS = async (
  file: File,
  options?: {
    name?: string;
    keyValues?: Record<string, string>;
  },
) => {
  try {
    const pinata = initializePinata();

    // Upload file to IPFS using the correct SDK API
    let upload = pinata.upload.public.file(file);

    // Chain options if provided
    if (options?.name) {
      upload = upload.name(options.name);
    }

    if (options?.keyValues) {
      upload = upload.keyvalues(options.keyValues);
    }

    const result = await upload;

    return {
      success: true,
      ipfsHash: result.cid,
      pinSize: result.size,
      timestamp: result.created_at,
      url: `https://ipfs.io/ipfs/${result.cid}`,
      gatewayUrl: process.env.NEXT_PUBLIC_PINATA_GATEWAY
        ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${result.cid}`
        : `https://ipfs.io/ipfs/${result.cid}`,
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Upload JSON data to IPFS using Pinata
 * @param data - The JSON data to upload
 * @param options - Optional metadata and configuration
 * @returns Promise with IPFS hash and other upload details
 */
export const uploadJSONToIPFS = async (
  data: object,
  options?: {
    name?: string;
    keyValues?: Record<string, string>;
  },
) => {
  try {
    const pinata = initializePinata();

    // Upload JSON to IPFS using the correct SDK API
    let upload = pinata.upload.public.json(data);

    // Chain options if provided
    if (options?.name) {
      upload = upload.name(options.name);
    }

    if (options?.keyValues) {
      upload = upload.keyvalues(options.keyValues);
    }

    const result = await upload;

    return {
      success: true,
      ipfsHash: result.cid,
      pinSize: result.size,
      timestamp: result.created_at,
      url: `https://ipfs.io/ipfs/${result.cid}`,
      gatewayUrl: process.env.NEXT_PUBLIC_PINATA_GATEWAY
        ? `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${result.cid}`
        : `https://ipfs.io/ipfs/${result.cid}`,
    };
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get the full URL for an IPFS hash with gateway fallbacks
 * @param ipfsHash - The IPFS hash to construct URL for
 * @param preferredGateway - Optional preferred gateway to try first
 * @returns The full URL to access the IPFS content
 */
export const getIPFSUrl = (ipfsHash: string, preferredGateway?: string): string => {
  if (!ipfsHash) return "";

  // Remove 'ipfs://' prefix if present
  const cleanHash = ipfsHash.replace(/^ipfs:\/\//, "");

  // If a preferred gateway is specified, use it
  if (preferredGateway) {
    if (preferredGateway.startsWith("http://") || preferredGateway.startsWith("https://")) {
      return `${preferredGateway}/ipfs/${cleanHash}`;
    } else {
      return `https://${preferredGateway}/ipfs/${cleanHash}`;
    }
  }

  // Use custom Pinata gateway if available
  if (process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

    // Check if gateway already includes protocol
    if (gateway.startsWith("http://") || gateway.startsWith("https://")) {
      return `${gateway}/ipfs/${cleanHash}`;
    } else {
      // Add https:// if missing
      return `https://${gateway}/ipfs/${cleanHash}`;
    }
  }

  // Fallback to public IPFS gateway
  return `https://ipfs.io/ipfs/${cleanHash}`;
};

/**
 * Get multiple IPFS gateway URLs for fallback purposes
 * @param ipfsHash - The IPFS hash to construct URLs for
 * @returns Array of gateway URLs to try
 */
export const getIPFSGateways = (ipfsHash: string): string[] => {
  if (!ipfsHash) return [];

  const cleanHash = ipfsHash.replace(/^ipfs:\/\//, "");
  const gateways = [];

  // Add custom Pinata gateway if available
  if (process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
    if (gateway.startsWith("http://") || gateway.startsWith("https://")) {
      gateways.push(`${gateway}/ipfs/${cleanHash}`);
    } else {
      gateways.push(`https://${gateway}/ipfs/${cleanHash}`);
    }
  }

  // Add public gateways
  gateways.push(
    `https://ipfs.io/ipfs/${cleanHash}`,
    `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
    `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
    `https://dweb.link/ipfs/${cleanHash}`,
  );

  return gateways;
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  options?: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
  },
): { valid: boolean; error?: string } => {
  const maxSize = options?.maxSizeBytes || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = options?.allowedTypes || ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};
