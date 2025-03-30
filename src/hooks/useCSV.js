import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useCSV() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchEmojis = async () => {
      const { data: emojis, error } = await supabase
        .from("Emojis_Data")
        .select("*")
        .eq("active", true); // Fetch only active emojis

      if (error) {
        console.error("Error fetching emojis:", error);
      } else {
        setData(emojis);
      }
    };

    fetchEmojis();

    const subscription = supabase
      .channel("public:Emojis_Data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Emojis_Data" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setData((prevData) => {
              const updatedEmoji = payload.new;
              if (updatedEmoji.active) {
                // Add or update the emoji if it's active
                const exists = prevData.some(
                  (emoji) => emoji.id === updatedEmoji.id
                );
                if (exists) {
                  return prevData.map((emoji) =>
                    emoji.id === updatedEmoji.id ? updatedEmoji : emoji
                  );
                } else {
                  return [...prevData, updatedEmoji];
                }
              } else {
                // Remove the emoji if it's inactive
                return prevData.filter((emoji) => emoji.id !== updatedEmoji.id);
              }
            });
          } else if (payload.eventType === "INSERT") {
            if (payload.new.active) {
              setData((prevData) => [...prevData, payload.new]);
            }
          } else if (payload.eventType === "DELETE") {
            setData((prevData) =>
              prevData.filter((emoji) => emoji.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return data.sort((a, b) => a.id - b.id).reverse(); // Sort by id and reverse
}

export function useAdminEmojis() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchEmojis = async () => {
      const { data: emojis, error } = await supabase
        .from("Emojis_Data")
        .select("*");

      if (error) {
        console.error("Error fetching emojis for admin:", error);
      } else {
        setData(emojis);
      }
    };

    fetchEmojis();
  }, []);

  return data.sort((a, b) => a.id - b.id).reverse(); // Sort by id and reverse
}
