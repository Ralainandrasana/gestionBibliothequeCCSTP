import React from 'react'
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { Card } from 'antd';
import axios from 'axios';

function EvolutionLine() {
  const [effectifInscriptionParMois, setEffectifInscriptionParMois] = useState([]);

  const fetchEffectifInscription = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/other/evolutionInscription');
      setEffectifInscriptionParMois(response.data);
    console.log(response.data);

    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    }
  };

  // Fetch des données
  useEffect(() => {
    fetchEffectifInscription();
  }, []);

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