export const isValidPhoneNumber = (phone: string) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone number');
  }
  if (!isAllowedCountryCode(phone)) {
    throw new Error('Invalid country code');
  }
};

export const ALLOWED_COUNTRY_CODES = ['+1'];

export const isAllowedCountryCode = (phoneNumber: string): boolean => {
  return ALLOWED_COUNTRY_CODES.some(code => phoneNumber.startsWith(code));
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface OTPCredential extends Credential {
  code: string;
}

export const listenForOTP = (signal: AbortSignal): Promise<string | null> => {
  if (!('OTPCredential' in window)) {
    return Promise.resolve(null);
  }

  return navigator.credentials
    .get({
      otp: { transport: ['sms'] },
      signal,
    } as CredentialRequestOptions)
    .then((credential) => {
      if (!credential) return null;
      return (credential as OTPCredential).code || null;
    })
    .catch((err) => {
      console.log('Web OTP API error:', err);
      return null;
    });
};

