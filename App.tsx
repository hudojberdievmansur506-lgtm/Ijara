import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from './components/Icons';
import { Student, LoadingState } from './types';
import { getMahallas, getStreets, analyzeStudentData } from './services/geminiService';
import { StudentList } from './components/StudentList';
import { StatsChart } from './components/StatsChart';
import { StatisticsCards } from './components/StatisticsCards';
import { FacultyStats } from './components/FacultyStats';
import { RegionStats } from './components/RegionStats';
import { MahallaStats } from './components/MahallaStats';

// Sirdaryo Region Districts and Cities
const CITIES = [
  "Guliston shahri",
  "Guliston tumani",
  "Mirzaobod tumani"
];

// Pre-defined Mahallas for Guliston City
const GULISTON_MAHALLAS = [
  "Ahillik", "Yangi hayot", "Nurafshon", "Navbahor", "Do‘stlik", "Sohil", 
  "Shodlik", "Bo‘ston", "Baxt", "Buyuk kelajak", "Istiqlol", "Ulug‘obod", 
  "Taraqqiyot", "Namuna", "Sayqal", "Bog‘ishamol", "Obod yurt", "Madaniyat", 
  "Ma’naviyat", "Nihol", "Ulug‘ yo‘l", "Yuksalish", "Bahor", "Ibratli"
];

// University Structure: Faculties and their Specializations
const UNIVERSITY_STRUCTURE: Record<string, string[]> = {
  "Aniq va tabiiy fanlar fakulteti": [
    "Matematika va informatika",
    "Fizika va astronomiya",
    "Kimyo",
    "Biologiya",
    "Geografiya va iqtisodiy bilim asoslari",
    "Texnologik ta'lim",
    "Matematika",
    "Amaliy matematika",
    "Boshqa"
  ],
  "Gumanitar fanlar va jismoniy madaniyat fakulteti": [
    "Tasviriy san'at",
    "Musiqa ta'limi",
    "Milliy g‘oya",
    "Tarix",
    "Jismoniy madaniyat",
    "Boshqa"
  ],
  "Pedagogika fakulteti": [
    "Pedagogika",
    "Maktabgacha ta'lim",
    "Boshlang‘ich ta'lim",
    "Boshqa"
  ],
  "Tillarni o‘qitish fakulteti": [
    "O‘zbek tili va adabiyoti",
    "Ona tili va adabiyoti (qozoq tili)",
    "Ona tili va adabiyoti (rus tili)",
    "Xorijiy til va adabiyoti (ingliz tili)",
    "Boshqa"
  ]
};

const FACULTIES = Object.keys(UNIVERSITY_STRUCTURE);

const COURSES = [
  "1-kurs",
  "2-kurs",
  "3-kurs",
  "4-kurs",
  "Magistratura 1-kurs",
  "Magistratura 2-kurs"
];

// Helper Data for Generator
const MALE_NAMES = ["Aziz", "Bekzod", "Jamshid", "Dilshod", "Ravshan", "Otabek", "Sardor", "Ulug'bek", "Farrux", "Bobur", "Jasur", "Sanjar", "Sherzod", "Doniyor", "Abbos", "Botir", "Rustam", "Ilhom", "Javlon", "Oybek", "Islom", "Shohruh", "Jahongir", "Nodir", "Elyor"];
const FEMALE_NAMES = ["Malika", "Dilnoza", "Sevara", "Kamola", "Nargiza", "Laylo", "Guli", "Shahnoza", "Zilola", "Umida", "Feruza", "Nigora", "Oydin", "Ra'no", "Barno", "Madina", "Muxlisa", "Dildora", "Gulsanam", "Zuhra", "Fotima", "Maftuna", "Shaxzoda", "Gulzoda", "Iroda"];
const LAST_NAMES = ["Karimov", "Rahimov", "Abdullayev", "Yo'ldoshev", "Olimov", "Usmonov", "Sultonov", "Nazarov", "Rustamov", "Ibrohimov", "Ismoilov", "Qosimov", "Sharipov", "Yusupov", "Ahmedov", "Tursunov", "Eshonqulov", "Mahmudov", "Oripov", "Norboyev", "Xolmatov", "Ergashev", "Shokirov", "Saidov", "Valiyev"];
const STREET_NAMES = ["Mustaqillik", "O'zbekiston", "Amir Temur", "Alisher Navoiy", "Bobur", "Ibn Sino", "Beruniy", "Ulug'bek", "Farg'ona", "Toshkent", "Samarqand", "Xorazm", "Buxoro", "Termiz", "Nasaf", "Turkiston", "Do'stlik", "Tinchlik", "Yoshlik", "Ziyolilar", "Ma'rifat", "Nurafshon", "Istiqlol", "Bahor", "Guliston"];

// Function to generate random students
const generateMoreStudents = (startId: number, count: number): Student[] => {
  const newStudents: Student[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.45; // Slightly more males or balanced
    const firstName = isMale 
      ? MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)] 
      : FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)] + (isMale ? "" : "a");
    
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    // If Guliston city, pick from real mahallas, otherwise random from fallback list/names
    const mahalla = city === "Guliston shahri" 
      ? GULISTON_MAHALLAS[Math.floor(Math.random() * GULISTON_MAHALLAS.length)]
      : ["Oqoltin", "Zarbdor", "Paxtakor", "Navro'z", "Mustaqillik", "Tinchlik", "Yangiobod", "Haqiqat"][Math.floor(Math.random() * 8)];

    const faculty = FACULTIES[Math.floor(Math.random() * FACULTIES.length)];
    const specs = UNIVERSITY_STRUCTURE[faculty];
    const specialization = specs[Math.floor(Math.random() * specs.length)];
    const course = COURSES[Math.floor(Math.random() * 4)]; // Mostly bachelors 1-4

    newStudents.push({
      id: (startId + i).toString(),
      fullName: `${lastName} ${firstName}`,
      gender: isMale ? "Erkak" : "Ayol",
      photoUrl: "", // Empty for generated
      housePhotoUrls: [],
      faculty,
      specialization,
      course,
      group: `${Math.floor(Math.random() * 4) + 1}0${Math.floor(Math.random() * 9) + 1}-guruh`,
      phone: `+998${["90", "91", "93", "94", "99", "88", "97"][Math.floor(Math.random() * 7)]}${Math.floor(1000000 + Math.random() * 9000000)}`,
      city,
      mahalla,
      street: STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)],
      houseNumber: `${Math.floor(Math.random() * 100) + 1}-uy`,
      registrationDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() // Registered within last 30 days
    });
  }
  return newStudents;
};

