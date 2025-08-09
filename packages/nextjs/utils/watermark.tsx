/**
 * Watermark utilities for PhotoQuest
 * Handles watermarking logic and photo display decisions
 */
import React from "react";

/**
 * Determines which photo version to show based on context
 * @param context - Where the photo is being displayed
 * @param isOwner - Whether the current user owns this photo
 * @param watermarkedIPFS - IPFS hash of watermarked version
 * @param originalIPFS - IPFS hash of original version
 * @returns The appropriate IPFS hash to display
 */
export const getPhotoToDisplay = (
  context: "gallery" | "submission" | "preview" | "explore",
  isOwner: boolean,
  watermarkedIPFS: string,
  originalIPFS: string,
): string => {
  // Gallery: Show original photos only for owned images
  if (context === "gallery") {
    return isOwner ? originalIPFS : watermarkedIPFS;
  }

  // All other contexts: Show watermarked version
  return watermarkedIPFS;
};

/**
 * Simple text watermark overlay component props
 */
export interface WatermarkConfig {
  text: string;
  opacity: number;
  position: "center" | "bottom-right" | "top-left" | "bottom-left" | "top-right";
  fontSize: string;
  color: string;
}

/**
 * Default watermark configuration
 */
export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  text: "PhotoQuest",
  opacity: 0.7,
  position: "bottom-right",
  fontSize: "16px",
  color: "white",
};

/**
 * Get watermark overlay styles based on configuration
 */
export const getWatermarkStyles = (config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG) => {
  const positionStyles = {
    center: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
    "bottom-right": {
      bottom: "8px",
      right: "8px",
    },
    "top-left": {
      top: "8px",
      left: "8px",
    },
    "bottom-left": {
      bottom: "8px",
      left: "8px",
    },
    "top-right": {
      top: "8px",
      right: "8px",
    },
  };

  return {
    position: "absolute" as const,
    fontSize: config.fontSize,
    color: config.color,
    opacity: config.opacity,
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    fontWeight: "bold",
    pointerEvents: "none" as const,
    userSelect: "none" as const,
    zIndex: 10,
    ...positionStyles[config.position],
  };
};

/**
 * Canvas-based watermarking function for client-side watermarking
 * This adds a watermark directly to the image data
 */
export const addWatermarkToImage = async (
  imageFile: File,
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark text
      const fontSize = Math.max(20, Math.min(img.width / 20, img.height / 20));
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = config.color;
      ctx.globalAlpha = config.opacity;
      ctx.textAlign = "center";

      // Add text shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Calculate position
      let x, y;
      switch (config.position) {
        case "center":
          x = canvas.width / 2;
          y = canvas.height / 2;
          break;
        case "bottom-right":
          ctx.textAlign = "right";
          x = canvas.width - 20;
          y = canvas.height - 20;
          break;
        case "top-left":
          ctx.textAlign = "left";
          x = 20;
          y = 40;
          break;
        case "bottom-left":
          ctx.textAlign = "left";
          x = 20;
          y = canvas.height - 20;
          break;
        case "top-right":
          ctx.textAlign = "right";
          x = canvas.width - 20;
          y = 40;
          break;
        default:
          x = canvas.width / 2;
          y = canvas.height / 2;
      }

      // Draw watermark text
      ctx.fillText(config.text, x, y);

      // Convert canvas to blob and create new file
      canvas.toBlob(
        blob => {
          if (blob) {
            const watermarkedFile = new File([blob], imageFile.name, {
              type: imageFile.type,
              lastModified: Date.now(),
            });
            resolve(watermarkedFile);
          } else {
            reject(new Error("Failed to create watermarked image"));
          }
        },
        imageFile.type,
        0.95,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Check if user owns a specific photo
 * @param userAddress - Current user's wallet address
 * @param photoOwner - Address of the photo owner (quest creator)
 * @returns Whether the user owns this photo
 */
export const doesUserOwnPhoto = (userAddress: string | undefined, photoOwner: string): boolean => {
  return userAddress?.toLowerCase() === photoOwner?.toLowerCase();
};

/**
 * Watermark overlay React component
 */
export const WatermarkOverlay: React.FC<{
  config?: Partial<WatermarkConfig>;
  children?: React.ReactNode;
}> = ({ config, children }) => {
  const finalConfig = { ...DEFAULT_WATERMARK_CONFIG, ...config };
  const styles = getWatermarkStyles(finalConfig);

  return <div style={styles}>{children || finalConfig.text}</div>;
};
