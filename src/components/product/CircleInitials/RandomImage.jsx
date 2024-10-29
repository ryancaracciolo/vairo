// RandomImage.js
import React, { useState, useEffect } from 'react';

function RandomImage() {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const loadRandomImage = async () => {
      const randomNumber = Math.floor(Math.random() * 25) + 1;
      try {
        const image = await import(`../../../Assets/x/${randomNumber}.png`);
        setImageSrc(image.default);
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadRandomImage();
  }, []);

  if (!imageSrc) {
    return <div>...</div>;
  }

  return <img className='circle-image' style={{ width: '80px', height: '80px', margin: '0px', padding: '0px' }} src={imageSrc} alt="Random Logo" />;
}

export default RandomImage;
