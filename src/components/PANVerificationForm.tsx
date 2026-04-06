"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FormattedResponse } from "@/types/pan";

export default function PANVerificationForm() {
  const [pan, setPan] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/verify-pan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan, name: name.trim() || undefined }),
      });

      const data: FormattedResponse = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        if (data.name_match === true) {
          toast.success("PAN verified successfully!");
        } else if (data.name_match === false) {
          toast.error("PAN number does not match the name provided");
        } else {
          toast.success("PAN is valid");
        }
      } else {
        toast.error(data.error || "Verification failed");
        setResult(data);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to auto-uppercase PAN
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPan(
      e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10),
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-black">PAN Verification</h2>
      <p className="text-black text-sm mb-6">
        Verify PAN details against NSDL records via Setu API
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PAN Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Number *
          </label>
          <input
            type="text"
            value={pan}
            onChange={handlePanChange}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-black bg-white"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            10-character alphanumeric PAN (auto-uppercase)
          </p>
        </div>

        {/* Name Field (Optional for name matching) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter to check if name matches PAN records
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify PAN"
          )}
        </button>
      </form>

      {/* Results Section */}
      {result && (
        <div
          className={`mt-6 p-4 rounded-md ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h3 className="font-semibold text-lg mb-3 text-black">
            Verification Result
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black">PAN:</span>
              <span className="font-mono font-medium text-black">
                {result.pan}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Status:</span>
              <span
                className={`font-medium ${
                  result.status === "valid"
                    ? "text-green-600"
                    : result.status === "not_found"
                      ? "text-orange-600"
                      : "text-red-600"
                }`}
              >
                {result.status.toUpperCase()}
              </span>
            </div>
            {result.name_match !== undefined && (
              <div className="flex justify-between">
                <span className="text-black">Name Match:</span>
                <span
                  className={`font-medium ${
                    result.name_match ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.name_match ? "✓ Matched" : "✗ Not Matched"}
                </span>
              </div>
            )}
            {result.full_name && (
              <div className="flex justify-between">
                <span className="text-black">Full Name:</span>
                <span className="font-medium text-black">
                  {result.full_name}
                </span>
              </div>
            )}
            {result.category && (
              <div className="flex justify-between">
                <span className="text-black">Category:</span>
                <span className="capitalize text-black">
                  {result.category.toLowerCase()}
                </span>
              </div>
            )}
            {result.aadhaar_linked !== undefined && (
              <div className="flex justify-between">
                <span className="text-black">Aadhaar Linked:</span>
                <span
                  className={
                    result.aadhaar_linked ? "text-green-600" : "text-orange-600"
                  }
                >
                  {result.aadhaar_linked ? "✓ Linked" : "Not Linked"}
                </span>
              </div>
            )}
            {result.message && (
              <div className="flex justify-between text-gray-500">
                <span>Message:</span>
                <span>{result.message}</span>
              </div>
            )}
            {result.error && (
              <div className="text-red-600 text-center pt-2 border-t mt-2">
                Error: {result.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test PAN Info */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs text-gray-500">
        <strong>Test PANs (Sandbox):</strong>
        <ul className="mt-1 space-y-1 ml-4 list-disc">
          <li>
            <code className="bg-gray-200 px-1 rounded">ABCDE1234A</code> - Valid
            PAN
          </li>
          <li>
            <code className="bg-gray-200 px-1 rounded">ABCDE1234B</code> -
            Invalid PAN (blacklisted/not Aadhaar linked)
          </li>
          <li>Any other PAN - PAN not found error</li>
        </ul>
      </div>
    </div>
  );
}
