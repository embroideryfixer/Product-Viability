import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: "The name of the product analyzed." },
        marketOverview: { type: Type.STRING, description: "A brief overview of the current market for this product." },
        competitionLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "The overall competition level." },
        competitors: {
            type: Type.ARRAY,
            description: "A list of 3-5 key competitors.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Competitor's brand name." },
                    url: { type: Type.STRING, description: "A valid URL to the competitor's website." }
                },
                required: ['name', 'url']
            }
        },
        averageRevenuePotential: { type: Type.STRING, description: "Estimated average monthly revenue potential, e.g., '$5,000 - $15,000'." },
        potentialVendors: {
            type: Type.ARRAY,
            description: "A list of 3-5 potential vendors or suppliers (e.g., from AliExpress, CJ Dropshipping).",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Vendor's name." },
                    url: { type: Type.STRING, description: "A valid URL to the vendor's page." }
                },
                required: ['name', 'url']
            }
        },
        topInfluencers: {
            type: Type.ARRAY,
            description: "A list of 2-3 top influencers or 'product hunters' in this niche.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Influencer's name or handle." },
                    platform: { type: Type.STRING, description: "Their primary social media platform (e.g., TikTok, Instagram)." }
                },
                required: ['name', 'platform']
            }
        },
        bestMatchedProduct: {
            type: Type.OBJECT,
            description: "The specific type of the product that is currently trending or has the most potential.",
            properties: {
                name: { type: Type.STRING, description: "Name of the specific product variation." },
                description: { type: Type.STRING, description: "Why this variation is a good match." }
            },
            required: ['name', 'description']
        },
        marketSaturation: { type: Type.NUMBER, description: "Market saturation score from 0 (not saturated) to 100 (highly saturated)." },
        interestOverTime: {
            type: Type.ARRAY,
            description: "An array of 12 numbers representing Google Trends-like search interest score (0-100) for the last 12 months, with the last item being the most recent month.",
            items: { type: Type.NUMBER }
        },
        finalDecision: { type: Type.STRING, enum: ['Recommended', 'Not Recommended'], description: "The final verdict." },
        decisionReasoning: { type: Type.STRING, description: "A concise, actionable reason for the final decision." },
        relatedProductIdeas: {
            type: Type.ARRAY,
            description: "A list of 3-5 related or alternative product ideas that might also be viable.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the related product idea." },
                    reasoning: { type: Type.STRING, description: "A brief reason why this product is a good alternative or complement." }
                },
                required: ['name', 'reasoning']
            }
        }
    },
    required: [
        'productName', 'marketOverview', 'competitionLevel', 'competitors',
        'averageRevenuePotential', 'potentialVendors', 'topInfluencers',
        'bestMatchedProduct', 'finalDecision', 'decisionReasoning',
        'marketSaturation', 'interestOverTime', 'relatedProductIdeas'
    ]
};

export const analyzeProduct = async (productName: string): Promise<AnalysisResult> => {
    const systemInstruction = "You are an expert e-commerce market analyst specializing in dropshipping. Your goal is to provide a detailed, data-driven analysis of a given product's viability for a dropshipping business model. Provide concrete examples and realistic figures where possible. Additionally, provide a market saturation score from 0-100, a 12-month interest-over-time trend as an array of 12 numbers (scores from 0-100, where the last number is the most recent month), and a list of related product ideas. Your final output must strictly follow the provided JSON schema.";
    
    const prompt = `Analyze the dropshipping viability for the product: "${productName}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            temperature: 0.5,
        },
    });

    const jsonText = response.text.trim();
    try {
        const result = JSON.parse(jsonText);
        // Ensure interestOverTime has exactly 12 numbers
        if (Array.isArray(result.interestOverTime) && result.interestOverTime.length > 12) {
            result.interestOverTime = result.interestOverTime.slice(-12);
        } else if (!Array.isArray(result.interestOverTime) || result.interestOverTime.length < 12) {
            // Fill with zeros if data is incomplete, to avoid crashes
            result.interestOverTime = new Array(12).fill(0).map((_, i) => result.interestOverTime?.[i] || 0);
        }

        return result as AnalysisResult;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new Error("The AI returned an invalid response format.");
    }
};