import React, { useState } from 'react';
import { api } from '../../convex/_generated/api.js';
import { isConvexConfigured } from '../../lib/convexClient';
import { useQuery, useMutation } from '../../lib/convexHooks';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Edit2, Trash2, Save, X, UserCheck, UserX } from 'lucide-react';

const UsersManagementView: React.FC = () => {
  const users = useQuery(api?.users?.listUsers) || [];
  const createUser = useMutation(api?.users?.createUser);
  const updateUser = useMutation(api?.users?.updateUser);
  const deleteUser = useMutation(api?.users?.deleteUser);

  const [editingId, setEditingId] = useState<Id<"users"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'myyntiedustaja' as 'toimitusjohtaja' | 'myyntipäällikkö' | 'myyntiedustaja' | 'asiakas' | 'muu',
    email: '',
    phone: '',
    active: true,
  });

  const handleEdit = (user: any) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      role: user.role,
      email: user.email || '',
      phone: user.phone || '',
      active: user.active,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      role: 'myyntiedustaja',
      email: '',
      phone: '',
      active: true,
    });
  };

  const handleSave = async () => {
    if (!isConvexConfigured) return;

    try {
      if (isCreating && createUser) {
        await createUser({
          name: formData.name,
          role: formData.role,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        });
      } else if (editingId && updateUser) {
        await updateUser({
          id: editingId,
          updates: formData,
        });
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Virhe käyttäjän tallentamisessa');
    }
  };

  const handleDelete = async (id: Id<"users">) => {
    if (!isConvexConfigured || !deleteUser) return;
    
    if (confirm('Haluatko varmasti poistaa tämän käyttäjän?')) {
      try {
        await deleteUser({ id });
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Virhe käyttäjän poistamisessa');
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'toimitusjohtaja': 'Toimitusjohtaja',
      'myyntipäällikkö': 'Myyntipäällikkö',
      'myyntiedustaja': 'Myyntiedustaja',
      'tehtaanjohtaja': 'Tehtaanjohtaja',
      'asiakas': 'Asiakas',
      'muu': 'Muu'
    };
    return roleMap[role] || role;
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!isConvexConfigured) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Convex ei ole konfiguroitu. Käyttäjähallinta ei ole käytettävissä.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-hieta-light min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Käyttäjähallinta</h1>
          <p className="text-slate-600">Hallinnoi järjestelmän käyttäjiä</p>
        </div>

        {/* Add User Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
              setFormData({
                name: '',
                role: 'myyntiedustaja',
                email: '',
                phone: '',
                active: true,
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Lisää uusi käyttäjä
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Uusi käyttäjä' : 'Muokkaa käyttäjää'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nimi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Esim. Olli Hietanen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rooli *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="toimitusjohtaja">Toimitusjohtaja</option>
                  <option value="myyntipäällikkö">Myyntipäällikkö</option>
                  <option value="myyntiedustaja">Myyntiedustaja</option>
                  <option value="tehtaanjohtaja">Tehtaanjohtaja</option>
                  <option value="asiakas">Asiakas</option>
                  <option value="muu">Muu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sähköposti
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="olli.hietanen@hietakulma.fi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Puhelin
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="040 123 4567"
                />
              </div>
              {editingId && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Aktiivinen</span>
                  </label>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                Tallenna
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                <X size={18} />
                Peruuta
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Käyttäjä</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Rooli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Yhteystiedot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Tila</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Toiminnot</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            user.role === 'toimitusjohtaja' ? 'bg-purple-500 text-white' :
                            user.role === 'myyntipäällikkö' ? 'bg-blue-500 text-white' :
                            'bg-hieta-sand text-hieta-black'
                          }`}>
                            {getUserInitials(user.name)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{getRoleDisplayName(user.role)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {user.email && <div>{user.email}</div>}
                          {user.phone && <div>{user.phone}</div>}
                          {!user.email && !user.phone && <span className="text-slate-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.active ? (
                            <>
                              <UserCheck size={16} className="text-green-500" />
                              <span className="text-sm text-green-700">Aktiivinen</span>
                            </>
                          ) : (
                            <>
                              <UserX size={16} className="text-slate-400" />
                              <span className="text-sm text-slate-500">Ei aktiivinen</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Muokkaa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Poista"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Ei käyttäjiä
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagementView;
