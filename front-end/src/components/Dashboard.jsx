import { useCallback, useEffect, useState } from 'react';
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import Effectif from '../diagramme/Effectif';
import DiagrammeCirculaire from '../diagramme/DiagrammeCirculaire';
import EvolutionLine from '../diagramme/EvolutionLine';
import PageLoader from './PageLoader';

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

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSummary = useCallback(async (signal) => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get('/api/other/dashboard-summary', { signal });
      setSummary(response.data);
    } catch (requestError) {
      if (!axios.isCancel(requestError) && requestError.code !== 'ERR_CANCELED') {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSummary(controller.signal);
    return () => controller.abort();
  }, [fetchSummary]);

  if (loading) {
    return <PageLoader contained message="Chargement du tableau de bord" />;
  }
  
  return (
    <div className='component'>
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px 0 4px' }} />
        </div>
        <p>Dashboard</p>
      </div>
      <div className="titre">
        <h2 className="titreTable">Tableau de bord</h2>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les statistiques."
          action={<Button size="small" onClick={() => fetchSummary()}>Réessayer</Button>}
        />
      )}
      <div className="content">
        <div className="content1">
          <div className="left effectif">
            <Effectif
              effectifLivre={summary?.effectifLivre || 0}
              effectifAdherent={summary?.effectifAdherent || 0}
            />
          </div>
          <div className="right diagramme">
            <DiagrammeCirculaire
              effectifLivreParType={summary?.livresParType || []}
              effectifAdherentParCategorie={summary?.adherentsParCategorie || []}
            />
          </div>
        </div>
        <div className="content2">
          <EvolutionLine effectifInscriptionParMois={summary?.evolutionInscription || []} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
