import React, { useState } from "react";
import { supabase, roomOne } from "../supabaseClient";
import { toast } from "react-toastify";
import { Send } from "lucide-react";

const Tile = ({ id, emoji }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleTap = () => {
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback on tap
    setIsDialogOpen(true);
    setIsClosing(false);
  };

  const handleReact = async () => {
    handleCloseAnimation();
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
      toast.error("Unfortunately something went wrong, please try again!", {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      console.log("Data inserted successfully:", data);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Haptic feedback on success
      toast.success("Your reaction has been received!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleCloseAnimation = () => {
    setIsClosing(true);
    setTimeout(() => setIsDialogOpen(false), 200); // Match animation duration
  };

  const handleClose = (e) => {
    if (e.target.id === "dialog-overlay") {
      handleCloseAnimation();
    }
  };

  return (
    <>
      <div className="p-3 flex justify-center items-center" onClick={handleTap}>
        <span className="emoji">{emoji}</span>
      </div>
      {isDialogOpen && (
        <div
          id="dialog-overlay"
          className={`dialog-overlay ${isClosing ? "" : "dialog-overlay-open"}`}
          onClick={handleClose}
        >
          <div
            className={`bg-gray-800 p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 ${
              isClosing ? "animate-close" : "animate-bounce"
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the dialog
          >
            <div className="text-2xl py-5 text-gray-200">This one?</div>
            <div className="text-8xl mb-4 text-gray-200">{emoji}</div>
            <button
              className="bg-red-800 text-gray-200 px-4 py-2 m-2 rounded-lg mb-4 p-4 font-bold hover:bg-gray-600"
              onClick={handleCloseAnimation}
            >
              Nah
            </button>
            <button
              className="bg-abbey-700 text-gray-200 px-4 py-2 m-2 rounded-lg mb-4 p-4 font-bold hover:bg-gray-600"
              onClick={handleReact}
            >
              Send!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Tile;
