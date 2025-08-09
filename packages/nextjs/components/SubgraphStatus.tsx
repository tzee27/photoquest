"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { useGetQuests } from "~~/hooks/useSubgraph";
import { checkSubgraphHealth, getCurrentSubgraphEndpoint } from "~~/services/graphql/config";

export const SubgraphStatus = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [endpoint, setEndpoint] = useState("");

  // Only get 1 quest for testing, no polling to save memory
  const { data: quests, loading, error } = useGetQuests(1, 0, false);

  useEffect(() => {
    setEndpoint(getCurrentSubgraphEndpoint());
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const healthy = await checkSubgraphHealth();
      setIsHealthy(healthy);
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />;
    }

    if (isHealthy === null) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }

    return isHealthy ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = () => {
    if (isChecking) return "Checking...";
    if (isHealthy === null) return "Unknown";
    return isHealthy ? "Connected" : "Disconnected";
  };

  const getStatusColor = () => {
    if (isChecking || isHealthy === null) return "text-yellow-600";
    return isHealthy ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Subgraph Status</h3>
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isChecking ? "Checking..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
        </div>

        {/* Endpoint */}
        <div className="flex items-start justify-between">
          <span className="text-sm text-gray-600">Endpoint:</span>
          <div className="text-right max-w-xs">
            <a
              href={endpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 break-all flex items-center gap-1"
            >
              {endpoint.replace("https://", "").slice(0, 40)}...
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Data Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Data Loading:</span>
          <div className="flex items-center gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                <span className="text-sm text-blue-600">Loading...</span>
              </>
            ) : error ? (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Error</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Connected (1 quest test)</span>
              </>
            )}
          </div>
        </div>

        {/* Error Details */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800 font-medium">GraphQL Error:</p>
            <p className="text-xs text-red-600 mt-1">{error.message}</p>
          </div>
        )}

        {/* Success Details */}
        {quests?.questCreateds && quests.questCreateds.length > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800 font-medium">Latest Quest:</p>
            <p className="text-xs text-green-600 mt-1">{quests.questCreateds[0]?.title || "No title"}</p>
          </div>
        )}

        {/* Memory Optimization Note */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800 font-medium">Memory Optimized:</p>
          <ul className="text-xs text-blue-600 mt-1 space-y-1">
            <li>• Reduced polling intervals</li>
            <li>• Smart caching enabled</li>
            <li>• Limited data fetching</li>
            <li>• Background processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
