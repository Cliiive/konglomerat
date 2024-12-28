import React from "react";
import { EmojiProvider } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";
import Grid from "./components/Grid";
import { emojiList } from "./assets/Emojis";
import { createClient } from "@supabase/supabase-js";


const App = () => {
  return (
    <EmojiProvider data={emojiData}>
      <div className="bg-abbey-900 flex flex-col items-center justify-center">
        <h1 className="p-20 text-4xl text-white font-bold mb-8">Emojis</h1>
        <Grid emojis={emojiList} />
      </div>
    </EmojiProvider>
  );
};

export default App;
