"use client";

import { useTransition } from "react";
import { moveCategoryAction } from "./actions";

export default function MoveCategoryButtons({
  id,
  canMoveUp,
  canMoveDown,
}: {
  id: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const move = (direction: "up" | "down") => {
    startTransition(async () => {
      const res = await moveCategoryAction(id, direction);
      if (!res.ok) {
        window.alert(res.error);
      }
    });
  };

  const btnCls =
    "w-7 h-6 inline-flex items-center justify-center border border-[var(--rule)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--rule-strong)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-label="Move up"
        disabled={!canMoveUp || pending}
        onClick={() => move("up")}
        className={btnCls}
      >
        <span aria-hidden className="text-[10px] leading-none">▲</span>
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={!canMoveDown || pending}
        onClick={() => move("down")}
        className={btnCls}
      >
        <span aria-hidden className="text-[10px] leading-none">▼</span>
      </button>
    </div>
  );
}
