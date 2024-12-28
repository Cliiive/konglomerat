import React, { useState } from "react";

const TextInput = () => {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="flex flex-row">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="input-text"
        placeholder="Teile deine Gedanken..."
      />
      <button className="button">Senden</button>
    </div>
  );
};

export default TextInput;
