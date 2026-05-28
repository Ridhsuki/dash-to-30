import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

export type GameOverPayload = {
  runId?: string;
  score: number;
  balance?: number;
  survivalDays: number;
  isWin: boolean;
  needsTaken?: number;
  wantsAvoided?: number;
  bossAvoided?: number;
  essentialLife?: number;
  isNewPersonalHighScore?: boolean;
  previousPersonalBest?: number;
};

export type LeaderboardSubmitStatus =
  | "idle"
  | "guest"
  | "submitting"
  | "success"
  | "error"
  | "skipped";

export type LeaderboardSubmitState = {
  status: LeaderboardSubmitStatus;
  title: string;
  message: string;
  score?: number;
  docId?: string;
  errorCode?: string;
};

type SubmitInput = {
  db: Firestore | null;
  user: User | null;
  payload: GameOverPayload;
};

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
};

const toSafeNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getFriendlyFirebaseError = (error: unknown) => {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "unknown";

  if (code.includes("permission-denied")) {
    return {
      code,
      message:
        "Firestore menolak akses. Cek Security Rules untuk collection highscores.",
    };
  }

  if (code.includes("unavailable")) {
    return {
      code,
      message: "Koneksi ke Firestore belum tersedia. Coba lagi beberapa saat.",
    };
  }

  if (code.includes("not-found")) {
    return {
      code,
      message:
        "Database Firestore belum ditemukan. Buat Cloud Firestore Database terlebih dahulu.",
    };
  }

  return {
    code,
    message: "Skor belum bisa dikirim. Cek koneksi, env Firebase, atau rules.",
  };
};

export const createSubmitKey = (userId: string, payload: GameOverPayload) => {
  const baseKey =
    payload.runId ||
    [
      payload.score,
      payload.survivalDays,
      payload.isWin ? "win" : "lose",
      payload.needsTaken ?? 0,
      payload.wantsAvoided ?? 0,
      payload.bossAvoided ?? 0,
    ].join(":");

  return `${userId}:${baseKey}`;
};

export const getPlayerUsername = (user: User) => {
  const rawName = user.displayName || user.email?.split("@")[0] || "Player";

  return (
    rawName.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 32) ||
    "Player"
  );
};

export async function submitLeaderboardScore({
  db,
  user,
  payload,
}: SubmitInput): Promise<LeaderboardSubmitState> {
  const score = Math.max(0, Math.floor(toSafeNumber(payload.score, 0)));

  if (!user) {
    return {
      status: "guest",
      title: "Skor tersimpan lokal",
      message: "Login untuk mengirim skor ke Global Leaderboard.",
      score,
    };
  }

  if (!db) {
    return {
      status: "error",
      title: "Firebase belum siap",
      message: "Env Firebase belum lengkap atau Firestore belum terhubung.",
      score,
      errorCode: "firebase-not-configured",
    };
  }

  if (score <= 0) {
    return {
      status: "skipped",
      title: "Skor tidak dikirim",
      message: "Skor 0 tidak masuk leaderboard global.",
      score,
    };
  }

  try {
    const survivalDays = clamp(toSafeNumber(payload.survivalDays, 1), 1, 30);

    const docRef = await addDoc(collection(db, "highscores"), {
      userId: user.uid,
      username: getPlayerUsername(user),
      score,
      balance: Math.floor(toSafeNumber(payload.balance, 0)),
      survivalDays,
      isWin: Boolean(payload.isWin),
      needsTaken: clamp(toSafeNumber(payload.needsTaken, 0), 0, 999),
      wantsAvoided: clamp(toSafeNumber(payload.wantsAvoided, 0), 0, 999),
      bossAvoided: clamp(toSafeNumber(payload.bossAvoided, 0), 0, 999),
      essentialLife: clamp(toSafeNumber(payload.essentialLife, 0), 0, 10),
      timestamp: serverTimestamp(),
      clientMeta: {
        source: "dash-to-30-web",
        version: "mvp-polish",
      },
    });

    return {
      status: "success",
      title: "Skor terkirim!",
      message: "Run kamu sudah masuk Global Leaderboard.",
      score,
      docId: docRef.id,
    };
  } catch (error) {
    console.error("Leaderboard submit failed:", error);

    const friendlyError = getFriendlyFirebaseError(error);

    return {
      status: "error",
      title: "Gagal mengirim skor",
      message: friendlyError.message,
      score,
      errorCode: friendlyError.code,
    };
  }
}
