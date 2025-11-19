"use client"

import { useState } from "react";
import AdminChatbot from "./AdminChatbot";

export default function AdminChatbotWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
        aria-label="Abrir asistente de IA"
      >
        <div className="relative">
          <span className="text-3xl">🤖</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Asistente de IA
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Chatbot Modal */}
      <AdminChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
