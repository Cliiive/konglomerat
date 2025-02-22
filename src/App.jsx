import React, { useState, useEffect } from "react";
import useCSV from "./hooks/useCSV";
import Grid from "./components/Grid";
import { createClient } from "@supabase/supabase-js";

const App = () => {
  const emojis = useCSV();
  return (
    <div className="bg-abbey-900 flex flex-col items-center justify-center">
      <h1 className="p-20 text-4xl text-white font-bold mb-8">Emojis</h1>
      <Grid emojis={emojis} />
    </div>
  );
};

export default App;
