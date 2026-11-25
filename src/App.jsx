import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Camera, 
  LayoutDashboard, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Shield, 
  MapPin, 
  Clock, 
  Award,
  TrendingUp,
  Image as ImageIcon,
  Settings,
  Save,
  ChevronRight,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  ClipboardCheck,
  UserCheck,
  UserX,
  Clock3,
  Download
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDvgVj5K6e16xJrqcQvcmilPUszXoMtx88",
  authDomain: "vikingos-blanca-fs.firebaseapp.com",
  projectId: "vikingos-blanca-fs",
  storageBucket: "vikingos-blanca-fs.firebasestorage.app",
  messagingSenderId: "136290527424",
  appId: "1:136290527424:web:73dda1ee2c4a1d5647a525"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'vikingos-blanca-fs';

// ==========================================
// 2. DATOS INICIALES POR DEFECTO (SEED DATA)
// ==========================================
const INITIAL_TEAM_CONFIG = {
  clubName: "Blanca Fútbol Sala",
  teamName: "VIKINGOS SONDOS BLANCA FS",
  category: "Primera Benjamín F.S., Grupo Único",
  season: "Temporada 2026-2027",
  customLogoUrl: "",
  backgroundImageUrl: "",
  coachPin: "blanca2026",
  familyPin: "Viking@s2026",
  nextMatch: {
    opponent: "C.D. VILLA DE FORTUNA",
    date: "2026-11-29",
    time: "10:00",
    venue: "Pabellón Municipal 'Satur' de Fortuna",
    mapsUrl: "",
    isHome: false,
    round: "Jornada 2"
  }
};

const INITIAL_STANDINGS = [
  { id: "team-1", name: "C.D. SEVERO OCHOA", pj: 1, g: 1, e: 0, p: 0, gf: 10, gc: 0, isOwn: false },
  { id: "team-9", name: "C.D. VILLA DE FORTUNA", pj: 1, g: 1, e: 0, p: 0, gf: 10, gc: 0, isOwn: false },
  { id: "team-10", name: "JAMÓN SUPREM ALCANTARILLA DEPORTIVO F.S. \"B\"", pj: 1, g: 1, e: 0, p: 0, gf: 14, gc: 6, isOwn: false },
  { id: "team-own", name: "VIKINGOS SONDOS BLANCA FS", pj: 1, g: 1, e: 0, p: 0, gf: 9, gc: 3, isOwn: true },
  { id: "team-4", name: "PRENSASTOVE ARCHIVEL F. S.", pj: 1, g: 1, e: 0, p: 0, gf: 8, gc: 5, isOwn: false },
  { id: "team-2", name: "ESCUELA DEPORTIVA MUNICIPAL CARAVACA DE LA CRUZ", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, isOwn: false },
  { id: "team-11", name: "EL DULZE EL MIRADOR FS", pj: 1, g: 0, e: 0, p: 1, gf: 5, gc: 8, isOwn: false },
  { id: "team-7", name: "CIEZA F.S. \"B\"", pj: 1, g: 0, e: 0, p: 1, gf: 3, gc: 9, isOwn: false },
  { id: "team-5", name: "DMG FUTSAL LIBRILLA", pj: 1, g: 0, e: 0, p: 1, gf: 6, gc: 14, isOwn: false },
  { id: "team-3", name: "EFS ÁGUILAS", pj: 1, g: 0, e: 0, p: 1, gf: 0, gc: 10, isOwn: false },
  { id: "team-6", name: "FACTOTUM BUSINESS COMPANY AT. DE CIEZA F.S.", pj: 1, g: 0, e: 0, p: 1, gf: 0, gc: 10, isOwn: false }
];

