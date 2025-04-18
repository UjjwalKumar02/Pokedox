import { useState } from "react";


function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDesc, setShowDesc] = useState(false);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (jpg, png, webp, avif).");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch");
      }

      const data = await response.json();
      console.log("Prediction:", data);
      setPrediction(data);
    } 
    catch (error) {
      console.error("Error:", error.message);
    } 
    finally {
      setLoading(false); 
    }
  };

  const handleDesc = () => {
    setShowDesc(!showDesc)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="fixed top-5 right-20 max-w-[30%]">
        <button 
        className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg"
        onClick={handleDesc}
        >
          {!showDesc? "Description" : "Close"}
        </button>
      </div>
      {showDesc && (
          <div className="fixed top-15 right-20 w-[30%] bg-gray-200 px-4 py-2 rounded-lg">
            <p>
            This project is an image classification model which predicts the pokemon names on analyzing the uploaded image. This model is currently limited to 10 pokemons [Bulbasaur, Caterpie, Charmander, Ekans, Pidgey, Pikachu, Rattata, Spearow, Squirtle, Weedle].
          </p>
          </div>
        )}

      <h1 className="text-3xl font-bold mb-2">
        Pokemon Predictor
      </h1>

      <p className="mb-4 font-semibold text-red-400">[Upload Image to Find out]</p>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 bg-gray-200 rounded-lg p-2"
      />

      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="Uploaded preview"
          className="w-48 h-48 object-contain mt-2 mb-4 rounded-md shadow-md"
        />
      )}


      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg cursor-pointer"
        disabled={loading}
      >
        {loading ? "Predicting..." : "Predict"}
      </button>

      {prediction && (
        <div className="mt-6 p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl  text-gray-700">
            Prediction: {prediction.prediction} ({prediction.confidence.toFixed(2)}%)
          </h2>
          <p className="text-lg ">
            
          </p>
        </div>
      )}
    </div>
  );
}

export default App