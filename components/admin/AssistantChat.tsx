"use client"

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasReport?: boolean;
  reportType?: 'sales' | 'products' | 'categories';
};

type AssistantChatProps = {
  userName: string;
};

const STORAGE_KEY = 'assistant_chat_history';

export default function AssistantChat({ userName }: AssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar historial desde localStorage solo en el cliente
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedMessages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        // Si hay error, cargar mensaje inicial
        setMessages([{
          role: 'assistant',
          content: `¡Hola ${userName}! 👋 Soy tu asistente de inteligencia de negocio. Puedo ayudarte con:\n\n📊 Análisis de ventas y estadísticas\n🔥 Productos más vendidos\n📦 Recomendaciones de abastecimiento\n📈 Reportes en Excel descargables\n💡 Insights del negocio\n\n¿En qué puedo ayudarte hoy?`,
          timestamp: new Date()
        }]);
      }
    } else {
      // Si no hay historial guardado, mostrar mensaje inicial
      setMessages([{
        role: 'assistant',
        content: `¡Hola ${userName}! 👋 Soy tu asistente de inteligencia de negocio. Puedo ayudarte con:\n\n📊 Análisis de ventas y estadísticas\n🔥 Productos más vendidos\n📦 Recomendaciones de abastecimiento\n📈 Reportes en Excel descargables\n💡 Insights del negocio\n\n¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      }]);
    }
  }, [userName]);

  // Guardar historial en localStorage cuando cambian los mensajes
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial de conversación?')) {
      const initialMessage: Message = {
        role: 'assistant',
        content: `¡Hola ${userName}! 👋 Soy tu asistente de inteligencia de negocio. Puedo ayudarte con:\n\n📊 Análisis de ventas y estadísticas\n🔥 Productos más vendidos\n📦 Recomendaciones de abastecimiento\n📈 Reportes en Excel descargables\n💡 Insights del negocio\n\n¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Historial limpiado');
    }
  };

  const detectReportRequest = (userMessage: string, aiResponse: string): { hasReport: boolean; reportType?: 'sales' | 'products' | 'categories' } => {
    const lowerUserMessage = userMessage.toLowerCase();
    const lowerAiResponse = aiResponse.toLowerCase();
    
    // Detectar si el usuario o Claude mencionan reportes/excel
    const mentionsReport = 
      lowerUserMessage.includes('reporte') || 
      lowerUserMessage.includes('informe') || 
      lowerUserMessage.includes('excel') ||
      lowerAiResponse.includes('reporte') ||
      lowerAiResponse.includes('excel') ||
      lowerAiResponse.includes('descargar');
    
    if (mentionsReport) {
      // Determinar el tipo de reporte basado en el contenido
      if (lowerUserMessage.includes('producto') || lowerAiResponse.includes('producto') || lowerUserMessage.includes('vendido')) {
        return { hasReport: true, reportType: 'products' };
      } else if (lowerUserMessage.includes('categoría') || lowerUserMessage.includes('categoria') || lowerAiResponse.includes('categoría')) {
        return { hasReport: true, reportType: 'categories' };
      } else {
        return { hasReport: true, reportType: 'sales' };
      }
    }
    
    return { hasReport: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          days
        })
      });

      if (!response.ok) {
        throw new Error('Error al obtener respuesta');
      }

      const data = await response.json();
      const reportDetection = detectReportRequest(userMessage.content, data.response);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        ...reportDetection
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al comunicarse con el asistente');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType: 'sales' | 'products' | 'categories') => {
    setDownloadingReport(true);
    
    try {
      const response = await fetch(`/api/admin/reports/excel?type=${reportType}&days=${days}`);
      
      if (!response.ok) {
        throw new Error('Error al generar reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${reportType}_${days}dias_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setDownloadingReport(false);
    }
  };

  const quickQuestions = [
    "¿Qué productos se vendieron más esta semana?",
    "¿De qué necesito abastecerme?",
    "Genera un reporte de ventas en Excel",
    "¿Qué categoría genera más ingresos?",
    "¿Qué día tengo más órdenes?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
      {/* Header del chat */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-semibold">Asistente activo</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white bg-opacity-20 text-white rounded-lg px-3 py-2 text-sm border border-white border-opacity-30 cursor-pointer"
          >
            <option value={7} className="text-gray-900">Últimos 7 días</option>
            <option value={30} className="text-gray-900">Últimos 30 días</option>
            <option value={90} className="text-gray-900">Últimos 90 días</option>
            <option value={180} className="text-gray-900">Últimos 6 meses</option>
          </select>
          <button
            onClick={clearHistory}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            title="Limpiar historial de conversación"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {!isClient ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Cargando...</div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <span className="text-lg">🤖</span>
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Botón de descarga si es un reporte */}
                  {message.hasReport && message.reportType && (
                    <button
                      onClick={() => handleDownloadReport(message.reportType!)}
                      disabled={downloadingReport}
                      className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {downloadingReport ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar Excel
                        </>
                      )}
                    </button>
                  )}
                  
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-amber-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 bg-white border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2 font-semibold">Preguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta o solicita un reporte..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
