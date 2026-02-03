import { Outlet } from 'react-router-dom';
const AdminLayout = () => (
    <div className="min-h-screen bg-background-light p-6">
        <div className="card mb-6">
            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
        </div>
        <Outlet />
    </div>
);
export default AdminLayout;