const INITIAL_MATCHES = [
  // Jornada 1 ya disputada por VIKINGOS SONDOS BLANCA FS
  { id: "m-1", round: "Jornada 1", opponent: "CIEZA F.S. \"B\"", date: "2026-11-21", gf: 9, gc: 3, isHome: true, status: "played", scorers: "" },
  // Próximos partidos oficiales de VIKINGOS SONDOS BLANCA FS (Jornada 2 a Jornada 22)
  { id: "m-2", round: "Jornada 2", opponent: "C.D. VILLA DE FORTUNA", date: "2026-11-29", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-3", round: "Jornada 3", opponent: "EL DULZE EL MIRADOR FS", date: "2026-12-06", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-4", round: "Jornada 4", opponent: "ESCUELA DEPORTIVA MUNICIPAL CARAVACA DE LA CRUZ", date: "2026-12-13", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-5", round: "Jornada 5", opponent: "PRENSASTOVE ARCHIVEL F. S.", date: "2026-12-20", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" },
  { id: "m-6", round: "Jornada 6", opponent: "FACTOTUM BUSINESS COMPANY AT. DE CIEZA F.S.", date: "2027-01-10", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-7", round: "Jornada 7", opponent: "Descansa", date: "2027-01-17", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-8", round: "Jornada 8", opponent: "JAMÓN SUPREM ALCANTARILLA DEPORTIVO F.S. \"B\"", date: "2027-01-24", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-9", round: "Jornada 9", opponent: "C.D. SEVERO OCHOA", date: "2027-01-31", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" },
  { id: "m-10", round: "Jornada 10", opponent: "EFS ÁGUILAS", date: "2027-02-04", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" },
  { id: "m-11", round: "Jornada 11", opponent: "DMG FUTSAL LIBRILLA", date: "2027-02-07", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-12", round: "Jornada 12", opponent: "CIEZA F.S. \"B\"", date: "2027-02-14", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-13", round: "Jornada 13", opponent: "C.D. VILLA DE FORTUNA", date: "2027-02-21", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" },
  { id: "m-14", round: "Jornada 14", opponent: "EL DULZE EL MIRADOR FS", date: "2027-02-28", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-15", round: "Jornada 15", opponent: "ESCUELA DEPORTIVA MUNICIPAL CARAVACA DE LA CRUZ", date: "2027-03-07", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-16", round: "Jornada 16", opponent: "PRENSASTOVE ARCHIVEL F. S.", date: "2027-03-14", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" },
  { id: "m-17", round: "Jornada 17", opponent: "FACTOTUM BUSINESS COMPANY AT. DE CIEZA F.S.", date: "2027-03-21", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-18", round: "Jornada 18", opponent: "Descansa", date: "2027-04-04", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" },
  { id: "m-19", round: "Jornada 19", opponent: "JAMÓN SUPREM ALCANTARILLA DEPORTIVO F.S. \"B\"", date: "2027-04-11", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-20", round: "Jornada 20", opponent: "C.D. SEVERO OCHOA", date: "2027-04-18", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-21", round: "Jornada 21", opponent: "EFS ÁGUILAS", date: "2027-05-02", gf: 0, gc: 0, isHome: false, status: "scheduled", scorers: "" },
  { id: "m-22", round: "Jornada 22", opponent: "DMG FUTSAL LIBRILLA", date: "2027-05-09", gf: 0, gc: 0, isHome: true, status: "scheduled", scorers: "" }
];

const GROUP_ROUND_1_RESULTS = [
  { id: "r1-1", date: "20/11/2026", home: "C.D. SEVERO OCHOA", away: "EFS ÁGUILAS", scoreHome: 10, scoreAway: 0, isOwn: false },
  { id: "r1-2", date: "21/11/2026", home: "VIKINGOS SONDOS BLANCA FS", away: "CIEZA F.S. \"B\"", scoreHome: 9, scoreAway: 3, isOwn: true },
  { id: "r1-3", date: "22/11/2026", home: "FACTOTUM BUSINESS COMPANY AT. DE CIEZA F.S.", away: "C.D. VILLA DE FORTUNA", scoreHome: 0, scoreAway: 10, isOwn: false },
  { id: "r1-4", date: "22/11/2026", home: "JAMÓN SUPREM ALCANTARILLA DEPORTIVO F.S. \"B\"", away: "DMG FUTSAL LIBRILLA", scoreHome: 14, scoreAway: 6, isOwn: false },
  { id: "r1-5", date: "22/11/2026", home: "PRENSASTOVE ARCHIVEL F. S.", away: "EL DULZE EL MIRADOR FS", scoreHome: 8, scoreAway: 5, isOwn: false },
  { id: "r1-6", date: "22/11/2026", home: "Descansa", away: "ESCUELA DEPORTIVA MUNICIPAL CARAVACA DE LA CRUZ", scoreHome: null, scoreAway: null, isOwn: false, isBye: true }
];

const INITIAL_PLAYERS = [
  { id: "p-1", number: 1, name: "CESAR", position: "Portero", goals: 0, assists: 0 },
  { id: "p-2", number: 2, name: "ROCIO", position: "Portera", goals: 0, assists: 0 },
  { id: "p-8", number: 8, name: "MIA", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-9", number: 9, name: "DIEGO", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-10", number: 10, name: "LEON", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-11", number: 11, name: "ROMEO", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-16", number: 16, name: "MARTIN", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-17", number: 17, name: "ADRIAN", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-19", number: 19, name: "ABRIL", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-20", number: 20, name: "CARMEN", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-21", number: 21, name: "IKER", position: "Jugador", goals: 0, assists: 0 },
  { id: "p-22", number: 22, name: "NAYRA", position: "Jugador", goals: 0, assists: 0 }
];

// Componente del Escudo Oficial de Blanca Fútbol Sala
function ClubCrest({ customLogoUrl, className = "w-12 h-12" }) {
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Escudo Blanca Fútbol Sala"
        className={`${className} object-contain shrink-0`}
      />
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 220"
      className={`${className} object-contain shrink-0 drop-shadow-sm`}
      aria-label="Escudo Blanca Fútbol Sala"
    >
      {/* Corona Real */}
      <path d="M58 68 L44 38 L74 52 L100 26 L126 52 L156 38 L142 68 Z" fill="#E11D48" stroke="#D97706" strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 68 C58 46, 142 46, 142 68 Z" fill="#DC2626" />
      <path d="M44 38 Q72 24 100 24 Q128 24 156 38" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="100" cy="14" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
      <line x1="100" y1="5" x2="100" y2="11" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="97" y1="8" x2="103" y2="8" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      {/* Base de la corona */}
      <rect x="57" y="65" width="86" height="12" rx="3" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
      <circle cx="72" cy="71" r="2.5" fill="#DC2626" />
      <circle cx="100" cy="71" r="2.5" fill="#10B981" />
      <circle cx="128" cy="71" r="2.5" fill="#DC2626" />
      {/* Perlas superiores */}
      <circle cx="52" cy="34" r="2.5" fill="#F8FAFC" />
      <circle cx="66" cy="29" r="2.5" fill="#F8FAFC" />
      <circle cx="82" cy="25" r="2.5" fill="#F8FAFC" />
      <circle cx="118" cy="25" r="2.5" fill="#F8FAFC" />
      <circle cx="134" cy="29" r="2.5" fill="#F8FAFC" />
      <circle cx="148" cy="34" r="2.5" fill="#F8FAFC" />

      {/* Blason / Escudo exterior */}
      <path
        d="M46 78 H154 V145 C154 182 128 205 100 212 C72 205 46 182 46 145 Z"
        fill="#E2E8F0"
        stroke="#1E293B"
        strokeWidth="3.5"
      />

      {/* Castillo de Blanca (Rojo teja) */}
      <g fill="#C2410C" stroke="#7C2D12" strokeWidth="1.5">
        {/* Torre izquierda */}
        <rect x="64" y="112" width="18" height="62" />
        <rect x="64" y="106" width="4" height="6" />
        <rect x="71" y="106" width="4" height="6" />
        <rect x="78" y="106" width="4" height="6" />
        {/* Torre derecha */}
        <rect x="118" y="112" width="18" height="62" />
        <rect x="118" y="106" width="4" height="6" />
        <rect x="125" y="106" width="4" height="6" />
        <rect x="132" y="106" width="4" height="6" />
        {/* Torre central */}
        <rect x="82" y="94" width="36" height="80" />
        <rect x="83" y="87" width="6" height="7" />
        <rect x="92" y="87" width="6" height="7" />
        <rect x="102" y="87" width="6" height="7" />
        <rect x="111" y="87" width="6" height="7" />
      </g>

      {/* Puerta blanca y Cruz de Santiago */}
      <path d="M91 174 V154 C91 148 109 148 109 154 V174 Z" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.5" />
      <path d="M100 151 V169 M94 157 H106" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />

      {/* Roca Negra Inferior */}
      <path
        d="M52 176 Q75 166 100 173 Q125 166 148 176 C142 195 122 206 100 210 C78 206 58 195 52 176 Z"
        fill="#0F172A"
      />

      {/* Silueta Futbolista y Balón */}
      <circle cx="100" cy="107" r="6.5" fill="#0F172A" />
      <path
        d="M94 114 L106 114 L126 103 L129 107 L109 122 L106 138 L116 158 L113 175 L106 175 L107 159 L97 145 L83 156 L72 146 L76 141 L84 148 L92 135 L91 122 L73 135 L69 131 Z"
        fill="#0F172A"
      />
      <circle cx="88" cy="171" r="6" fill="#0F172A" />
    </svg>
  );
}

// Escudos vectoriales integrados de los equipos rivales
function RivalCrest({ teamKey, className = "w-full h-full" }) {
  if (teamKey === "SEVERO_OCHOA") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" className={className}>
        <defs>
          <linearGradient id="soBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        {/* Escudo exterior azul marino y relleno naranja */}
        <path
          d="M80 12 L138 30 V96 C138 134 112 156 80 168 C48 156 22 134 22 96 V30 Z"
          fill="url(#soBg)"
          stroke="#1E1B4B"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M80 18 L131 34 V95 C131 129 108 149 80 160 C52 149 29 129 29 95 V34 Z"
          fill="none"
          stroke="#312E81"
          strokeWidth="2"
        />
        {/* Cinta superior plateada */}
        <path d="M52 24 Q80 18 108 24 L105 34 Q80 28 55 34 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
        {/* Monograma S O entrelazado */}
        <path
          d="M92 46 C72 40 56 50 58 64 C60 76 86 78 86 92 C86 105 66 108 50 102"
          fill="none"
          stroke="#1E1B4B"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <ellipse
          cx="86"
          cy="82"
          rx="24"
          ry="22"
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="8.5"
        />
        {/* Cinta inferior plateada */}
        <path
          d="M28 118 Q80 104 132 118 L126 131 Q80 118 34 131 Z"
          fill="#F1F5F9"
          stroke="#64748B"
          strokeWidth="1.5"
        />
        <text x="80" y="121" fontSize="8.5" fontWeight="900" fill="#1E1B4B" textAnchor="middle" fontFamily="sans-serif">
          C.D. SEVERO OCHOA
        </text>
        {/* Balón inferior */}
        <circle cx="80" cy="144" r="11" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="1.8" />
        <polygon points="80,138 85,142 83,148 77,148 75,142" fill="#1E3A8A" />
      </svg>
    );
  }

  if (teamKey === "EFS_AGUILAS") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" className={className}>
        <defs>
          <path id="efsaTopArc" d="M 32,90 A 58,58 0 1,1 148,90" />
          <path id="efsaBottomArc" d="M 34,96 A 56,56 0 0,0 146,96" />
        </defs>
        {/* Anillo exterior dorado */}
        <circle cx="90" cy="90" r="82" fill="#C5A847" stroke="#A1822B" strokeWidth="2.5" />
        {/* Círculo interior rojo carmesí */}
        <circle cx="90" cy="90" r="61" fill="#B91C1C" stroke="#F8FAFC" strokeWidth="2.5" />
        {/* Franja horizontal marrón oscura */}
        <rect x="33" y="114" width="114" height="14" fill="#3B2314" stroke="#F8FAFC" strokeWidth="1.5" />
        {/* Texto circular superior e inferior */}
        <text fontSize="11.5" fontWeight="800" fill="#1C1917" letterSpacing="1.2" fontFamily="sans-serif">
          <textPath href="#efsaTopArc" startOffset="50%" textAnchor="middle">
            ESCUELA DE FÚTBOL SALA
          </textPath>
        </text>
        <text fontSize="13.5" fontWeight="900" fill="#1C1917" letterSpacing="2.5" fontFamily="sans-serif">
          <textPath href="#efsaBottomArc" startOffset="50%" textAnchor="middle">
            ÁGUILAS
          </textPath>
        </text>
        {/* Estrellas blancas laterales */}
        <polygon points="34,115 36,119 41,119 37,122 39,126 34,124 29,126 31,122 27,119 32,119" fill="#FFFFFF" />
        <polygon points="146,115 148,119 153,119 149,122 151,126 146,124 141,126 143,122 139,119 144,119" fill="#FFFFFF" />
        {/* Siglas centrales EFSA */}
        <text
          x="90"
          y="102"
          fontSize="42"
          fontWeight="900"
          fontStyle="italic"
          fill="#FFFFFF"
          stroke="#7F1D1D"
          strokeWidth="1.5"
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="-1"
        >
          EFSA
        </text>
        {/* Balón de fútbol sala verde y blanco */}
        <circle cx="90" cy="121" r="14" fill="#FFFFFF" stroke="#14532D" strokeWidth="1.8" />
        <polygon points="90,114 96,118 94,125 86,125 84,118" fill="#15803D" />
        <polygon points="90,107 95,110 90,113 85,110" fill="#15803D" />
        <polygon points="103,117 101,123 97,121 97,117" fill="#15803D" />
        <polygon points="77,117 79,123 83,121 83,117" fill="#15803D" />
        <polygon points="84,132 96,132 93,128 87,128" fill="#15803D" />
      </svg>
    );
  }

  if (teamKey === "CIEZA_FS") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" className={className}>
        <defs>
          <path id="ciezaTopArc" d="M 52,58 A 38,38 0 1,1 128,58" />
          <path id="ciezaBottomArc" d="M 50,62 A 40,40 0 0,0 130,62" />
        </defs>
        {/* Triángulo invertido granate */}
        <polygon
          points="14,26 166,26 90,196"
          fill="#580C1F"
          stroke="#2E050F"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Emblema circular superior */}
        <circle cx="90" cy="60" r="44" fill="#D97706" stroke="#78350F" strokeWidth="2" />
        <circle cx="90" cy="60" r="40" fill="#0284C7" />
        <circle cx="90" cy="60" r="27" fill="#1E3A8A" stroke="#FBBF24" strokeWidth="1.5" />
        {/* Base dorada interior 1986 */}
        <path d="M65 70 Q90 65 115 70 A 27 27 0 0 1 65 70 Z" fill="#F59E0B" />
        <text x="90" y="81" fontSize="8" fontWeight="900" fill="#1E1B4B" textAnchor="middle" fontFamily="sans-serif">
          1986
        </text>
        {/* Castillo dorado */}
        <g fill="#FBBF24" stroke="#78350F" strokeWidth="1">
          <rect x="82" y="38" width="16" height="16" />
          <rect x="82" y="34" width="3.5" height="4" />
          <rect x="88.2" y="34" width="3.5" height="4" />
          <rect x="94.5" y="34" width="3.5" height="4" />
          <rect x="70" y="52" width="40" height="18" />
          <rect x="70" y="48" width="4" height="4" />
          <rect x="77" y="48" width="4" height="4" />
          <rect x="84" y="48" width="4" height="4" />
          <rect x="92" y="48" width="4" height="4" />
          <rect x="99" y="48" width="4" height="4" />
          <rect x="106" y="48" width="4" height="4" />
          <rect x="87" y="42" width="6" height="8" fill="#1E1B4B" stroke="none" />
          <rect x="75" y="59" width="4.5" height="11" fill="#1E1B4B" stroke="none" />
          <rect x="87.7" y="59" width="4.5" height="11" fill="#1E1B4B" stroke="none" />
          <rect x="100.5" y="59" width="4.5" height="11" fill="#1E1B4B" stroke="none" />
        </g>
        {/* Texto circular superior e inferior */}
        <text fontSize="8.5" fontWeight="900" fill="#0F172A" letterSpacing="1.8" fontFamily="sans-serif">
          <textPath href="#ciezaTopArc" startOffset="50%" textAnchor="middle">
            CIEZA
          </textPath>
        </text>
        <text fontSize="6.8" fontWeight="800" fill="#0F172A" letterSpacing="0.6" fontFamily="sans-serif">
          <textPath href="#ciezaBottomArc" startOffset="50%" textAnchor="middle">
            CLUB FÚTBOL SALA
          </textPath>
        </text>
        {/* Cinta dorada 1986 - 2026 */}
        <path
          d="M28 122 Q90 110 152 122 L145 137 Q90 125 35 137 Z"
          fill="#F59E0B"
          stroke="#451A03"
          strokeWidth="1.5"
        />
        <text x="49" y="131" fontSize="9.5" fontWeight="900" fill="#1C1917" textAnchor="middle" fontFamily="sans-serif">
          1986
        </text>
        <text x="131" y="131" fontSize="9.5" fontWeight="900" fill="#1C1917" textAnchor="middle" fontFamily="sans-serif">
          2026
        </text>
        {/* Número central 40 */}
        <text
          x="90"
          y="136"
          fontSize="38"
          fontWeight="900"
          fill="#FBBF24"
          stroke="#451A03"
          strokeWidth="2.2"
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="-1.5"
        >
          40
        </text>
        {/* Balón inferior dorado y negro */}
        <circle cx="90" cy="158" r="14" fill="#F59E0B" stroke="#1C1917" strokeWidth="2" />
        <polygon points="90,151 96,155 94,162 86,162 84,155" fill="#1C1917" />
        <polygon points="90,144 95,147 90,150 85,147" fill="#1C1917" />
        <polygon points="103,154 101,160 97,158 97,154" fill="#1C1917" />
        <polygon points="77,154 79,160 83,158 83,154" fill="#1C1917" />
        <polygon points="84,169 96,169 93,165 87,165" fill="#1C1917" />
      </svg>
    );
  }

  if (teamKey === "CARAVACA") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" className={className}>
        <defs>
          <path id="caravacaTopArc" d="M 38,82 A 54,54 0 1,1 142,82" />
          <path id="caravacaBottomArc" d="M 32,96 A 58,58 0 0,0 148,96" />
        </defs>
        {/* Texto circular superior e inferior */}
        <text fontSize="10.5" fontWeight="700" fill="#64748B" letterSpacing="2" fontFamily="sans-serif">
          <textPath href="#caravacaTopArc" startOffset="50%" textAnchor="middle">
            AYUNTAMIENTO
          </textPath>
        </text>
        <text fontSize="11.5" fontWeight="900" fill="#1E1B38" letterSpacing="1.5" fontFamily="sans-serif">
          <textPath href="#caravacaBottomArc" startOffset="50%" textAnchor="middle">
            CARAVACA DE LA CRUZ
          </textPath>
        </text>
        {/* Puntos laterales */}
        {[ -26, -15, -4, 7, 18, 29 ].map((deg, idx) => (
          <g key={idx}>
            <circle cx={90 - 66 * Math.cos((deg * Math.PI) / 180)} cy={90 + 66 * Math.sin((deg * Math.PI) / 180)} r="2.2" fill="#1E1B38" />
            <circle cx={90 + 66 * Math.cos((deg * Math.PI) / 180)} cy={90 + 66 * Math.sin((deg * Math.PI) / 180)} r="2.2" fill="#1E1B38" />
          </g>
        ))}
        {/* Corona superior */}
        <path
          d="M64 56 L58 43 L71 49 L80 41 L90 49 L100 41 L109 49 L122 43 L116 56 Z"
          fill="#1E1B38"
        />
        <rect x="62" y="59" width="56" height="4" rx="1.5" fill="#1E1B38" />
        {/* Blasón dividido */}
        <path
          d="M62 66 H118 V105 C118 126 105 138 90 143 C75 138 62 126 62 105 Z"
          fill="#1E1B38"
        />
        {/* Línea divisoria central */}
        <line x1="62" y1="102" x2="118" y2="102" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Cruz de Caravaca superior */}
        <g stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round">
          <line x1="90" y1="73" x2="90" y2="95" />
          <line x1="84" y1="79" x2="96" y2="79" />
          <line x1="82" y1="86" x2="98" y2="86" />
        </g>
        {/* Silueta toro / vaca inferior */}
        <g fill="#FFFFFF">
          <rect x="78" y="112" width="22" height="11" rx="3" />
          <circle cx="76" cy="113" r="4" />
          <path d="M73 110 L71 107 M77 110 L79 107" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="79" y="122" width="2.8" height="7" rx="1" />
          <rect x="84" y="122" width="2.8" height="7" rx="1" />
          <rect x="92" y="122" width="2.8" height="7" rx="1" />
          <rect x="97" y="122" width="2.8" height="7" rx="1" />
          <path d="M100 113 Q104 117 102 123" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (teamKey === "ALCANTARILLA") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 190" className={className}>
        {/* Corona real dorada superior */}
        <path
          d="M58 52 L48 30 L72 42 L90 22 L108 42 L132 30 L122 52 Z"
          fill="#FACC15"
          stroke="#78350F"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="57" y="50" width="66" height="8" rx="2" fill="#EAB308" stroke="#78350F" strokeWidth="2" />
        <circle cx="90" cy="15" r="3.5" fill="#FACC15" stroke="#78350F" strokeWidth="1.5" />

        {/* Adornos / lambrequines laterales rojizos y dorados */}
        <path
          d="M44 62 C30 78, 32 122, 54 148 C68 164, 82 172, 90 176 C98 172, 112 164, 126 148 C148 122, 150 78, 136 62"
          fill="none"
          stroke="#991B1B"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M44 62 C30 78, 32 122, 54 148 C68 164, 82 172, 90 176 C98 172, 112 164, 126 148 C148 122, 150 78, 136 62"
          fill="none"
          stroke="#FACC15"
          strokeWidth="2.5"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />

        {/* Blasón azul celeste */}
        <path
          d="M50 60 Q90 68 130 60 L126 116 C124 142 106 158 90 166 C74 158 56 142 54 116 Z"
          fill="#60A5FA"
          stroke="#CA8A04"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M54 64 Q90 71 126 64 L122 115 C120 138 104 153 90 160 C76 153 60 138 58 115 Z"
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="1.2"
        />

        {/* Detalles heráldicos superiores */}
        <g fill="#0F172A">
          <rect x="64" y="75" width="7" height="7" rx="1" />
          <rect x="74" y="75" width="7" height="7" rx="1" />
          <rect x="64" y="85" width="7" height="7" rx="1" />
          <rect x="74" y="85" width="7" height="7" rx="1" />
          <line x1="74" y1="97" x2="83" y2="97" stroke="#0F172A" strokeWidth="1.8" />
          <line x1="74" y1="101" x2="83" y2="101" stroke="#0F172A" strokeWidth="1.8" />
          <line x1="74" y1="105" x2="83" y2="105" stroke="#0F172A" strokeWidth="1.8" />
        </g>

        {/* Siete coronas / florones a la derecha */}
        <g fill="#1E1B4B">
          <circle cx="100" cy="78" r="2.2" />
          <circle cx="109" cy="78" r="2.2" />
          <circle cx="118" cy="78" r="2.2" />
          <circle cx="104" cy="87" r="2.2" />
          <circle cx="114" cy="87" r="2.2" />
          <circle cx="109" cy="96" r="2.2" />
          <circle cx="109" cy="105" r="2.2" />
        </g>

        {/* Siglas F.S inferiores */}
        <text
          x="90"
          y="141"
          fontSize="24"
          fontWeight="800"
          fill="#1E293B"
          textAnchor="middle"
          fontFamily="serif"
          letterSpacing="1"
        >
          F.S
        </text>
      </svg>
    );
  }

  if (teamKey === "LIBRILLA") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 185" className={className}>
        {/* Silueta exterior amarilla */}
        <path
          d="M36 28 C52 24, 78 30, 102 24 C124 18, 148 28, 152 54 C156 82, 162 114, 148 140 C134 164, 96 172, 62 168 C36 164, 28 142, 32 110 C36 80, 22 34, 36 28 Z"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Texto superior A. D. V. */}
        <text x="45" y="48" fontSize="11" fontWeight="900" fill="#18181B" fontFamily="sans-serif">
          A. D. V.
        </text>
        {/* Corona superior derecha */}
        <g fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M108 58 H142" />
          <path d="M110 55 C106 42, 118 34, 125 34 C132 34, 144 42, 140 55" />
          <path d="M125 25 V55" />
          <path d="M121 28 H129" />
          <path d="M118 55 C116 44, 121 37, 125 34" />
          <path d="M132 55 C134 44, 129 37, 125 34" />
        </g>
        {/* Arcos circulares del emblema */}
        <path d="M52 80 A 38 38 0 0 0 98 134" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M134 72 A 38 38 0 0 1 140 112" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M84 54 A 38 38 0 0 1 102 54" fill="none" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

        {/* León rampante negro arriba izquierda */}
        <g fill="#18181B">
          <circle cx="68" cy="60" r="5" />
          <path d="M62 65 L73 65 L75 82 L81 94 L75 95 L70 85 L62 94 L56 93 L63 81 L54 74 L57 69 L63 73 Z" />
          <path d="M74 72 C84 68, 86 58, 79 56 C74 55, 73 61, 77 63" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Peñas / montañas arriba derecha */}
        <path
          d="M94 94 L106 68 L115 84 L123 64 L132 94 Z"
          fill="none"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Tres flores de lis abajo izquierda */}
        <g fill="#18181B">
          <path d="M68 100 L71 107 L68 112 L65 107 Z M62 106 Q68 105 74 106" />
          <path d="M84 100 L87 107 L84 112 L81 107 Z M78 106 Q84 105 90 106" />
          <path d="M76 114 L79 121 L76 126 L73 121 Z M70 120 Q76 119 82 120" />
        </g>

        {/* Dos torres abajo derecha */}
        <g fill="none" stroke="#18181B" strokeWidth="1.8">
          <rect x="102" y="102" width="12" height="26" />
          <rect x="118" y="102" width="12" height="26" />
          <rect x="106" y="121" width="4" height="7" fill="#18181B" />
          <rect x="122" y="121" width="4" height="7" fill="#18181B" />
        </g>

        {/* Textos inferiores FUTSAL • 1980 • LIBRILLA */}
        <text x="44" y="143" fontSize="9.5" fontWeight="900" fill="#18181B" fontFamily="sans-serif">
          FUTSAL
        </text>
        <text x="128" y="143" fontSize="9" fontWeight="800" fill="#18181B" fontFamily="sans-serif">
          1980
        </text>
        <text
          x="93"
          y="160"
          fontSize="18.5"
          fontWeight="900"
          fill="#18181B"
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="0.8"
        >
          LIBRILLA
        </text>
      </svg>
    );
  }

  if (teamKey === "ATLETICO_CIEZA") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" className={className}>
        <defs>
          <path id="atCiezaTopArc" d="M 28,90 A 62,62 0 1,1 152,90" />
          <path id="atCiezaBottomArc" d="M 24,96 A 66,66 0 0,0 156,96" />
        </defs>
        {/* Anillo exterior negro */}
        <circle cx="90" cy="90" r="82" fill="#09090B" stroke="#71717A" strokeWidth="2.5" />
        {/* Fondo interior blanco */}
        <circle cx="90" cy="90" r="56" fill="#FFFFFF" />

        {/* Texto circular superior e inferior */}
        <text fontSize="11.5" fontWeight="900" fill="#FFFFFF" letterSpacing="1.2" fontFamily="sans-serif">
          <textPath href="#atCiezaTopArc" startOffset="50%" textAnchor="middle">
            ATLÉTICO DE CIEZA
          </textPath>
        </text>
        <text fontSize="11" fontWeight="900" fill="#FFFFFF" letterSpacing="1.5" fontFamily="sans-serif">
          <textPath href="#atCiezaBottomArc" startOffset="50%" textAnchor="middle">
            FÚTBOL SALA
          </textPath>
        </text>

        {/* Silueta castillo y puente en tono arena/marrón claro */}
        <g fill="#D6A87C" opacity="0.85">
          {/* Torre superior */}
          <rect x="78" y="45" width="24" height="26" rx="1" />
          <rect x="78" y="40" width="5" height="5" />
          <rect x="87.5" y="40" width="5" height="5" />
          <rect x="97" y="40" width="5" height="5" />
          <rect x="87" y="54" width="6" height="10" rx="3" fill="#FFFFFF" />
          {/* Cuerpo medio y arcos del puente */}
          <rect x="64" y="71" width="52" height="32" rx="2" />
          <path d="M72 103 V91 A 6 6 0 0 1 84 91 V103 Z" fill="#FFFFFF" />
          <path d="M96 103 V91 A 6 6 0 0 1 108 91 V103 Z" fill="#FFFFFF" />
          {/* Base ondulada */}
          <path d="M62 106 Q90 114 118 106 Q90 119 62 106 Z" />
        </g>

        {/* Siglas rojas redondeadas AC / FS */}
        <g fill="#EF4444" fontFamily="sans-serif" fontWeight="900" fontSize="34" textAnchor="middle">
          <text x="72" y="78">A</text>
          <text x="108" y="78">C</text>
          <text x="72" y="114">F</text>
          <text x="108" y="114">S</text>
        </g>

        {/* Año 2007 */}
        <text x="90" y="133" fontSize="11.5" fontWeight="900" fill="#09090B" textAnchor="middle" fontFamily="sans-serif">
          2007
        </text>
      </svg>
    );
  }

  if (teamKey === "FORTUNA") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" className={className}>
        <defs>
          <path id="fortunaTopArc" d="M 32,90 A 58,58 0 1,1 148,90" />
          <path id="fortunaBottomArc" d="M 30,96 A 60,60 0 0,0 150,96" />
        </defs>
        {/* Fondo cuadrado redondeado azul cobalto */}
        <rect x="6" y="6" width="168" height="168" rx="22" fill="#0038A8" />
        {/* Anillo blanco exterior y anillo naranja */}
        <circle cx="90" cy="90" r="76" fill="#F8FAFC" />
        <circle cx="90" cy="90" r="70" fill="#F97316" />
        {/* Círculo interior azul */}
        <circle cx="90" cy="90" r="48" fill="#0038A8" />

        {/* Texto circular superior e inferior */}
        <text fontSize="11.5" fontWeight="900" fill="#0038A8" letterSpacing="1.8" fontFamily="sans-serif">
          <textPath href="#fortunaTopArc" startOffset="50%" textAnchor="middle">
            VILLA DE
          </textPath>
        </text>
        <text fontSize="11.5" fontWeight="900" fill="#0038A8" letterSpacing="1.8" fontFamily="sans-serif">
          <textPath href="#fortunaBottomArc" startOffset="50%" textAnchor="middle">
            FORTUNA
          </textPath>
        </text>

        {/* Silueta de montañas naranjas */}
        <polyline
          points="44,76 66,64 76,72 92,54 106,68 122,56 138,70"
          fill="none"
          stroke="#F97316"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Monograma estilizado VF */}
        <path
          d="M66 76 Q82 76 82 94 L82 108 L64 94"
          fill="none"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M114 76 Q96 76 96 94 L96 108 M96 93 H114"
          fill="none"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tres ondas de agua inferiores */}
        <path d="M52 114 Q71 108 90 114 Q109 120 128 114" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
        <path d="M56 122 Q73 116 90 122 Q107 128 124 122" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
        <path d="M64 130 Q77 125 90 130 Q103 135 116 130" fill="none" stroke="#F97316" strokeWidth="3.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (teamKey === "ARCHIVEL") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 185" className={className}>
        <defs>
          <path id="archivelBottomArc" d="M 28,136 A 72,72 0 0,0 152,136" />
        </defs>
        {/* Corona superior negra */}
        <g fill="#09090B" stroke="#09090B" strokeWidth="2" strokeLinejoin="round">
          <rect x="74" y="37" width="32" height="4" rx="1" />
          <path d="M74 35 C66 24, 78 16, 90 16 C102 16, 114 24, 106 35" fill="none" strokeWidth="3.5" />
          <path d="M90 11 V35" strokeWidth="3.2" />
          <circle cx="90" cy="11" r="2" />
          <circle cx="72" cy="23" r="1.8" />
          <circle cx="108" cy="23" r="1.8" />
        </g>

        {/* Torre central blanca con contorno negro */}
        <g fill="#FFFFFF" stroke="#09090B" strokeWidth="2.2" strokeLinejoin="round">
          {/* Almenas */}
          <rect x="74" y="45" width="7" height="6" />
          <rect x="86.5" y="45" width="7" height="6" />
          <rect x="99" y="45" width="7" height="6" />
          {/* Cuerpo superior */}
          <rect x="74" y="51" width="32" height="8" />
          {/* Cuerpo medio */}
          <rect x="77" y="59" width="26" height="30" />
          {/* Base ensanchada */}
          <polygon points="77,89 103,89 109,106 71,106" />
          {/* Puerta negra */}
          <path d="M85 106 V94 A 5 5 0 0 1 95 94 V106 Z" fill="#09090B" stroke="none" />
        </g>

        {/* Ramas de laurel izquierda y derecha */}
        <path d="M72 110 C42 98, 36 66, 52 44" fill="none" stroke="#09090B" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M108 110 C138 98, 144 66, 128 44" fill="none" stroke="#09090B" strokeWidth="2.4" strokeLinecap="round" />
        <g fill="#09090B">
          {/* Hojas izquierdas */}
          <ellipse cx="48" cy="48" rx="6" ry="2.6" transform="rotate(-35 48 48)" />
          <ellipse cx="43" cy="58" rx="6.5" ry="2.6" transform="rotate(-20 43 58)" />
          <ellipse cx="41" cy="69" rx="6.5" ry="2.6" transform="rotate(-5 41 69)" />
          <ellipse cx="43" cy="80" rx="6.5" ry="2.6" transform="rotate(15 43 80)" />
          <ellipse cx="48" cy="91" rx="6.5" ry="2.6" transform="rotate(30 48 91)" />
          <ellipse cx="56" cy="100" rx="6.5" ry="2.6" transform="rotate(42 56 100)" />
          <ellipse cx="53" cy="53" rx="5.5" ry="2.3" transform="rotate(-70 53 53)" />
          <ellipse cx="50" cy="64" rx="5.5" ry="2.3" transform="rotate(-55 50 64)" />
          <ellipse cx="50" cy="75" rx="5.5" ry="2.3" transform="rotate(-35 50 75)" />
          <ellipse cx="54" cy="86" rx="5.5" ry="2.3" transform="rotate(-15 54 86)" />
          <ellipse cx="62" cy="95" rx="5.5" ry="2.3" transform="rotate(5 62 95)" />
          {/* Hojas derechas */}
          <ellipse cx="132" cy="48" rx="6" ry="2.6" transform="rotate(35 132 48)" />
          <ellipse cx="137" cy="58" rx="6.5" ry="2.6" transform="rotate(20 137 58)" />
          <ellipse cx="139" cy="69" rx="6.5" ry="2.6" transform="rotate(5 139 69)" />
          <ellipse cx="137" cy="80" rx="6.5" ry="2.6" transform="rotate(-15 137 80)" />
          <ellipse cx="132" cy="91" rx="6.5" ry="2.6" transform="rotate(-30 132 91)" />
          <ellipse cx="124" cy="100" rx="6.5" ry="2.6" transform="rotate(-42 124 100)" />
          <ellipse cx="127" cy="53" rx="5.5" ry="2.3" transform="rotate(70 127 53)" />
          <ellipse cx="130" cy="64" rx="5.5" ry="2.3" transform="rotate(55 130 64)" />
          <ellipse cx="130" cy="75" rx="5.5" ry="2.3" transform="rotate(35 130 75)" />
          <ellipse cx="126" cy="86" rx="5.5" ry="2.3" transform="rotate(15 126 86)" />
          <ellipse cx="118" cy="95" rx="5.5" ry="2.3" transform="rotate(-5 118 95)" />
        </g>

        {/* Lazo inferior */}
        <path d="M62 126 L74 114 L82 118 L70 132 Z" fill="#09090B" />
        <path d="M118 126 L106 114 L98 118 L110 132 Z" fill="#09090B" />
        <rect x="74" y="109" width="32" height="8" rx="3" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />

        {/* Balón clásico debajo del lazo */}
        <circle cx="90" cy="134" r="11" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
        <path d="M83 127 Q90 131 97 127 M80 135 Q90 133 100 135 M85 143 Q90 138 95 143" fill="none" stroke="#09090B" strokeWidth="1.6" />

        {/* Texto curvo inferior ARCHIVEL F.S. */}
        <text fontSize="13.5" fontWeight="900" fill="#09090B" letterSpacing="1.5" fontFamily="sans-serif">
          <textPath href="#archivelBottomArc" startOffset="50%" textAnchor="middle">
            ARCHIVEL F.S.
          </textPath>
        </text>
      </svg>
    );
  }

  if (teamKey === "EL_MIRADOR") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 185" className={className}>
        {/* Fondo cuadrado redondeado rojo */}
        <rect x="4" y="4" width="172" height="177" rx="18" fill="#DC140C" />

        {/* Cinta superior dorada 2003 */}
        <polygon points="18,26 62,26 62,38 18,46 30,36" fill="#FDE047" stroke="#09090B" strokeWidth="2.2" strokeLinejoin="round" />
        <polygon points="162,26 118,26 118,38 162,46 150,36" fill="#FDE047" stroke="#09090B" strokeWidth="2.2" strokeLinejoin="round" />
        <rect x="56" y="18" width="68" height="22" rx="2" fill="#FDE047" stroke="#09090B" strokeWidth="2.2" />
        <text x="90" y="34" fontSize="14.5" fontWeight="900" fill="#09090B" textAnchor="middle" fontFamily="sans-serif">
          2003
        </text>
        {/* Estrellitas rojas en los extremos de la cinta */}
        <text x="41" y="39" fontSize="12" fontWeight="900" fill="#DC140C" textAnchor="middle">*</text>
        <text x="139" y="39" fontSize="12" fontWeight="900" fill="#DC140C" textAnchor="middle">*</text>

        {/* Contorno exterior dorado del escudo */}
        <path
          d="M48 40 Q90 36 132 40 L166 76 L90 174 L14 76 Z"
          fill="#FDE047"
          stroke="#09090B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Cuarteles superiores rojos */}
        <polygon points="50,45 87,44 87,67 24,67" fill="#DC140C" />
        <polygon points="130,45 93,44 93,67 156,67" fill="#DC140C" />

        {/* Franja horizontal central dorada EL MIRADOR */}
        <text
          x="90"
          y="83"
          fontSize="14.5"
          fontWeight="900"
          fill="#DC140C"
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="1.2"
        >
          EL MIRADOR
        </text>

        {/* Cuarteles inferiores azul celeste */}
        <polygon points="24,89 87,89 87,114 66,140" fill="#2596EA" />
        <polygon points="156,89 93,89 93,114 114,140" fill="#2596EA" />

        {/* Letras F y S en rojo */}
        <text x="64" y="113" fontSize="22" fontWeight="900" fill="#DC140C" textAnchor="middle" fontFamily="sans-serif">
          F
        </text>
        <text x="116" y="113" fontSize="22" fontWeight="900" fill="#DC140C" textAnchor="middle" fontFamily="sans-serif">
          S
        </text>

        {/* Rombo inferior rojo con balón */}
        <polygon
          points="90,115 113,142 90,168 67,142"
          fill="#DC140C"
          stroke="#FDE047"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="90" cy="142" r="12" fill="#FFFFFF" stroke="#DC140C" strokeWidth="1.2" />
        <polygon points="90,136 95,140 93,146 87,146 85,140" fill="#DC140C" />
        <polygon points="90,130 94,133 90,135 86,133" fill="#DC140C" />
        <polygon points="101,139 99,145 96,143 96,139" fill="#DC140C" />
        <polygon points="79,139 81,145 84,143 84,139" fill="#DC140C" />
        <polygon points="85,151 95,151 92,148 88,148" fill="#DC140C" />
      </svg>
    );
  }

  return null;
}

