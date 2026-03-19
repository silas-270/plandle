"use client";

import { useState } from "react";

export default function TestImagePage() {
  const [manufacturer, setManufacturer] = useState("");
  const [type, setType] = useState("");
  const [airline, setAirline] = useState("");
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchImage = async () => {
    // Reset states before fetching
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const queryParams = new URLSearchParams({ manufacturer, type, airline });
      const response = await fetch(`/api/plane-images?${queryParams}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setImageUrl(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-bold mb-4">Plane Image Tester</h1>

      <input
        type="text"
        placeholder="Manufacturer (e.g., Boeing)"
        value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)}
        className="border p-2 rounded text-black"
      />
      <input
        type="text"
        placeholder="Type (e.g., 737)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 rounded text-black"
      />
      <input
        type="text"
        placeholder="Airline (e.g., Ryanair)"
        value={airline}
        onChange={(e) => setAirline(e.target.value)}
        className="border p-2 rounded text-black"
      />

      <button
        onClick={fetchImage}
        disabled={isLoading || !manufacturer || !type || !airline}
        className="bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? "Searching..." : "Find Image"}
      </button>

      {/* Result Area */}
      <div className="mt-8 border-t pt-4">
        {error && <p className="text-red-500 font-semibold">Error: {error}</p>}
        
        {imageUrl && (
          <div className="flex flex-col gap-2">
            <p className="text-green-600 font-semibold">Success!</p>
            {/* Using a standard img tag since this is just a quick test */}
            <img 
              src={imageUrl} 
              alt={`${manufacturer} ${type} ${airline}`} 
              className="w-full h-auto rounded shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}