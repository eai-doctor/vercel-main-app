// hooks/useSessionGuard.js
import { useIdleTimer } from 'react-idle-timer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function useSessionGuard(timeoutMs = 1000 * 60 * 15) {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(false);

  useIdleTimer({
    timeout: timeoutMs,
    onIdle: () => setIsLocked(true),   // 15 minutes
    onActive: () => {},
    debounce: 500,
  });

  return { isLocked, setIsLocked };
}