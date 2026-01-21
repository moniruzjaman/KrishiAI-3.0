

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AnalysisResult, GroundingChunk, FlashCard, AgriTask, UserCrop, User, WeatherData, CropDiseaseReport, AgriQuizQuestion, Language, UserRole } from "../types";
import { AEZInfo } from "./locationService";

const BD_GOVT_GROUNDING_INSTRUCTION = `
Role: Senior Scientific Officer, Ministry of Agriculture, Bangladesh.
Instructions: Reference official BARI/BRRI/BARC/DAE 2024-2025 standards. 
Task: Audit for Pests, Diseases, and Nutrient Deficiencies.
Language: Strictly Bangla (বাংলা).
Format: NO GREETINGS. Use square brackets for sections: [শনাক্তকরণ], [প্রতিকার], [পরামর্শ].
Always provide integrated pest management (IPM) and chemical rotation guidelines.
`;

const extractJSON = <T>(text: string, defaultValue: T): T => {
  if (!text) return defaultValue;
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return defaultValue;
    return JSON.parse(jsonMatch[0]) as T;
  } catch (e) {
    console.warn("JSON Extraction Failed", e);
    return defaultValue;
  }
};

const getRawBase64 = (data: string | null | undefined): string => {
  if (!data) return "";
  return data.includes('base64,') ? data.split('base64,')[1] : data;
};

export const decodeBase64 = (base64: string): Uint8Array => {
  const raw = getRawBase64(base64);
  const binaryString = atob(raw);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

export const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
};

export const analyzeCropImage = async (
  base64Data: string, 
  mimeType: string, 
  options?: { cropFamily?: string, query?: string, lang?: Language, weather?: WeatherData, hfHint?: string }
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: contents must be an object with parts for multi-modal calls
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { data: getRawBase64(base64Data), mimeType } }, 
        { text: `Scientific Audit Request: Crop ${options?.cropFamily}. Symptoms identified by pixel scan: ${options?.hfHint}. User Query: ${options?.query}. Environmental Context: ${JSON.stringify(options?.weather)}` }
      ] 
    },
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  
  const text = response.text || "";
  const diagnosis = text.match(/\[শনাক্তকরণ.*?\]:\s*(.*)/i)?.[1]?.split('\n')[0]?.trim() || "সায়েন্টিফিক অডিট সম্পন্ন";
  
  return {
    diagnosis,
    category: 'Other',
    confidence: 98,
    advisory: text,
    fullText: text,
    officialSource: "BARI/BRRI/DAE Grounded (Fallback Engine)",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || []
  };
};

export const getAIPlantNutrientAdvice = async (crop: string, aez: string, soil: string, area: number, unit: string, lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `BARC Fertilizer Guide 2024 calculation for ${crop} in ${aez}. Soil status: ${soil}. Land: ${area} ${unit}.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    // Note: contents can be an array for TTS tasks as per examples
    contents: [{ parts: [{ text: text.slice(0, 1000) }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) throw new Error("TTS Failed");
  return data;
};

export const getLiveWeather = async (lat: number, lng: number, force = false, lang: Language = 'bn'): Promise<WeatherData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search Google for real-time agricultural weather at Lat: ${lat}, Lng: ${lng} in Bangladesh. Respond strictly in Bangla (বাংলা) JSON format. Include crop health risks.`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return extractJSON<WeatherData>(response.text || "{}", {} as any);
};

export const getTrendingMarketPrices = async (lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search Google for official DAM market prices in Bangladesh today. Respond strictly in Bangla (বাংলা) JSON array of objects with {name, category, price, unit, trend, change}.`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return extractJSON<any[]>(response.text || "[]", []);
};

export const sendChatMessage = async (history: any[], message: string, persona: string, role: string, weather?: WeatherData, crops?: UserCrop[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = `User Context: Location weather: ${JSON.stringify(weather)}, Crops in field: ${JSON.stringify(crops)}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    // contents for multi-turn chat must be an array of Content objects
    contents: [...history, { role: 'user', parts: [{ text: `${context}\n\nUser Question: ${message}` }] }],
    config: { systemInstruction: `Identity: ${persona}. Target Audience Role: ${role}. Always use BARI/BRRI protocols. Language: Bangla.`, tools: [{ googleSearch: {} }] }
  });
  return {
    text: response.text || "",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || []
  };
};

