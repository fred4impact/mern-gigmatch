import React from 'react';

const Test = () => {
  console.log('Test component rendering');
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ background: '#007bff', color: 'white', padding: '10px', borderRadius: '5px' }}>
        Bootstrap is working too!
      </div>
    </div>
  );
};

export default Test; 