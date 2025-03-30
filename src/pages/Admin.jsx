import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const EmojiManager = ({ emojis, setEmojis }) => {
  const handleAddEmoji = () => {
    const newEmoji = prompt("Enter a new emoji:");
    if (newEmoji) {
      setEmojis([...emojis, { id: emojis.length, Emoji: newEmoji }]);
    }
  };

  const handleRemoveEmoji = (id) => {
    setEmojis(emojis.filter((emoji) => emoji.id !== id));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-xl font-bold text-gray-200 mb-4">Manage Emojis</h2>
      <ul className="space-y-2">
        {emojis.map((emoji) => (
          <li
            key={emoji.id}
            className="flex items-center justify-between bg-gray-700 p-2 rounded-lg"
          >
            <span className="text-2xl">{emoji.Emoji}</span>
            <button
              className="bg-red-600 text-gray-200 px-2 py-1 rounded-lg hover:bg-red-700"
              onClick={() => handleRemoveEmoji(emoji.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 w-full bg-blue-600 text-gray-200 py-2 rounded-lg hover:bg-blue-700"
        onClick={handleAddEmoji}
      >
        Add Emoji
      </button>
    </div>
  );
};

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emojis, setEmojis] = useState([]);

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
        <EmojiManager emojis={emojis} setEmojis={setEmojis} />
      )}
    </div>
  );
};

export default Admin;
