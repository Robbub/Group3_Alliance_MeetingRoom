import React, { Fragment, useEffect, useRef, useState } from "react";

export const FocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="First Name" />
      <input type="text" placeholder="Last Name" />
    </div>
  );
};


function ScrollIntoView() {
  // Create a ref for the div element
  const divRef = useRef<any>(null);

  // Function to scroll the div into view
  const scrollToDiv = () => {
    divRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <button onClick={scrollToDiv}>Scroll to the box</button>

      {/* Some content to create scrollable space */}
      <div style={{ height: '2000px', backgroundColor: '#f0f0f0' }}></div>

      {/* The target div we want to scroll to */}
      <div
        ref={divRef}
        style={{
          height: '150px',
          backgroundColor: '#ff6347',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Scroll to me!
      </div>
    </div>
  );
}

export default ScrollIntoView;
