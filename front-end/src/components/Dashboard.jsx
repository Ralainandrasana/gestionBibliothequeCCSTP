import React from 'react'
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement} from 'chart.js';
import Effectif from '../diagramme/Effectif';
import DiagrammeCirculaire from '../diagramme/DiagrammeCirculaire';
import EvolutionLine from '../diagramme/EvolutionLine';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
);


function Dashboard(){
    return <div className='component'>
      <div className="rout">
        <div className="icon">
            <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }}/>
        </div>
        <div className="icon">
            <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin:'0 4px 0 4px'}}/>
        </div>
        <p>Dashboard</p>
      </div>
      <div className="titre">
            <h2 className="titreTable">Tableau de bord</h2>
      </div>
      <div className="content">
        <div className="content1">
            <div className="left effectif">{/* EFFECTIFS */}
                <Effectif/>
            </div>

            <div className="right diagramme">{/* DIAGRAMME CIRCULAIRE */}
                <DiagrammeCirculaire/>
            </div>
        </div>
        <div className="content2">
            <EvolutionLine/>
        </div>
      </div>
    </div>
  }

export default Dashboard