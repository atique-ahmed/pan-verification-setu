"use client";

import { Toaster } from "react-hot-toast";
import PANVerificationForm from "@/components/PANVerificationForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            PAN Verification Demo
          </h1>
          <p className="text-gray-600 mt-2">
            Verify PAN details against NSDL records using Setu API
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sandbox Mode • Powered by Setu
          </p>
        </div>

        {/* Verification Form */}
        <PANVerificationForm />
      </div>
    </main>
  );
}
