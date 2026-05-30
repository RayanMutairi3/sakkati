import confetti from "canvas-confetti";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Sun,
  Trophy
} from "lucide-react";
import "./styles.css";

const WINNING_SCORE = 152;
const STORAGE_KEYS = {
  rounds: "balootna-rounds",
  theme: "balootna-theme"
};
const CONFETTI_COLORS = ["#111827", "#dc2626", "#ffffff", "#f59e0b"];

function clearConfettiTimers(timerRef) {
  timerRef.current.forEach((timerId) => window.clearTimeout(timerId));
  timerRef.current = [];
}

function stopConfetti(timerRef) {
  clearConfettiTimers(timerRef);
  confetti.reset?.();
}

function fireWinConfetti(timerRef) {
  stopConfetti(timerRef);

  const fire = (delay, options) => {
    const timerId = window.setTimeout(() => {
      confetti({
        colors: CONFETTI_COLORS,
        decay: 0.92,
        gravity: 0.82,
        ticks: 115,
        ...options
      });
    }, delay);

    timerRef.current.push(timerId);
  };

  fire(0, {
    particleCount: 28,
    angle: 58,
    spread: 52,
    startVelocity: 38,
    origin: { x: 0.08, y: 0.72 }
  });
  fire(0, {
    particleCount: 28,
    angle: 122,
    spread: 52,
    startVelocity: 38,
    origin: { x: 0.92, y: 0.72 }
  });
  fire(650, {
    particleCount: 22,
    spread: 70,
    startVelocity: 30,
    origin: { x: 0.5, y: 0.62 }
  });
  fire(1400, {
    particleCount: 16,
    angle: 65,
    spread: 46,
    startVelocity: 30,
    origin: { x: 0.12, y: 0.76 }
  });
  fire(1400, {
    particleCount: 16,
    angle: 115,
    spread: 46,
    startVelocity: 30,
    origin: { x: 0.88, y: 0.76 }
  });
  fire(2300, {
    particleCount: 20,
    spread: 62,
    startVelocity: 28,
    scalar: 0.9,
    origin: { x: 0.5, y: 0.68 }
  });
  fire(3300, {
    particleCount: 14,
    angle: 62,
    spread: 44,
    startVelocity: 28,
    scalar: 0.9,
    origin: { x: 0.1, y: 0.78 }
  });
  fire(3300, {
    particleCount: 14,
    angle: 118,
    spread: 44,
    startVelocity: 28,
    scalar: 0.9,
    origin: { x: 0.9, y: 0.78 }
  });
  fire(4400, {
    particleCount: 16,
    spread: 58,
    startVelocity: 24,
    scalar: 0.85,
    origin: { x: 0.5, y: 0.7 }
  });
}

function readStoredRounds() {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.rounds);
    const rounds = value ? JSON.parse(value) : [];
    return Array.isArray(rounds)
      ? rounds.filter(
          (round) =>
            Number.isFinite(round.us) &&
            Number.isFinite(round.them) &&
            round.us >= 0 &&
            round.them >= 0
        )
      : [];
  } catch {
    return [];
  }
}

function readStoredTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function clampScore(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return "";
  }

  return Math.floor(numericValue).toString();
}

