import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface GoogleOAuthButtonProps {
  onSuccess?: (isComplete: boolean) => void;
  onError?: (error: string) => void;
  buttonText?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  buttonText = 'Sign in with Google',
}) => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Environment Google Client ID or default Google App Client ID
  const clientId =
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    (import.meta as any).env?.REACT_APP_GOOGLE_CLIENT_ID ||
    '';

  useEffect(() => {
    // 1. Load Google Identity Services SDK
    const loadGsiScript = () => {
      if (document.getElementById('google-gsi-client')) {
        initGoogleGsi();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleGsi();
      };
      document.body.appendChild(script);
    };

    const initGoogleGsi = () => {
      if (window.google?.accounts?.id && clientId && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill',
          });
        } catch (err) {
          console.warn('Failed to render official Google button:', err);
        }
      }
    };

    loadGsiScript();
  }, [clientId]);

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setErrorMsg('No Google credential returned.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleLogin({ credential: response.credential });
      if (onSuccess) onSuccess(res.isComplete);
    } catch (err: any) {
      const msg = err.message || 'Google OAuth sign-in failed.';
      setErrorMsg(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomButtonClick = () => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt blocked or not displayed, use token client popup flow
          triggerOAuthPopupFlow();
        }
      });
    } else {
      triggerOAuthPopupFlow();
    }
  };

  const triggerOAuthPopupFlow = () => {
    if (!clientId) {
      setShowConfigHelp(true);
      return;
    }

    try {
      const client = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            setLoading(true);
            try {
              const res = await googleLogin({ access_token: tokenResponse.access_token });
              if (onSuccess) onSuccess(res.isComplete);
            } catch (err: any) {
              setErrorMsg(err.message || 'Google OAuth login failed.');
              if (onError) onError(err.message);
            } finally {
              setLoading(false);
            }
          }
        },
      });
      if (client) {
        client.requestAccessToken();
      } else {
        setShowConfigHelp(true);
      }
    } catch {
      setShowConfigHelp(true);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Container where official Google GIS Button is rendered if Client ID exists */}
      {clientId && <div ref={googleBtnRef} className="w-full min-h-[40px] flex justify-center" />}

      {/* Fallback Custom Google Styled Button */}
      {(!clientId || !window.google?.accounts?.id) && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{buttonText}</span>
        </button>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Config Helper Modal if VITE_GOOGLE_CLIENT_ID is not configured in .env */}
      {showConfigHelp && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 animate-fadeIn">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Google OAuth Setup Required</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            To enable production Google OAuth 2.0, set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> in your frontend <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">.env</code> environment file from your Google Cloud Console.
          </p>
          <div className="flex items-center justify-between pt-1">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-amber-900 underline flex items-center gap-1 hover:text-amber-950"
            >
              <span>Google Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setShowConfigHelp(false)}
              className="text-[10px] font-extrabold text-amber-700 hover:text-amber-900 uppercase"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
