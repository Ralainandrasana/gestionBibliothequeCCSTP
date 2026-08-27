/* eslint-disable react/prop-types */
import { Line } from 'react-chartjs-2';
import { Card } from 'antd';

function EvolutionLine({ effectifInscriptionParMois }) {
  const dataLine = {
    labels: effectifInscriptionParMois.map(item => item.mois),
    datasets: [
      {
        label: 'nombre inscription',
        data: effectifInscriptionParMois.map(item => item.effectifIns),
        fill: false,
        borderColor: '#F2055C',
        tension: 0.1
      }
    ]
  };
  
  const optionsLine = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolution inscription'
      }
    }
  };

  return (
    <>
        <div className="left evolutionInscription">
                    <Card
                        className='card'
                        hoverable
                        style={{
                        width: 700,
                        }}
                    >
                         <Line data={dataLine} options={optionsLine} />
                    </Card>       
            </div>
    </>
  )
}

export default EvolutionLine