function App() {
  const [rounds, setRounds] = useState(readStoredRounds);
  const [theme, setTheme] = useState(readStoredTheme);
  const [form, setForm] = useState({ us: "", them: "" });
  const [error, setError] = useState("");
  const [highlightedRoundId, setHighlightedRoundId] = useState("");
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const confettiTimersRef = useRef([]);
  const hasCheckedInitialWinnerRef = useRef(false);
  const previousWinnerRef = useRef(null);

  const totals = useMemo(
    () =>
      rounds.reduce(
        (score, round) => ({
          us: score.us + round.us,
          them: score.them + round.them
        }),
        { us: 0, them: 0 }
      ),
    [rounds]
  );

  const winner =
    totals.us >= WINNING_SCORE
      ? "us"
      : totals.them >= WINNING_SCORE
        ? "them"
        : null;
  const isGameFinished = Boolean(winner);
  const leadingTeam =
    totals.us === totals.them ? null : totals.us > totals.them ? "us" : "them";
  const displayedRounds = useMemo(
    () =>
      rounds
        .map((round, index) => ({
          ...round,
          roundNumber: index + 1
        }))
        .reverse(),
    [rounds]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.rounds, JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    if (!hasCheckedInitialWinnerRef.current) {
      hasCheckedInitialWinnerRef.current = true;
      previousWinnerRef.current = winner;
      return;
    }

    if (winner === "us" && previousWinnerRef.current !== "us") {
      fireWinConfetti(confettiTimersRef);
    }

    previousWinnerRef.current = winner;
  }, [winner]);

  useEffect(() => {
    if (!highlightedRoundId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedRoundId("");
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedRoundId]);

  useEffect(
    () => () => {
      stopConfetti(confettiTimersRef);
    },
    []
  );

  useEffect(() => {
    if (!isNewGameModalOpen) {
      return undefined;
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setIsNewGameModalOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isNewGameModalOpen]);

  function updateField(field, value) {
    setError("");
    setForm((currentForm) => ({
      ...currentForm,
      [field]: clampScore(value)
    }));
  }

  function addRound(event) {
    event.preventDefault();

    if (winner) {
      return;
    }

    const us = form.us === "" ? null : Number(form.us);
    const them = form.them === "" ? null : Number(form.them);

    if (us === null && them === null) {
      setError("أدخل نتيجة الصكة أولاً");
      return;
    }

    const round = {
      id: crypto.randomUUID(),
      us: us ?? 0,
      them: them ?? 0
    };

    setRounds((currentRounds) => [...currentRounds, round]);
    setHighlightedRoundId(round.id);
    setForm({ us: "", them: "" });
    setError("");
  }

  function undoLastRound() {
    setRounds((currentRounds) => currentRounds.slice(0, -1));
    setError("");
  }

  function newGame() {
    stopConfetti(confettiTimersRef);
    setIsNewGameModalOpen(true);
  }

  function confirmNewGame() {
    stopConfetti(confettiTimersRef);
    setRounds([]);
    setForm({ us: "", them: "" });
    setError("");
    setHighlightedRoundId("");
    setIsNewGameModalOpen(false);
  }

  return (
    <main
      className="app-root min-h-[100dvh] bg-zinc-50 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50"
      dir="rtl"
      lang="ar"
    >
      <div className="app-shell mx-auto flex h-full w-full max-w-xl flex-col overflow-hidden px-3 py-2 sm:px-6 sm:py-5">
        <header className="app-header mb-2 flex items-center justify-between gap-3">
          <h1 className="app-title font-bold tracking-normal">
            صكتي
          </h1>

          <button
            className="icon-button"
            type="button"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark"
              )
            }
            aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <section className="grid grid-cols-2 gap-2 sm:gap-3">
          <ScoreCard
            label="لنا"
            score={totals.us}
            remaining={Math.max(WINNING_SCORE - totals.us, 0)}
            isLeading={leadingTeam === "us"}
          />
          <ScoreCard
            label="لهم"
            score={totals.them}
            remaining={Math.max(WINNING_SCORE - totals.them, 0)}
            isLeading={leadingTeam === "them"}
          />
        </section>

        {winner && (
          <section
            className={[
              "winner-alert mt-2 flex flex-col items-center justify-center rounded-lg border px-3 py-1.5 text-center shadow-sm",
              winner === "us"
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800/60 dark:bg-green-950/35 dark:text-green-100"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/35 dark:text-red-100"
            ].join(" ")}
          >
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold sm:text-base">
              {winner === "us" && <Trophy size={17} />}
              <span>{winner === "us" ? "مبروك، فزت 🎉" : "خسرت، فريقهم فاز"}</span>
            </div>
            <p className="mt-0.5 text-xs font-semibold opacity-80">
              ابدأ لعبة جديدة لحساب صكة جديدة
            </p>
          </section>
        )}

        <form
          className="score-form mt-2 rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4"
          onSubmit={addRound}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <label className="field-label">
              <span>لنا</span>
              <input
                className="score-input"
                inputMode="numeric"
                min="0"
                pattern="[0-9]*"
                placeholder="0"
                type="number"
                value={form.us}
                onChange={(event) => updateField("us", event.target.value)}
                disabled={isGameFinished}
              />
            </label>

            <label className="field-label">
              <span>لهم</span>
              <input
                className="score-input"
                inputMode="numeric"
                min="0"
                pattern="[0-9]*"
                placeholder="0"
                type="number"
                value={form.them}
                onChange={(event) => updateField("them", event.target.value)}
                disabled={isGameFinished}
              />
            </label>
          </div>

          {error && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </p>
          )}

          <button className="primary-button mt-2.5" type="submit" disabled={isGameFinished}>
            <Plus size={22} />
            <span>إضافة الصكة</span>
          </button>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
            <button
              className="secondary-button"
              type="button"
              onClick={undoLastRound}
              disabled={rounds.length === 0}
            >
              <RotateCcw size={19} />
              <span>تراجع</span>
            </button>

            <button
              className="secondary-button reset-button"
              type="button"
              onClick={newGame}
              disabled={rounds.length === 0 && form.us === "" && form.them === ""}
            >
              <RefreshCw size={19} />
              <span>لعبة جديدة</span>
            </button>
          </div>
        </form>

        <section className="history-section mt-2.5 flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="history-title font-bold">سجل الصكات</h2>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {rounds.length} صكة
            </span>
          </div>

          {rounds.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-3 text-center text-sm font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              لا توجد صكات بعد
            </div>
          ) : (
            <ol className="history-list min-h-0 flex-1 space-y-2 overflow-y-auto pb-2">
              {displayedRounds.map((round) => (
                <li
                  className={[
                    "history-row flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900",
                    round.id === highlightedRoundId ? "history-row-new" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={round.id}
                  dir="rtl"
                >
                  <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                    الصكة {round.roundNumber}
                  </span>
                  <span className="text-left text-zinc-950 dark:text-zinc-50">
                    لنا {round.us} - لهم {round.them}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {isNewGameModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsNewGameModalOpen(false)}
          role="presentation"
        >
          <section
            aria-labelledby="new-game-title"
            aria-describedby="new-game-description"
            aria-modal="true"
            className="confirm-modal"
            dir="rtl"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="new-game-title" className="confirm-modal-title">
              بدء لعبة جديدة؟
            </h2>
            <p id="new-game-description" className="confirm-modal-description">
              سيتم حذف سجل الصكات الحالي وتصفير النقاط.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="modal-cancel-button"
                type="button"
                onClick={() => setIsNewGameModalOpen(false)}
              >
                إلغاء
              </button>
              <button
                className="modal-confirm-button"
                type="button"
                onClick={confirmNewGame}
              >
                تأكيد البدء
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function ScoreCard({ label, score, remaining, isLeading }) {
  return (
    <article
      className={[
        "score-card rounded-lg border bg-white p-2.5 text-center shadow-sm transition-all duration-300 dark:bg-zinc-900 sm:p-4",
        isLeading
          ? "border-accent-500 ring-2 ring-accent-500/10 dark:border-accent-500"
          : "border-zinc-200 dark:border-zinc-800"
      ].join(" ")}
    >
      <div className="flex min-h-6 items-center justify-center gap-1.5">
        <h2 className="team-label font-bold">{label}</h2>
        {isLeading && (
          <span className="rounded-full bg-accent-50 px-1.5 py-0.5 text-[11px] font-bold text-accent-700 dark:bg-accent-500/10 dark:text-accent-100">
            متقدم
          </span>
        )}
      </div>

      <p className="score-number mt-1 font-bold leading-none tabular-nums sm:mt-3">
        {score}
      </p>
      <p className="remaining-text mt-1.5 font-semibold text-zinc-500 dark:text-zinc-400">
        باقي {label}: {remaining}
      </p>
    </article>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
