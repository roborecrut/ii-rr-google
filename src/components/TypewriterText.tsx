import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // default is 50ms per character which is exactly 20 characters per second
  className?: string;
}

export default function TypewriterText({ text, speed = 50, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < text.length) {
        // Handle markdown/formatting tags safely or just characters
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
}
