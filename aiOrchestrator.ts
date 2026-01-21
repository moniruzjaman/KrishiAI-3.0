
import { AIModelProvider, UserSettings, Language } from '../types';
import { queryQwenVL } from './huggingfaceService';
import { analyzeCropImage, searchAgriculturalInfo } from './geminiService';

const SYSTEM_INSTRUCTION = `
Role: Senior Scientific Officer, Ministry of Agriculture, Bangladesh.
Standard: BARI/BRRI/BARC 2024-2025.
Output: Strictly Bangla (বাংলা).
Format: [শনাক্তকরণ], [প্রতিকার], [পরামর্শ].
NO GREETINGS.
`;

export const executeAICore = async (
  prompt: string,
  settings: UserSettings,
  options: {
    image?: string,
    lang?: Language,
    crop?: string
  }
): Promise<{ text: string, source: string }> => {
  const provider = settings.modelProvider;
  const lang = options.lang || 'bn';

  // 1. Image Priority Logic
  // If an image is provided and we aren't in Strategic (Gemini) mode, try Qwen-VL first
  if (options.image && settings.aiStrategy !== 'strategic') {
    const qwenRes = await queryQwenVL(prompt, options.image, lang);
    if (qwenRes) return { text: qwenRes, source: 'Qwen-VL 2.5 (HF Inference)' };
  }

  // 2. Text Routing
  switch (provider) {
    case 'openai':
      return callOpenAICompatible(
        'https://api.openai.com/v1/chat/completions',
        'gpt-4o-mini',
        prompt,
        settings.customKeys?.openai
      );

    case 'deepseek':
      return callOpenAICompatible(
        'https://api.deepseek.com/chat/completions',
        'deepseek-chat',
        prompt,
        settings.customKeys?.deepseek
      );

    case 'glm':
      return callOpenAICompatible(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        'glm-4',
        prompt,
        settings.customKeys?.glm
      );

    case 'ollama':
      return callOllamaAPI(
        prompt, 
        settings.customKeys?.ollamaEndpoint || 'http://localhost:11434'
      );

    case 'qwen_hf':
      const qwenTextOnly = await queryQwenVL(prompt, undefined, lang);
      return { text: qwenTextOnly || "Error", source: "Qwen-7B (HuggingFace)" };

    case 'gemini':
    default:
      if (options.image) {
        const res = await analyzeCropImage(options.image, 'image/jpeg', { 
          cropFamily: options.crop, 
          query: prompt, 
          lang 
        });
        return { text: res.fullText, source: 'Google Gemini 3 Pro (Grounded)' };
      } else {
        const res = await searchAgriculturalInfo(prompt);
        return { text: res.text, source: 'Google Gemini 3 Flash' };
      }
  }
};

/**
 * Universal caller for OpenAI-style APIs (GPT, DeepSeek, GLM)
 */
async function callOpenAICompatible(url: string, model: string, prompt: string, key?: string): Promise<{ text: string, source: string }> {
  if (!key) {
    return { 
      text: `[Error] ${model.toUpperCase()} ব্যবহারের জন্য আপনার প্রোফাইল সেটিংস থেকে API Key প্রদান করুন।`,
      source: `${model} (Key Required)`
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    return { 
      text: data.choices[0].message.content, 
      source: `${model.toUpperCase()} (Cloud API)` 
    };
  } catch (e) {
    return { text: "সংযোগ বিচ্ছিন্ন হয়েছে। এপিআই কী সঠিক কিনা যাচাই করুন।", source: `${model} (Failed)` };
  }
}

async function callOllamaAPI(prompt: string, endpoint: string): Promise<{ text: string, source: string }> {
  try {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ 
        model: 'llama3', 
        prompt: `${SYSTEM_INSTRUCTION}\n\nUser: ${prompt}`, 
        stream: false 
      }),
    });
    const data = await response.json();
    return { text: data.response, source: 'Ollama (Local Host)' };
  } catch (e) {
    return { 
      text: "Ollama সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি। আপনার পিসিতে Ollama চালু আছে কি?", 
      source: 'Ollama (Error)' 
    };
  }
}
