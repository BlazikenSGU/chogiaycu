import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './auth.css';

type Props = { title: ReactNode; children: ReactNode; footer: ReactNode };
export default function AuthLayout({ title, children, footer }: Props) {
  return <main className="auth-page"><section className="auth-shell">
    <header className="auth-topbar"><Link to="/" className="auth-back" aria-label="Quay về trang chủ"><ArrowLeft size={23} strokeWidth={1.8}/></Link></header>
    <div className="auth-content"><h1 className="auth-title">{title}</h1>{children}<AuthSocials/><p className="auth-footer">{footer}</p></div>
  </section></main>;
}
import AuthSocials from './AuthSocials';
