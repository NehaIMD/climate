import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/80">
      <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
      <p className="text-lg text-sky-800 animate-pulse">Generating map...</p>
    </div>
  );
};

export default LoadingSpinner;
