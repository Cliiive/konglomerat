import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";

export function useCSV() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchEmojis() {
      const { data: emojis, error } = await supabase
        .from("Emojis_Data")
        .select("*")
        .eq("active", true);
      if (error) {
        console.error("Error fetching emojis:", error);
      } else {
        setData(emojis);
      }
    }

    fetchEmojis();

    const subscription = supabase
      .channel("public:Emojis_Data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Emojis_Data" },
        (payload) => {
          const { eventType, new: newData, old } = payload;
          setData((prevData) => {
            switch (eventType) {
              case "UPDATE":
                return newData.active
                  ? prevData.some((e) => e.id === newData.id)
                    ? prevData.map((e) => (e.id === newData.id ? newData : e))
                    : [...prevData, newData]
                  : prevData.filter((e) => e.id !== newData.id);
              case "INSERT":
                return newData.active ? [...prevData, newData] : prevData;
              case "DELETE":
                return prevData.filter((e) => e.id !== old.id);
              default:
                return prevData;
            }
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // Use useMemo to avoid sorting on every render
  return useMemo(() => [...data].sort((a, b) => b.id - a.id), [data]);
}

export function useAdminEmojis() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchEmojis() {
      const { data: emojis, error } = await supabase
        .from("Emojis_Data")
        .select("*");
      if (error) {
        console.error("Error fetching emojis for admin:", error);
      } else {
        setData(emojis);
      }
    }
    fetchEmojis();
  }, []);

  return useMemo(() => [...data].sort((a, b) => b.id - a.id), [data]);
}
