import React, { useState } from "react";
import { Camera } from "lucide-react";
import { getIPFSUrl } from "~~/utils/pinata";
import { WatermarkConfig, WatermarkOverlay, getPhotoToDisplay } from "~~/utils/watermark";

interface PhotoDisplayProps {
  /** IPFS hash of the watermarked photo */
  watermarkedIPFS: string;
  /** IPFS hash of the original photo */
  originalIPFS: string;
  /** Context where the photo is being displayed */
  context: "gallery" | "submission" | "preview" | "explore";
  /** Whether the current user owns this photo */
  isOwner: boolean;
  /** Alt text for the image */
  alt: string;
  /** CSS classes for the image */
  className?: string;
  /** CSS classes for the container */
  containerClassName?: string;
  /** Whether to show watermark overlay (in addition to watermarked image) */
  showOverlay?: boolean;
  /** Custom watermark configuration for overlay */
  watermarkConfig?: Partial<WatermarkConfig>;
  /** Fallback image URL if IPFS fails */
  fallbackImage?: string;
  /** Click handler */
  onClick?: () => void;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({
  watermarkedIPFS,
  originalIPFS,
  context,
  isOwner,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "relative",
  showOverlay = context !== "gallery", // Show overlay except in gallery
  watermarkConfig,
  fallbackImage = "https://images.unsplash.com/photo-1494790108755-2616c95e2d75?w=400&h=300&fit=crop",
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine which photo to display
  const photoToDisplay = getPhotoToDisplay(context, isOwner, watermarkedIPFS, originalIPFS);
  const shouldShowWatermarkOverlay = showOverlay && !isOwner && context !== "gallery";

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={containerClassName} onClick={onClick}>
      {!imageError && photoToDisplay ? (
        <>
          <img
            src={getIPFSUrl(photoToDisplay)}
            alt={alt}
            className={className}
            onError={handleImageError}
            loading="lazy"
          />
          {/* Show watermark overlay for non-owned photos */}
          {shouldShowWatermarkOverlay && <WatermarkOverlay config={watermarkConfig} />}
          {/* Show "OWNED" indicator in gallery for owned photos */}
          {context === "gallery" && isOwner && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">Owned</span>
            </div>
          )}
        </>
      ) : (
        // Fallback when no photo or error
        <>
          {fallbackImage ? (
            <img src={fallbackImage} alt={alt} className={className} loading="lazy" />
          ) : (
            <div className={`${className} bg-gray-200 flex items-center justify-center`}>
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {/* Still show watermark on fallback images (except gallery) */}
          {shouldShowWatermarkOverlay && (
            <WatermarkOverlay
              config={{
                ...watermarkConfig,
                text: "PhotoQuest",
                opacity: 0.3,
                color: "#666",
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
