import { useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleAlert, LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import Button from '../components/Button.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';
import FormField from '../components/FormField.jsx';
import { AuthChecking } from '../components/RequireAuth.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateField } from '../utils/validation';

const ERRORS = 'auth.errors';
const PASSWORD_MIN_LENGTH = 6;
const NAME_MAX_LENGTH = 40;
const EMPTY_VALUES = { name: '', email: '', password: '' };
const MODES = ['login', 'register'];
const FIELDS = {
  login: ['email', 'password'],
  register: ['name', 'email', 'password'],
};

// Коды ошибок Firebase → ключи переводов auth.errors.*.
// При входе Firebase не уточняет, что именно неверно — email или пароль, и мы тоже.
const ERROR_KEYS = {
  'auth/email-already-in-use': 'emailInUse',
  'auth/invalid-credential': 'invalid',
  'auth/user-not-found': 'invalid',
  'auth/wrong-password': 'invalid',
  'auth/user-disabled': 'disabled',
  'auth/invalid-email': 'emailInvalid',
  'auth/missing-password': 'passwordRequired',
  'auth/weak-password': 'weakPassword',
  'auth/too-many-requests': 'tooMany',
  'auth/network-request-failed': 'network',
  'auth/operation-not-allowed': 'notEnabled',
};

function validate(mode, values) {
  const errors = {};
  if (mode === 'register') {
    const nameError = validateField('name', values.name);
    if (nameError) errors.name = nameError;
  }
  const emailError = validateField('email', values.email);
  if (emailError) errors.email = emailError;

  if (!values.password) {
    errors.password = { key: `${ERRORS}.passwordRequired` };
  } else if (mode === 'register' && values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = { key: `${ERRORS}.weakPassword`, params: { min: PASSWORD_MIN_LENGTH } };
  }
  return errors;
}

// Вход и регистрация клиента: две вкладки на одной странице (/login).
export default function LoginPage() {
  const { t } = useTranslation();
  const { status, signInUser, register } = useAuth();
  const location = useLocation();
  const formRef = useRef(null);
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);

  if (status === 'loading') return <AuthChecking />;
  // Уже вошёл (или только что вошёл) — возвращаем туда, откуда пришёл, или в кабинет.
  if (status === 'signedIn') return <Navigate to={location.state?.from ?? '/account'} replace />;

  const isRegister = mode === 'register';

  const switchMode = (next) => {
    if (loading || next === mode) return;
    setMode(next);
    setErrors({});
    setFailure(null);
  };

  const handleTabKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const next = isRegister ? 'login' : 'register';
    switchMode(next);
    document.getElementById(`auth-tab-${next}`)?.focus();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    setFailure(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const validationErrors = validate(mode, values);
    setErrors(validationErrors);
    const firstInvalid = FIELDS[mode].find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setLoading(true);
    setFailure(null);
    try {
      // После успеха страница сменится сама: состояние входа придёт из AuthContext.
      if (isRegister) {
        await register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
      } else {
        await signInUser(values.email.trim(), values.password);
      }
    } catch (error) {
      setFailure(ERROR_KEYS[error.code] ?? 'unknown');
      setLoading(false);
    }
  };

  const fieldProps = (name) => ({
    id: `auth-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: handleChange,
    disabled: loading,
  });

  const SubmitIcon = isRegister ? UserPlus : LogIn;

  return (
    <section className="section auth-page" aria-labelledby="auth-title">
      <div className="container">
        <div className="card auth-card">
          <span className="logo__mark auth-card__mark" aria-hidden="true">
            <FlowerIcon size={34} />
          </span>
          <h1 id="auth-title" className="auth-card__title">
            {t(`auth.${mode}.title`)}
          </h1>
          <p className="auth-card__subtitle">{t(`auth.${mode}.subtitle`)}</p>

          <div className="auth-tabs" role="tablist" aria-label={t('auth.tabsLabel')}>
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                id={`auth-tab-${item}`}
                className={`auth-tabs__tab${mode === item ? ' is-active' : ''}`}
                aria-selected={mode === item}
                aria-controls="auth-panel"
                tabIndex={mode === item ? 0 : -1}
                disabled={loading}
                onClick={() => switchMode(item)}
                onKeyDown={handleTabKeyDown}
              >
                {t(`auth.tabs.${item}`)}
              </button>
            ))}
          </div>

          <form
            ref={formRef}
            id="auth-panel"
            role="tabpanel"
            aria-labelledby={`auth-tab-${mode}`}
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {isRegister && (
              <FormField
                {...fieldProps('name')}
                label={t('auth.fields.name')}
                placeholder={t('auth.fields.namePlaceholder')}
                type="text"
                autoComplete="name"
                maxLength={NAME_MAX_LENGTH}
              />
            )}
            <FormField
              {...fieldProps('email')}
              label={t('auth.fields.email')}
              placeholder={t('auth.fields.emailPlaceholder')}
              type="email"
              inputMode="email"
              autoComplete={isRegister ? 'email' : 'username'}
            />
            <FormField
              {...fieldProps('password')}
              label={t('auth.fields.password')}
              placeholder={
                isRegister
                  ? t('auth.fields.newPasswordPlaceholder', { min: PASSWORD_MIN_LENGTH })
                  : t('auth.fields.passwordPlaceholder')
              }
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />

            {failure && (
              <div className="form-alert" role="alert">
                <CircleAlert size={22} aria-hidden="true" />
                <div>
                  <p className="form-alert__title">{t(`auth.${mode}.errorTitle`)}</p>
                  <p>{t(`${ERRORS}.${failure}`, { min: PASSWORD_MIN_LENGTH })}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
              aria-busy={loading}
              icon={
                loading ? <LoaderCircle size={19} className="spinner" /> : <SubmitIcon size={18} />
              }
            >
              {loading ? t(`auth.${mode}.submitting`) : t(`auth.${mode}.submit`)}
            </Button>
          </form>

          <p className="auth-card__switch">
            <span>{t(`auth.${mode}.switchText`)} </span>
            <button
              type="button"
              className="auth-card__switch-link"
              disabled={loading}
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
            >
              {t(`auth.${mode}.switchAction`)}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