// Initial Mock Data (25 Original + 150 Generated)
const BASE_STUDENTS: Student[] = [
  {
    id: "1",
    fullName: "Aliyev Vali",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Matematika va informatika",
    course: "2-kurs",
    group: "201-guruh",
    phone: "+998901234567",
    city: "Guliston shahri",
    mahalla: "Sayqal",
    street: "Do'stlik",
    houseNumber: "4-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "2",
    fullName: "Karimova Laylo",
    gender: "Ayol",
    faculty: "Pedagogika fakulteti",
    specialization: "Boshlang‘ich ta'lim",
    course: "1-kurs",
    group: "104-guruh",
    phone: "+998912345678",
    city: "Guliston shahri",
    mahalla: "Bahor",
    street: "Navoiy",
    houseNumber: "12-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "3",
    fullName: "Rustamov Jasur",
    gender: "Erkak",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Tarix",
    course: "3-kurs",
    group: "302-guruh",
    phone: "+998933456789",
    city: "Guliston tumani",
    mahalla: "Zarbdor",
    street: "Mustaqillik",
    houseNumber: "45-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "4",
    fullName: "Umarova Dilnoza",
    gender: "Ayol",
    faculty: "Tillarni o‘qitish fakulteti",
    specialization: "Xorijiy til va adabiyoti (ingliz tili)",
    course: "2-kurs",
    group: "205-guruh",
    phone: "+998944567890",
    city: "Guliston shahri",
    mahalla: "Bo‘ston",
    street: "O'zbekiston",
    houseNumber: "8-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "5",
    fullName: "Sobirov Temur",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Fizika va astronomiya",
    course: "4-kurs",
    group: "401-guruh",
    phone: "+998995678901",
    city: "Mirzaobod tumani",
    mahalla: "Oqoltin",
    street: "Beruniy",
    houseNumber: "22-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "6",
    fullName: "Xalilova Zamira",
    gender: "Ayol",
    faculty: "Pedagogika fakulteti",
    specialization: "Maktabgacha ta'lim",
    course: "1-kurs",
    group: "102-guruh",
    phone: "+998976789012",
    city: "Guliston shahri",
    mahalla: "Ahillik",
    street: "Yoshlik",
    houseNumber: "5-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "7",
    fullName: "Ismoilov Bekzod",
    gender: "Erkak",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Jismoniy madaniyat",
    course: "2-kurs",
    group: "203-guruh",
    phone: "+998907890123",
    city: "Guliston shahri",
    mahalla: "Namuna",
    street: "Sportchi",
    houseNumber: "1-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "8",
    fullName: "Abdullayeva Sevara",
    gender: "Ayol",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Biologiya",
    course: "3-kurs",
    group: "304-guruh",
    phone: "+998918901234",
    city: "Guliston shahri",
    mahalla: "Shodlik",
    street: "Gulxor",
    houseNumber: "10-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "9",
    fullName: "Qodirov Sarvar",
    gender: "Erkak",
    faculty: "Tillarni o‘qitish fakulteti",
    specialization: "Ona tili va adabiyoti (rus tili)",
    course: "1-kurs",
    group: "105-guruh",
    phone: "+998939012345",
    city: "Mirzaobod tumani",
    mahalla: "Navro'z",
    street: "Tinchlik",
    houseNumber: "33-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "10",
    fullName: "Tursunova Malika",
    gender: "Ayol",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Tasviriy san'at",
    course: "2-kurs",
    group: "206-guruh",
    phone: "+998940123456",
    city: "Guliston shahri",
    mahalla: "Taraqqiyot",
    street: "San'atkorlar",
    houseNumber: "7-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "11",
    fullName: "Abdurahmonov Javlon",
    gender: "Erkak",
    faculty: "Pedagogika fakulteti",
    specialization: "Pedagogika",
    course: "3-kurs",
    group: "301-guruh",
    phone: "+998901112233",
    city: "Guliston shahri",
    mahalla: "Yangi hayot",
    street: "Ma'rifat",
    houseNumber: "14-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "12",
    fullName: "Karimova Nilufar",
    gender: "Ayol",
    faculty: "Tillarni o‘qitish fakulteti",
    specialization: "O‘zbek tili va adabiyoti",
    course: "4-kurs",
    group: "402-guruh",
    phone: "+998912223344",
    city: "Guliston tumani",
    mahalla: "Dehqonobod",
    street: "Nurafshon",
    houseNumber: "56-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "13",
    fullName: "Yoqubov Bobur",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Kimyo",
    course: "1-kurs",
    group: "103-guruh",
    phone: "+998933334455",
    city: "Mirzaobod tumani",
    mahalla: "Bog'iston",
    street: "Chashma",
    houseNumber: "88-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "14",
    fullName: "Saidova Kamola",
    gender: "Ayol",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Musiqa ta'limi",
    course: "2-kurs",
    group: "204-guruh",
    phone: "+998944445566",
    city: "Guliston shahri",
    mahalla: "Do‘stlik",
    street: "Ipak yo'li",
    houseNumber: "23-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "15",
    fullName: "Odilov Otabek",
    gender: "Erkak",
    faculty: "Pedagogika fakulteti",
    specialization: "Boshlang‘ich ta'lim",
    course: "3-kurs",
    group: "305-guruh",
    phone: "+998975556677",
    city: "Guliston shahri",
    mahalla: "Ulug‘obod",
    street: "Ziyolilar",
    houseNumber: "9-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "16",
    fullName: "Alimova Madina",
    gender: "Ayol",
    faculty: "Tillarni o‘qitish fakulteti",
    specialization: "Xorijiy til va adabiyoti (ingliz tili)",
    course: "1-kurs",
    group: "106-guruh",
    phone: "+998996667788",
    city: "Guliston tumani",
    mahalla: "Zarbdor",
    street: "Guliston",
    houseNumber: "42-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "17",
    fullName: "Shokirov Sanjar",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Geografiya va iqtisodiy bilim asoslari",
    course: "4-kurs",
    group: "403-guruh",
    phone: "+998907778899",
    city: "Mirzaobod tumani",
    mahalla: "Oqoltin",
    street: "Paxtakor",
    houseNumber: "15-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "18",
    fullName: "Nazarova Fotima",
    gender: "Ayol",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Tarix",
    course: "2-kurs",
    group: "207-guruh",
    phone: "+998918889900",
    city: "Guliston shahri",
    mahalla: "Sohil",
    street: "Daryo bo'yi",
    houseNumber: "3-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "19",
    fullName: "Raximov Elyor",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Texnologik ta'lim",
    course: "3-kurs",
    group: "306-guruh",
    phone: "+998939990011",
    city: "Guliston shahri",
    mahalla: "Madaniyat",
    street: "Teatr",
    houseNumber: "7B-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "20",
    fullName: "Usmonova Zuxra",
    gender: "Ayol",
    faculty: "Pedagogika fakulteti",
    specialization: "Maktabgacha ta'lim",
    course: "1-kurs",
    group: "107-guruh",
    phone: "+998940001122",
    city: "Guliston tumani",
    mahalla: "Mustaqillik",
    street: "O'zbekiston",
    houseNumber: "61-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "21",
    fullName: "Valiyev Jasur",
    gender: "Erkak",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Jismoniy madaniyat",
    course: "2-kurs",
    group: "208-guruh",
    phone: "+998971112233",
    city: "Mirzaobod tumani",
    mahalla: "Navro'z",
    street: "Sport",
    houseNumber: "11-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "22",
    fullName: "Ergasheva Nargiza",
    gender: "Ayol",
    faculty: "Tillarni o‘qitish fakulteti",
    specialization: "Ona tili va adabiyoti (rus tili)",
    course: "4-kurs",
    group: "405-guruh",
    phone: "+998992223344",
    city: "Guliston shahri",
    mahalla: "Bog‘ishamol",
    street: "Bog'bonlar",
    houseNumber: "28-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "23",
    fullName: "Qosimov Sardor",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Matematika",
    course: "3-kurs",
    group: "307-guruh",
    phone: "+998903334455",
    city: "Guliston shahri",
    mahalla: "Ma’naviyat",
    street: "Ilm",
    houseNumber: "16-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "24",
    fullName: "Yusupova Dilbar",
    gender: "Ayol",
    faculty: "Gumanitar fanlar va jismoniy madaniyat fakulteti",
    specialization: "Milliy g‘oya",
    course: "1-kurs",
    group: "108-guruh",
    phone: "+998914445566",
    city: "Guliston tumani",
    mahalla: "Obod",
    street: "Chaman",
    houseNumber: "39-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  },
  {
    id: "25",
    fullName: "Mahmudov Farrux",
    gender: "Erkak",
    faculty: "Aniq va tabiiy fanlar fakulteti",
    specialization: "Amaliy matematika",
    course: "2-kurs",
    group: "209-guruh",
    phone: "+998935556677",
    city: "Mirzaobod tumani",
    mahalla: "Tinchlik",
    street: "Yoshlik",
    houseNumber: "77-uy",
    registrationDate: new Date().toISOString(),
    photoUrl: "",
    housePhotoUrls: []
  }
];

const INITIAL_STUDENTS: Student[] = [...BASE_STUDENTS, ...generateMoreStudents(26, 150)];

export default function App() {
  // --- State ---
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [mahallas, setMahallas] = useState<string[]>([]);
  const [selectedMahalla, setSelectedMahalla] = useState<string>("");
  const [streets, setStreets] = useState<string[]>([]);
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  
  // Custom Mahalla State
  const [newMahallaName, setNewMahallaName] = useState<string>("");
  
  // Custom Specialization State
  const [customSpecialization, setCustomSpecialization] = useState<string>("");

  // Validation Error State
  const [formError, setFormError] = useState<string | null>(null);

  const [loadingMahalla, setLoadingMahalla] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingStreets, setLoadingStreets] = useState<LoadingState>(LoadingState.IDLE);

  // Initialize with Mock Data
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    fullName: string;
    gender: 'Erkak' | 'Ayol';
    photoUrl: string;
    housePhotoUrls: string[]; 
    faculty: string;
    specialization: string;
    course: string;
    group: string;
    phone: string;
    houseNumber: string;
  }>({
    fullName: '',
    gender: 'Erkak',
    photoUrl: '',
    housePhotoUrls: [],
    faculty: FACULTIES[0],
    specialization: '',
    course: COURSES[0],
    group: '',
    phone: '+998',
    houseNumber: ''
  });

  // --- Effects ---

  // Auto-analyze when student list changes
  useEffect(() => {
    const performAnalysis = async () => {
      if (students.length > 0) {
        setIsAnalyzing(true);
        try {
          const result = await analyzeStudentData(students);
          setAnalysis(result);
        } catch (error) {
          console.error("Analysis failed", error);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setAnalysis("");
      }
    };

    // Debounce to prevent too many API calls while typing or rapid changes
    const timeoutId = setTimeout(performAnalysis, 2000);
    return () => clearTimeout(timeoutId);
  }, [students]);

  // --- Handlers ---

  const handleCityChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    // Reset child selections
    setSelectedMahalla("");
    setMahallas([]);
    setSelectedStreet("");
    setStreets([]);
    setNewMahallaName("");
    if (!editingId) setShowAddForm(false);

    if (city) {
      if (city === "Guliston shahri") {
        // Use static list for Guliston City + "Boshqa" option
        setMahallas([...GULISTON_MAHALLAS, "Boshqa"]);
        setLoadingMahalla(LoadingState.SUCCESS);
      } else {
        // Use Gemini for other districts
        setLoadingMahalla(LoadingState.LOADING);
        try {
          const fetchedMahallas = await getMahallas(city);
          // Ensure "Boshqa" is always available even if API returns data (or fallback data)
          // Use Set to prevent duplicates if fallback already has Boshqa
          const uniqueMahallas = Array.from(new Set([...fetchedMahallas, "Boshqa"]));
          setMahallas(uniqueMahallas);
          setLoadingMahalla(LoadingState.SUCCESS);

          if (uniqueMahallas.length > 0 && uniqueMahallas[0] !== "Boshqa") {
            const firstMahalla = uniqueMahallas[0];
            setSelectedMahalla(firstMahalla);
            
            setLoadingStreets(LoadingState.LOADING);
            const fetchedStreets = await getStreets(city, firstMahalla);
            setStreets(fetchedStreets);
            setLoadingStreets(LoadingState.SUCCESS);

            if (fetchedStreets.length > 0) {
              setSelectedStreet(fetchedStreets[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
          // Fallback if something critically fails, though getMahallas handles errors now
          setMahallas(["Boshqa"]); 
          setLoadingMahalla(LoadingState.ERROR);
        }
      }
    } else {
      setLoadingMahalla(LoadingState.IDLE);
    }
  }, [editingId]);

  const handleMahallaChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mahalla = e.target.value;
    setSelectedMahalla(mahalla);
    
    // Reset streets
    setSelectedStreet("");
    setStreets([]);
    
    if (mahalla === "Boshqa") {
      // Do nothing, wait for user input
      return;
    }
    
    if (mahalla && selectedCity) {
      setLoadingStreets(LoadingState.LOADING);
      try {
        const fetchedStreets = await getStreets(selectedCity, mahalla);
        setStreets(fetchedStreets);
        setLoadingStreets(LoadingState.SUCCESS);

        // Auto-select first street
        if (fetchedStreets.length > 0) {
          setSelectedStreet(fetchedStreets[0]);
        }
      } catch (error) {
        console.error("Error fetching streets:", error);
        setLoadingStreets(LoadingState.ERROR);
      }
    } else {
      setLoadingStreets(LoadingState.IDLE);
    }
  }, [selectedCity]);

  const handleAddCustomMahalla = async () => {
    if (!newMahallaName.trim()) return;

    const formattedName = newMahallaName.trim();
    
    // Add new mahalla before "Boshqa"
    const updatedList = [...mahallas];
    const insertIndex = updatedList.length - 1; // "Boshqa" is at the end
    updatedList.splice(insertIndex, 0, formattedName);
    
    setMahallas(updatedList);
    setSelectedMahalla(formattedName);
    setNewMahallaName("");

    // Fetch streets for the new mahalla
    if (selectedCity) {
      setLoadingStreets(LoadingState.LOADING);
      try {
        const fetchedStreets = await getStreets(selectedCity, formattedName);
        setStreets(fetchedStreets);
        setLoadingStreets(LoadingState.SUCCESS);
        if (fetchedStreets.length > 0) {
          setSelectedStreet(fetchedStreets[0]);
        }
      } catch (error) {
        console.error("Error fetching streets:", error);
        setLoadingStreets(LoadingState.ERROR);
      }
    }
  };

  const handleStreetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStreet(e.target.value);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'housePhotoUrls') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (field === 'photoUrl') {
        // Single file for student photo
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert("Rasm hajmi 5MB dan oshmasligi kerak!");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        // Multiple files for house photos
        (Array.from(files) as File[]).forEach(file => {
          if (file.size > 5 * 1024 * 1024) {
            alert(`${file.name} hajmi 5MB dan oshmasligi kerak!`);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({ 
              ...prev, 
              housePhotoUrls: [...prev.housePhotoUrls, reader.result as string] 
            }));
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeHousePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      housePhotoUrls: prev.housePhotoUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedMahalla === "Boshqa") {
      setFormError("Iltimos, yangi mahallani kiriting va 'Qo'shish' tugmasini bosing.");
      return;
    }

    if (!selectedCity || !selectedMahalla || !selectedStreet) {
      setFormError("Iltimos, manzil ma'lumotlarini (Shahar/Tuman, Mahalla, Ko'cha) to'liq tanlang!");
      return;
    }

    // Validation: Check for minimum 2 house photos
    if (formData.housePhotoUrls.length < 2) {
      setFormError("Xatolik: Yashash joyi uchun kamida 2 ta rasm yuklash majburiy!");
      return;
    }

    // Determine Specialization
    let finalSpecialization = formData.specialization;
    if (finalSpecialization === "Boshqa") {
      if (!customSpecialization.trim()) {
        setFormError("Iltimos, ta'lim yo'nalishi nomini kiriting!");
        return;
      }
      finalSpecialization = customSpecialization.trim();
    } else if (!finalSpecialization) {
       setFormError("Iltimos, ta'lim yo'nalishini tanlang!");
       return;
    }

    // Check for duplicate Full Name (F.I.O)
    const normalizedName = formData.fullName.trim().toLowerCase();
    const isDuplicate = students.some(s => {
      // If editing, ignore the current student
      if (editingId && s.id === editingId) return false;
      return s.fullName.trim().toLowerCase() === normalizedName;
    });

    if (isDuplicate) {
      setFormError(`Xatolik: "${formData.fullName}" ismli talaba allaqachon bazada mavjud!`);
      return;
    }

    if (editingId) {
      // Update existing student
      const updatedStudents = students.map(student => {
        if (student.id === editingId) {
          return {
            ...student,
            fullName: formData.fullName,
            gender: formData.gender,
            photoUrl: formData.photoUrl,
            housePhotoUrls: formData.housePhotoUrls,
            faculty: formData.faculty,
            specialization: finalSpecialization,
            course: formData.course,
            group: formData.group,
            phone: formData.phone,
            city: selectedCity,
            mahalla: selectedMahalla,
            street: selectedStreet,
            houseNumber: formData.houseNumber,
          };
        }
        return student;
      });
      setStudents(updatedStudents);
      setEditingId(null);
    } else {
      // Add new student
      // Robust ID generation
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      const newStudent: Student = {
        id: newId,
        fullName: formData.fullName,
        gender: formData.gender,
        photoUrl: formData.photoUrl,
        housePhotoUrls: formData.housePhotoUrls,
        faculty: formData.faculty,
        specialization: finalSpecialization,
        course: formData.course,
        group: formData.group,
        phone: formData.phone,
        city: selectedCity,
        mahalla: selectedMahalla,
        street: selectedStreet,
        houseNumber: formData.houseNumber,
        registrationDate: new Date().toISOString()
      };
      setStudents([newStudent, ...students]);
    }

    setShowAddForm(false);
    resetForm();
  };

  const handleEditStudent = (student: Student) => {
    setEditingId(student.id);
    setFormError(null);

    // Determine if specialization is standard or custom
    const facultySpecs = UNIVERSITY_STRUCTURE[student.faculty] || [];
    const isStandardSpec = facultySpecs.includes(student.specialization);
    const specValue = isStandardSpec ? student.specialization : "Boshqa";
    
    setFormData({
      fullName: student.fullName,
      gender: student.gender,
      photoUrl: student.photoUrl || '',
      housePhotoUrls: student.housePhotoUrls || [],
      faculty: student.faculty,
      specialization: specValue,
      course: student.course,
      group: student.group,
      phone: student.phone,
      houseNumber: student.houseNumber
    });

    if (!isStandardSpec) {
      setCustomSpecialization(student.specialization);
    } else {
      setCustomSpecialization("");
    }
    
    // Set location state
    setSelectedCity(student.city);
    
    // Handle Mahalla Logic for Edit
    if (student.city === "Guliston shahri") {
      const exists = GULISTON_MAHALLAS.includes(student.mahalla);
      if (!exists && student.mahalla !== "Boshqa") {
         setMahallas([...GULISTON_MAHALLAS, student.mahalla, "Boshqa"]);
      } else {
         setMahallas([...GULISTON_MAHALLAS, "Boshqa"]);
      }
    } else {
      // For other districts, show current + Boshqa to allow changing it manually
      setMahallas([student.mahalla, "Boshqa"]);
    }
    
    setSelectedMahalla(student.mahalla);
    setStreets([student.street]);
    setSelectedStreet(student.street);
    
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm("Haqiqatan ham bu talabani o'chirmoqchimisiz?")) {
      const updatedStudents = students.filter(s => s.id !== id);
      setStudents(updatedStudents);
      if (editingId === id) {
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      gender: 'Erkak',
      photoUrl: '',
      housePhotoUrls: [],
      faculty: FACULTIES[0],
      specialization: '',
      course: COURSES[0],
      group: '',
      phone: '+998',
      houseNumber: ''
    });
    setCustomSpecialization("");
    setFormError(null);
    if (!editingId) {
      setSelectedMahalla("");
      setMahallas([]);
      setSelectedStreet("");
      setStreets([]);
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleDownloadExcel = async () => {
    if (students.length === 0) return;

    // Access ExcelJS from window (loaded via script tag)
    // @ts-ignore
    const ExcelJS = window.ExcelJS;
    if (!ExcelJS) {
      alert("Excel kutubxonasi yuklanmadi. Iltimos sahifani yangilang.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Talabalar");

    // Define Columns
    worksheet.columns = [
      { header: "T/r", key: "index", width: 6 },
      { header: "Rasm", key: "photo", width: 12 },
      { header: "F.I.O", key: "fullName", width: 30 },
      { header: "Jinsi", key: "gender", width: 10 },
      { header: "Telefon", key: "phone", width: 15 },
      { header: "Fakultet", key: "faculty", width: 25 },
      { header: "Yo'nalish", key: "specialization", width: 25 },
      { header: "Kurs", key: "course", width: 10 },
      { header: "Guruh", key: "group", width: 10 },
      { header: "Manzil (Shahar/Tuman)", key: "city", width: 20 },
      { header: "Mahalla", key: "mahalla", width: 20 },
      { header: "Ko'cha", key: "street", width: 20 },
      { header: "Uy raqami", key: "houseNumber", width: 15 },
      { header: "Uy rasmi 1", key: "housePhoto1", width: 15 },
      { header: "Uy rasmi 2", key: "housePhoto2", width: 15 },
      { header: "Qo'shilgan sana", key: "date", width: 15 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    // Add Data
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const row = worksheet.addRow({
        index: i + 1,
        fullName: s.fullName,
        gender: s.gender,
        phone: s.phone,
        faculty: s.faculty,
        specialization: s.specialization,
        course: s.course,
        group: s.group,
        city: s.city,
        mahalla: s.mahalla,
        street: s.street,
        houseNumber: s.houseNumber,
        date: new Date(s.registrationDate).toLocaleDateString("uz-UZ")
      });

      row.height = 50; 
      row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      // Handle Student Photo
      if (s.photoUrl) {
        try {
          const mime = s.photoUrl.split(';')[0].split(':')[1];
          const ext = mime === 'image/jpeg' ? 'jpeg' : 'png';
          
          const imageId = workbook.addImage({
            base64: s.photoUrl,
            extension: ext,
          });

          worksheet.addImage(imageId, {
            tl: { col: 1.1, row: row.number - 1.0 + 0.1 }, 
            ext: { width: 76, height: 57 },
            editAs: 'oneCell'
          });
        } catch (e) {
          console.error("Student Image add failed", e);
        }
      }

      // Handle House Photos (Max 2 for Excel)
      if (s.housePhotoUrls && s.housePhotoUrls.length > 0) {
        // Photo 1
        try {
          const mime = s.housePhotoUrls[0].split(';')[0].split(':')[1];
          const ext = mime === 'image/jpeg' ? 'jpeg' : 'png';
          const imageId = workbook.addImage({ base64: s.housePhotoUrls[0], extension: ext });

          worksheet.addImage(imageId, {
            tl: { col: 13.1, row: row.number - 1.0 + 0.1 }, // Column index for House Photo 1
            ext: { width: 95, height: 57 },
            editAs: 'oneCell'
          });
        } catch (e) { console.error("House Image 1 failed", e); }

        // Photo 2
        if (s.housePhotoUrls.length > 1) {
          try {
            const mime = s.housePhotoUrls[1].split(';')[0].split(':')[1];
            const ext = mime === 'image/jpeg' ? 'jpeg' : 'png';
            const imageId = workbook.addImage({ base64: s.housePhotoUrls[1], extension: ext });

            worksheet.addImage(imageId, {
              tl: { col: 14.1, row: row.number - 1.0 + 0.1 }, // Column index for House Photo 2
              ext: { width: 95, height: 57 },
              editAs: 'oneCell'
            });
          } catch (e) { console.error("House Image 2 failed", e); }
        }
      }
    }

    // Write and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GDPI_Ijara_Rasmli_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Render Helpers ---

  return (
    <div className="min-h-screen flex flex-col font-[Plus Jakarta Sans] selection:bg-blue-200">
      {/* Glassmorphism Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Icons.School className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                GDPI<span className="text-blue-600">Ijara</span>
              </h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                Monitoring Tizimi
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
               onClick={handleDownloadExcel}
               disabled={students.length === 0}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 ${
                 students.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30'
               }`}
               title="Ma'lumotlarni Excel formatida yuklash"
             >
               <Icons.Download className="w-4 h-4" />
               <span className="hidden sm:inline">Excelga yuklash</span>
             </button>
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 rounded-full border border-blue-100/50 backdrop-blur-sm">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               <span className="text-xs font-semibold text-blue-700">Online Baza</span>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls (4 cols) - Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Location Selector Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-6 sticky top-28 ring-1 ring-black/5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl -z-10" />
              
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                   <Icons.MapPin className="w-5 h-5" />
                </div>
                Hududni tanlash
              </h2>

              <div className="space-y-5">
                {/* City Select */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Shahar / Tuman</label>
                  <div className="relative transition-all duration-300 transform group-hover:-translate-y-0.5">
                    <select
                      value={selectedCity}
                      onChange={handleCityChange}
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-3.5 appearance-none shadow-sm font-medium cursor-pointer hover:border-blue-300 transition-colors"
                    >
                      <option value="">Tanlang...</option>
                      {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                    <Icons.Navigation className="absolute right-4 top-4 w-4 h-4 text-blue-500 pointer-events-none" />
                  </div>
                </div>

                {/* Mahalla Select */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 flex justify-between">
                    <span>Mahalla</span>
                    {loadingMahalla === LoadingState.LOADING && <span className="text-blue-600 text-[10px] flex items-center gap-1 bg-blue-50 px-2 rounded-full"><Icons.Loader className="animate-spin w-3 h-3"/> Yuklanmoqda</span>}
                  </label>
                  <div className="relative transition-all duration-300 transform group-hover:-translate-y-0.5">
                    <select
                      value={selectedMahalla}
                      onChange={handleMahallaChange}
                      disabled={!selectedCity || loadingMahalla === LoadingState.LOADING}
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-3.5 disabled:opacity-60 disabled:bg-gray-50 shadow-sm font-medium cursor-pointer hover:border-blue-300 transition-colors"
                    >
                      <option value="">{loadingMahalla === LoadingState.LOADING ? "Ma'lumot olinmoqda..." : "Tanlang..."}</option>
                      {mahallas.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <Icons.Home className="absolute right-4 top-4 w-4 h-4 text-blue-500 pointer-events-none" />
                  </div>
                  
                  {/* Custom Mahalla Input */}
                  {selectedMahalla === "Boshqa" && (
                    <div className="mt-3 flex gap-2 animate-fade-in-down">
                      <input 
                        type="text" 
                        value={newMahallaName}
                        onChange={(e) => setNewMahallaName(e.target.value)}
                        placeholder="Yangi mahalla nomi..."
                        className="flex-1 text-sm bg-white border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        autoFocus
                      />
                      <button 
                        onClick={handleAddCustomMahalla}
                        disabled={!newMahallaName.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all"
                      >
                        Qo'shish
                      </button>
                    </div>
                  )}
                </div>

                {/* Street Select */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 flex justify-between">
                    <span>Ko'cha</span>
                    {loadingStreets === LoadingState.LOADING && <span className="text-blue-600 text-[10px] flex items-center gap-1 bg-blue-50 px-2 rounded-full"><Icons.Loader className="animate-spin w-3 h-3"/> Yuklanmoqda</span>}
                  </label>
                  <div className="relative transition-all duration-300 transform group-hover:-translate-y-0.5">
                     <select
                      value={selectedStreet}
                      onChange={handleStreetChange}
                      disabled={(!selectedMahalla || selectedMahalla === "Boshqa") || loadingStreets === LoadingState.LOADING}
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-3.5 disabled:opacity-60 disabled:bg-gray-50 shadow-sm font-medium cursor-pointer hover:border-blue-300 transition-colors"
                    >
                       <option value="">{loadingStreets === LoadingState.LOADING ? "Ma'lumot olinmoqda..." : "Tanlang..."}</option>
                      {streets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <Icons.Search className="absolute right-4 top-4 w-4 h-4 text-blue-500 pointer-events-none" />
                  </div>
                </div>

                {/* Add Button Trigger */}
                <div className="pt-6">
                  {!editingId && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      disabled={!selectedCity || !selectedMahalla || !selectedStreet || selectedMahalla === "Boshqa"}
                      className={`w-full relative overflow-hidden group flex justify-center items-center gap-2 font-bold rounded-xl text-sm px-6 py-4 text-center transition-all duration-300 transform hover:-translate-y-1 ${
                        (!selectedCity || !selectedMahalla || !selectedStreet || selectedMahalla === "Boshqa")
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/30'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Icons.UserPlus className="w-5 h-5" />
                        Talabani qo'shish
                      </span>
                      {(!(!selectedCity || !selectedMahalla || !selectedStreet || selectedMahalla === "Boshqa")) && (
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                    </button>
                  )}
                   {editingId && (
                     <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                        <Icons.Pencil className="w-4 h-4" />
                        Tahrirlash rejimi faol
                     </div>
                   )}
                  {(!selectedCity || !selectedMahalla || !selectedStreet) && !editingId && (
                    <p className="text-[11px] font-medium text-gray-400 text-center mt-3 bg-gray-50 py-1 px-2 rounded-lg inline-block w-full">
                      Barcha maydonlarni to'ldiring
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Add/Edit Student Form (Conditional) */}
            {showAddForm && (
              <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-fade-in-down ring-1 ring-black/5">
                <div className={`${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} px-8 py-5 flex justify-between items-center`}>
                  <h3 className="text-white font-bold text-lg flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                       {editingId ? <Icons.Pencil className="w-5 h-5" /> : <Icons.UserPlus className="w-5 h-5" />}
                    </div>
                    {editingId ? "Ma'lumotlarni tahrirlash" : "Yangi talaba qo'shish"}
                  </h3>
                  <button onClick={cancelForm} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                      <Icons.X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSaveStudent} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                   {/* Error Alert Box */}
                   {formError && (
                    <div className="md:col-span-2 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-bounce shadow-sm">
                      <div className="bg-red-100 p-2 rounded-lg">
                         <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      </div>
                      <p className="text-sm font-bold">{formError}</p>
                    </div>
                   )}

                   <div className={`md:col-span-2 p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${editingId ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                      <Icons.MapPin className="w-5 h-5 opacity-70" />
                      <span>
                        <span className="opacity-70">Manzil:</span> {selectedCity}, <span className="font-bold">{selectedMahalla}</span> MFY, {selectedStreet} ko'chasi
                      </span>
                   </div>

                   {/* Student Photo Upload Section */}
                   <div className="bg-gray-50 rounded-2xl p-5 border border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Talaba rasmi (3x4)</label>
                      <div className="flex items-center gap-5">
                        <div className="relative w-24 h-24 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 flex items-center justify-center group flex-shrink-0">
                          {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Talaba rasmi" className="w-full h-full object-cover" />
                          ) : (
                            <Icons.Image className="w-8 h-8 text-gray-300" />
                          )}
                          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all cursor-pointer backdrop-blur-[2px]">
                             <Icons.Upload className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'photoUrl')}
                            className="block w-full text-xs text-gray-500
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-xl file:border-0
                              file:text-xs file:font-bold
                              file:bg-blue-600 file:text-white
                              hover:file:bg-blue-700
                              cursor-pointer file:cursor-pointer
                              file:transition-colors file:shadow-md file:shadow-blue-500/20
                            "
                          />
                          <p className="text-[10px] text-gray-400 mt-2 font-medium pl-1">
                             JPG yoki PNG. Maksimal 5MB.
                          </p>
                        </div>
                      </div>
                   </div>

                   {/* Personal Info Group (FIO + Phone) - Moved here next to Photo */}
                   <div className="flex flex-col gap-6">
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">F.I.O (To'liq)</label>
                        <input 
                          type="text" 
                          required
                          className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                          placeholder="Masalan: Aliyev Vali"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                     </div>

                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Telefon raqam</label>
                        <input 
                          type="text" 
                          required
                          className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium font-mono"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                     </div>
                   </div>

                   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Fakultet</label>
                        <div className="relative">
                            <select 
                            className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium appearance-none"
                            value={formData.faculty}
                            onChange={(e) => {
                                const newFaculty = e.target.value;
                                setFormData({
                                ...formData, 
                                faculty: newFaculty, 
                                specialization: '' 
                                });
                                setCustomSpecialization("");
                            }}
                            >
                            {FACULTIES.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                             <Icons.Navigation className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                        </div>
                     </div>
                     
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Ta'lim yo'nalishi</label>
                        <div className="relative">
                            <select 
                            required
                            className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium appearance-none"
                            value={formData.specialization}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({...formData, specialization: val});
                                if (val !== "Boshqa") setCustomSpecialization("");
                            }}
                            >
                            <option value="">Tanlang...</option>
                            {UNIVERSITY_STRUCTURE[formData.faculty]?.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                            </select>
                            <Icons.Navigation className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                        </div>
                        {formData.specialization === "Boshqa" && (
                           <div className="mt-3 animate-fade-in-down">
                              <input 
                                 type="text" 
                                 placeholder="Yo'nalish nomini kiriting"
                                 required
                                 className="w-full p-3.5 border-0 ring-1 ring-amber-300 bg-amber-50 rounded-xl focus:ring-2 focus:ring-amber-500 text-gray-800 placeholder-gray-400 font-medium"
                                 value={customSpecialization}
                                 onChange={(e) => setCustomSpecialization(e.target.value)}
                              />
                           </div>
                        )}
                     </div>
                   </div>

                   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Kurs</label>
                        <div className="relative">
                            <select 
                            className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium appearance-none"
                            value={formData.course}
                            onChange={(e) => setFormData({...formData, course: e.target.value})}
                            >
                            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                             <Icons.Navigation className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                        </div>
                     </div>

                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Guruh</label>
                        <input 
                          type="text" 
                          required
                          className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                          placeholder="Masalan: 101-guruh"
                          value={formData.group}
                          onChange={(e) => setFormData({...formData, group: e.target.value})}
                        />
                     </div>

                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Jinsi</label>
                         <div className="relative">
                            <select 
                            className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium appearance-none"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value as 'Erkak' | 'Ayol'})}
                            >
                            <option value="Erkak">Erkak</option>
                            <option value="Ayol">Ayol</option>
                            </select>
                             <Icons.Navigation className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                        </div>
                     </div>

                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Uy raqami / Kvartira</label>
                        <input 
                          type="text" 
                          required
                          className="w-full p-3.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                          placeholder="7-uy, 24-xonadon"
                          value={formData.houseNumber}
                          onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
                        />
                     </div>
                   </div>

                   {/* House Photo Upload Section (Multiple) - Moved to bottom */}
                   <div className="md:col-span-2 bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex justify-between">
                        <span>Yashash joyi rasmi</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${formData.housePhotoUrls.length >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {formData.housePhotoUrls.length} / 2+ yuklandi
                        </span>
                      </label>
                      <div className="space-y-4">
                        {/* Preview Grid */}
                        {formData.housePhotoUrls.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {formData.housePhotoUrls.map((url, idx) => (
                              <div key={idx} className="relative w-full aspect-square bg-white rounded-xl shadow-sm overflow-hidden group border border-gray-200">
                                <img src={url} alt={`Uy rasmi ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeHousePhoto(idx)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 transform hover:scale-110 shadow-sm"
                                  title="O'chirish"
                                >
                                  <Icons.X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="bg-white p-2 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                      <Icons.Upload className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-blue-600">Yuklash uchun bosing</span></p>
                                    <p className="text-xs text-gray-400">PNG, JPG (har biri max 5MB)</p>
                                </div>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  multiple // Allow multiple selection
                                  onChange={(e) => handleImageUpload(e, 'housePhotoUrls')}
                                  className="hidden"
                                />
                            </label>
                        </div>
                      </div>
                   </div>

                   <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-100">
                      <button 
                        type="button"
                        onClick={cancelForm}
                        className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                      >
                        Bekor qilish
                      </button>
                      <button 
                        type="submit"
                        className={`px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'}`}
                      >
                        {editingId ? "O'zgarishlarni saqlash" : "Ma'lumotlarni saqlash"}
                      </button>
                   </div>
                </form>
              </div>
            )}

            {/* Gemini Analysis Block - Enhanced UI */}
            {students.length > 0 && (
               <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                        <Icons.Sparkles className="w-6 h-6 text-yellow-300" />
                      </div>
                      <h3 className="font-bold text-xl tracking-tight text-white/90">Sun'iy Intellekt Tahlili</h3>
                      {isAnalyzing && (
                        <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-100 border border-white/10 animate-pulse">
                           <Icons.Loader className="w-3 h-3 animate-spin" />
                           Tahlil qilinmoqda...
                        </span>
                      )}
                    </div>
                    <p className="text-blue-50/90 text-base leading-relaxed font-medium max-w-4xl relative">
                       <span className="text-4xl absolute -left-4 -top-4 opacity-20 font-serif">"</span>
                       {analysis || "Ma'lumotlar tahlil qilinmoqda..."}
                       <span className="text-4xl absolute -bottom-6 opacity-20 font-serif">"</span>
                    </p>
                  </div>
                  
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
               </div>
             )}

            {/* Statistics Dashboard Cards */}
            <StatisticsCards students={students} />

            {/* Statistics Chart */}
            <StatsChart students={students} />

            {/* Faculty Detailed Report Table */}
            <FacultyStats students={students} />

            {/* Region Detailed Report Table */}
            <RegionStats students={students} />

            {/* Mahalla Detailed Report Table */}
            <MahallaStats students={students} />

            {/* Student List */}
            <StudentList 
              students={students} 
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-white/20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-1">
           <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
             <span className="opacity-70">Loyihani yaratdi:</span>
             <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Xudayberdiyev Mansur
             </span>
           </p>
        </div>
      </footer>
    </div>
  );
}