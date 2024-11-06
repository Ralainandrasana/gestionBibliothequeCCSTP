import React from 'react';
import SideMenu from './components/SideMenu';
import Content from './components/Content';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="App" style={{height: "100vh", width: "100vw"}}>
      <Header/>
      <div style={{display: "flex", flexDirection: "row", height: "94vh"}}>
      <SideMenu/>
      <Content/>
      </div>
    </div>
  );
}


export default App;