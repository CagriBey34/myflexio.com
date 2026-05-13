import { useState, useEffect } from 'react';
import { Search, Trash2, Ban, CheckCircle, UserCheck } from 'lucide-react';
import { getUsers, updateUserStatus, deleteUser } from '../../services/adminService';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

const ROLE_LABELS = {
    hasta: 'Hasta',
    uzman: 'Uzman',
    admin: 'Admin'
};

const STATUS_LABELS = {
    active:    { text: 'Aktif',         color: 'bg-green-100 text-green-700'   },
    pending_approval: { text: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
    rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-700' },
    suspended: { text: 'Askıya Alındı', color: 'bg-red-100 text-red-700'      },
};

const statusInfo = (status) => STATUS_LABELS[status] || STATUS_LABELS.pending_approval;
const isPending = (status) => !STATUS_LABELS[status] || status === 'pending_approval';

export default function Kullanicilar() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (roleFilter)   params.role   = roleFilter;
            if (statusFilter) params.status = statusFilter;
            if (search)       params.search = search;

            const response = await getUsers(params);
            setUsers(response.data.users);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        if (e.target.value === '') {
            setPage(1);
            setTimeout(() => fetchUsers(), 0);
        }
    };

    const handleStatusChange = async (id, status) => {
        const messages = {
            active:    'Kullanıcıyı onaylamak istediğinizden emin misiniz?',
            suspended: 'Kullanıcıyı askıya almak istediğinizden emin misiniz?',
        };
        if (!confirm(messages[status] || 'Durumu değiştirmek istediğinizden emin misiniz?')) return;

        try {
            await updateUserStatus(id, status);
            fetchUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Durum güncellenirken bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) return;

        try {
            await deleteUser(id);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
                <p className="text-gray-600 mt-1">Tüm kullanıcıları görüntüleyin ve yönetin</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="grid md:grid-cols-4 gap-4">
                    <form onSubmit={handleSearch} className="md:col-span-2 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Email veya isim ara..."
                                className="pl-10"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                        >
                            Ara
                        </button>
                    </form>

                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tüm Roller</option>
                        <option value="hasta">Hasta</option>
                        <option value="uzman">Uzman</option>
                        <option value="admin">Admin</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tüm Durumlar</option>
                        <option value="active">Aktif</option>
                        <option value="pending_approval">Bekliyor</option>
                        <option value="rejected">Reddedildi</option>
                        <option value="suspended">Askıya Alındı</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-500 text-lg">Kullanıcı bulunamadı</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {user.ad} {user.soyad}
                                            {user.unvan && (
                                                <span className="text-gray-500 text-sm ml-2">({user.unvan})</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo(user.status).color}`}>
                                            {statusInfo(user.status).text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            {/* Bekliyor veya null/undefined → Onayla */}
                                            {isPending(user.status) && (
                                                <button
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Onayla"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            )}
                                            {/* Aktif → Askıya Al */}
                                            {user.status === 'active' && (
                                                <button
                                                    onClick={() => handleStatusChange(user.id, 'suspended')}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                                                    title="Askıya Al"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            )}
                                            {/* Askıya Alınmış → Aktif Et */}
                                            {user.status === 'suspended' && (
                                                <button
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    title="Aktif Et"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {/* Sil */}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Sil"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        Önceki
                    </Button>
                    <span className="px-4 py-2 text-gray-700">
                        Sayfa {page} / {Math.ceil(total / 20)}
                    </span>
                    <Button variant="outline" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
}
