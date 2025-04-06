import React, { ReactNode, useEffect } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// The actual reCAPTCHA site key
const RECAPTCHA_SITE_KEY = '6Lc_BQkrAAAAAFsiOOsjnnY5_S69i8zidb5oTRHw';

interface ReCaptchaProviderProps {
  children: ReactNode;
}

const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({ children }) => {
  // No longer need custom CSS injection for inline badge

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
      container={{
        parameters: {
          badge: 'inline', // Use inline badge to hide the default floating one
          theme: 'light',
        }
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default ReCaptchaProvider;