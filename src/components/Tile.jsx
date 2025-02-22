import React from "react";
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
    <div id={id} className="container" onClick={handleTap}>
      <div className="p-10 flex justify-center items-center">
        <span className="emoji">{emoji}</span>
      </div>
    </div>
  );
};

// Add the following CSS to your stylesheet or in a style tag
// .emoji {
//   font-size: 100px;
// }
// @media (min-width: 640px) {
//   .emoji {
//     font-size: 150px;
//   }
// }
// @media (min-width: 768px) {
//   .emoji {
//     font-size: 200px;
//   }
// }
// @media (min-width: 1024px) {
//   .emoji {
//     font-size: 250px;
//   }
// }

export default Tile;
