import { useState, type ComponentType, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
type IconType = ComponentType<{size?: number; 'aria-hidden'?: boolean}>;
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { icon: IconType; label: string; type?: 'text'|'email'|'password' };
export default function AuthInput({icon: Icon, label, type='text', ...props}: Props) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return <div className="auth-input-wrap">
    <Icon size={18} aria-hidden={true}/>
    <label className="auth-sr-only" htmlFor={props.id}>{label}</label>
    <input {...props} type={password && visible ? 'text' : type} aria-label={label}/>
    {password && <button type="button" className="auth-eye" disabled={props.disabled} onClick={()=>setVisible(v=>!v)} aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'} aria-pressed={visible}>{visible?<Eye size={19}/>:<EyeOff size={19}/>}</button>}
  </div>;
}
