
import { HFClassificationResult } from "../types";

/**
 * Universal primary engine using Qwen/Qwen2.5-VL-7B-Instruct.
 * Grounded in Bangladesh Government Scientific Protocols.
 */
export const queryQwenVL = async (
  prompt: string, 
  base64Image?: string, 
  lang: string = 'bn'
): Promise<string | null> => {
  const HF_TOKEN = (process.env.HF_TOKEN && process.env.HF_TOKEN !== "undefined" && process.env.HF_TOKEN !== "null") 
    ? process.env.HF_TOKEN 
    : "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";
  
  try {
    const modelUrl = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-VL-7B-Instruct";
    
    // Explicit Scientific Audit Grounding
    const groundedPrompt = `[Role: Senior Scientific Officer, Ministry of Agriculture, Bangladesh]
    Task: Comprehensive Crop Audit (Pest, Disease, & Nutrient Deficiency Identification).
    Source Material: BARI, BRRI, BARC, and DAE Official Handbooks 2024-2025.
    
    Context: ${prompt}
    
    Audit Requirements:
    1. Identify specific Pests, Diseases, or Nutrient Deficiencies seen in the image.
    2. Provide integrated management (IPM) advice.
    3. Specify official chemical group and dosage per decimal/bigha if applicable.
    4. Language: ${lang === 'bn' ? 'Bangla (বাংলা)' : 'English'}.
    5. Formatting: NO GREETINGS. Use square brackets for headers like [শনাক্তকরণ], [প্রতিকার], [বৈজ্ঞানিক নোট].`;

    const body: any = {
      inputs: base64Image ? {
        image: base64Image.includes('base64,') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
        prompt: groundedPrompt
      } : groundedPrompt,
      parameters: { max_new_tokens: 1024, temperature: 0.1 }
    };

    const response = await fetch(modelUrl, {
      headers: { 
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true"
      },
      method: "POST",
      body: JSON.stringify(body)
    });

    if (!response.ok) return null;
    
    const result = await response.json();
    let text = "";
    if (Array.isArray(result)) {
      text = result[0]?.generated_text || result[0]?.text || "";
    } else {
      text = result?.generated_text || result?.text || "";
    }

    return text.replace(/<\|.*?\|>/g, '').trim() || null;
  } catch (error) {
    return null;
  }
};

export const queryCropNetInsight = async (weatherData: any, lang: string = 'bn'): Promise<string | null> => {
  const HF_TOKEN = process.env.HF_TOKEN || "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";
  try {
    const modelUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";
    const prompt = `[INST] Agri-Analysis for Bangladesh. Weather: Temp ${weatherData.temp}C, Humidity ${weatherData.humidity}%. Predict pest/disease surge risk. Language: ${lang === 'bn' ? 'Bangla' : 'English'}. [/INST]`;
    const response = await fetch(modelUrl, {
      headers: { "Authorization": `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ inputs: prompt })
    });
    if (!response.ok) return null;
    const result = await response.json();
    return (Array.isArray(result) ? result[0].generated_text : result.generated_text).split('[/INST]').pop().trim();
  } catch (e) { return null; }
};

export const classifyPlantDiseaseHF = async (base64Data: string): Promise<HFClassificationResult[] | null> => {
  const HF_TOKEN = process.env.HF_TOKEN || "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";
  if (!base64Data) return null;
  try {
    const rawBase64 = base64Data.includes('base64,') ? base64Data.split(',')[1] : base64Data;
    const binaryString = atob(rawBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const response = await fetch("https://api-inference.huggingface.co/models/linkv/plant-disease-classification", {
      headers: { "Authorization": `Bearer ${HF_TOKEN}`, "Content-Type": "application/octet-stream", "x-wait-for-model": "true" },
      method: "POST",
      body: bytes.buffer,
    });
    if (!response.ok) return null;
    const result = await response.json();
    return Array.isArray(result) ? result.sort((a: any, b: any) => b.score - a.score).slice(0, 5) : null;
  } catch (error) { return null; }
};
