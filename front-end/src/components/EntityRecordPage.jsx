/* eslint-disable react/prop-types */
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Spin,
  Switch,
} from 'antd';
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  RightOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { entityRecords } from '../config/entityRecords';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES } from '../config/accessControl';

const { confirm } = Modal;

const validDate = (value) => value && value !== '0000-00-00' && dayjs(value).isValid();

function EntityRecordPage({ entity, mode }) {
  const config = entityRecords[entity];
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const canEdit = hasAnyRole(user, config.editRoles);

  const editableFields = useMemo(
    () => config.fields.filter((field) => field.editable !== false),
    [config.fields]
  );

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const response = await axios.get(config.listEndpoint);
        const foundRecord = response.data.find(
          (item) => String(item[config.idField]) === String(id)
        );

        if (!foundRecord) {
          setRecord(null);
          return;
        }

        setRecord(foundRecord);
        const formValues = {};
        editableFields.forEach((field) => {
          const value = foundRecord[field.name];
          if (field.type === 'date') {
            formValues[field.name] = validDate(value) ? dayjs(value) : null;
          } else if (field.type === 'boolean') {
            formValues[field.name] = Boolean(Number(value) || value === true);
          } else {
            formValues[field.name] = value;
          }
        });
        form.setFieldsValue(formValues);
      } catch (error) {
        message.error(error.response?.data?.message || `Impossible de charger ${config.title.toLowerCase()}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [config, editableFields, form, id]);

  const viewPath = `${config.recordPath}/view/${id}`;
  const editPath = `${config.recordPath}/edit/${id}`;

  const formatValue = (field, value) => {
    if (field.type === 'date') {
      return validDate(value) ? dayjs(value).format('DD MMM YYYY') : '—';
    }
    if (field.type === 'boolean') {
      return Number(value) !== 0 || value === true ? 'Oui' : 'Non';
    }
    if (field.type === 'photo') {
      return (
        <Avatar
          size={72}
          src={value}
          icon={entity === 'livre' ? <BookOutlined /> : <UserOutlined />}
          shape="square"
        />
      );
    }
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    const selectedOption = field.options?.find(
      (option) => String(option.value) === String(value)
    );
    return selectedOption?.label || String(value);
  };

  const renderInput = (field) => {
    if (field.type === 'textarea') return <Input.TextArea rows={3} />;
    if (field.type === 'date') return <DatePicker style={{ width: '100%' }} />;
    if (field.type === 'number') return <InputNumber style={{ width: '100%' }} />;
    if (field.type === 'boolean') return <Switch checkedChildren="Oui" unCheckedChildren="Non" />;
    if (field.type === 'select') {
      return (
        <Select
          options={field.options}
          onChange={
            entity === 'user' && field.name === 'roles'
              ? (role) => form.setFieldValue('user_role_id', role === ROLES.ADMIN ? 1 : 2)
              : undefined
          }
        />
      );
    }
    return <Input type={field.type === 'email' ? 'email' : 'text'} />;
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const formattedValues = { ...values };
      editableFields.forEach((field) => {
        if (field.type === 'date' && values[field.name]) {
          formattedValues[field.name] = values[field.name].format('YYYY-MM-DD');
        }
      });

      const basePayload = {
        ...record,
        ...formattedValues,
        [config.idField]: record[config.idField],
      };
      const payload = config.preparePayload
        ? config.preparePayload(record, basePayload)
        : basePayload;

      await axios.put(config.updateEndpoint, payload);
      message.success(`${config.title} modifié avec succès.`);
      navigate(viewPath);
    } catch (error) {
      message.error(error.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    confirm({
      title: `Supprimer ${config.title.toLowerCase()} ?`,
      content: 'Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const endpoint = typeof config.deleteEndpoint === 'function'
            ? config.deleteEndpoint(id)
            : config.deleteEndpoint;
          const options = config.deleteWithBody
            ? { data: { [config.idField]: record[config.idField] } }
            : undefined;
          await axios.delete(endpoint, options);
          message.success(`${config.title} supprimé avec succès.`);
          navigate(config.listPath);
        } catch (error) {
          message.error(error.response?.data?.message || 'Erreur lors de la suppression.');
        }
      },
    });
  };

  if (loading) {
    return <div className="record-page-loading"><Spin size="large" /></div>;
  }

  if (!record) {
    return (
      <div className="record-page-empty">
        <Empty description={`${config.title} introuvable`} />
        <Button type="primary" onClick={() => navigate(config.listPath)}>Retour à la liste</Button>
      </div>
    );
  }

  return (
    <div className="component record-page">
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        {config.breadcrumbs.map((breadcrumb) => (
          <Fragment key={breadcrumb}>
            <div className="icon">
              <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
            </div>
            <p>{breadcrumb}</p>
          </Fragment>
        ))}
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>{mode === 'edit' ? 'Modifier' : 'Voir'}</p>
      </div>

      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">
            {mode === 'edit' ? `Modifier ${config.title}` : `Détail ${config.title}`}
          </h2>
        </div>
      </div>

      {mode === 'view' ? (
        <div className="record-detail-card">
          <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
            {config.fields.map((field) => (
              <Descriptions.Item label={field.label} key={field.name}>
                {formatValue(field, record[field.name])}
              </Descriptions.Item>
            ))}
          </Descriptions>

          <div className="record-actions">
            <Button onClick={() => navigate(config.listPath)}>Retour</Button>
            {canEdit && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(editPath)}>
                Modifier
              </Button>
            )}
            {isAdmin && (
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                Supprimer
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="form record-edit-card">
          <Form
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            onFinish={handleSave}
            autoComplete="off"
          >
            {editableFields.map((field) => (
              <Form.Item
                label={field.label}
                name={field.name}
                key={field.name}
                valuePropName={field.type === 'boolean' ? 'checked' : 'value'}
                rules={[
                  {
                    required: field.required !== false && field.type !== 'boolean',
                    message: `Veuillez renseigner ${field.label.toLowerCase()}.`,
                  },
                ]}
              >
                {renderInput(field)}
              </Form.Item>
            ))}

            <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
              <div className="record-actions">
                <Button onClick={() => navigate(viewPath)}>Annuler</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  Enregistrer
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}

export default EntityRecordPage;
