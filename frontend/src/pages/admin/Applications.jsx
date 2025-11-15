import React from 'react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';

const AdminApplications = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-4xl font-black mb-2">Applications</h1>
        <p className="text-gray-600 mb-8">Manage student room change applications</p>
        <Card>
          <p className="text-gray-600">Applications management will be implemented here</p>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminApplications;
