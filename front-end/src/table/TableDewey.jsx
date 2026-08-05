import { Table, Input, Space } from 'antd';
import React, { useState, useEffect } from 'react';
import height from './height';
import axios from 'axios';

const { Column } = Table;

function Catalogue() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/Deweys');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = data.filter(dewey => {
      const deweyTitre = dewey.titre?.toLowerCase() || '';
      const deweyCode = dewey.code?.toLowerCase() || '';
      return deweyTitre.includes(lowerCaseSearch) || deweyCode.includes(lowerCaseSearch);
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Dewey</h2>
        </div>
        <div className="right">
          <Space>
            <Input placeholder="rechercher..." onChange={(event) => setSearchTerm(event.target.value)} />
          </Space>
        </div>
      </div>
      <div className="table">
        <Table
          dataSource={filteredData}
          rowKey="code"
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{ showTotal: (total) => `Total des livres : ${total}` }}
        >
          <Column title="code" dataIndex="code" key="code" width={70} />
          <Column title="titre" dataIndex="titre" key="titre" width={150} />
          <Column title="description" dataIndex="description" key="description" />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
