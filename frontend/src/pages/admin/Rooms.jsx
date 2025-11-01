import Layout from '../../components/Layout';
import Card from '../../ui/Card';

const AdminRooms = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-4xl font-black mb-2">Room Management</h1>
        <p className="text-gray-600 mb-8">Add and manage hostel rooms</p>
        <Card>
          <p className="text-gray-600">Room management will be implemented here</p>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminRooms;
