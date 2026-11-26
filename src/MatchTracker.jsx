import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  ArrowLeftRight,
  Trash2,
  Copy,
  Check,
  Database,
  Plus,
  Trophy,
  X,
  Flame
} from 'lucide-react';

const PERIODS = ['1ª Parte', 'Descanso', '2ª Parte', 'Final'];

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDateES = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export default function MatchTracker({
  teamName = 'VIKINGOS SONDOS BLANCA FS',
  matches = [],
  players = [],
  onSaveLiveMatch,
  onClose
}) {
  const playableMatches = useMemo(
    () => matches.filter((m) => (m.opponent || '').trim().toUpperCase() !== 'DESCANSA'),
    [matches]
  );

  const detectedMatch = useMemo(() => {
    const pending = playableMatches.filter((m) => m.status !== 'played');
    if (pending.length === 0) return playableMatches[playableMatches.length - 1] || null;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMatch = pending.find((m) => m.date === todayStr);
    if (todayMatch) return todayMatch;
    return [...pending].sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0];
  }, [playableMatches]);

  const [selectedMatchId, setSelectedMatchId] = useState(detectedMatch?.id || '');
  const [rivalName, setRivalName] = useState(detectedMatch?.opponent || '');
  const [isHomeMatch, setIsHomeMatch] = useState(detectedMatch ? detectedMatch.isHome : true);
  const [matchRound, setMatchRound] = useState(detectedMatch?.round || 'Jornada 2');
  const [matchDate, setMatchDate] = useState(detectedMatch?.date || '');

  useEffect(() => {
    if (detectedMatch && !selectedMatchId) {
      setSelectedMatchId(detectedMatch.id);
      setRivalName(detectedMatch.opponent);
      setIsHomeMatch(detectedMatch.isHome);
      setMatchRound(detectedMatch.round);
      setMatchDate(detectedMatch.date);
    }
  }, [detectedMatch, selectedMatchId]);

  const handleSelectCalendarMatch = (id) => {
    setSelectedMatchId(id);
    const found = playableMatches.find((m) => m.id === id);
    if (found) {
      setRivalName(found.opponent);
      setIsHomeMatch(found.isHome);
      setMatchRound(found.round);
      setMatchDate(found.date);
    }
  };

  const [roster, setRoster] = useState([]);
  useEffect(() => {
    setRoster((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]));
      return players.map((p, idx) => {
        const existing = prevMap.get(p.id);
        if (existing) {
          return {
            ...existing,
            number: p.number,
            name: p.name,
            position: p.position || 'Jugador'
          };
        }
        return {
          id: p.id,
          number: p.number,
          name: p.name,
          position: p.position || 'Jugador',
          isCalledUp: true,
          isStarter: prev.length === 0 && idx < 5
        };
      });
    });
  }, [players]);

  const [phase, setPhase] = useState('setup');
  const halfDuration = 30;
  const [periodIndex, setPeriodIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [periodSeconds, setPeriodSeconds] = useState(0);
  const [countDownMode, setCountDownMode] = useState(true);

  const [ownScore, setOwnScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [ownFouls, setOwnFouls] = useState(0);
  const [rivalFouls, setRivalFouls] = useState(0);
  const [ownTimeoutUsed, setOwnTimeoutUsed] = useState(false);

  const [matchPlayers, setMatchPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCourtPlayer, setSelectedCourtPlayer] = useState(null);
  const [playerToSubOut, setPlayerToSubOut] = useState(null);
  const [goalAssistModal, setGoalAssistModal] = useState(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [savingToFirebase, setSavingToFirebase] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [bannerMsg, setBannerMsg] = useState(null);

  const notify = (msg) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 2600);
  };

  useEffect(() => {
    if (phase !== 'live' || !isRunning) return;
    const interval = setInterval(() => {
      setPeriodSeconds((prev) => prev + 1);
      setMatchPlayers((prev) =>
        prev.map((p) => (p.onCourt ? { ...p, secondsPlayed: p.secondsPlayed + 1 } : p))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, isRunning]);

  const getCurrentMinuteLabel = () => {
    const baseOffset = periodIndex >= 2 ? halfDuration : 0;
    const min = Math.floor(periodSeconds / 60) + 1 + baseOffset;
    return `${min}'`;
  };

  const toggleCallUp = (id) => {
    setRoster((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = !p.isCalledUp;
        return { ...p, isCalledUp: next, isStarter: next ? p.isStarter : false };
      })
    );
  };

  const toggleStarter = (id) => {
    const count = roster.filter((p) => p.isStarter).length;
    setRoster((prev) =>
      prev.map((p) => {
        if (p.id !== id || !p.isCalledUp) return p;
        if (!p.isStarter && count >= 5) {
          notify('Ya hay 5 titulares en pista');
          return p;
        }
        return { ...p, isStarter: !p.isStarter };
      })
    );
  };

  const handleStartMatch = () => {
    const calledUp = roster.filter((p) => p.isCalledUp);
    const starters = calledUp.filter((p) => p.isStarter);
    if (starters.length !== 5) {
      notify('Selecciona exactamente 5 titulares para empezar');
      return;
    }

    setMatchPlayers(
      calledUp.map((p) => ({
        id: p.id,
        number: p.number,
        name: p.name,
        position: p.position,
        onCourt: p.isStarter,
        secondsPlayed: 0,
        goals: 0,
        assists: 0,
        saves: 0,
        shots: 0,
        yellowCards: 0,
        redCards: 0
      }))
    );
    setPeriodIndex(0);
    setPeriodSeconds(0);
    setIsRunning(false);
    setOwnScore(0);
    setRivalScore(0);
    setOwnFouls(0);
    setRivalFouls(0);
    setOwnTimeoutUsed(false);
    setEvents([]);
    setSavedSuccess(false);
    setPhase('live');
  };

  const handlePeriodControl = (newIdx) => {
    setPeriodIndex(newIdx);
    if (newIdx === 1) {
      setIsRunning(false);
      notify('Descanso (30 min)');
    } else if (newIdx === 2) {
      setPeriodSeconds(0);
      setOwnFouls(0);
      setRivalFouls(0);
      setOwnTimeoutUsed(false);
      setIsRunning(true);
      notify('Inicio 2º Tiempo: Reloj a 30:00 en marcha');
    } else if (newIdx === 3) {
      setIsRunning(false);
      setPhase('summary');
    }
  };

  const handleTimeout = () => {
    if (ownTimeoutUsed) {
      notify('Tiempo muerto ya utilizado en esta parte');
      return;
    }
    setIsRunning(false);
    setOwnTimeoutUsed(true);
    setEvents((prev) => [
      {
        id: Date.now(),
        minuteStr: getCurrentMinuteLabel(),
        type: 'timeout',
        description: `Tiempo muerto pedido por ${teamName}`
      },
      ...prev
    ]);
    notify('Reloj pausado por Tiempo Muerto');
  };

  const completeSubstitution = (benchPlayer) => {
    if (!playerToSubOut) return;
    setMatchPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerToSubOut.id) return { ...p, onCourt: false };
        if (p.id === benchPlayer.id) return { ...p, onCourt: true };
        return p;
      })
    );
    setEvents((prev) => [
      {
        id: Date.now(),
        minuteStr: getCurrentMinuteLabel(),
        type: 'sub',
        description: `Cambio: Entra #${benchPlayer.number} ${benchPlayer.name} por #${playerToSubOut.number} ${playerToSubOut.name}`
      },
      ...prev
    ]);
    setPlayerToSubOut(null);
  };

  const handleRivalGoal = () => {
    setRivalScore((s) => s + 1);
    setEvents((prev) => [
      {
        id: Date.now(),
        minuteStr: getCurrentMinuteLabel(),
        type: 'rival_goal',
        description: `Gol de ${rivalName || 'Rival'}`
      },
      ...prev
    ]);
    notify(`Gol anotado para ${rivalName || 'Rival'}`);
  };

  const registerPlayerAction = (player, actionType, assistant = null) => {
    const minLabel = getCurrentMinuteLabel();
    if (actionType === 'goal') {
      setOwnScore((s) => s + 1);
      setMatchPlayers((prev) =>
        prev.map((p) => {
          if (p.id === player.id) return { ...p, goals: p.goals + 1 };
          if (assistant && p.id === assistant.id) return { ...p, assists: p.assists + 1 };
          return p;
        })
      );
      setEvents((prev) => [
        {
          id: Date.now(),
          minuteStr: minLabel,
          type: 'goal',
          playerId: player.id,
          assistantId: assistant ? assistant.id : null,
          description: assistant
            ? `⚽ GOL de #${player.number} ${player.name} (Asist. #${assistant.number} ${assistant.name})`
            : `⚽ GOL de #${player.number} ${player.name}`
        },
        ...prev
      ]);
      notify(`¡GOL de ${player.name}!`);
    } else if (actionType === 'assist') {
      setMatchPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, assists: p.assists + 1 } : p)));
      setEvents((prev) => [
        { id: Date.now(), minuteStr: minLabel, type: 'assist', playerId: player.id, description: `👟 Asistencia de #${player.number} ${player.name}` },
        ...prev
      ]);
      notify(`Asistencia sumada a ${player.name}`);
    } else if (actionType === 'save') {
      setMatchPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, saves: p.saves + 1 } : p)));
      setEvents((prev) => [
        { id: Date.now(), minuteStr: minLabel, type: 'save', playerId: player.id, description: `🧤 Parada de #${player.number} ${player.name}` },
        ...prev
      ]);
      notify(`Parada registrada para ${player.name}`);
    }
    setSelectedCourtPlayer(null);
    setGoalAssistModal(null);
  };

  const deleteEvent = (ev) => {
    if (ev.type === 'goal') {
      setOwnScore((s) => Math.max(0, s - 1));
      setMatchPlayers((prev) =>
        prev.map((p) => {
          if (p.id === ev.playerId) return { ...p, goals: Math.max(0, p.goals - 1) };
          if (ev.assistantId && p.id === ev.assistantId) return { ...p, assists: Math.max(0, p.assists - 1) };
          return p;
        })
      );
    } else if (ev.type === 'rival_goal') {
      setRivalScore((s) => Math.max(0, s - 1));
    } else if (ev.type === 'assist') {
      setMatchPlayers((prev) => prev.map((p) => (p.id === ev.playerId ? { ...p, assists: Math.max(0, p.assists - 1) } : p)));
    } else if (ev.type === 'save') {
      setMatchPlayers((prev) => prev.map((p) => (p.id === ev.playerId ? { ...p, saves: Math.max(0, p.saves - 1) } : p)));
    }
    setEvents((prev) => prev.filter((item) => item.id !== ev.id));
    notify('Evento deshecho');
  };

  const generateWhatsAppText = () => {
    const scorers = matchPlayers
      .filter((p) => p.goals > 0)
      .map((p) => `${p.name} (${p.goals})`)
      .join(', ');
    const assisters = matchPlayers
      .filter((p) => p.assists > 0)
      .map((p) => `${p.name} (${p.assists})`)
      .join(', ');
    const resultEmoji =
      ownScore > rivalScore ? '✅ VICTORIA' : ownScore < rivalScore ? '❌ DERROTA' : '🤝 EMPATE';

    return [
      `🏆 *ACTA DE PARTIDO - ${teamName}*`,
      `📅 ${matchRound} (${formatDateES(matchDate)})`,
      `${resultEmoji}: *${teamName} ${ownScore} - ${rivalScore} ${rivalName}*`,
      ``,
      scorers ? `⚽ *Goles:* ${scorers}` : `⚽ *Goles:* Sin goles`,
      assisters ? `👟 *Asistencias:* ${assisters}` : null,
      ``,
      `⏱️ *Minutos jugados:*`,
      ...[...matchPlayers]
        .sort((a, b) => b.secondsPlayed - a.secondsPlayed)
        .map((p) => `• #${p.number} ${p.name}: ${formatTime(p.secondsPlayed)}`)
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  const handleSaveToPortal = async () => {
    if (savingToFirebase || savedSuccess || typeof onSaveLiveMatch !== 'function') return;
    setSavingToFirebase(true);
    try {
      await onSaveLiveMatch({
        matchId: selectedMatchId,
        jornada: matchRound,
        rival: rivalName,
        isHome: isHomeMatch,
        homeScore: ownScore,
        awayScore: rivalScore,
        players: matchPlayers,
        events
      });
      setSavedSuccess(true);
    } finally {
      setSavingToFirebase(false);
    }
  };

  const totalPeriodSeconds = halfDuration * 60;
  const displaySeconds = countDownMode ? Math.max(0, totalPeriodSeconds - periodSeconds) : periodSeconds;
  const isOvertime = countDownMode && periodSeconds > totalPeriodSeconds;
  const courtPlayers = matchPlayers.filter((p) => p.onCourt);
  const benchPlayers = matchPlayers.filter((p) => !p.onCourt);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 max-w-2xl mx-auto select-none relative">
      {bannerMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-black">
          <Flame className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{bannerMsg}</span>
        </div>
      )}

      {phase === 'setup' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">Modo Banquillo en Directo</h2>
                <p className="text-[11px] text-emerald-400 font-bold">2 partes × 30 min • Privado Entrenador</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartMatch}
              className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wide flex items-center gap-1.5 shadow-lg active:scale-95 transition shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              COMENZAR PARTIDO
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Partido detectado de tu calendario • {matchRound}</span>
                </div>
                <p className="text-sm font-black text-white mt-0.5">
                  {isHomeMatch ? `${teamName} vs ${rivalName}` : `${rivalName} vs ${teamName}`}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatDateES(matchDate)} • {isHomeMatch ? 'Jugamos en Casa' : 'Jugamos Fuera'}
                </p>
              </div>

              <select
                value={selectedMatchId}
                onChange={(e) => handleSelectCalendarMatch(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
              >
                {playableMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.round}: {m.opponent}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Convocatoria y Quinteto Inicial</h3>
                <p className="text-xs text-slate-400">Marca convocados y elige los 5 que salen en pista</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-black">
                Titulares:{' '}
                <span className={roster.filter((p) => p.isStarter).length === 5 ? 'text-emerald-400' : 'text-amber-400'}>
                  {roster.filter((p) => p.isStarter).length}/5
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {roster.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    player.isCalledUp ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/30 border-slate-900 opacity-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCallUp(player.id)}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                        player.isCalledUp ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {player.isCalledUp && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-emerald-400 text-xs">
                      #{player.number}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">{player.name}</div>
                      <div className="text-[11px] text-slate-400">{player.position}</div>
                    </div>
                  </button>

                  {player.isCalledUp && (
                    <button
                      type="button"
                      onClick={() => toggleStarter(player.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                        player.isStarter ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {player.isStarter ? 'En Pista' : 'Suplente'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'live' && (
        <div className="space-y-3.5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCountDownMode(!countDownMode)}
                  className="text-left flex-1"
                >
                  <div className="text-[10px] font-black text-slate-400 uppercase">
                    {PERIODS[periodIndex]} • {matchRound}
                  </div>
                  <div
                    className={`text-3xl font-black tabular-nums leading-none mt-1 ${
                      isOvertime ? 'text-amber-400' : isRunning ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {isOvertime ? `+${formatTime(periodSeconds - totalPeriodSeconds)}` : formatTime(displaySeconds)}
                  </div>
                </button>

                <div className="flex flex-col gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => setPeriodSeconds((s) => Math.max(0, s + (countDownMode ? -60 : 60)))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black text-slate-200"
                  >
                    +1m
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodSeconds((s) => Math.max(0, s + (countDownMode ? 60 : -60)))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black text-slate-400"
                  >
                    -1m
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`h-20 px-4 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shrink-0 ${
                  isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                <span>{isRunning ? 'PAUSAR' : periodSeconds === 0 && periodIndex === 0 ? 'INICIO PARTIDO' : 'REANUDAR'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleTimeout}
                className={`py-2.5 px-2 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-0.5 ${
                  ownTimeoutUsed
                    ? 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>TIEMPO MUERTO</span>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodControl(1)}
                className={`py-2.5 px-2 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-0.5 ${
                  periodIndex === 1
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
                <span>DESCANSO</span>
              </button>

              <button
                type="button"
                onClick={() => handlePeriodControl(2)}
                className={`py-2.5 px-2 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-0.5 ${
                  periodIndex === 2
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-emerald-300'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>INICIO 2º TIEMPO</span>
              </button>
            </div>

            <div className="grid grid-cols-3 items-center text-center gap-2 pt-1">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400">Nosotros</span>
                <div className="font-black text-xs text-white truncate">{teamName}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-emerald-400 tabular-nums">{ownScore}</span>
                <span className="text-slate-600 font-bold">-</span>
                <span className="text-3xl font-black text-white tabular-nums">{rivalScore}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Rival</span>
                <div className="font-black text-xs text-slate-200 line-clamp-2">{rivalName}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => (events.length > 0 ? deleteEvent(events[0]) : notify('Nada que deshacer'))}
                className="py-2.5 px-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Deshacer
              </button>

              <button
                type="button"
                onClick={handleRivalGoal}
                className="py-2.5 px-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-black text-[11px] flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                GOL RIVAL
              </button>

              <button
                type="button"
                onClick={() => handlePeriodControl(3)}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-700 text-white font-black text-[11px] flex items-center justify-center gap-1"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                FINAL
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400">Faltas Acumulativas</span>
              {(ownFouls >= 5 || rivalFouls >= 5) && (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black">
                  ¡5ª Falta - Doble Penalti!
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300 w-20 truncate">Vikingos</span>
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setOwnFouls(num === ownFouls ? num - 1 : num)}
                    className={`w-8 h-8 rounded-lg font-black text-xs ${
                      num <= ownFouls
                        ? num === 5
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOwnFouls((f) => Math.min(5, f + 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white font-black"
              >
                +
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 w-20 truncate">{rivalName}</span>
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRivalFouls(num === rivalFouls ? num - 1 : num)}
                    className={`w-8 h-8 rounded-lg font-black text-xs ${
                      num <= rivalFouls
                        ? num === 5
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRivalFouls((f) => Math.min(5, f + 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white font-black"
              >
                +
              </button>
            </div>
          </div>

          {playerToSubOut && (
            <div className="bg-amber-500 text-slate-950 p-3 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-black">
                Sale #{playerToSubOut.number} {playerToSubOut.name}. Toca en el banquillo quién entra:
              </span>
              <button
                type="button"
                onClick={() => setPlayerToSubOut(null)}
                className="px-2.5 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          )}

          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-400">En Pista ({courtPlayers.length})</span>
              <span className="text-[11px] text-slate-400">Toca jugador para Gol / Acción</span>
            </div>

            <div className="space-y-2">
              {courtPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    playerToSubOut?.id === player.id ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPlayerToSubOut(null);
                      setSelectedCourtPlayer(player);
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center">
                      {player.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white truncate">{player.name}</span>
                        {player.goals > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-black">
                            ⚽ {player.goals}
                          </span>
                        )}
                        {player.assists > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-black">
                            👟 {player.assists}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{player.position}</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-right">
                      <div className="text-[9px] uppercase text-slate-500 font-bold">Min</div>
                      <div className="text-xs font-black tabular-nums text-emerald-400">
                        {formatTime(player.secondsPlayed)}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourtPlayer(null);
                      setPlayerToSubOut(player);
                    }}
                    title="Cambiar jugador"
                    className="ml-2 p-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-xs font-black uppercase text-slate-400 block">Banquillo ({benchPlayers.length})</span>
            <div className="space-y-1.5">
              {benchPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => {
                    if (playerToSubOut) completeSubstitution(player);
                    else notify('Pulsa primero el botón de cambio en un jugador en pista');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left ${
                    playerToSubOut ? 'bg-amber-500/15 border-amber-400' : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">
                      {player.number}
                    </span>
                    <span className="font-bold text-sm text-slate-200">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tabular-nums text-slate-400">
                      {formatTime(player.secondsPlayed)}
                    </span>
                    {playerToSubOut && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px] font-black">
                        ENTRAR
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {events.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-black uppercase text-slate-400 block">Eventos ({events.length})</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-black">
                        {ev.minuteStr}
                      </span>
                      <span className="truncate text-slate-200">{ev.description}</span>
                    </div>
                    <button type="button" onClick={() => deleteEvent(ev)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCourtPlayer && !goalAssistModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center">
                  #{selectedCourtPlayer.number}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedCourtPlayer.name}</h3>
                  <p className="text-xs text-slate-400">Minutos: {formatTime(selectedCourtPlayer.secondsPlayed)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourtPlayer(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGoalAssistModal(selectedCourtPlayer)}
                className="col-span-2 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center gap-2"
              >
                <span>⚽</span> GOL DE {selectedCourtPlayer.name}
              </button>

              <button
                type="button"
                onClick={() => registerPlayerAction(selectedCourtPlayer, 'assist')}
                className="py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs flex flex-col items-center gap-1"
              >
                <span>👟</span> ASISTENCIA
              </button>

              <button
                type="button"
                onClick={() => registerPlayerAction(selectedCourtPlayer, 'save')}
                className="py-3.5 rounded-2xl bg-slate-800 text-white font-black text-xs flex flex-col items-center gap-1"
              >
                <span>🧤</span> PARADA
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlayerToSubOut(selectedCourtPlayer);
                  setSelectedCourtPlayer(null);
                }}
                className="col-span-2 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" /> CAMBIAR POR SUPLENTE
              </button>
            </div>
          </div>
        </div>
      )}

      {goalAssistModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 space-y-4">
            <div className="text-center">
              <span className="text-xs font-black uppercase text-emerald-400">
                ⚽ ¡Gol de #{goalAssistModal.number} {goalAssistModal.name}!
              </span>
              <h3 className="text-base font-black text-white mt-1">¿Quién dio la asistencia?</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {courtPlayers
                .filter((p) => p.id !== goalAssistModal.id)
                .map((teammate) => (
                  <button
                    key={teammate.id}
                    type="button"
                    onClick={() => registerPlayerAction(goalAssistModal, 'goal', teammate)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-emerald-600 border border-slate-800 text-left flex items-center gap-2"
                  >
                    <span className="font-black text-xs text-emerald-400">#{teammate.number}</span>
                    <span className="font-bold text-xs text-white truncate">{teammate.name}</span>
                  </button>
                ))}
            </div>

            <button
              type="button"
              onClick={() => registerPlayerAction(goalAssistModal, 'goal', null)}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm"
            >
              SIN ASISTENCIA
            </button>
          </div>
        </div>
      )}

      {phase === 'summary' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-2">
            <span className="text-xs font-black uppercase text-emerald-400">Acta Final • {matchRound}</span>
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 text-right font-black text-sm text-white">{teamName}</div>
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-3xl font-black text-white">
                {ownScore} - {rivalScore}
              </div>
              <div className="flex-1 text-left font-black text-sm text-slate-300">{rivalName}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2">Jugador</th>
                  <th className="py-2 text-center">Min</th>
                  <th className="py-2 text-center">⚽</th>
                  <th className="py-2 text-center">👟</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...matchPlayers]
                  .sort((a, b) => b.secondsPlayed - a.secondsPlayed)
                  .map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 font-bold text-white">
                        #{p.number} {p.name}
                      </td>
                      <td className="py-2.5 text-center font-black text-emerald-400">
                        {formatTime(p.secondsPlayed)}
                      </td>
                      <td className="py-2.5 text-center font-black">{p.goals || '-'}</td>
                      <td className="py-2.5 text-center font-bold text-blue-300">{p.assists || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleSaveToPortal}
              disabled={savingToFirebase || savedSuccess}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg ${
                savedSuccess
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Database className="w-5 h-5" />
              {savedSuccess
                ? '¡GUARDADO EN RESULTADOS, PLANTILLA Y CLASIFICACIÓN!'
                : savingToFirebase
                ? 'GUARDANDO EN FIREBASE...'
                : 'GUARDAR ACTA Y ACTUALIZAR CLASIFICACIÓN'}
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-2"
            >
              {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedWhatsApp ? '¡COPIADO PARA WHATSAPP!' : 'COPIAR RESUMEN PARA WHATSAPP'}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPhase('live')}
                className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                Volver al partido
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                Cerrar Banquillo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
