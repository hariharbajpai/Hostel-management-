import React from 'react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';

const AdminSwaps = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-4xl font-black mb-2">Swap Requests</h1>
        <p className="text-gray-600 mb-8">Manage room swap requests</p>
        <Card>
          <p className="text-gray-600">Swap requests management will be implemented here</p>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminSwaps;
