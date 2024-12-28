import React from "react";
import { Emoji } from "react-apple-emojis";
import { createClient } from "@supabase/supabase-js";
import { supabase, roomOne } from "../supabaseClient";

const Tile = ({ id, emoji }) => {
  const handleTap = async () => {
    roomOne.send({
      type: "broadcast",
      event: "emojis",
      payload: {
        message: id,
        timestamp: new Date().toLocaleString(),
      },
    });
    const { data, error } = await supabase.from("Emojis").insert([{ id: id }]);

    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Data inserted successfully:", data);
    }
  };

  return (
    <div
      id={id}
      className="container"
      onClick={handleTap}
    >
      <div className="p-10 flex justify-center items-center">
        <Emoji name={emoji} style={{ width: "48px", height: "48px" }} />
      </div>
    </div>
  );
};

export default Tile;
