import React from 'react'
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import TableEmpruntNonRendu from '../table/TableEmpruntNonRendu';


function EmpruntNonRendu(){
    return <div className='component'>
      <div className="rout">
        <div className="icon">
            <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }}/>
        </div>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Gestion Bibliothèque</p>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Emprunt Livre</p>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Non Rendu</p>
      </div>
      <div className="boutonAndTable">
        <TableEmpruntNonRendu/>
      </div>
      <div className="footer">
        copyright 2024 MijoroMarson
      </div>
    </div>
  }

export default EmpruntNonRendu