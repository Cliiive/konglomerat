import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import useCSV from "./hooks/useCSV";
import Grid from "./components/Grid";
import Admin from "./pages/Admin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const emojis = useCSV();
  return (
    <Router basename="/konglomerat">
      <div className="bg-black flex flex-col items-center justify-center min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="p-20 text-3xl text-gray-200 font-bold mb-8">
                  REACT!
                </h1>
                <Grid emojis={emojis} />
              </>
            }
          />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <ToastContainer
          autoClose={3000}
          theme="dark"
          toastClassName="rounded-2xl bg-gray-800"
          bodyClassName="text-lg text-gray-100"
          closeButton={false}
          style={{ margin: "10px" }}
        />
      </div>
    </Router>
  );
};

export default App;
