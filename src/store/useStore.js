import { useState, useEffect } from "react";
import { DUNKIN_RESTAURANT } from "../data/templates/dunkin";

const DEFAULT_SLIDERS = { production: 0, markdown: 0, buildtoorder: 0, inventory: 0, donation: 0 };

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value]);

  return [value, setValue];
}

export function useStore() {
  const [restaurant, setRestaurant] = useLocalStorage("fs_restaurant", DUNKIN_RESTAURANT);
  const [wasteRecords, setWasteRecords] = useLocalStorage("fs_waste", []);
  const [roiSliders, setROISliders] = useLocalStorage("fs_roi", DEFAULT_SLIDERS);
  const [claudeKey, setClaudeKey] = useLocalStorage("fs_claude_key", "");

  const addWasteRecord = (record) => setWasteRecords(prev => [record, ...prev]);
  const deleteWasteRecord = (id) => setWasteRecords(prev => prev.filter(r => r.id !== id));

  const resetToTemplate = () => {
    setRestaurant(DUNKIN_RESTAURANT);
    setWasteRecords([]);
    setROISliders(DEFAULT_SLIDERS);
  };

  return {
    restaurant, setRestaurant,
    wasteRecords, addWasteRecord, deleteWasteRecord,
    roiSliders, setROISliders,
    claudeKey, setClaudeKey,
    resetToTemplate,
  };
}
