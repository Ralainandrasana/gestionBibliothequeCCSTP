import { Card } from 'antd';
import { UserOutlined, PlayCircleOutlined, TableOutlined, PlaySquareOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


function Effectif() {
    const [effectifLivre, setEffectifLivre] = useState('');
    const [effectifAdherent, setEffectifAdherent] = useState('');

      // Fonction pour récupérer les données
  const fetchEffectifLivre = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/other/effectifTotalLivre');
      setEffectifLivre(response.data[0].effectifLivre);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    }
  };

  const fetchEffectifAdherent = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/other/effectifTotalAdherent');
      setEffectifAdherent(response.data[0].effectifAdherent);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    }
  };

  // Fetch des data
  useEffect(() => {
    fetchEffectifLivre();
    fetchEffectifAdherent();
  }, []);
  return (
    <>
        <div className="left">
                    <div className="top effectifAdherent">
                        <Card
                                className='card'
                                hoverable
                                style={{
                                width: 220,
                                }}
                            >
                                <div className="left">
                                    <UserOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
                                </div>
                                <div className="right">
                                    <div className="top">
                                        <h1>{effectifAdherent}</h1>
                                    </div>
                                    <div className="bottom">
                                        <p>Adherent</p>
                                    </div>
                                </div>
                            </Card>
                    </div>
                    <div className="bottom effectifJeux">
                        <Card
                                className='card'
                                hoverable
                                style={{
                                width: 220,
                                }}
                            >
                                <div className="left">
                                    <PlaySquareOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
                                </div>
                                <div className="right">
                                    <div className="top">
                                        <h1>0</h1>
                                    </div>
                                    <div className="bottom">
                                        <p>Jeux</p>
                                    </div>
                                </div>
                            </Card>
                    </div>
                </div>
                <div className="right">
                    <div className="top effectifLivre">
                        <Card
                                className='card'
                                hoverable
                                style={{
                                width: 220,
                                }}
                            >
                                <div className="left">
                                    <TableOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
                                </div>
                                <div className="right">
                                    <div className="top">
                                        <h1>{effectifLivre}</h1>
                                    </div>
                                    <div className="bottom">
                                        <p>Livre</p>
                                    </div>
                                </div>
                            </Card>
                    </div>
                    <div className="bottom effectifMultimedia">
                        <Card
                            className='card'
                            hoverable
                            style={{
                            width: 220,
                            }}
                        >
                            <div className="left">
                                <PlayCircleOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
                            </div>
                            <div className="right">
                                <div className="top">
                                    <h1>0</h1>
                                </div>
                                <div className="bottom">
                                    <p>Multimedia</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>  
    </>
  )
}

export default Effectif