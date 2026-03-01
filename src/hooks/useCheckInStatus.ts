"use client";

import { useState, useEffect } from "react";

export function useCheckInStatus() {
  const [checkedIn, setCheckedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/mood/history")
      .then((r) => r.json())
      .then((logs: Array<{ loggedAt: string }>) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hasToday = logs.some(
          (l) => new Date(l.loggedAt) >= today
        );
        setCheckedIn(hasToday);
      })
      .catch(() => setCheckedIn(false));
  }, []);

  return checkedIn;
}
