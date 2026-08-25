import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      className="fixed bottom-[24px] right-[24px] bg-[#1E3E2E] text-[#FBF7EC] py-[13px] px-[20px] rounded-[9px] text-[13.5px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] z-[200] flex items-center gap-[10px] animate-bounce-short"
      style={{ animation: 'slideUp 0.25s ease forwards' }}
    >
      <span>✨</span>
      <span>{toastMessage}</span>
    </div>
  );
};
