/* eslint-disable react/prop-types */
import { Card } from 'antd';
import { UserOutlined, PlayCircleOutlined, TableOutlined, PlaySquareOutlined } from '@ant-design/icons';


function Effectif({ effectifLivre, effectifAdherent }) {
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
