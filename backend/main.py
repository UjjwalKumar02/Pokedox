from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from io import BytesIO
from PIL import Image
import os


# Load the trained model
try:
    model = tf.keras.models.load_model("../model.keras")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")


# Pokemon classnames (in order of training labels)
class_names = ['bulbasaur', 'caterpie', 'charmander', 'ekans', 'pidgey', 'pikachu', 'rattata', 'spearow', 'squirtle', 'weedle']


app = FastAPI()


# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Image preprocessing function
def preprocess_image(file) -> np.array:
    try:
        img = Image.open(BytesIO(file)).convert("RGB")
        img = img.resize((128, 128))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {e}")


# Prediction endpoint with error handling
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img_array = preprocess_image(contents)

        prediction = model.predict(img_array)
        predicted_class = class_names[np.argmax(prediction)]
        confidence = float(np.max(prediction)) * 100

        return {
            "prediction": predicted_class,
            "confidence": confidence
        }

    except Exception as e:
        # Return error message as JSON to the frontend
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
