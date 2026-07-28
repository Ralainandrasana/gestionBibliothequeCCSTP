import React from 'react'
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import TableHistoriqueSysteme from '../table/TableHistoriqueSysteme';


function Catalogue(){
    return <div className='component'>
      <div className="rout">
        <div className="icon">
            <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }}/>
        </div>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Parametre</p>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Administrateur</p>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Historique systeme</p>
      </div>
      <div className="boutonAndTable">
        <TableHistoriqueSysteme/>
      </div>
      <div className="footer">
        copyright 2024 MijoroMarson
      </div>
    </div>
  }

export default Catalogue