import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PageTransitionContextType {
  isFadingOutToBlackOverlay: boolean;
  startFadeOutToBlack: (path: string, duration?: number) => void;
}

const PageTransitionContext = createContext<
  PageTransitionContextType | undefined
>(undefined);

const CONTENT_FADE_IN_DURATION = 1000;

const PageContentAnimator: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  return (
    <div
      key={location.key}
      style={{
        animation: `contentFadeIn ${CONTENT_FADE_IN_DURATION}ms ease-in-out forwards`,
      }}
    >
      {children}
      <style>
        {`
          @keyframes contentFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export const PageTransitionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isFadingOutToBlackOverlay, setIsFadingOutToBlackOverlay] =
    useState(false);
  const [blackOverlayDuration, setBlackOverlayDuration] = useState(2000);
  const [isPageContentFadingIn, setIsPageContentFadingIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsPageContentFadingIn(true);
    const timer = setTimeout(() => {
      setIsPageContentFadingIn(false);
    }, CONTENT_FADE_IN_DURATION);

    return () => clearTimeout(timer);
  }, [location.key]);

  const startFadeOutToBlack = useCallback(
    (path: string, duration: number = 2000) => {
      setBlackOverlayDuration(duration);
      setIsFadingOutToBlackOverlay(true);

      setTimeout(() => {
        navigate(path);
        setIsFadingOutToBlackOverlay(false);
      }, duration);
    },
    [navigate]
  );

  return (
    <PageTransitionContext.Provider
      value={{ isFadingOutToBlackOverlay, startFadeOutToBlack }}
    >
      <PageContentAnimator>{children}</PageContentAnimator>

      {isFadingOutToBlackOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'black',
            opacity: 0,
            animation: `blackOverlayAppear ${blackOverlayDuration}ms ease-in-out forwards`,
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        />
      )}

      {isPageContentFadingIn && !isFadingOutToBlackOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'transparent',
            zIndex: 9998,
            pointerEvents: 'auto',
          }}
        />
      )}

      <style>
        {`
          @keyframes blackOverlayAppear {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = (): PageTransitionContextType => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      'usePageTransition must be used within a PageTransitionProvider'
    );
  }
  return {
    isFadingOutToBlackOverlay: context.isFadingOutToBlackOverlay,
    startFadeOutToBlack: context.startFadeOutToBlack,
  };
};
