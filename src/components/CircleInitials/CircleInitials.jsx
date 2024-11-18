import React from 'react';
import './CircleInitials.css'; // CSS file for styling

function CircleInitials({ text, classN, style }) {
  if (!text) { return <div>X</div>; }

  const getInitials = (name) => {
    const words = name
      .trim()
      .split(' ')
      .filter((word) => word && word.toLowerCase() !== 'the');

    const initials = words
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');

    return initials;
  };

  const initials = getInitials(text);

  return (
    <div className={`circle-wrapper ${classN}`} style={style}>
      <p>{initials}</p>
    </div>
  );
}

export default CircleInitials;
