import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Accès refusé"
      subTitle="Votre rôle ne permet pas d’accéder à cette page."
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>}
    />
  );
}

export default Unauthorized;