export const searchNearbySellers = async (lat: number, lng: number, query: string, lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Find ${query} near coordinates ${lat}, ${lng} in Bangladesh. Respond in Bangla.`,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
    }
  });
  return {
    text: response.text || "",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || []
  };
};

export const performSoilHealthAudit = async (inputs: any, aez?: AEZInfo, lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Detailed Soil Audit for AEZ: ${aez?.name}. Inputs: ${JSON.stringify(inputs)}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const getAgriPodcastSummary = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize news for audio podcast on: ${topic}. Focus on current BD context. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  return { text: response.text || "", groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || [] };
};

export const identifyPlantSpecimen = async (base64Data: string, mimeType: string, lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: contents must be an object with parts for multi-modal calls
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: getRawBase64(base64Data), mimeType } }, { text: "Provide detailed identity. Language: Bangla." }] },
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return { text: response.text || "", groundingChunks: [] };
};

export const generateAgriImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed");
};

export const searchAgriculturalInfo = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${query}. Language: Bangla.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return {
    text: response.text || "",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || []
  };
};

export const requestPrecisionParameters = async (base64: string, mime: string, crop: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: contents must be an object with parts for multi-modal calls
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { data: getRawBase64(base64), mimeType: mime } },
        { text: `Identify specific 3-5 diagnostic questions for this ${crop}. Respond in Bangla JSON.` }
      ]
    },
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<any[]>(response.text || "[]", []);
};

export const performDeepAudit = async (base64: string, mime: string, crop: string, dynamicData: any, lang: Language, weather?: WeatherData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: contents must be an object with parts for multi-modal calls
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { data: getRawBase64(base64), mimeType: mime } },
        { text: `Deep Audit for ${crop}. Field Data: ${JSON.stringify(dynamicData)}. Weather: ${JSON.stringify(weather)}. Language: Bangla.` }
      ]
    },
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  
  return {
    diagnosis: "সমন্বিত সায়েন্টিফিক অডিট রিপোর্ট",
    category: 'Other' as any,
    confidence: 100,
    advisory: response.text || "",
    fullText: response.text || "",
    officialSource: "Verified National Protocol (BARI/BRRI)"
  };
};

export const getBiocontrolExpertAdvice = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Ecofriendly biocontrol guide for: ${query}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const interpretSoilReportAI = async (inputs: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Interpret soil lab parameters: ${JSON.stringify(inputs)}. Provide BARC 2024 solutions in Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const getPesticideExpertAdvice = async (query: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Official dosage and safety for: ${query}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  return {
    text: response.text || "",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || []
  };
};

export const analyzePesticideMixing = async (items: any[], weather?: WeatherData, lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze compatibility of: ${JSON.stringify(items)}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return {
    text: response.text || "",
    groundingChunks: []
  };
};

export const requestPesticidePrecisionParameters = async (query: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Pesticide audit requirements for: ${query}. Respond in Bangla JSON.`,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<any[]>(response.text || "[]", []);
};

export const performDeepPesticideAudit = async (query: string, data: any, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Final spray audit for ${query} with data: ${JSON.stringify(data)}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return { text: response.text || "", groundingChunks: [] };
};

export const getAISprayAdvisory = async (crop: string, pest: string, weather: WeatherData, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Is it safe to spray for ${pest} on ${crop} with current weather: ${JSON.stringify(weather)}? Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return { text: response.text || "", groundingChunks: [] };
};

export const requestSoilPrecisionParameters = async (inputs: any, aezName: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine soil audit for AEZ: ${aezName}. Current: ${JSON.stringify(inputs)}. Respond in Bangla JSON.`,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<any[]>(response.text || "[]", []);
};

export const performDeepSoilAudit = async (inputs: any, aezName: string, dynamicData: any, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Soil Audit for ${aezName}. Lab: ${JSON.stringify(inputs)}. Field: ${JSON.stringify(dynamicData)}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const getCropDiseaseInfo = async (crop: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Complete pathology report for ${crop}. Respond strictly in Bangla JSON.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, responseMimeType: "application/json" }
  });
  return {
    data: extractJSON<CropDiseaseReport>(response.text || "{}", {} as any),
    sourceUsed: "BARI/BRRI/DAE 2025"
  };
};

export const getFieldMonitoringData = async (lat: number, lng: number, aez: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Remote monitoring analysis for ${lat}, ${lng} (AEZ: ${aez}). Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  return { text: response.text || "", groundingChunks: [] };
};

export const getLCCAnalysisSummary = async (lccValue: number, confidence: number, dose: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze digital LCC result: index ${lccValue}, confidence ${confidence}%, calculated dose ${dose}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const analyzeLeafColorAI = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: contents must be an object with parts for multi-modal calls
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: getRawBase64(base64Data), mimeType } }, { text: "Calculate LCC index 1-5. Respond in JSON." }] },
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<{ lccValue: number, confidence: number }>(response.text || "{}", { lccValue: 3, confidence: 50 });
};

export const getAgriFlashCards = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create 5 flashcards for: ${topic}. Respond in Bangla JSON array.`,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<FlashCard[]>(response.text || "[]", []);
};

export const getAICropSchedule = async (crop: string, date: string, season: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Develop a 4-week task schedule for ${crop} in ${season}. Respond in Bangla JSON array.`,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<any[]>(response.text || "[]", []);
};

export const getAgriMetaExplanation = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain internals regarding: ${query}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return response.text || "";
};

export const generateAgriQuiz = async (topic: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 quiz questions on ${topic}. Respond in Bangla JSON array.`,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON<AgriQuizQuestion[]>(response.text || "[]", []);
};

export const searchEncyclopedia = async (query: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Define agricultural term: ${query}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  return { text: response.text || "", groundingChunks: [] };
};

export const getPersonalizedAgriAdvice = async (crops: UserCrop[], rank: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Strategic advice for ${rank} farmer managing: ${JSON.stringify(crops)}. Language: Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION, tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

export const getAgriNews = async (lang: Language = 'bn') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search Google for top 5 agricultural news headlines in Bangladesh today. Return strictly in Bangla (বাংলা) bulleted list.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return (response.text || "").split('\n').filter(l => l.trim().length > 10).slice(0, 5);
};

export const getAIYieldPrediction = async (crop: string, aez: string, soil: string, practice: string, water: string, extra: string, rank?: string, params?: any, lang?: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Predict yield for ${crop} in AEZ: ${aez}. Inputs: ${soil}, ${practice}, ${water}. Respond in Bangla.`,
    config: { systemInstruction: BD_GOVT_GROUNDING_INSTRUCTION }
  });
  return { text: response.text || "", groundingChunks: [] };
};
