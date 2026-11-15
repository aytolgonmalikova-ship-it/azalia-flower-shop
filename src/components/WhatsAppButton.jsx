import { useTranslation } from 'react-i18next';
import { FaWhatsapp } from 'react-icons/fa6';
import Button from './Button.jsx';
import { WHATSAPP_URL } from '../data/contacts';

export default function WhatsAppButton({ className = '', size }) {
  const { t } = useTranslation();

  return (
    <Button
      href={WHATSAPP_URL}
      external
      variant="whatsapp"
      size={size}
      className={className}
      icon={<FaWhatsapp size={22} />}
    >
      {t('contact.whatsappButton')}
    </Button>
  );
}
