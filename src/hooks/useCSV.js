import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useCSV() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchEmojis = async () => {
      const { data: emojis, error } = await supabase
        .from("Emojis_Data")
        .select("*")
        .eq("active", "TRUE"); // Fetch only active emojis

      if (error) {
        console.error("Error fetching emojis:", error);
      } else {
        console.log("Fetched emojis:", emojis);
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
            setData((prevData) =>
              prevData.map((emoji) =>
                emoji.id === payload.new.id ? payload.new : emoji
              )
            );
          } else if (payload.eventType === "INSERT") {
            setData((prevData) => [...prevData, payload.new]);
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

  return data.filter((emoji) => emoji.active); // Return only active emojis
}
