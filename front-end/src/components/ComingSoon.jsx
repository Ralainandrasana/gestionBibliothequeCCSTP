/* eslint-disable react/prop-types */
import {
  ClockCircleOutlined,
  HomeOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function ComingSoon({ title, breadcrumbs = [] }) {
  const navigate = useNavigate();

  return (
    <div className="component coming-soon-page">
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        {breadcrumbs.map((breadcrumb, index) => (
          <div className="coming-soon-breadcrumb" key={`${breadcrumb}-${index}`}>
            <div className="icon">
              <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
            </div>
            <p>{breadcrumb}</p>
          </div>
        ))}
      </div>

      <section className="coming-soon-simple-card">
        <Result
          icon={<ClockCircleOutlined />}
          title={title}
          subTitle="Cette page est en cours de développement. Aucun contenu n’est disponible pour le moment."
          extra={(
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              Retour au tableau de bord
            </Button>
          )}
        />
      </section>
    </div>
  );
}

export default ComingSoon;
