import { useEffect, useRef } from 'react';

/**
 * EsewaRedirectForm — builds and auto-submits a hidden HTML form to eSewa's
 * payment URL with the signed fields returned by /api/payments/initiate.
 * Renders nothing visible; the browser navigates away on submit.
 */
export default function EsewaRedirectForm({ paymentUrl, formFields }) {
  const formRef = useRef(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} action={paymentUrl} method="POST" className="hidden">
      {Object.entries(formFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  );
}