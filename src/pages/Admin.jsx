import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const EmojiManager = ({ emojis }) => {
  const [localEmojis, setLocalEmojis] = useState(emojis);

  const handleToggleEmoji = async (id, currentState) => {
    const { error } = await supabase
      .from("Emojis_Data")
      .update({ active: !currentState })
      .eq("id", id);

    if (error) {
      console.error("Error updating emoji state:", error);
      // Revert state if update fails
      setLocalEmojis((prev) =>
        prev.map((emoji) =>
          emoji.id === id ? { ...emoji, active: currentState } : emoji
        )
      );
    } else {
      console.log("Emoji state updated successfully:", id);
      setLocalEmojis((prev) =>
        prev.map((emoji) =>
          emoji.id === id ? { ...emoji, active: !currentState } : emoji
        )
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-200 mb-4">Manage Emojis</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-10">
        {localEmojis.map((emoji) => (
          <div key={emoji.id}>
            <span className="text-4xl">{emoji.emoji}</span>
            <div
              className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                emoji.active ? "bg-blue-600" : "bg-gray-400"
              }`}
              onClick={() => handleToggleEmoji(emoji.id, emoji.active)}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  emoji.active ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Admin = ({ emojis }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Login failed. Please check your credentials.");
    } else {
      setError(null);
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {!isLoggedIn ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-200 mb-6">
            Konglomerat Login
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                className="w-full p-2 bg-gray-700 text-gray-200 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Password</label>
              <input
                type="password"
                className="w-full p-2 bg-gray-700 text-gray-200 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-gray-200 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <EmojiManager emojis={emojis} />
      )}
    </div>
  );
};

export default Admin;
