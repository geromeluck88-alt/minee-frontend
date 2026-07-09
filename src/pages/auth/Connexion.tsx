// src/pages/auth/Connexion.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
import { roleHome } from '@/lib/utils';

export default function Connexion() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={roleHome(user.role)} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(email, motDePasse);
      toast.success(`Bienvenue ${u.nom}`);
      navigate(roleHome(u.role), { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-bg via-bg to-bg-100">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-bg text-2xl mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold">MEE Cameroun</h1>
          <p className="text-text-muted text-sm mt-1">Plateforme de suivi des projets</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-5">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10" placeholder="vous@mee.cm"
              />
            </div>
          </div>

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                type="password" required value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="input pl-10" placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? <Spinner /> : <><LogIn className="w-4 h-4" /> Se connecter</>}
          </button>

          <p className="text-center text-sm text-text-muted">
            Pas de compte ?{' '}
            <Link to="/inscription" className="text-brand-cyan hover:underline">S'inscrire</Link>
          </p>
        </form>

        <div className="mt-6 card text-xs text-text-muted">
          <div className="font-semibold text-text mb-2">Comptes de test (mot de passe : password123)</div>
          <ul className="space-y-1">
            <li>• admin@mee.cm</li>
            <li>• chef.projet@mee.cm</li>
            <li>• chef.equipe@mee.cm</li>
            <li>• inspecteur@mee.cm</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
