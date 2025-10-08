import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="w-[500px] rounded-lg bg-[#2a2a2a] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">Graphics Smasher</h2>
          <p className="text-lg text-gray-400">Version 2.0.0</p>
        </div>

        <div className="mb-6 space-y-4 text-center text-gray-300">
          <p>
            A powerful browser-based graphics editor with layers, selections, and advanced editing tools.
          </p>
          <p className="text-sm text-gray-400">
            Built with React, TypeScript, Konva, and Zustand
          </p>
        </div>

        <div className="mb-6 space-y-2 text-center text-sm text-gray-400">
          <p>© 2025 SmashingApps</p>
          <p>All rights reserved</p>
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/OpaceDigitalAgency/smashingappsv2"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-[#3a3a3a] px-4 py-2 text-white hover:bg-[#4a4a4a]"
          >
            View on GitHub
          </a>
          <button
            onClick={onClose}
            className="rounded bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;

