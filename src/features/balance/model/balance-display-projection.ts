"use client";

import * as React from "react";

export interface BalanceDisplayProjection {
  gamePoints?: string;
  ownerId: string;
  watchPoints?: string;
}

let currentProjection: BalanceDisplayProjection | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentProjection;
}

function emitProjectionChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setBalanceDisplayProjection(
  projection: BalanceDisplayProjection,
) {
  currentProjection = projection;
  emitProjectionChange();
}

export function clearBalanceDisplayProjection(ownerId: string) {
  if (currentProjection?.ownerId !== ownerId) {
    return;
  }

  currentProjection = null;
  emitProjectionChange();
}

export function useBalanceDisplayProjection() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
