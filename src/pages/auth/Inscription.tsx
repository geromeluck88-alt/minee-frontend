// src/pages/auth/Inscription.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
import { ROLE_LABEL, roleHome } from '@/lib/utils';
import type { Role } from '@/types';

export default function Inscription() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', email: '', motDePasse: '', telephone: '', role: 'CHEF_PROJET' as Role,
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={roleHome(user.role)} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/inscription', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Compte créé avec succès');
      navigate(roleHome(data.user.role), { replace: true });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-bg text-2xl mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-text-muted text-sm mt-1">MEE Cameroun — Suivi des projets</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="label">Nom complet</label>
            <input
              required value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="input" placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="input" placeholder="+237 6XX XX XX XX"
            />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input
              type="password" required minLength={6} value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="input"
            >
              {(['CHEF_PROJET', 'CHEF_EQUIPE', 'INSPECTEUR'] as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? <Spinner /> : <><UserPlus className="w-4 h-4" /> Créer le compte</>}
          </button>

          <p className="text-center text-sm text-text-muted">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-brand-cyan hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
