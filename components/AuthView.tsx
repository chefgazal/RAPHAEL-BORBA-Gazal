'use client';

import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ChefHat } from 'lucide-react';

export default function AuthView() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingReset, setIsCheckingReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = (e: any) => {
    const errorCode = (e as AuthError).code;
    if (errorCode === 'auth/invalid-email') setError('E-mail inválido.');
    else if (errorCode === 'auth/user-not-found') setError('Usuário não encontrado.');
    else if (errorCode === 'auth/wrong-password') setError('Senha incorreta.');
    else if (errorCode === 'auth/email-already-in-use') setError('Este e-mail já está em uso.');
    else setError(e.message || 'Ocorreu um erro.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      if (isCheckingReset) {
        await sendPasswordResetEmail(auth, email);
        setMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setIsCheckingReset(false);
      } else if (isRegistering) {
        if (!fullName || !nickname) {
          setError('Nome completo e apelido são obrigatórios.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          email,
          fullName,
          nickname,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <ChefHat size={36} />
          </div>
          <h1 className="text-2xl font-bold font-inter text-text-main text-center">GR Produção</h1>
          <p className="text-sm text-text-muted mt-2 text-center text-balance">
            Entre para gerenciar sua produção e estoque.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-surface-dim shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error/10 text-error rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            {msg && (
              <div className="p-3 bg-secondary/10 text-secondary rounded-lg text-sm font-medium">
                {msg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-background border border-surface-dim rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {isRegistering && !isCheckingReset && (
              <>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full p-3 bg-background border border-surface-dim rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">Apelido (Exibição)</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    required
                    className="w-full p-3 bg-background border border-surface-dim rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </>
            )}

            {!isCheckingReset && (
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1 flex justify-between">
                  Senha
                  {!isRegistering && (
                    <button type="button" onClick={() => setIsCheckingReset(true)} className="text-primary hover:underline lowercase font-normal">
                      Esqueci a senha
                    </button>
                  )}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-background border border-surface-dim rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : isCheckingReset ? 'Enviar E-mail' : isRegistering ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium">
             {isCheckingReset ? (
               <button onClick={() => { setIsCheckingReset(false); setError(''); setMsg(''); }} className="text-text-muted hover:text-text-main">
                 Voltar para Login
               </button>
             ) : (
               <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setMsg(''); }} className="text-text-muted hover:text-text-main">
                 {isRegistering ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
