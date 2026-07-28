import { Doughnut } from 'react-chartjs-2';
import { Card } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DiagrammeCirculaire() {
  const [effectifLivreParType, setEffectifLivreParType] = useState([]);
  const [effectifAdherentParCategorie, setEffectifAdherentParCategorie] = useState([]);

  // Fonction pour récupérer les données
  const fetchEffectifLivre = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/other/effectifLivreParType');
      setEffectifLivreParType(response.data);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    }
  };

  const fetchEffectifAdherent = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/other/effectifAdherentParCategorie');
      setEffectifAdherentParCategorie(response.data);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    }
  };

  // Fetch des données
  useEffect(() => {
    fetchEffectifLivre();
    fetchEffectifAdherent();
  }, []);

  // Données pour les adhérents

  const dataAdherent = {
    labels: effectifAdherentParCategorie.map(item => item.categorie),
    datasets: [
      {
        label: 'Effectif Adhérents',
        data: effectifAdherentParCategorie.map(item => item.effectif),
        backgroundColor: ['#051CB6', '#5369B2', '#ADB4D2'],
        hoverOffset: 4,
      },
    ],
  };

  // Données pour les livres
  const dataLivre = {
    labels: effectifLivreParType.map(item => item.Type),
    datasets: [
      {
        label: 'Effectif Livres',
        data: effectifLivreParType.map(item => item.effectif),
        backgroundColor: ['#5369B2', '#051CB6', '#ADB4D2'],
        hoverOffset: 4,
      },
    ],
  };

  // Options pour les graphiques
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="diagrammeAdherent">
        <Card
          className="card"
          hoverable
          style={{
            width: 240,
            height: 235,
          }}
        >
          <Doughnut data={dataAdherent} options={options} />
        </Card>
      </div>
      <div className="diagrammeLivre">
        <Card
          className="card"
          hoverable
          style={{
            width: 240,
            height: 235,
          }}
        >
          <Doughnut data={dataLivre} options={options} />
        </Card>
      </div>
    </div>
  );
}

export default DiagrammeCirculaire;
