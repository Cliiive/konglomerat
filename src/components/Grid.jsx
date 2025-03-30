import React from "react";
import Tile from "./Tile";

const Grid = ({ emojis }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {emojis.map((emoji) => (
        <Tile key={emoji.id} id={emoji.id} emoji={emoji.emoji} />
      ))}
    </div>
  );
};

export default Grid;
