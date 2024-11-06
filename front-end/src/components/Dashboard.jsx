import React from 'react'
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Card } from 'antd';

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

const dataBar = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: '#5369B2', // Couleur des barres
        borderWidth: 0,
      }
    ]
  };
  
  const optionsBar = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bar Chart Example'
      }
    }
  };

const dataLine = {
    labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul'],
    datasets: [
      {
        label: 'nombre inscription',
        data: [65, 59, 80, 81, 56, 55, 40],
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
  

const { Meta } = Card;
const data = {
    labels: [
      'Enfant',
      'Jeune',
      'Adulte'
    ],
    datasets: [{
      label: 'effectif',
      data: [300, 50, 100],
      backgroundColor: [
        '#5369B2',
        '#051CB6',
        '#ADB4D2'
      ],
      hoverOffset: 4
    }]
  };
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
          position: 'top',
        }
      }
  };

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
                                        <h1>699</h1>
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
                                    <UserOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
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
                                    <UserOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
                                </div>
                                <div className="right">
                                    <div className="top">
                                        <h1>8075</h1>
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
                                <UserOutlined style={{color: '#05DBF2', fontSize: '16px'}}/>
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
            </div>

            <div className="right diagramme">{/* DIAGRAMME CIRCULAIRE */}
                <div className="left diagrammeAdherent">
                    <Card
                        className='card'
                        hoverable
                        style={{
                        width: 240,
                        }}
                    >
                         <Doughnut data={data} options={options} />   
                    </Card>
                </div>
                <div className="right diagrammeLivre">
                    <Card
                        className='card'
                        hoverable
                        style={{
                        width: 240,
                        }}
                    >
                         <Doughnut data={data} options={options} />      
                    </Card>
                </div>
            </div>
        </div>
        <div className="content2">
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
            <div className="right activite">
                    {/* <Card
                        className='card'
                        hoverable
                        style={{
                        width: 700,
                        }}
                    >
                         <Bar data={dataBar} options={optionsBar} />
                    </Card>  */}
            </div>
        </div>
        <div className="content3">

      </div>
      </div>
    </div>
  }

export default Dashboard