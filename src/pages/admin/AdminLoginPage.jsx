import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, LoaderCircle, LogIn } from 'lucide-react';
import Button from '../../components/Button.jsx';
import FormField from '../../components/FormField.jsx';
import AuthScreen from '../../components/admin/AuthScreen.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ERRORS = 'admin.auth.errors';
const FIELDS = ['email', 'password'];

// Firebase не уточняет, что именно неверно — email или пароль, и мы тоже не уточняем.
const ERROR_KEYS = {
  'auth/invalid-credential': 'invalid',
  'auth/invalid-email': 'invalid',
  'auth/user-not-found': 'invalid',
  'auth/wrong-password': 'invalid',
  'auth/user-disabled': 'invalid',
  'auth/too-many-requests': 'tooMany',
  'auth/network-request-failed': 'network',
  'auth/operation-not-allowed': 'notEnabled',
};

// Вход администратора по email и паролю.
export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const formRef = useRef(null);
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    setFailure(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const validationErrors = {};
    if (!values.email.trim()) validationErrors.email = { key: `${ERRORS}.emailRequired` };
    if (!values.password) validationErrors.password = { key: `${ERRORS}.passwordRequired` };
    setErrors(validationErrors);
    const firstInvalid = FIELDS.find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setLoading(true);
    setFailure(null);
    try {
      // После успешного входа панель откроется сама: состояние придёт из AuthContext.
      await signIn(values.email.trim(), values.password);
    } catch (error) {
      setFailure(ERROR_KEYS[error.code] ?? 'unknown');
      setLoading(false);
    }
  };

  const fieldProps = (name) => ({
    id: `login-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: handleChange,
    disabled: loading,
  });

  return (
    <AuthScreen title={t('admin.auth.title')} subtitle={t('admin.auth.subtitle')}>
      <form ref={formRef} className="admin-auth__form" onSubmit={handleSubmit} noValidate>
        <FormField
          {...fieldProps('email')}
          label={t('admin.auth.email')}
          placeholder={t('admin.auth.emailPlaceholder')}
          type="email"
          inputMode="email"
          autoComplete="username"
        />
        <FormField
          {...fieldProps('password')}
          label={t('admin.auth.password')}
          placeholder={t('admin.auth.passwordPlaceholder')}
          type="password"
          autoComplete="current-password"
        />

        {failure && (
          <div className="form-alert" role="alert">
            <CircleAlert size={22} aria-hidden="true" />
            <div>
              <p className="form-alert__title">{t('admin.auth.errorTitle')}</p>
              <p>{t(`${ERRORS}.${failure}`)}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          icon={loading ? <LoaderCircle size={19} className="spinner" /> : <LogIn size={18} />}
        >
          {loading ? t('admin.auth.submitting') : t('admin.auth.submit')}
        </Button>
      </form>
    </AuthScreen>
  );
}
