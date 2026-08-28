import { Table, Input, Select, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import height from './height';

const { Column } = Table;

function TableHistoriqueSysteme() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [logSource, setLogSource] = useState('active');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const currentPage = pagination.current;
  const currentPageSize = pagination.pageSize;

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
        const response = await axios.get('/api/crud/app_logs', {
          signal: controller.signal,
          params: {
            page: currentPage,
            pageSize: currentPageSize,
            search: debouncedSearch,
            source: logSource
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
  }, [currentPage, currentPageSize, debouncedSearch, logSource]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Historique Système</h2>
        </div>
        <div className="right">
          <Space>
            <Select
              value={logSource}
              style={{ width: 190 }}
              options={[
                { value: 'active', label: 'Journaux récents' },
                { value: 'archive', label: 'Archives (> 1 an)' }
              ]}
              onChange={(value) => {
                setLogSource(value);
                setPagination((current) => ({ ...current, current: 1 }));
              }}
            />
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
            showTotal: (total) => logSource === 'archive'
              ? `Total des archives : ${total}`
              : `Total des journaux récents : ${total}`
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
