"use client";

import { useEffect } from "react";
import { initAnalytics } from "../../lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    initAnalytics().then(() => {
      console.log("Firebase Analytics Initialized");
    });
  }, []);

  return null; // This component doesn't render anything
}