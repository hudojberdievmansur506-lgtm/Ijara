import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize Gemini AI
// We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fallback data for when API quota is exceeded or offline
const FALLBACK_MAHALLAS = [
  "Mustaqillik", "O'zbekiston", "Navro'z", "Do'stlik", "Yoshlik", 
  "Tinchlik", "Istiqlol", "Obod", "Ziyokor", "Bunyodkor", 
  "Xalqobod", "Paxtakor", "Sog'lom avlod", "Ma'rifat", "Yangiobod",
  "Guliston", "Bahor", "Umid", "Zarbdor", "Oltin vodiy"
];

const FALLBACK_STREETS = [
  "Alisher Navoiy", "Amir Temur", "Bobur", "Ibn Sino", "Beruniy", 
  "Mirzo Ulug'bek", "Farg'ona yo'li", "Toshkent", "Samarqand", 
  "Xalqlar do'stligi", "Istiqlol", "Turkiston", "Ziyolilar", "Sportchilar",
  "Ma'rifat", "Nurafshon", "A.Temur"
];

// Helper function to generate a local analysis string without AI
const generateLocalAnalysis = (students: any[]): string => {
  if (students.length === 0) return "Hozircha ma'lumot yo'q.";

  const total = students.length;
  
  // Stats counters
  const regions: Record<string, number> = {};
  const faculties: Record<string, number> = {};
  let men = 0;
  let women = 0;

  students.forEach(s => {
    // Count Region
    const city = s.city || s.district || "Noma'lum";
    regions[city] = (regions[city] || 0) + 1;

    // Count Faculty
    const fac = s.faculty || "Noma'lum";
    faculties[fac] = (faculties[fac] || 0) + 1;

    // Count Gender
    if (s.gender === 'Erkak') men++;
    else if (s.gender === 'Ayol') women++;
  });

  // Find top items
  const sortedRegions = Object.entries(regions).sort((a, b) => b[1] - a[1]);
  const sortedFaculties = Object.entries(faculties).sort((a, b) => b[1] - a[1]);

  const topRegion = sortedRegions.length > 0 ? sortedRegions[0] : ["Noma'lum", 0];
  const topFaculty = sortedFaculties.length > 0 ? sortedFaculties[0] : ["Noma'lum", 0];

  return `📊 Statistik tahlil (Oflayn): Jami ${total} nafar talaba (${men} erkak, ${women} ayol). Asosiy qism (${topRegion[1]} nafar) ${topRegion[0]} hududidan. Eng ko'p talaba (${topFaculty[1]} nafar) ${topFaculty[0]}da tahsil oladi.`;
};

// Generic function to get a list of items based on a parent location
export const fetchLocationsFromGemini = async (
  promptText: string,
  itemName: string,
  fallbackData: string[] = []
): Promise<string[]> => {
  try {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: `List of ${itemName} names.`
        }
      },
      required: ["items"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, // Low temperature for more deterministic/factual results
      },
    });

    const jsonText = response.text;
    if (!jsonText) return fallbackData;
    
    const parsed = JSON.parse(jsonText);
    return parsed.items && parsed.items.length > 0 ? parsed.items : fallbackData;
  } catch (error) {
    // Log generic warning instead of error to avoid cluttering console with expected 429s
    console.warn(`Gemini API unavailable for ${itemName} (using fallback data):`, error);
    return fallbackData;
  }
};

export const getMahallas = async (city: string): Promise<string[]> => {
  const prompt = `List 15 popular or random real "Mahalla" (neighborhood) names located specifically in the district/city of ${city}, Sirdaryo region, Uzbekistan. Return only the names in a clean list.`;
  return fetchLocationsFromGemini(prompt, "mahallas", FALLBACK_MAHALLAS);
};

export const getStreets = async (city: string, mahalla: string): Promise<string[]> => {
  const prompt = `List 10 plausible street names that could exist in the "${mahalla}" mahalla of ${city}, Sirdaryo, Uzbekistan. If specific data is unavailable, generate common Uzbek street names used in residential areas.`;
  return fetchLocationsFromGemini(prompt, "streets", FALLBACK_STREETS);
};

export const analyzeStudentData = async (students: any[]): Promise<string> => {
  if (students.length === 0) return "Hozircha ma'lumot yo'q.";

  const prompt = `
    Analyze the following list of Guliston State Pedagogical Institute (GDPI) students living in rental housing in Sirdaryo region.
    Provide a short, professional summary in Uzbek language (O'zbek tilida) about the distribution of students by faculty, specialization, course level, and districts.
    Keep it under 3 sentences.
    
    Data: ${JSON.stringify(students.map(s => ({ 
      faculty: s.faculty, 
      specialization: s.specialization,
      course: s.course,
      group: s.group,
      district: s.city, 
      mahalla: s.mahalla 
    })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || generateLocalAnalysis(students);
  } catch (e) {
    console.warn("AI Analysis unavailable due to quota, using local analysis.");
    // Return local analysis instead of error message to handle quota limits gracefully
    return generateLocalAnalysis(students);
  }
};