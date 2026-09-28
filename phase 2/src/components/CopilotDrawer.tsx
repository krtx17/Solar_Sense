import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, Terminal, ExternalLink, CornerDownLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { CopilotMessage, SolarSystem, DeviationDecomposition, ForecastPoint, HealthComponents } from '../types/solar';
import { askSolarCopilot, CopilotContext } from '../services/copilotService';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  system: SolarSystem;
  decomposition: DeviationDecomposition;
  forecast: ForecastPoint[];
  health: HealthComponents;
  billsCount: number;
  onInspectEvidence?: (id: string) => void;
  isDarkTheme?: boolean;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  system,
  decomposition,
  forecast,
  health,
  billsCount,
  onInspectEvidence,
  isDarkTheme = true,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content: `Hello! I'm the SolarSense Copilot. I can inspect your ${system.name} system data, check physical baselines, explain anomalies, or recommend optimal appliance running times.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulateDegraded, setSimulateDegraded] = useState<boolean>(false);

  if (!isOpen) return null;

  const context: CopilotContext = {
    system,
    decomposition,
    forecast,
    health,
    billsCount,
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askSolarCopilot(text, context, messages, simulateDegraded);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: 'Unable to reach the copilot service. Your deterministic dashboard telemetry is unaffected.',
          timestamp: new Date().toISOString(),
          is_degraded: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Semi-transparent backdrop to isolate Copilot drawer and prevent overlapping */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        aria-hidden="true"
      />

      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 ${
        isDarkTheme ? 'bg-[#0B1322] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
      {/* Top Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between ${
        isDarkTheme ? 'bg-[#0D1527] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>SolarSense Copilot</h2>
            <div className={`text-[11px] flex items-center gap-1.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Grounded in {system.name} telemetry</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSimulateDegraded(!simulateDegraded)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              simulateDegraded
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                : isDarkTheme
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title="Simulate LLM outage to verify deterministic degradation message"
          >
            {simulateDegraded ? 'Offline Test' : 'Test Offline'}
          </button>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkTheme ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium shadow-xs'
                  : msg.is_degraded
                  ? isDarkTheme ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-950'
                  : isDarkTheme
                  ? 'bg-[#121B2F] text-slate-200 border border-slate-800 shadow-xs'
                  : 'bg-slate-100 text-slate-800 border border-slate-200/60'
              }`}
            >
              {/* Tool Execution Box (Transparency) */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="mb-2 p-2 bg-slate-950 text-slate-200 rounded-md font-mono text-[10px] space-y-1 border border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400 font-sans font-semibold">
                    <Terminal className="w-3 h-3" />
                    <span>Tool Invocation (Deterministic Execution):</span>
                  </div>
                  {msg.tool_calls.map((t, i) => (
                    <div key={i} className="border-t border-slate-800 pt-1">
                      <span className="text-sky-300 font-bold">{t.tool_name}()</span>: {t.result_summary}
                    </div>
                  ))}
                </div>
              )}

              <div>{msg.content}</div>

              {/* Evidence Chips */}
              {msg.evidence_chips && msg.evidence_chips.length > 0 && (
                <div className={`mt-2.5 pt-2 border-t flex flex-wrap gap-1.5 ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
                  <span className={`text-[10px] font-sans ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Sources:</span>
                  {msg.evidence_chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => onInspectEvidence && onInspectEvidence(chip.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors shadow-2xs ${
                        isDarkTheme
                          ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{chip.label}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className={`text-[10px] mt-1 px-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              {msg.sender === 'user' ? 'You' : 'SolarSense Copilot'}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${
            isDarkTheme ? 'bg-[#0D1527] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Executing telemetry tools & formatting grounded response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className={`px-4 py-2 border-t ${
        isDarkTheme ? 'border-slate-800 bg-[#090F1B]' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className={`text-[11px] font-medium mb-1.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Quick questions:</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend('Why did my solar drop on Tuesday?')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-colors shadow-2xs text-left ${
              isDarkTheme
                ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Why did my solar drop on Tuesday?
          </button>
          <button
            onClick={() => handleSend('When should I run my washing machine tomorrow?')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-colors shadow-2xs text-left ${
              isDarkTheme
                ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            When to run washing machine tomorrow?
          </button>
          <button
            onClick={() => handleSend('What is my generation vs clear-sky ratio?')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-colors shadow-2xs text-left ${
              isDarkTheme
                ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            What is my clear-sky health ratio?
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className={`p-3 border-t ${
        isDarkTheme ? 'border-slate-800 bg-[#0B1322]' : 'border-slate-200 bg-white'
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about generation, forecasts, or bills..."
            className={`flex-1 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDarkTheme
                ? 'bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-950'
                : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
            }`}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 font-bold rounded-lg transition-colors shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  </>
);
};
