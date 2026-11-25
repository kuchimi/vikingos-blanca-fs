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
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDvgVj5K6e16xJrqcQvcmilPUszXoMtx88",
  authDomain: "vikingos-blanca-fs.firebaseapp.com",
  projectId: "vikingos-blanca-fs",
  storageBucket: "vikingos-blanca-fs.firebasestorage.app",
  messagingSenderId: "136290527424",
  appId: "1:136290527424:web:73dda1ee2c4a1d5647a525",
  measurementId: "G-7L9JDPLR7Y"
};

const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : DEFAULT_FIREBASE_CONFIG;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'vikingos-blanca-fs';

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
  { id: "m-1", round: "Jornada 1", opponent: "CIEZA F.S. \"B\"", date: "2026-11-21", gf: 9, gc: 3, isHome: true, status: "played", scorers: "" },
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
      <path d="M58 68 L44 38 L74 52 L100 26 L126 52 L156 38 L142 68 Z" fill="#E11D48" stroke="#D97706" strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 68 C58 46, 142 46, 142 68 Z" fill="#DC2626" />
      <path d="M44 38 Q72 24 100 24 Q128 24 156 38" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="100" cy="14" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
      <line x1="100" y1="5" x2="100" y2="11" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="97" y1="8" x2="103" y2="8" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="57" y="65" width="86" height="12" rx="3" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
      <circle cx="72" cy="71" r="2.5" fill="#DC2626" />
      <circle cx="100" cy="71" r="2.5" fill="#10B981" />
      <circle cx="128" cy="71" r="2.5" fill="#DC2626" />
      <circle cx="52" cy="34" r="2.5" fill="#F8FAFC" />
      <circle cx="66" cy="29" r="2.5" fill="#F8FAFC" />
      <circle cx="82" cy="25" r="2.5" fill="#F8FAFC" />
      <circle cx="118" cy="25" r="2.5" fill="#F8FAFC" />
      <circle cx="134" cy="29" r="2.5" fill="#F8FAFC" />
      <circle cx="148" cy="34" r="2.5" fill="#F8FAFC" />
      <path
        d="M46 78 H154 V145 C154 182 128 205 100 212 C72 205 46 182 46 145 Z"
        fill="#E2E8F0"
        stroke="#1E293B"
        strokeWidth="3.5"
      />
      <g fill="#C2410C" stroke="#7C2D12" strokeWidth="1.5">
        <rect x="64" y="112" width="18" height="62" />
        <rect x="64" y="106" width="4" height="6" />
        <rect x="71" y="106" width="4" height="6" />
        <rect x="78" y="106" width="4" height="6" />
        <rect x="118" y="112" width="18" height="62" />
        <rect x="118" y="106" width="4" height="6" />
        <rect x="125" y="106" width="4" height="6" />
        <rect x="132" y="106" width="4" height="6" />
        <rect x="82" y="94" width="36" height="80" />
        <rect x="83" y="87" width="6" height="7" />
        <rect x="92" y="87" width="6" height="7" />
        <rect x="102" y="87" width="6" height="7" />
        <rect x="111" y="87" width="6" height="7" />
      </g>
      <path d="M91 174 V154 C91 148 109 148 109 154 V174 Z" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="1.5" />
      <path d="M100 151 V169 M94 157 H106" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M52 176 Q75 166 100 173 Q125 166 148 176 C142 195 122 206 100 210 C78 206 58 195 52 176 Z"
        fill="#0F172A"
      />
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
        <path d="M52 24 Q80 18 108 24 L105 34 Q80 28 55 34 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
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
        <path
          d="M28 118 Q80 104 132 118 L126 131 Q80 118 34 131 Z"
          fill="#F1F5F9"
          stroke="#64748B"
          strokeWidth="1.5"
        />
        <text x="80" y="121" fontSize="8.5" fontWeight="900" fill="#1E1B4B" textAnchor="middle" fontFamily="sans-serif">
          C.D. SEVERO OCHOA
        </text>
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
        <circle cx="90" cy="90" r="82" fill="#C5A847" stroke="#A1822B" strokeWidth="2.5" />
        <circle cx="90" cy="90" r="61" fill="#B91C1C" stroke="#F8FAFC" strokeWidth="2.5" />
        <rect x="33" y="114" width="114" height="14" fill="#3B2314" stroke="#F8FAFC" strokeWidth="1.5" />
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
        <polygon points="34,115 36,119 41,119 37,122 39,126 34,124 29,126 31,122 27,119 32,119" fill="#FFFFFF" />
        <polygon points="146,115 148,119 153,119 149,122 151,126 146,124 141,126 143,122 139,119 144,119" fill="#FFFFFF" />
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
          letter
