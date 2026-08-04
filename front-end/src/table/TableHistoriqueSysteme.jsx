import { Table, Input, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import height from './height';

const { Column } = Table;

function TableHistoriqueSysteme() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPagination(current => ({ ...current, current: 1 }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/crud/app_logs', {
          signal: controller.signal,
          params: {
            page: pagination.current,
            pageSize: pagination.pageSize,
            search: debouncedSearch
          }
        });

        setData(response.data.data);
        setPagination(current => ({
          ...current,
          ...response.data.pagination
        }));
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          console.error('Erreur lors de la récupération des journaux :', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [pagination.current, pagination.pageSize, debouncedSearch]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Historique Système</h2>
        </div>
        <div className="right">
          <Space>
            <Input
              allowClear
              value={searchTerm}
              placeholder="Rechercher..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </Space>
        </div>
      </div>

      <div className="table">
        <Table
          dataSource={data}
          rowKey="log_id"
          scroll={{ y: height, x: 2100 }}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total des journaux : ${total}`
          }}
          onChange={(nextPagination) => {
            setPagination(current => ({
              ...current,
              current: nextPagination.current,
              pageSize: nextPagination.pageSize
            }));
          }}
        >
          <Column title="#id" dataIndex="log_id" key="log_id" width={70} />
          <Column title="Timestamp" dataIndex="Timestamp" key="Timestamp" width={150} />
          <Column title="Action" dataIndex="Action" key="Action" />
          <Column title="TableName" dataIndex="TableName" key="TableName" />
          <Column title="RecordID" dataIndex="RecordID" key="RecordID" />
          <Column title="SqlQuery" dataIndex="SqlQuery" key="SqlQuery" width={300} />
          <Column title="UserID" dataIndex="UserID" key="UserID" />
          <Column title="ServerIP" dataIndex="ServerIP" key="ServerIP" />
          <Column title="URL" dataIndex="RequestUrl" key="RequestUrl" width={250} />
          <Column title="Données" dataIndex="RequestData" key="RequestData" width={350} />
          <Column
            title="Résultat"
            dataIndex="RequestCompleted"
            key="RequestCompleted"
            render={(completed) => {
              const success = String(completed) === 'true';
              return <Tag color={success ? 'success' : 'error'}>{success ? 'Réussi' : 'Échec'}</Tag>;
            }}
          />
          <Column title="Message" dataIndex="RequestMsg" key="RequestMsg" width={280} />
        </Table>
      </div>
    </div>
  );
}

export default TableHistoriqueSysteme;
