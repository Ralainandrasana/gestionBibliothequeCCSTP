import React from 'react'
import { DownOutlined } from '@ant-design/icons';


function Header(){
    return <div style={{background: "white", color: "#215CDE"}} className='header'>
      <div className="logo">
        <div className="logoCCSP">
          <img src="/image/logoSaintPaul.png" alt="logoCCSP"/>
        </div>
        <div className="textCCSP"><h1>CCSTP</h1></div>
      </div>
      <div className="user">
        <div className="photo">
          <img src="/image/profil.png" alt="" />
        </div>
        <div className="nomEtRole">
          <h5>Mijoro</h5>
          <h6>Admin</h6>
        </div>
        <div className="arrowDown">
          <DownOutlined />
        </div>
      </div>
    </div>
  }

export default Header