// Componente universal para mostrar el escudo de cualquier equipo (propio o rival)
function TeamBadge({ teamName, standings, ownTeamName, ownLogoUrl, size = "md" }) {
  const sizeClasses = {
    sm: "w-7 h-7 p-0.5 text-[10px]",
    md: "w-10 h-10 p-1 text-xs",
    lg: "w-14 h-14 p-1.5 text-sm"
  }[size] || "w-10 h-10 p-1 text-xs";

  const normalized = (teamName || "").trim().toUpperCase();
  if (!normalized || normalized === "DESCANSA") {
    return (
      <div className={`${sizeClasses} rounded-xl bg-slate-200/70 border border-slate-300/70 flex items-center justify-center font-bold text-slate-400 shrink-0`}>
        —
      </div>
    );
  }

  const matchedTeam = standings?.find(
    (t) => (t.name || "").trim().toUpperCase() === normalized
  );
  const isOwn =
    matchedTeam?.isOwn ||
    normalized === (ownTeamName || "").trim().toUpperCase() ||
    normalized.includes("BLANCA FS");

  if (isOwn) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-emerald-200 shadow-sm flex items-center justify-center shrink-0`}>
        <ClubCrest customLogoUrl={ownLogoUrl || matchedTeam?.logoUrl} className="w-full h-full" />
      </div>
    );
  }

  if (matchedTeam?.logoUrl) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <img
          src={matchedTeam.logoUrl}
          alt={`Escudo ${teamName}`}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Escudos integrados por nombre de equipo rival
  if (normalized.includes("SEVERO OCHOA")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="SEVERO_OCHOA" />
      </div>
    );
  }

  if (normalized.includes("ÁGUILAS") || normalized.includes("AGUILAS")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="EFS_AGUILAS" />
      </div>
    );
  }

  if (normalized.includes("CIEZA F.S.") || normalized === "CIEZA B") {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="CIEZA_FS" />
      </div>
    );
  }

  if (normalized.includes("CARAVACA")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="CARAVACA" />
      </div>
    );
  }

  if (normalized.includes("ALCANTARILLA")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="ALCANTARILLA" />
      </div>
    );
  }

  if (normalized.includes("LIBRILLA")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="LIBRILLA" />
      </div>
    );
  }

  if (normalized.includes("AT. DE CIEZA") || normalized.includes("ATLETICO") || normalized.includes("ATLÉTICO")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="ATLETICO_CIEZA" />
      </div>
    );
  }

  if (normalized.includes("FORTUNA")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="FORTUNA" />
      </div>
    );
  }

  if (normalized.includes("ARCHIVEL")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="ARCHIVEL" />
      </div>
    );
  }

  if (normalized.includes("MIRADOR") || normalized.includes("DULZE")) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <RivalCrest teamKey="EL_MIRADOR" />
      </div>
    );
  }

  // Escudo genérico con iniciales si aún no se ha subido la imagen del rival
  const initials = normalized
    .replace(/C\.D\.|EFS|F\.S\.|FS|DEPORTIVO|MUNICIPAL|ESCUELA|DEPORTIVA/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || normalized.slice(0, 2);

  return (
    <div className={`${sizeClasses} rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-600 shrink-0`}>
      {initials}
    </div>
  );
}

const INITIAL_PHOTOS = [
  {
    id: "ph-1",
    title: "Victoria 9-3 Jornada 1 vs Cieza F.S. \"B\"",
    date: "2026-11-21",
    category: "Partido",
    imageUrl: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23059669'/%3E%3Cstop offset='100%25' stop-color='%23064e3b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g)'/%3E%3Crect x='40' y='35' width='720' height='380' rx='18' fill='none' stroke='%23ffffff' stroke-opacity='0.28' stroke-width='4'/%3E%3Cline x1='400' y1='35' x2='400' y2='415' stroke='%23ffffff' stroke-opacity='0.28' stroke-width='4'/%3E%3Ccircle cx='400' cy='225' r='65' fill='none' stroke='%23ffffff' stroke-opacity='0.28' stroke-width='4'/%3E%3Ctext x='400' y='195' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23a7f3d0' text-anchor='middle'%3EJORNADA 1 • VIKINGOS SONDOS BLANCA FS%3C/text%3E%3Ctext x='400' y='262' font-family='sans-serif' font-size='64' font-weight='900' fill='%23ffffff' text-anchor='middle'%3E9 - 3%3C/text%3E%3Ctext x='400' y='305' font-family='sans-serif' font-size='20' font-weight='600' fill='%23d1fae5' text-anchor='middle'%3EVictoria frente a Cieza F.S. %22B%22%3C/text%3E%3C/svg%3E"
  }
];

// ==========================================
// 3. COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ==========================================
export default function App() {
  // Estados de autenticación y sincronización
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  // Control de acceso privado a la web (para padres / compañero)
  const [siteUnlocked, setSiteUnlocked] = useState(false);
  const [sitePinInput, setSitePinInput] = useState("");
  const [sitePinError, setSitePinError] = useState("");

  // Modo de vista: bloqueado en Vista Afición por defecto
  const [coachMode, setCoachMode] = useState(false);
  const [showCoachPinModal, setShowCoachPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState("inicio");

  // Estados de datos en tiempo real desde Firestore
  const [teamConfig, setTeamConfig] = useState(INITIAL_TEAM_CONFIG);
  const [standings, setStandings] = useState(INITIAL_STANDINGS);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [rivalResults, setRivalResults] = useState(GROUP_ROUND_1_RESULTS);
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [attendanceSessions, setAttendanceSessions] = useState([]);

  // Estados de control de asistencia (solo entrenador)
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceType, setAttendanceType] = useState("Entrenamiento");
  const [attendanceNotes, setAttendanceNotes] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Estados de modales y notificaciones
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [expandedRoundRivals, setExpandedRoundRivals] = useState({ "Jornada 1": true });
  const [showRivalResultModal, setShowRivalResultModal] = useState(false);
  const [editingRivalResult, setEditingRivalResult] = useState(null);
  const [defaultRivalRound, setDefaultRivalRound] = useState("Jornada 2");
  const [defaultRivalDate, setDefaultRivalDate] = useState("");
  const [showTeamSettingsModal, setShowTeamSettingsModal] = useState(false);
  const [showNextMatchModal, setShowNextMatchModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showTeamStandingModal, setShowTeamStandingModal] = useState(false);
  const [editingStandingTeam, setEditingStandingTeam] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ------------------------------------------
  // 4. AUTENTICACIÓN INICIAL FIREBASE
  // ------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Error de autenticación:", err);
        setSyncError("No se pudo conectar con el servidor de datos.");
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Permitir abrir el acceso de entrenador mediante parámetro de URL (?admin=1) o atajo de teclado (Ctrl+E)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1" || window.location.hash === "#admin") {
      setShowCoachPinModal(true);
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        if (coachMode) {
          setCoachMode(false);
          showToast("Panel de entrenador cerrado");
        } else {
          setPinInput("");
          setPinError("");
          setShowCoachPinModal(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [coachMode]);

  // ------------------------------------------
  // 5. SUSCRIPCIÓN EN TIEMPO REAL A FIRESTORE
  // ------------------------------------------
  useEffect(() => {
    if (!user) return;

    const basePath = `artifacts/${appId}/public/data`;

    // 5.1 Configuración del equipo
    const configRef = doc(db, `${basePath}/team_config`, "main");
    const unsubConfig = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const updates = {};
          if (data.coachPin === "Chapi2026" || !data.coachPin) {
            updates.coachPin = "blanca2026";
          }
          if (!data.familyPin || data.familyPin === "Chapi2026") {
            updates.familyPin = "Viking@s2026";
          }
          if (Object.keys(updates).length > 0) {
            setDoc(configRef, updates, { merge: true }).catch(console.error);
          }
          setTeamConfig((prev) => ({ ...prev, ...data, ...updates }));
        } else {
          setDoc(configRef, INITIAL_TEAM_CONFIG).catch(console.error);
        }
      },
      (err) => console.error("Error leyendo configuración:", err)
    );

    // 5.2 Clasificación
    const standingsRef = collection(db, `${basePath}/standings`);
    const unsubStandings = onSnapshot(
      standingsRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_STANDINGS.forEach((team) => {
            setDoc(doc(standingsRef, team.id), team).catch(console.error);
          });
        } else {
          setStandings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error("Error leyendo clasificación:", err)
    );

    // 5.3 Partidos y Resultados
    const matchesRef = collection(db, `${basePath}/matches`);
    const unsubMatches = onSnapshot(
      matchesRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_MATCHES.forEach((m) => {
            setDoc(doc(matchesRef, m.id), m).catch(console.error);
          });
        } else {
          setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error("Error leyendo partidos:", err)
    );

    // 5.4 Plantilla
    const playersRef = collection(db, `${basePath}/players`);
    const unsubPlayers = onSnapshot(
      playersRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_PLAYERS.forEach((p) => {
            setDoc(doc(playersRef, p.id), p).catch(console.error);
          });
        } else {
          setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error("Error leyendo plantilla:", err)
    );

    // 5.5 Galería de Fotos
    const photosRef = collection(db, `${basePath}/photos`);
    const unsubPhotos = onSnapshot(
      photosRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_PHOTOS.forEach((ph) => {
            setDoc(doc(photosRef, ph.id), ph).catch(console.error);
          });
        } else {
          setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error("Error leyendo fotos:", err)
    );

    // 5.6 Registro de Asistencia (Solo accesible en Modo Entrenador)
    const attendanceRef = collection(db, `${basePath}/attendance`);
    const unsubAttendance = onSnapshot(
      attendanceRef,
      (snap) => {
        setAttendanceSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("Error leyendo asistencia:", err)
    );

    // 5.7 Resultados de los rivales del grupo (Solo visibles para el entrenador)
    const rivalResultsRef = collection(db, `${basePath}/rival_results`);
    const unsubRivalResults = onSnapshot(
      rivalResultsRef,
      (snap) => {
        if (snap.empty) {
          GROUP_ROUND_1_RESULTS.filter((r) => !r.isOwn).forEach((item) => {
            setDoc(doc(rivalResultsRef, item.id), {
              round: "Jornada 1",
              date: "2026-11-22",
              home: item.home,
              away: item.away,
              scoreHome: item.scoreHome ?? 0,
              scoreAway: item.scoreAway ?? 0,
              isBye: Boolean(item.isBye)
            }).catch(console.error);
          });
        } else {
          setRivalResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error("Error leyendo resultados de rivales:", err)
    );

    return () => {
      unsubConfig();
      unsubStandings();
      unsubMatches();
      unsubPlayers();
      unsubPhotos();
      unsubAttendance();
      unsubRivalResults();
    };
  }, [user]);

  // ------------------------------------------
  // 6. CÁLCULOS DERIVADOS Y ORDENACIÓN
  // ------------------------------------------
  const syncStandingsFromAllResults = async (latestMatchesList, latestRivalResultsList) => {
    const basePath = `artifacts/${appId}/public/data`;
    const statsByTeamName = {};

    standings.forEach((t) => {
      const key = (t.name || "").trim().toUpperCase();
      statsByTeamName[key] = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 };
    });

    const ownKey = (
      standings.find((t) => t.isOwn)?.name ||
      teamConfig.teamName ||
      "VIKINGOS SONDOS BLANCA FS"
    ).trim().toUpperCase();

    const applyMatchResult = (homeName, awayName, homeGoals, awayGoals) => {
      const hKey = (homeName || "").trim().toUpperCase();
      const aKey = (awayName || "").trim().toUpperCase();
      if (!hKey || !aKey || hKey === "DESCANSA" || aKey === "DESCANSA") return;

      const gh = Number(homeGoals) || 0;
      const ga = Number(awayGoals) || 0;

      if (statsByTeamName[hKey]) {
        statsByTeamName[hKey].pj += 1;
        statsByTeamName[hKey].gf += gh;
        statsByTeamName[hKey].gc += ga;
        if (gh > ga) statsByTeamName[hKey].g += 1;
        else if (gh === ga) statsByTeamName[hKey].e += 1;
        else statsByTeamName[hKey].p += 1;
      }

      if (statsByTeamName[aKey]) {
        statsByTeamName[aKey].pj += 1;
        statsByTeamName[aKey].gf += ga;
        statsByTeamName[aKey].gc += gh;
        if (ga > gh) statsByTeamName[aKey].g += 1;
        else if (ga === gh) statsByTeamName[aKey].e += 1;
        else statsByTeamName[aKey].p += 1;
      }
    };

    latestMatchesList.forEach((m) => {
      if (m.status !== "played") return;
      const oppKey = (m.opponent || "").trim().toUpperCase();
      if (!oppKey || oppKey === "DESCANSA") return;
      const gf = Number(m.gf) || 0;
      const gc = Number(m.gc) || 0;
      if (m.isHome) {
        applyMatchResult(ownKey, oppKey, gf, gc);
      } else {
        applyMatchResult(oppKey, ownKey, gc, gf);
      }
    });

    latestRivalResultsList.forEach((r) => {
      if (r.isBye) return;
      const hKey = (r.home || "").trim().toUpperCase();
      const aKey = (r.away || "").trim().toUpperCase();
      if (!hKey || !aKey || hKey === "DESCANSA" || aKey === "DESCANSA") return;
      if (hKey === ownKey || aKey === ownKey) return;
      applyMatchResult(hKey, aKey, r.scoreHome, r.scoreAway);
    });

    await Promise.all(
      standings.map((team) => {
        const key = (team.name || "").trim().toUpperCase();
        const computed = statsByTeamName[key];
        if (!computed) return Promise.resolve();
        return updateDoc(doc(db, `${basePath}/standings`, team.id), computed);
      })
    );
  };
  const sortedStandings = useMemo(() => {
    return [...standings]
      .map((team) => {
        const pj = Number(team.pj) || 0;
        const g = Number(team.g) || 0;
        const e = Number(team.e) || 0;
        const p = Number(team.p) || 0;
        const gf = Number(team.gf) || 0;
        const gc = Number(team.gc) || 0;
        const pts = g * 3 + e;
        const dg = gf - gc;
        return { ...team, pj, g, e, p, gf, gc, pts, dg };
      })
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      });
  }, [standings]);

  const ownTeamStanding = useMemo(() => {
    const idx = sortedStandings.findIndex((t) => t.isOwn);
    if (idx === -1) return null;
    return { ...sortedStandings[idx], position: idx + 1 };
  }, [sortedStandings]);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const numA = parseInt((a.round || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.round || "").replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numA - numB;
      return (a.date || "").localeCompare(b.date || "");
    });
  }, [matches]);

  const lastPlayedMatch = useMemo(() => {
    const played = sortedMatches.filter((m) => m.status === "played");
    return played.length > 0 ? played[played.length - 1] : null;
  }, [sortedMatches]);

  const recentForm = useMemo(() => {
    return sortedMatches
      .filter((m) => m.status === "played")
      .slice(-5)
      .map((m) => {
        const gf = Number(m.gf) || 0;
        const gc = Number(m.gc) || 0;
        if (gf > gc) return { res: "V", label: "Victoria", color: "bg-emerald-500 text-white", match: m };
        if (gf === gc) return { res: "E", label: "Empate", color: "bg-amber-400 text-slate-950", match: m };
        return { res: "D", label: "Derrota", color: "bg-rose-500 text-white", match: m };
      });
  }, [sortedMatches]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
  }, [players]);

  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [photos]);

  const sortedAttendanceSessions = useMemo(() => {
    return [...attendanceSessions].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [attendanceSessions]);

  const sortedRivalResults = useMemo(() => {
    return [...rivalResults].sort((a, b) => {
      const numA = parseInt((a.round || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.round || "").replace(/\D/g, ""), 10) || 0;
      if (numB !== numA) return numB - numA;
      return (b.date || "").localeCompare(a.date || "");
    });
  }, [rivalResults]);

  // Sincronizar formulario de asistencia cuando cambia la fecha o las sesiones guardadas
  useEffect(() => {
    const existing = attendanceSessions.find(
      (s) => s.date === attendanceDate && s.type === attendanceType
    );
    if (existing) {
      setAttendanceNotes(existing.notes || "");
      setAttendanceRecords(existing.records || {});
    } else {
      setAttendanceNotes("");
      const defaultMap = {};
      players.forEach((p) => {
        defaultMap[p.id] = "present";
      });
      setAttendanceRecords(defaultMap);
    }
  }, [attendanceDate, attendanceType, attendanceSessions, players]);

  // Estadísticas acumuladas de asistencia por jugador
  const playerAttendanceStats = useMemo(() => {
    const stats = {};
    players.forEach((p) => {
      stats[p.id] = { present: 0, justified: 0, absent: 0, total: 0, pct: 0 };
    });
    attendanceSessions.forEach((session) => {
      const recs = session.records || {};
      players.forEach((p) => {
        const status = recs[p.id];
        if (status) {
          stats[p.id].total += 1;
          if (status === "present") stats[p.id].present += 1;
          else if (status === "justified") stats[p.id].justified += 1;
          else if (status === "absent") stats[p.id].absent += 1;
        }
      });
    });
    Object.keys(stats).forEach((pid) => {
      const s = stats[pid];
      s.pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 100;
    });
    return stats;
  }, [players, attendanceSessions]);

  // ------------------------------------------
  // 7. ACCIONES CRUD Y CONTROL DE ENTRENADOR
  // ------------------------------------------
  const basePath = `artifacts/${appId}/public/data`;

  const handleToggleCoachMode = () => {
    if (coachMode) {
      setCoachMode(false);
      if (activeTab === 'asistencia') setActiveTab('inicio');
      showToast("Modo Entrenador bloqueado (Solo Lectura)");
    } else {
      setPinInput("");
      setPinError("");
      setShowCoachPinModal(true);
    }
  };

  const handleVerifyCoachPin = (e) => {
    e.preventDefault();
    const expectedPin = teamConfig.coachPin || "blanca2026";
    if (pinInput.trim() === expectedPin) {
      setCoachMode(true);
      setShowCoachPinModal(false);
      setPinInput("");
      setPinError("");
      showToast("Modo Entrenador activado");
    } else {
      setPinError("Clave incorrecta. Inténtalo de nuevo.");
    }
  };

  const handleVerifySitePin = (e) => {
    e.preventDefault();
    const entered = sitePinInput.trim();
    const expectedFamily = teamConfig.familyPin || "Viking@s2026";
    const expectedCoach = teamConfig.coachPin || "blanca2026";
    if (entered === expectedFamily) {
      setSiteUnlocked(true);
      setSitePinInput("");
      setSitePinError("");
    } else if (entered === expectedCoach) {
      setSiteUnlocked(true);
      setCoachMode(true);
      setSitePinInput("");
      setSitePinError("");
      showToast("Bienvenido, Entrenador");
    } else {
      setSitePinError("Clave incorrecta. Solicítala al entrenador del equipo.");
    }
  };

  const handleSaveTeamConfig = async (updatedConfig) => {
    try {
      await setDoc(doc(db, `${basePath}/team_config`, "main"), updatedConfig, { merge: true });
      if (updatedConfig.teamName) {
        const ownTeam = standings.find((t) => t.isOwn);
        if (ownTeam && ownTeam.name !== updatedConfig.teamName) {
          await updateDoc(doc(db, `${basePath}/standings`, ownTeam.id), { name: updatedConfig.teamName });
        }
      }
      setShowTeamSettingsModal(false);
      setShowNextMatchModal(false);
      showToast("Configuración guardada correctamente");
    } catch (err) {
      console.error(err);
      showToast("Error al guardar la configuración", "error");
    }
  };

  const handleQuickMatchBgUpload = (matchItem, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          await updateDoc(doc(db, `${basePath}/matches`, matchItem.id), {
            bgImageUrl: compressedDataUrl
          });
          showToast("Foto de fondo del resultado actualizada");
        } catch (err) {
          console.error(err);
          showToast("Error al guardar la foto del resultado", "error");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMatchBg = async (matchItem) => {
    try {
      await updateDoc(doc(db, `${basePath}/matches`, matchItem.id), {
        bgImageUrl: ""
      });
      showToast("Foto de fondo eliminada del resultado");
    } catch (err) {
      console.error(err);
      showToast("Error al quitar la foto", "error");
    }
  };

 const handleSaveMatch = async (matchData, shouldSyncStandings) => {
    try {
      const matchesRef = collection(db, `${basePath}/matches`);
      let nextMatchesList = [];
      if (editingMatch) {
        await updateDoc(doc(matchesRef, editingMatch.id), matchData);
        nextMatchesList = matches.map((m) => (m.id === editingMatch.id ? { ...m, ...matchData } : m));
        showToast("Partido y clasificación actualizados");
      } else {
        const docRef = await addDoc(matchesRef, matchData);
        nextMatchesList = [...matches, { id: docRef.id, ...matchData }];
        showToast("Partido añadido y clasificación actualizada");
      }

      if (shouldSyncStandings) {
        await syncStandingsFromAllResults(nextMatchesList, rivalResults);
      }

      setShowMatchModal(false);
      setEditingMatch(null);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar el partido", "error");
    }
  };

  const handleDeleteMatch = (matchId) => {
    setConfirmDialog({
      title: "Eliminar partido",
      message: "¿Seguro que quieres eliminar este partido del calendario?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `${basePath}/matches`, matchId));
          const remainingMatches = matches.filter((m) => m.id !== matchId);
          await syncStandingsFromAllResults(remainingMatches, rivalResults);
          showToast("Partido eliminado y clasificación recalculada");
        } catch (err) {
          console.error(err);
          showToast("Error al eliminar partido", "error");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSaveStandingTeam = async (teamData) => {
    try {
      const standingsRef = collection(db, `${basePath}/standings`);
      if (editingStandingTeam) {
        await updateDoc(doc(standingsRef, editingStandingTeam.id), teamData);
        showToast("Clasificación actualizada");
      } else {
        await addDoc(standingsRef, teamData);
        showToast("Equipo añadido a la tabla");
      }
      setShowTeamStandingModal(false);
      setEditingStandingTeam(null);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar equipo", "error");
    }
  };

  const handleDeleteStandingTeam = (team) => {
    setConfirmDialog({
      title: "Eliminar equipo de la tabla",
      message: `¿Quieres quitar a ${team.name} de la clasificación?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `${basePath}/standings`, team.id));
          showToast("Equipo eliminado");
        } catch (err) {
          console.error(err);
          showToast("Error al eliminar equipo", "error");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSavePlayer = async (playerData) => {
    try {
      const playersRef = collection(db, `${basePath}/players`);
      if (editingPlayer) {
        await updateDoc(doc(playersRef, editingPlayer.id), playerData);
        showToast("Ficha del jugador actualizada");
      } else {
        await addDoc(playersRef, playerData);
        showToast("Jugador añadido a la plantilla");
      }
      setShowPlayerModal(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar jugador", "error");
    }
  };

  const handleQuickStatPlayer = async (player, field, delta) => {
    try {
      const nextVal = Math.max(0, (Number(player[field]) || 0) + delta);
      await updateDoc(doc(db, `${basePath}/players`, player.id), { [field]: nextVal });
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar estadística", "error");
    }
  };

  const handleDeletePlayer = (player) => {
    setConfirmDialog({
      title: "Eliminar jugador",
      message: `¿Seguro que quieres dar de baja a ${player.name} (#${player.number})?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `${basePath}/players`, player.id));
          showToast("Jugador eliminado");
        } catch (err) {
          console.error(err);
          showToast("Error al eliminar jugador", "error");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSavePhoto = async (photoData) => {
    try {
      const photosRef = collection(db, `${basePath}/photos`);
      if (editingPhoto) {
        await updateDoc(doc(photosRef, editingPhoto.id), photoData);
        showToast("Foto y datos actualizados");
      } else {
        await addDoc(photosRef, photoData);
        showToast("Foto publicada en la galería");
      }
      setShowPhotoModal(false);
      setEditingPhoto(null);
    } catch (err) {
      console.error(err);
      showToast("Error al subir la foto", "error");
    }
  };

  const handleDeletePhoto = (photo) => {
    setConfirmDialog({
      title: "Borrar foto",
      message: `¿Quieres eliminar la foto "${photo.title}" de la galería?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `${basePath}/photos`, photo.id));
          if (lightboxPhoto?.id === photo.id) setLightboxPhoto(null);
          showToast("Foto eliminada");
        } catch (err) {
          console.error(err);
          showToast("Error al eliminar foto", "error");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSetPlayerAttendanceStatus = (playerId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [playerId]: status
    }));
  };

  const handleMarkAllAttendance = (status) => {
    const updated = {};
    players.forEach((p) => {
      updated[p.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendanceSession = async () => {
    try {
      const docId = `${attendanceDate}_${attendanceType.toLowerCase()}`;
      await setDoc(doc(db, `${basePath}/attendance`, docId), {
        date: attendanceDate,
        type: attendanceType,
        notes: attendanceNotes.trim(),
        records: attendanceRecords,
        updatedAt: new Date().toISOString()
      });
      showToast(`Asistencia del ${formatDateES(attendanceDate)} guardada`);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar la asistencia", "error");
    }
  };

  const handleDeleteAttendanceSession = (session) => {
    setConfirmDialog({
      title: "Eliminar registro de asistencia",
      message: `¿Quieres borrar el pase de lista del ${formatDateES(session.date)} (${session.type})?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `${basePath}/attendance`, session.id));
          showToast("Registro de asistencia eliminado");
        } catch (err) {
          console.error(err);
          showToast("Error al eliminar registro", "error");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

 const handleSaveRivalResult = async (resultData) => {
    try {
      const rivalRef = collection(db, `${basePath}/rival_results`);
      let nextRivalList = [];
      if (editingRivalResult) {
        await updateDoc(doc(rivalRef, editingRivalResult.id), resultData);
        nextRivalList = rivalResults.map((r) => (r.id === editingRivalResult.id ? { ...r, ...resultData } : r));
        showToast("Resultado actualizado en clasificación");
      } else {
        const docRef = await addDoc(rivalRef, resultData);
        nextRivalList = [...rivalResults, { id: docRef.id, ...resultData }];
        showToast("Resultado añadido a la clasificación");
      }
      await syncStandingsFromAllResults(matches, nextRivalList);
      setShowRivalResultModal(false);
      setEditingRivalResult(null);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar resultado de rivales", "error");
    }
  };

  const handleDeleteRivalResult = (item) => {
    setConfirmDialog({
      title: "Eliminar resultado de rivales",
      message: `¿Quieres borrar el partido ${item.home} vs ${item.away} (${item.round || 'Liga'})?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `${basePath}/rival_results`, item.id));
          const remainingRivals = rivalResults.filter((r) => r.id !== item.id);
          await syncStandingsFromAllResults(matches, remainingRivals);
          showToast("Resultado eliminado y tabla actualizada");
        } catch (err) {
          console.error(err);
          showToast("Error al eliminar resultado", "error");
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };



  // Exportar el historial completo de asistencia a archivo Excel (.xls)
  const handleExportAttendanceExcel = () => {
    if (sortedAttendanceSessions.length === 0) {
      showToast("No hay sesiones guardadas para exportar", "error");
      return;
    }

    const chronologicalSessions = [...sortedAttendanceSessions].reverse();
    const escapeHtml = (str) =>
      String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const sessionHeaders = chronologicalSessions
      .map(
        (s) =>
          `<th style="background:#0f172a;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">${escapeHtml(
            formatDateES(s.date)
          )}<br/><span style="font-size:10px;color:#34d399;">${escapeHtml(s.type)}</span></th>`
      )
      .join("");

    const playerRows = sortedPlayers
      .map((player) => {
        const stats = playerAttendanceStats[player.id] || {
          present: 0,
          justified: 0,
          absent: 0,
          total: 0,
          pct: 0
        };

        const cells = chronologicalSessions
          .map((session) => {
            const st = (session.records || {})[player.id];
            if (st === "present") {
              return `<td style="background:#dcfce7;color:#166534;font-weight:bold;text-align:center;border:1px solid #cbd5e1;padding:6px;">Asiste</td>`;
            }
            if (st === "justified") {
              return `<td style="background:#fef3c7;color:#92400e;font-weight:bold;text-align:center;border:1px solid #cbd5e1;padding:6px;">Justificada</td>`;
            }
            if (st === "absent") {
              return `<td style="background:#fee2e2;color:#991b1b;font-weight:bold;text-align:center;border:1px solid #cbd5e1;padding:6px;">Falta</td>`;
            }
            return `<td style="text-align:center;color:#94a3b8;border:1px solid #cbd5e1;padding:6px;">-</td>`;
          })
          .join("");

        return `
          <tr>
            <td style="text-align:center;font-weight:bold;border:1px solid #cbd5e1;padding:6px;">${escapeHtml(player.number)}</td>
            <td style="font-weight:bold;border:1px solid #cbd5e1;padding:6px;">${escapeHtml(player.name)}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;">${escapeHtml(player.position)}</td>
            ${cells}
            <td style="text-align:center;font-weight:bold;color:#166534;border:1px solid #cbd5e1;padding:6px;">${stats.present}</td>
            <td style="text-align:center;font-weight:bold;color:#92400e;border:1px solid #cbd5e1;padding:6px;">${stats.justified}</td>
            <td style="text-align:center;font-weight:bold;color:#991b1b;border:1px solid #cbd5e1;padding:6px;">${stats.absent}</td>
            <td style="text-align:center;font-weight:bold;background:#f1f5f9;border:1px solid #cbd5e1;padding:6px;">${
              stats.total > 0 ? `${stats.pct}%` : "-"
            }</td>
          </tr>
        `;
      })
      .join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8" /></head>
      <body>
        <table>
          <tr>
            <td colspan="${7 + chronologicalSessions.length}" style="font-size:16px;font-weight:bold;background:#064e3b;color:#ffffff;padding:10px;">
              CONTROL DE ASISTENCIA — ${escapeHtml(teamConfig.teamName)} (${escapeHtml(teamConfig.season)})
            </td>
          </tr>
          <tr>
            <th style="background:#0f172a;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">Dorsal</th>
            <th style="background:#0f172a;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">Jugador</th>
            <th style="background:#0f172a;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">Posición</th>
            ${sessionHeaders}
            <th style="background:#065f46;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">Total Asiste</th>
            <th style="background:#92400e;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">Justificadas</th>
            <th style="background:#991b1b;color:#ffffff;padding:8px;border:1px solid #cbd5e1;">Faltas</th>
            <th style="background:#1e293b;color:#34d399;padding:8px;border:1px solid #cbd5e1;">% Asistencia</th>
          </tr>
          ${playerRows}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", excelHtml], {
      type: "application/vnd.ms-excel;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `Asistencia_Vikingos_Blanca_FS_${todayStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Archivo Excel descargado correctamente");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">Cargando portal de {teamConfig.teamName}...</p>
      </div>
    );
  }

  if (!siteUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-1.5 mx-auto mb-5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <ClubCrest customLogoUrl={teamConfig.customLogoUrl} className="w-16 h-16" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-3">
            <Lock className="w-3.5 h-3.5" />
            Acceso Privado Autorizado
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {teamConfig.teamName}
          </h1>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            {teamConfig.clubName || "Blanca Fútbol Sala"} • {teamConfig.category}
          </p>

          <form onSubmit={handleVerifySitePin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Clave de Acceso a la Página
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Introduce la contraseña"
                value={sitePinInput}
                onChange={(e) => {
                  setSitePinInput(e.target.value);
                  if (sitePinError) setSitePinError("");
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
              {sitePinError && (
                <p className="text-xs font-semibold text-rose-400 mt-1.5">{sitePinError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition"
            >
              Entrar al Portal del Equipo
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans relative">
      {/* Capa fija de foto de fondo personalizada */}
      {teamConfig.backgroundImageUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={teamConfig.backgroundImageUrl}
            alt="Fondo del equipo"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Notificación Toast flotante */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white font-medium transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Diálogo de Confirmación Personalizado */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-slate-600 text-sm mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CABECERA PRINCIPAL Y NAVEGACIÓN
          ========================================== */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fila superior: Escudo, Nombre Equipo y Acceso Discreto de Entrenador */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <div className="flex items-center gap-3.5">
              <div
                onDoubleClick={() => {
                  if (!coachMode) {
                    setPinInput("");
                    setPinError("");
                    setShowCoachPinModal(true);
                  }
                }}
                className="w-14 h-14 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-slate-700 shrink-0 select-none"
              >
                <ClubCrest customLogoUrl={teamConfig.customLogoUrl} className="w-12 h-12" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {teamConfig.teamName}
                  </h1>
                  {coachMode && (
                    <button
                      onClick={() => setShowTeamSettingsModal(true)}
                      title="Editar datos del club y del equipo"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-emerald-400 font-medium">
                  {teamConfig.clubName || 'Blanca Fútbol Sala'} • {teamConfig.category} ({teamConfig.season})
                </p>
              </div>
            </div>

            {/* Solo visible cuando tú ya has iniciado sesión como entrenador */}
            {coachMode && (
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={handleToggleCoachMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/50"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Salir del Panel Entrenador</span>
                </button>
              </div>
            )}
          </div>

          {/* Barra de Navegación por Pestañas */}
          <nav className="flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 pb-0 -mb-px">
            {[
              { id: 'inicio', label: 'Resumen / Inicio', icon: LayoutDashboard },
              { id: 'resultados', label: 'Resultados y Partidos', icon: Calendar },
              { id: 'clasificacion', label: 'Clasificación', icon: Trophy },
              { id: 'galeria', label: 'Galería de Fotos', icon: Camera },
              { id: 'plantilla', label: 'Plantilla', icon: Users },
              ...(coachMode ? [{ id: 'asistencia', label: 'Asistencia (Privado)', icon: ClipboardCheck }] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-emerald-400 text-emerald-400 bg-slate-800/50 rounded-t-lg'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-t-lg'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ==========================================
          CONTENIDO PRINCIPAL SEGÚN PESTAÑA
          ========================================== */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {syncError && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 1: RESUMEN / INICIO
            ------------------------------------------ */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            {/* Fila Superior: Próximo Partido + Último Resultado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tarjeta Próximo Partido */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/80 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Calendar className="w-3.5 h-3.5" />
                    Próximo Partido • {teamConfig.nextMatch?.round || 'Jornada'}
                  </span>
                  {coachMode && (
                    <button
                      onClick={() => setShowNextMatchModal(true)}
                      className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-emerald-300 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                  )}
                </div>

                <div className="my-5 flex items-center justify-between gap-3">
                  <div className="flex-1 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mb-2 flex items-center justify-center">
                      {teamConfig.nextMatch?.isHome ? (
                        <ClubCrest customLogoUrl={teamConfig.customLogoUrl} className="w-13 h-13" />
                      ) : (
                        <TeamBadge
                          teamName={teamConfig.nextMatch?.opponent}
                          standings={standings}
                          ownTeamName={teamConfig.teamName}
                          ownLogoUrl={teamConfig.customLogoUrl}
                          size="lg"
                        />
                      )}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">Local</span>
                    <p className="text-sm sm:text-base font-extrabold leading-tight line-clamp-2">
                      {teamConfig.nextMatch?.isHome ? teamConfig.teamName : teamConfig.nextMatch?.opponent}
                    </p>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-black text-base shrink-0">
                    VS
                  </div>

                  <div className="flex-1 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mb-2 flex items-center justify-center">
                      {!teamConfig.nextMatch?.isHome ? (
                        <ClubCrest customLogoUrl={teamConfig.customLogoUrl} className="w-13 h-13" />
                      ) : (
                        <TeamBadge
                          teamName={teamConfig.nextMatch?.opponent}
                          standings={standings}
                          ownTeamName={teamConfig.teamName}
                          ownLogoUrl={teamConfig.customLogoUrl}
                          size="lg"
                        />
                      )}
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">Visitante</span>
                    <p className="text-sm sm:text-base font-extrabold leading-tight line-clamp-2">
                      {!teamConfig.nextMatch?.isHome ? teamConfig.teamName : teamConfig.nextMatch?.opponent}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>{formatDateES(teamConfig.nextMatch?.date)} • {teamConfig.nextMatch?.time} h</span>
                  </div>
                  <a
                    href={
                      teamConfig.nextMatch?.mapsUrl?.trim()
                        ? teamConfig.nextMatch.mapsUrl.trim()
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            teamConfig.nextMatch?.venue || 'Pabellón Municipal'
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir ubicación en Google Maps"
                    className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 underline decoration-emerald-500/50 underline-offset-2 font-semibold transition"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{teamConfig.nextMatch?.venue}</span>
                  </a>
                </div>
              </div>

              {/* Tarjeta Último Resultado Disputado */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Último Resultado {lastPlayedMatch ? `• ${lastPlayedMatch.round}` : ''}
                    </span>
                    <button
                      onClick={() => setActiveTab('resultados')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                    >
                      Ver todos <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {lastPlayedMatch ? (
                    <div className="my-4">
                      <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex-1 text-center flex flex-col items-center">
                          <div className="mb-1.5">
                            <TeamBadge
                              teamName={lastPlayedMatch.isHome ? teamConfig.teamName : lastPlayedMatch.opponent}
                              standings={standings}
                              ownTeamName={teamConfig.teamName}
                              ownLogoUrl={teamConfig.customLogoUrl}
                              size="md"
                            />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
                            {lastPlayedMatch.isHome ? teamConfig.teamName : lastPlayedMatch.opponent}
                          </p>
                          <span className="text-[11px] text-slate-400">Local</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-2xl shadow-inner">
                          <span className={lastPlayedMatch.isHome ? 'text-emerald-400' : 'text-white'}>
                            {lastPlayedMatch.isHome ? lastPlayedMatch.gf : lastPlayedMatch.gc}
                          </span>
                          <span className="text-slate-500 text-base">-</span>
                          <span className={!lastPlayedMatch.isHome ? 'text-emerald-400' : 'text-white'}>
                            {lastPlayedMatch.isHome ? lastPlayedMatch.gc : lastPlayedMatch.gf}
                          </span>
                        </div>

                        <div className="flex-1 text-center flex flex-col items-center">
                          <div className="mb-1.5">
                            <TeamBadge
                              teamName={!lastPlayedMatch.isHome ? teamConfig.teamName : lastPlayedMatch.opponent}
                              standings={standings}
                              ownTeamName={teamConfig.teamName}
                              ownLogoUrl={teamConfig.customLogoUrl}
                              size="md"
                            />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
                            {!lastPlayedMatch.isHome ? teamConfig.teamName : lastPlayedMatch.opponent}
                          </p>
                          <span className="text-[11px] text-slate-400">Visitante</span>
                        </div>
                      </div>

                      {lastPlayedMatch.scorers && (
                        <p className="mt-3 text-xs text-slate-600 bg-emerald-50/70 border border-emerald-100 px-3 py-2 rounded-lg">
                          <strong className="text-emerald-800">⚽ Goleadores:</strong> {lastPlayedMatch.scorers}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      Aún no hay partidos disputados registrados.
                    </div>
                  )}
                </div>

                {/* Racha de últimos 5 partidos */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Racha reciente:</span>
                  <div className="flex items-center gap-1.5">
                    {recentForm.map((item, idx) => (
                      <span
                        key={idx}
                        title={`${item.label} vs ${item.match.opponent} (${item.match.gf}-${item.match.gc})`}
                        className={`w-6 h-6 rounded-md text-xs font-extrabold flex items-center justify-center shadow-xs ${item.color}`}
                      >
                        {item.res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Media: Mini-Clasificación + Estadísticas Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tarjeta Posición en Tabla */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Situación en Liga
                    </h3>
                    <button
                      onClick={() => setActiveTab('clasificacion')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Tabla completa
                    </button>
                  </div>

                  {ownTeamStanding ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                          <span className="text-2xl font-black leading-none">{ownTeamStanding.position}º</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Puesto</span>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-base">{ownTeamStanding.name}</p>
                          <p className="text-sm text-emerald-800 font-bold">
                            {ownTeamStanding.pts} Puntos <span className="font-normal text-slate-600">({ownTeamStanding.pj} partidos)</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-lg font-extrabold text-emerald-600 block">{ownTeamStanding.g}</span>
                          <span className="text-[11px] font-semibold text-slate-500">Victorias</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-lg font-extrabold text-amber-600 block">{ownTeamStanding.e}</span>
                          <span className="text-[11px] font-semibold text-slate-500">Empates</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-lg font-extrabold text-slate-700 block">
                            {ownTeamStanding.dg > 0 ? `+${ownTeamStanding.dg}` : ownTeamStanding.dg}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">Dif. Goles</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Equipo no encontrado en la clasificación.</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Goles a favor: <strong className="text-slate-800">{ownTeamStanding?.gf || 0}</strong></span>
                  <span>Goles en contra: <strong className="text-slate-800">{ownTeamStanding?.gc || 0}</strong></span>
                </div>
              </div>

              {/* Vista Previa de Galería */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    Últimas Fotos del Equipo
                  </h3>
                  <div className="flex items-center gap-3">
                    {coachMode && (
                      <button
                        onClick={() => {
                          setEditingPhoto(null);
                          setShowPhotoModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Subir Foto
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('galeria')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                    >
                      Ir a la galería <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {sortedPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {sortedPhotos.slice(0, 3).map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 cursor-pointer"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          onClick={() => setLightboxPhoto(photo)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {coachMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPhoto(photo);
                              setShowPhotoModal(true);
                            }}
                            className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/85 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-md transition"
                          >
                            <Camera className="w-3 h-3" />
                            Cambiar Foto
                          </button>
                        )}
                        <div
                          onClick={() => setLightboxPhoto(photo)}
                          className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent flex flex-col justify-end p-3"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            {photo.category}
                          </span>
                          <p className="text-white text-xs font-bold line-clamp-1">{photo.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Todavía no hay fotos subidas en la galería.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 2: RESULTADOS Y PARTIDOS
            ------------------------------------------ */}
        {activeTab === 'resultados' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Calendario y Resultados</h2>
                <p className="text-sm text-slate-500">
                  Temporada oficial de {teamConfig.teamName} ({sortedMatches.length} jornadas)
                </p>
              </div>
              {coachMode && (
                <button
                  onClick={() => {
                    setEditingMatch(null);
                    setShowMatchModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <Plus className="w-5 h-5" />
                  Subir Nuevo Partido / Resultado
                </button>
              )}
            </div>

            {/* Listado completo de todos los partidos de VIKINGOS SONDOS BLANCA FS con desplegable privado de rivales por jornada */}
            <div className="space-y-4">
              {sortedMatches.map((m) => {
                const isPlayed = m.status === 'played';
                const isBye = (m.opponent || '').trim().toUpperCase() === 'DESCANSA';
                const gf = Number(m.gf) || 0;
                const gc = Number(m.gc) || 0;
                const resultBadge = !isPlayed
                  ? { text: 'Pendiente de jugar', cls: 'bg-slate-100 text-slate-600' }
                  : gf > gc
                  ? { text: 'Victoria', cls: 'bg-emerald-100 text-emerald-800' }
                  : gf === gc
                  ? { text: 'Empate', cls: 'bg-amber-100 text-amber-800' }
                  : { text: 'Derrota', cls: 'bg-rose-100 text-rose-800' };

                const homeTeam = m.isHome ? teamConfig.teamName : m.opponent;
                const awayTeam = m.isHome ? m.opponent : teamConfig.teamName;
                const hasBg = Boolean(m.bgImageUrl);

                // Partidos de los rivales correspondientes a esta misma jornada
                const roundRivals = sortedRivalResults.filter(
                  (r) => (r.round || '').trim().toLowerCase() === (m.round || '').trim().toLowerCase()
                );
                const isRoundOpen = Boolean(expandedRoundRivals[m.round]);

                return (
                  <div
                    key={m.id}
                    className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm border transition ${
                      hasBg
                        ? 'bg-slate-900 text-white border-slate-700'
                        : isPlayed
                        ? 'bg-white border-slate-200'
                        : 'bg-white border-dashed border-slate-300'
                    }`}
                  >
                    {hasBg && (
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        <img
                          src={m.bgImageUrl}
                          alt={`Fondo ${m.round}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
                      </div>
                    )}

                    <div className={`relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b text-xs ${
                      hasBg ? 'border-white/20' : 'border-slate-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          hasBg ? 'bg-white/15 text-white' : 'text-slate-900 bg-slate-100'
                        }`}>
                          {m.round}
                        </span>
                        <span className={hasBg ? 'text-slate-200 font-medium' : 'text-slate-500 font-medium'}>
                          {formatDateES(m.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isBye && (
                          <span className={`px-2.5 py-0.5 rounded-full font-bold ${resultBadge.cls}`}>
                            {resultBadge.text}
                          </span>
                        )}
                        {coachMode && (
                          <div className="flex items-center gap-1 ml-1">
                            {isPlayed && !isBye && (
                              <>
                                <label
                                  title="Poner o cambiar foto de fondo del resultado"
                                  className={`cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                                    hasBg
                                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                                  }`}
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>{hasBg ? 'Cambiar Fondo' : 'Foto Fondo'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleQuickMatchBgUpload(m, e)}
                                    className="hidden"
                                  />
                                </label>
                                {hasBg && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMatchBg(m)}
                                    title="Quitar foto de fondo"
                                    className="p-1.5 rounded-lg bg-white/15 hover:bg-rose-600 text-white transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => {
                                setEditingMatch(m);
                                setShowMatchModal(true);
                              }}
                              title="Editar resultado o fecha"
                              className={`p-1.5 rounded-lg transition ${
                                hasBg
                                  ? 'text-white/80 hover:text-white hover:bg-white/15'
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMatch(m.id)}
                              title="Eliminar partido"
                              className={`p-1.5 rounded-lg transition ${
                                hasBg
                                  ? 'text-white/80 hover:text-rose-300 hover:bg-white/15'
                                  : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isBye ? (
                      <div className="relative z-10 py-2 text-center text-sm font-semibold text-slate-500">
                        Jornada de descanso para {teamConfig.teamName}
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-between gap-3">
                        {/* Equipo Local */}
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                          <TeamBadge
                            teamName={homeTeam}
                            standings={standings}
                            ownTeamName={teamConfig.teamName}
                            ownLogoUrl={teamConfig.customLogoUrl}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm truncate ${
                              hasBg
                                ? 'font-extrabold text-white drop-shadow-sm'
                                : m.isHome
                                ? 'font-extrabold text-slate-900'
                                : 'font-semibold text-slate-700'
                            }`}>
                              {homeTeam}
                            </p>
                            <span className={`text-[11px] ${hasBg ? 'text-slate-300' : 'text-slate-400'}`}>Local</span>
                          </div>
                        </div>

                        {/* Marcador o VS */}
                        <div className="shrink-0">
                          {isPlayed ? (
                            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-base sm:text-lg ${
                              hasBg ? 'bg-slate-950/85 border border-white/20 text-white shadow-lg' : 'bg-slate-900 text-white'
                            }`}>
                              <span className={m.isHome ? 'text-emerald-400' : 'text-white'}>
                                {m.isHome ? gf : gc}
                              </span>
                              <span className="text-slate-500 text-xs">-</span>
                              <span className={!m.isHome ? 'text-emerald-400' : 'text-white'}>
                                {m.isHome ? gc : gf}
                              </span>
                            </div>
                          ) : (
                            <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-500 font-extrabold text-xs">
                              VS
                            </div>
                          )}
                        </div>

                        {/* Equipo Visitante */}
                        <div className="flex-1 flex items-center justify-end gap-3 min-w-0 text-right">
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm truncate ${
                              hasBg
                                ? 'font-extrabold text-white drop-shadow-sm'
                                : !m.isHome
                                ? 'font-extrabold text-slate-900'
                                : 'font-semibold text-slate-700'
                            }`}>
                              {awayTeam}
                            </p>
                            <span className={`text-[11px] ${hasBg ? 'text-slate-300' : 'text-slate-400'}`}>Visitante</span>
                          </div>
                          <TeamBadge
                            teamName={awayTeam}
                            standings={standings}
                            ownTeamName={teamConfig.teamName}
                            ownLogoUrl={teamConfig.customLogoUrl}
                            size="md"
                          />
                        </div>
                      </div>
                    )}

                    {isPlayed && m.scorers && (
                      <div className={`relative z-10 mt-3 pt-2.5 border-t text-xs ${
                        hasBg ? 'border-white/20 text-slate-100' : 'border-slate-100 text-slate-600'
                      }`}>
                        <span className={`font-bold ${hasBg ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          ⚽ Goleadores / Notas:{' '}
                        </span>
                        {m.scorers}
                      </div>
                    )}

                    {/* Desplegable privado de los resultados de los rivales en esta jornada (SOLO ENTRENADOR) */}
                    {coachMode && (
                      <div className={`relative z-10 mt-3.5 pt-3 border-t ${hasBg ? 'border-white/20' : 'border-slate-100'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRoundRivals((prev) => ({
                                ...prev,
                                [m.round]: !prev[m.round]
                              }))
                            }
                            className={`inline-flex items-center gap-2 text-xs font-extrabold px-3 py-1.5 rounded-xl transition ${
                              hasBg
                                ? 'bg-slate-950/75 text-emerald-300 hover:bg-slate-950'
                                : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>
                              Resultados del Grupo • {m.round} ({roundRivals.length})
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${isRoundOpen ? 'rotate-90' : ''}`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingRivalResult(null);
                              setDefaultRivalRound(m.round);
                              setDefaultRivalDate(m.date);
                              setShowRivalResultModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Subir resultado rival ({m.round})
                          </button>
                        </div>

                        {isRoundOpen && (
                          <div className="mt-3 rounded-xl bg-slate-900/95 text-white border border-slate-800 p-3.5 divide-y divide-slate-800">
                            {roundRivals.length > 0 ? (
                              roundRivals.map((r) => (
                                <div
                                  key={r.id}
                                  className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex-1 flex items-center gap-2 min-w-0">
                                    <TeamBadge
                                      teamName={r.home}
                                      standings={standings}
                                      ownTeamName={teamConfig.teamName}
                                      ownLogoUrl={teamConfig.customLogoUrl}
                                      size="sm"
                                    />
                                    <span className="font-semibold text-slate-100 truncate">{r.home}</span>
                                  </div>

                                  <div className="shrink-0 self-center">
                                    {r.isBye ? (
                                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold text-[11px]">
                                        Descansa
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black">
                                        {r.scoreHome} - {r.scoreAway}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex-1 flex items-center sm:justify-end gap-2 min-w-0">
                                    <span className="font-semibold text-slate-100 truncate sm:text-right">
                                      {r.away}
                                    </span>
                                    <TeamBadge
                                      teamName={r.away}
                                      standings={standings}
                                      ownTeamName={teamConfig.teamName}
                                      ownLogoUrl={teamConfig.customLogoUrl}
                                      size="sm"
                                    />
                                  </div>

                                  <div className="flex items-center justify-end gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRivalResult(r);
                                        setShowRivalResultModal(true);
                                      }}
                                      title="Editar resultado"
                                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRivalResult(r)}
                                      title="Borrar resultado"
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-xs text-slate-400 py-2">
                                Aún no has subido resultados de rivales en la {m.round}. Pulsa en{' '}
                                <strong className="text-emerald-400">+ Subir resultado rival ({m.round})</strong>.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 3: CLASIFICACIÓN
            ------------------------------------------ */}
        {activeTab === 'clasificacion' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Clasificación de Liga</h2>
                <p className="text-sm text-slate-500">Ordenada automáticamente por Puntos y Diferencia de Goles</p>
              </div>
             {coachMode && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={async () => {
                      await syncStandingsFromAllResults(matches, rivalResults);
                      showToast("Clasificación recalculada desde los partidos actuales");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-sm shadow-sm transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recalcular desde Partidos
                  </button>
                </div>
)}
            {/* Tabla Responsiva */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 text-xs uppercase tracking-wider">
                      <th className="py-4 px-4 text-center w-14">Pos</th>
                      <th className="py-4 px-4">Equipo</th>
                      <th className="py-4 px-3 text-center" title="Partidos Jugados">PJ</th>
                      <th className="py-4 px-3 text-center" title="Ganados">G</th>
                      <th className="py-4 px-3 text-center" title="Empatados">E</th>
                      <th className="py-4 px-3 text-center" title="Perdidos">P</th>
                      <th className="py-4 px-3 text-center hidden sm:table-cell" title="Goles a Favor">GF</th>
                      <th className="py-4 px-3 text-center hidden sm:table-cell" title="Goles en Contra">GC</th>
                      <th className="py-4 px-3 text-center" title="Diferencia de Goles">DG</th>
                      <th className="py-4 px-4 text-center bg-slate-800 text-emerald-400 font-black">PTS</th>
                      {coachMode && <th className="py-4 px-4 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {sortedStandings.map((team, index) => {
                      const pos = index + 1;
                      const isOwn = team.isOwn;
                      return (
                        <tr
                          key={team.id}
                          className={`transition ${
                            isOwn
                              ? 'bg-emerald-50/90 font-semibold text-slate-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                                pos === 1
                                  ? 'bg-amber-400 text-slate-950'
                                  : pos <= 3
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {pos}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <TeamBadge
                                teamName={team.name}
                                standings={standings}
                                ownTeamName={teamConfig.teamName}
                                ownLogoUrl={teamConfig.customLogoUrl}
                                size="sm"
                              />
                              <span className={isOwn ? 'font-extrabold text-emerald-950' : 'font-medium'}>
                                {team.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">{team.pj}</td>
                          <td className="py-3.5 px-3 text-center text-emerald-700 font-medium">{team.g}</td>
                          <td className="py-3.5 px-3 text-center text-amber-700">{team.e}</td>
                          <td className="py-3.5 px-3 text-center text-rose-700">{team.p}</td>
                          <td className="py-3.5 px-3 text-center hidden sm:table-cell">{team.gf}</td>
                          <td className="py-3.5 px-3 text-center hidden sm:table-cell">{team.gc}</td>
                          <td className="py-3.5 px-3 text-center font-medium">
                            {team.dg > 0 ? `+${team.dg}` : team.dg}
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-base text-slate-900 bg-slate-50/60">
                            {team.pts}
                          </td>
                          {coachMode && (
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setEditingStandingTeam(team);
                                  setShowTeamStandingModal(true);
                                }}
                                title="Editar estadísticas del equipo"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-100/60 transition mr-1"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {!team.isOwn && (
                                <button
                                  onClick={() => handleDeleteStandingTeam(team)}
                                  title="Eliminar equipo"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-100/60 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 4: GALERÍA DE FOTOS
            ------------------------------------------ */}
        {activeTab === 'galeria' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Galería del Equipo</h2>
                <p className="text-sm text-slate-500">Recuerdos de partidos, torneos y entrenamientos de la temporada</p>
              </div>
              {coachMode && (
                <button
                  onClick={() => {
                    setEditingPhoto(null);
                    setShowPhotoModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <Plus className="w-5 h-5" />
                  Subir Foto
                </button>
              )}
            </div>

            {sortedPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col group"
                  >
                    <div
                      onClick={() => setLightboxPhoto(photo)}
                      className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-slate-900/80 text-emerald-400 backdrop-blur-sm">
                        {photo.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{photo.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDateES(photo.date)}</p>
                      </div>
                      {coachMode && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingPhoto(photo);
                              setShowPhotoModal(true);
                            }}
                            title="Cambiar foto o título"
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(photo)}
                            title="Borrar foto"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">La galería está vacía</h3>
                <p className="text-sm text-slate-500 mt-1">Sube la primera foto del equipo desde el botón superior.</p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 5: PLANTILLA (JUGADORES)
            ------------------------------------------ */}
        {activeTab === 'plantilla' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Plantilla Benjamín ({sortedPlayers.length} Jugadores)</h2>
                <p className="text-sm text-slate-500">Gestiona los dorsales, demarcaciones y estadísticas de goles y asistencias</p>
              </div>
              {coachMode && (
                <button
                  onClick={() => {
                    setEditingPlayer(null);
                    setShowPlayerModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <Plus className="w-5 h-5" />
                  Añadir Jugador
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-emerald-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 font-black text-xl flex items-center justify-center shadow-sm">
                        {player.number}
                      </div>
                      {coachMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPlayer(player);
                              setShowPlayerModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-extrabold text-slate-900">{player.name}</h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                        {player.position}
                      </span>
                    </div>
                  </div>

                  {/* Contadores de Goles y Asistencias */}
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">Goles</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {coachMode && (
                          <button
                            onClick={() => handleQuickStatPlayer(player, 'goals', -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                          >
                            -
                          </button>
                        )}
                        <span className="text-lg font-black text-slate-900">{player.goals || 0}</span>
                        {coachMode && (
                          <button
                            onClick={() => handleQuickStatPlayer(player, 'goals', 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">Asistencias</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {coachMode && (
                          <button
                            onClick={() => handleQuickStatPlayer(player, 'assists', -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                          >
                            -
                          </button>
                        )}
                        <span className="text-lg font-black text-slate-900">{player.assists || 0}</span>
                        {coachMode && (
                          <button
                            onClick={() => handleQuickStatPlayer(player, 'assists', 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-white hover:bg-slate-700 font-bold text-xs"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 6: CONTROL DE ASISTENCIA (SOLO PANEL ENTRENADOR)
            ------------------------------------------ */}
        {coachMode && activeTab === 'asistencia' && (
          <div className="space-y-6">
            {/* Cabecera privada */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  Solo visible en Panel de Entrenador
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold">Control de Asistencia</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Pasa lista en entrenamientos o partidos y consulta el porcentaje de asistencia de cada jugador.
                </p>
              </div>
              <button
                onClick={handleSaveAttendanceSession}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-md transition shrink-0"
              >
                <Save className="w-4 h-4" />
                Guardar Pase de Lista
              </button>
            </div>

            {/* Selector de Fecha, Sesión y Acciones Rápidas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha de la sesión</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo de convocatoria</label>
                  <select
                    value={attendanceType}
                    onChange={(e) => setAttendanceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Entrenamiento">Entrenamiento</option>
                    <option value="Partido">Partido Oficial / Amistoso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notas (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Pabellón Municipal, físico..."
                    value={attendanceNotes}
                    onChange={(e) => setAttendanceNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Barra resumen del día y botones rápidos */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Presentes: {Object.values(attendanceRecords).filter((v) => v === 'present').length}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    Justificados: {Object.values(attendanceRecords).filter((v) => v === 'justified').length}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    Faltas: {Object.values(attendanceRecords).filter((v) => v === 'absent').length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAllAttendance('present')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-bold transition"
                  >
                    Marcar todos Presentes
                  </button>
                </div>
              </div>

              {/* Listado de los 12 jugadores para pasar lista */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {sortedPlayers.map((player) => {
                  const currentStatus = attendanceRecords[player.id] || 'present';
                  const pStats = playerAttendanceStats[player.id] || { present: 0, total: 0, pct: 100 };
                  return (
                    <div
                      key={player.id}
                      className="p-3.5 sm:p-4 bg-white hover:bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                          {player.number}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{player.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {player.position} • Asistencia temporada:{' '}
                            <span className={`font-bold ${pStats.pct >= 80 ? 'text-emerald-600' : pStats.pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {pStats.total > 0 ? `${pStats.pct}% (${pStats.present}/${pStats.total})` : 'Sin registros'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Botones de estado */}
                      <div className="grid grid-cols-3 gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleSetPlayerAttendanceStatus(player.id, 'present')}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Asiste</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetPlayerAttendanceStatus(player.id, 'justified')}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                            currentStatus === 'justified'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>Justif.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetPlayerAttendanceStatus(player.id, 'absent')}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Falta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAttendanceSession}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Asistencia del Día
                </button>
              </div>
            </div>

            {/* Historial de sesiones guardadas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Historial de Sesiones Guardadas</h3>
                  <p className="text-xs text-slate-500">Pulsa sobre cualquier día anterior para revisarlo o modificarlo.</p>
                </div>
                {sortedAttendanceSessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportAttendanceExcel}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Exportar a Excel (.xls)
                  </button>
                )}
              </div>

              {sortedAttendanceSessions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {sortedAttendanceSessions.map((session) => {
                    const recs = Object.values(session.records || {});
                    const presentCount = recs.filter((v) => v === 'present').length;
                    const justifiedCount = recs.filter((v) => v === 'justified').length;
                    const absentCount = recs.filter((v) => v === 'absent').length;

                    return (
                      <div
                        key={session.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div
                          onClick={() => {
                            setAttendanceDate(session.date);
                            setAttendanceType(session.type);
                          }}
                          className="cursor-pointer flex-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {formatDateES(session.date)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              session.type === 'Partido'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-700'
                            }}>
                              {session.type}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-xs text-slate-500 mt-0.5">{session.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                            {presentCount} Asisten
                          </span>
                          {justifiedCount > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">
                              {justifiedCount} Justif.
                            </span>
                          )}
                          {absentCount > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700">
                              {absentCount} Faltas
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setAttendanceDate(session.date);
                              setAttendanceType(session.type);
                            }}
                            title="Editar este día"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttendanceSession(session)}
                            title="Eliminar este registro"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                    Aún no hay ningún pase de lista guardado. Elige la fecha arriba y pulsa en <strong>Guardar Asistencia del Día</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Pie de página */}
      <footer className="relative z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <p>{teamConfig.clubName || 'Blanca Fútbol Sala'} — {teamConfig.teamName} • Portal Oficial de Gestión Deportiva ({teamConfig.season})</p>
      </footer>

      {/* ==========================================
          7. MODALES DE EDICIÓN Y FORMULARIOS
          ========================================== */}

      {/* MODAL A: Ajustes Generales del Equipo */}
      {showTeamSettingsModal && (
        <TeamSettingsModal
          config={teamConfig}
          onClose={() => setShowTeamSettingsModal(false)}
          onSave={handleSaveTeamConfig}
        />
      )}

      {/* MODAL B: Editar Próximo Partido */}
      {showNextMatchModal && (
        <NextMatchModal
          config={teamConfig}
          onClose={() => setShowNextMatchModal(false)}
          onSave={handleSaveTeamConfig}
        />
      )}

      {/* MODAL C: Añadir / Editar Partido */}
      {showMatchModal && (
        <MatchFormModal
          match={editingMatch}
          teamName={teamConfig.teamName}
          onClose={() => {
            setShowMatchModal(false);
            setEditingMatch(null);
          }}
          onSave={handleSaveMatch}
        />
      )}

      {/* MODAL D: Añadir / Editar Equipo en Clasificación */}
      {showTeamStandingModal && (
        <StandingTeamModal
          team={editingStandingTeam}
          onClose={() => {
            setShowTeamStandingModal(false);
            setEditingStandingTeam(null);
          }}
          onSave={handleSaveStandingTeam}
        />
      )}

      {/* MODAL E: Añadir / Editar Jugador */}
      {showPlayerModal && (
        <PlayerFormModal
          player={editingPlayer}
          onClose={() => {
            setShowPlayerModal(false);
            setEditingPlayer(null);
          }}
          onSave={handleSavePlayer}
        />
      )}

      {/* MODAL F: Subir Foto con Compresión Automática */}
      {showPhotoModal && (
        <PhotoUploadModal
          photo={editingPhoto}
          onClose={() => {
            setShowPhotoModal(false);
            setEditingPhoto(null);
          }}
          onSave={handleSavePhoto}
        />
      )}

      {/* MODAL G2: Añadir / Editar Resultado de Rivales (Privado Entrenador) */}
      {showRivalResultModal && (
        <RivalResultModal
          item={editingRivalResult}
          defaultRound={defaultRivalRound}
          defaultDate={defaultRivalDate}
          standings={standings}
          onClose={() => {
            setShowRivalResultModal(false);
            setEditingRivalResult(null);
          }}
          onSave={handleSaveRivalResult}
        />
      )}

      {/* MODAL G: Clave de Acceso para Modo Entrenador */}
      {showCoachPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Acceso Entrenador</h3>
              </div>
              <button
                onClick={() => setShowCoachPinModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Introduce tu clave de entrenador para desbloquear la edición de resultados, clasificación, fotos y plantilla.
            </p>
            <form onSubmit={handleVerifyCoachPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Contraseña / PIN
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Introduce la clave"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
                {pinError && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5">{pinError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCoachPinModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX: Ver Foto en Grande */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
          >
            <div className="relative bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 flex items-center justify-between text-white">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-400">{lightboxPhoto.category}</span>
                <h3 className="text-lg font-bold">{lightboxPhoto.title}</h3>
                <p className="text-xs text-slate-400">{formatDateES(lightboxPhoto.date)}</p>
              </div>
              {coachMode && (
                <button
                  onClick={() => handleDeletePhoto(lightboxPhoto)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. COMPONENTES DE FORMULARIOS MODALES
// ==========================================

function TeamSettingsModal({ config, onClose, onSave }) {
  const [clubName, setClubName] = useState(config.clubName || 'Blanca Fútbol Sala');
  const [teamName, setTeamName] = useState(config.teamName || 'VIKINGOS SONDOS BLANCA FS');
  const [category, setCategory] = useState(config.category || 'Primera Benjamín F.S., Grupo Único');
  const [season, setSeason] = useState(config.season || 'Temporada 2026-2027');
  const [customLogoUrl, setCustomLogoUrl] = useState(config.customLogoUrl || '');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(config.backgroundImageUrl || '');
  const [familyPin, setFamilyPin] = useState(config.familyPin || 'Viking@s2026');
  const [coachPin, setCoachPin] = useState(config.coachPin || 'blanca2026');
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setCustomLogoUrl(canvas.toDataURL('image/png'));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleBgFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBackgroundImageUrl(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...config,
      clubName,
      teamName,
      category,
      season,
      customLogoUrl,
      backgroundImageUrl,
      familyPin: familyPin.trim() || 'Viking@s2026',
      coachPin: coachPin.trim() || 'blanca2026'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">Configuración del Club y Equipo</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
              <ClubCrest customLogoUrl={customLogoUrl} className="w-14 h-14" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Escudo del Club</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setCustomLogoUrl('')}
                  className="mt-1 text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Restaurar escudo oficial por defecto
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-500">
              Foto de Fondo de la Web (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBgFileChange}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {backgroundImageUrl && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <img
                  src={backgroundImageUrl}
                  alt="Vista previa fondo"
                  className="h-12 w-20 object-cover rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setBackgroundImageUrl('')}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Quitar foto de fondo
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre del Club</label>
            <input
              type="text"
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre del Equipo</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoría / Grupo</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Temporada</label>
            <input
              type="text"
              required
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Clave de Acceso a la Web (Familias / Invitados)</label>
            <input
              type="text"
              required
              value={familyPin}
              onChange={(e) => setFamilyPin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">La contraseña que necesitan para entrar a ver la página.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Clave / PIN de Entrenador</label>
            <input
              type="text"
              required
              value={coachPin}
              onChange={(e) => setCoachPin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Solo quien conozca esta clave podrá editar datos y ver las pestañas privadas.</p>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NextMatchModal({ config, onClose, onSave }) {
  const nm = config.nextMatch || {};
  const [round, setRound] = useState(nm.round || 'Jornada 2');
  const [opponent, setOpponent] = useState(nm.opponent || '');
  const [date, setDate] = useState(nm.date || '');
  const [time, setTime] = useState(nm.time || '10:00');
  const [venue, setVenue] = useState(nm.venue || '');
  const [mapsUrl, setMapsUrl] = useState(nm.mapsUrl || '');
  const [isHome, setIsHome] = useState(nm.isHome ?? false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...config,
      nextMatch: { round, opponent, date, time, venue, mapsUrl, isHome }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">Editar Próximo Partido</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Jornada</label>
              <input
                type="text"
                required
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Condición</label>
              <select
                value={isHome ? 'home' : 'away'}
                onChange={(e) => setIsHome(e.target.value === 'home')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="home">Jugamos en Casa (Local)</option>
                <option value="away">Jugamos Fuera (Visitante)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Equipo Rival</label>
            <input
              type="text"
              required
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Hora</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pabellón / Pista</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Enlace directo Google Maps (Opcional)
            </label>
            <input
              type="url"
              placeholder="Si lo dejas vacío, buscará el pabellón automáticamente"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
              Guardar Próximo Partido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MatchFormModal({ match, teamName, onClose, onSave }) {
  const [round, setRound] = useState(match?.round || 'Jornada 2');
  const [opponent, setOpponent] = useState(match?.opponent || '');
  const [date, setDate] = useState(match?.date || new Date().toISOString().split('T')[0]);
  const [isHome, setIsHome] = useState(match?.isHome ?? true);
  const [status, setStatus] = useState(match?.status || 'played');
  const [gf, setGf] = useState(match?.gf ?? 0);
  const [gc, setGc] = useState(match?.gc ?? 0);
  const [scorers, setScorers] = useState(match?.scorers || '');
  const [bgImageUrl, setBgImageUrl] = useState(match?.bgImageUrl || '');
  const [syncStandings, setSyncStandings] = useState(true);

  const handleMatchBgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBgImageUrl(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
      { round, opponent, date, isHome, status, gf: Number(gf), gc: Number(gc), scorers, bgImageUrl },
      status === 'played' && syncStandings
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {match ? 'Editar Partido / Resultado' : 'Subir Nuevo Resultado'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Jornada / Torneo</label>
              <input
                type="text"
                required
                placeholder="Ej: Jornada 2"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Condición</label>
              <select
                value={isHome ? 'home' : 'away'}
                onChange={(e) => setIsHome(e.target.value === 'home')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="home">Local ({teamName})</option>
                <option value="away">Visitante ({teamName})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="played">Finalizado (Con Resultado)</option>
                <option value="scheduled">Pendiente / Programado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Equipo Rival</label>
            <input
              type="text"
              required
              placeholder="Nombre del equipo rival"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {status === 'played' && (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-700 mb-1">
                    Goles {teamName}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={gf}
                    onChange={(e) => setGf(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-lg font-black text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Goles Rival
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={gc}
                    onChange={(e) => setGc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-lg font-black text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Goleadores y Notas del Partido
                </label>
                <input
                  type="text"
                  placeholder="Ej: Leon (2), Diego (1), Abril (1)"
                  value={scorers}
                  onChange={(e) => setScorers(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Foto de Fondo del Resultado (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMatchBgChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {bgImageUrl && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <img
                      src={bgImageUrl}
                      alt="Vista previa fondo resultado"
                      className="h-12 w-20 object-cover rounded-lg border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setBgImageUrl('')}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Quitar foto de fondo
                    </button>
                  </div>
                )}
              </div>

              
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncStandings}
                    onChange={(e) => setSyncStandings(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-emerald-900">
                    Sumar automáticamente estos puntos y goles a {teamName} en la Clasificación
                  </span>
                </label>
              
            </>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
              Guardar Partido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StandingTeamModal({ team, onClose, onSave }) {
  const [name, setName] = useState(team?.name || '');
  const [logoUrl, setLogoUrl] = useState(team?.logoUrl || '');
  const [pj, setPj] = useState(team?.pj ?? 0);
  const [g, setG] = useState(team?.g ?? 0);
  const [e, setE] = useState(team?.e ?? 0);
  const [p, setP] = useState(team?.p ?? 0);
  const [gf, setGf] = useState(team?.gf ?? 0);
  const [gc, setGc] = useState(team?.gc ?? 0);

  const handleTeamLogoChange = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 160;
        const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setLogoUrl(canvas.toDataURL('image/png'));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    onSave({
      name,
      logoUrl,
      pj: Number(pj),
      g: Number(g),
      e: Number(e),
      p: Number(p),
      gf: Number(gf),
      gc: Number(gc),
      isOwn: team?.isOwn || false
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {team ? 'Editar Equipo en Clasificación' : 'Añadir Equipo Rival'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Escudo" className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Escudo del Equipo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleTeamLogoChange}
                className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre del Equipo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-bold text-center text-slate-500 mb-1">PJ</label>
              <input type="number" min="0" value={pj} onChange={(ev) => setPj(ev.target.value)} className="w-full px-2 py-2 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-center text-emerald-600 mb-1">G</label>
              <input type="number" min="0" value={g} onChange={(ev) => setG(ev.target.value)} className="w-full px-2 py-2 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-center text-amber-600 mb-1">E</label>
              <input type="number" min="0" value={e} onChange={(ev) => setE(ev.target.value)} className="w-full px-2 py-2 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-center text-rose-600 mb-1">P</label>
              <input type="number" min="0" value={p} onChange={(ev) => setP(ev.target.value)} className="w-full px-2 py-2 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Goles a Favor (GF)</label>
              <input type="number" min="0" value={gf} onChange={(ev) => setGf(ev.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Goles en Contra (GC)</label>
              <input type="number" min="0" value={gc} onChange={(ev) => setGc(ev.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg text-center">
            Puntos calculados automáticamente: <strong className="text-slate-900">{Number(g) * 3 + Number(e)} pts</strong>
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
              Guardar Datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlayerFormModal({ player, onClose, onSave }) {
  const [number, setNumber] = useState(player?.number ?? 1);
  const [name, setName] = useState(player?.name || '');
  const [position, setPosition] = useState(player?.position || 'Jugador');
  const [goals, setGoals] = useState(player?.goals ?? 0);
  const [assists, setAssists] = useState(player?.assists ?? 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      number: Number(number),
      name: name.trim(),
      position,
      goals: Number(goals),
      assists: Number(assists)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {player ? 'Editar Ficha de Jugador' : 'Nuevo Jugador en Plantilla'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dorsal</label>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-black text-base"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej: LEON"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Demarcación / Posición</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value="Jugador">Jugador</option>
              <option value="Portero">Portero</option>
              <option value="Portera">Portera</option>
              <option value="Cierre">Cierre</option>
              <option value="Ala">Ala</option>
              <option value="Pívot">Pívot</option>
              <option value="Universal">Universal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Goles</label>
              <input
                type="number"
                min="0"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Asistencias</label>
              <input
                type="number"
                min="0"
                value={assists}
                onChange={(e) => setAssists(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
              Guardar Jugador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PhotoUploadModal({ photo, onClose, onSave }) {
  const [title, setTitle] = useState(photo?.title || '');
  const [date, setDate] = useState(photo?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(photo?.category || 'Partido');
  const [imagePreview, setImagePreview] = useState(photo?.imageUrl || '');
  const [processing, setProcessing] = useState(false);

  // Comprimir la imagen en Canvas para asegurar que cabe sin problemas en Firestore (< 1MB)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        setImagePreview(compressedDataUrl);
        setProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) return;
    onSave({
      title,
      date,
      category,
      imageUrl: imagePreview
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {photo ? 'Cambiar Foto / Editar Publicación' : 'Subir Foto a la Galería'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Seleccionar Imagen desde Móvil o PC</label>
            <input
              type="file"
              accept="image/*"
              required={!photo}
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>

          {processing && (
            <p className="text-xs text-emerald-600 font-semibold animate-pulse">Optimizando imagen...</p>
          )}

          {imagePreview && (
            <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
              <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Título o Descripción</label>
            <input
              type="text"
              required
              placeholder="Ej: Celebración tras ganar la Jornada 6"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Partido">Partido</option>
                <option value="Torneo">Torneo</option>
                <option value="Entrenamiento">Entrenamiento</option>
                <option value="Equipo">Equipo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!imagePreview || processing}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold"
            >
              {photo ? 'Guardar Cambios' : 'Publicar Foto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Utilidad para formatear fechas en español (DD/MM/YYYY)
function formatDateES(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function RivalResultModal({ item, defaultRound, defaultDate, standings, onClose, onSave }) {
  const rivalTeams = standings.filter((t) => !t.isOwn).map((t) => t.name);
  const [round, setRound] = useState(item?.round || defaultRound || 'Jornada 2');
  const [date, setDate] = useState(item?.date || defaultDate || new Date().toISOString().split('T')[0]);
  const [home, setHome] = useState(item?.home || rivalTeams[0] || '');
  const [away, setAway] = useState(item?.away || rivalTeams[1] || '');
  const [scoreHome, setScoreHome] = useState(item?.scoreHome ?? 0);
  const [scoreAway, setScoreAway] = useState(item?.scoreAway ?? 0);
  const [isBye, setIsBye] = useState(Boolean(item?.isBye));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      round: round.trim(),
      date,
      home: isBye ? 'Descansa' : home,
      away,
      scoreHome: isBye ? null : Number(scoreHome),
      scoreAway: isBye ? null : Number(scoreAway),
      isBye
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {item ? 'Editar Resultado de Rivales' : 'Añadir Resultado de Rivales'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Jornada</label>
              <input
                type="text"
                required
                placeholder="Ej: Jornada 2"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isBye}
              onChange={(e) => setIsBye(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600"
            />
            <span>Equipo que descansa en esta jornada</span>
          </label>

          {!isBye && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Equipo Local</label>
              <select
                value={home}
                onChange={(e) => setHome(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {rivalTeams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              {isBye ? 'Equipo que descansa' : 'Equipo Visitante'}
            </label>
            <select
              value={away}
              onChange={(e) => setAway(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {rivalTeams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {!isBye && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-center text-slate-600 mb-1">Goles Local</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={scoreHome}
                  onChange={(e) => setScoreHome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-black text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-center text-slate-600 mb-1">Goles Visitante</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={scoreAway}
                  onChange={(e) => setScoreAway(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center font-black text-lg"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold"
            >
              Guardar Resultado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
