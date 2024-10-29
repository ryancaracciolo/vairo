import React from 'react';
import './CircleInitials.css'; // CSS file for styling
import RandomImage from './RandomImage'

function CircleInitials({ businessName, businessImg, size, fontSize }) {
  if (!businessName) {
    return null;
  }

  const getInitials = (name) => {
    // Split the name into words, filter out empty strings and common words like "The"
    const words = name
      .trim()
      .split(' ')
      .filter((word) => word && word.toLowerCase() !== 'the'); // Filter out empty strings and "the"

    // Take the first letter of the first two words
    const initials = words
      .slice(0, 2) // Take the first two words
      .map((word) => word[0].toUpperCase()) // Map each word to its first letter, uppercase
      .join(''); // Join them into a string

    return initials;
  };

  // Get initials based on the business name
  const initials = getInitials(businessName);

  console.log(businessImg);

  return (
    (!businessImg) ? (
      <div className="circle-initials">
        <p className="circle-p" style={{ width: size, height: size, fontSize: fontSize }}>{initials}</p>
      </div>
    ) : (
      <div className="circle-initials">
        <RandomImage />
        {/*<img className='circle-image' style={{ width: size, height: size }} src={'../../../Assets/x/1.png'} alt='Logo'></img>*/}
      </div>
    )
  );
}

export default CircleInitials;
