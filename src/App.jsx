import React, { useState, useEffect } from "react";
import useCSV from "./hooks/useCSV";
import Grid from "./components/Grid";
import { createClient } from "@supabase/supabase-js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const emojis = useCSV();
  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen">
      <h1 className="p-20 text-3xl text-gray-200 font-bold mb-8">REACT!</h1>
      <Grid emojis={emojis} />
      <ToastContainer
        autoClose={3000}
        theme="dark"
        toastClassName="rounded-2xl bg-gray-800"
        bodyClassName="text-lg text-gray-100"
        closeButton={false}
        style={{ margin: "10px" }}
      />
    </div>
  );
};

export default App;
