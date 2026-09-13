import React, { useState } from 'react';
import { ApiEndpoint } from '../types/docs';
import { Play, Copy, Check, Lock, Send, RefreshCw, ChevronDown, ChevronRight, Layers, Terminal } from 'lucide-react';

interface ApiExplorerProps {
  endpoint: ApiEndpoint;
}

export function ApiExplorer({ endpoint }: ApiExplorerProps) {
  const [activeTab, setActiveTab] = useState<'interactive' | 'json' | 'headers'>('interactive');
  const [selectedResponseStatus, setSelectedResponseStatus] = useState<number>(200);
  const [apiKey, setApiKey] = useState<string>('nx_live_9948271049281');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1024);
  const [model, setModel] = useState<string>('ryvax-4-turbo');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const models = [
    { value: 'ryvax-4-turbo', label: 'ryvax-4-turbo (Flagship)' },
    { value: 'ryvax-flash-3', label: 'ryvax-flash-3 (Low Latency)' },
    { value: 'ryvax-4-pro', label: 'ryvax-4-pro (High Capacity)' },
  ];
  const [stream, setStream] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('List 3 principles of high-reliability distributed systems.');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSent, setHasSent] = useState<boolean>(false);
  const [simulatedLatency, setSimulatedLatency] = useState<number>(118);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const getMethodBadgeClass = () => {
    return 'bg-[#181818] text-neutral-200 border-[#141414]';
  };

  const handleSendRequest = () => {
    setIsLoading(true);
    setHasSent(true);

    const randomLatency = Math.floor(Math.random() * 80) + 75;
    setSimulatedLatency(randomLatency);

    setTimeout(() => {
      setIsLoading(false);
    }, randomLatency + 150);
  };

  const currentResponse = endpoint.responses.find(r => r.status === selectedResponseStatus) || endpoint.responses[0];

  const constructedPayload = {
    model,
    messages: [
      { role: 'system', content: 'You are a staff distributed systems engineer.' },
      { role: 'user', content: userPrompt }
    ],
    temperature,
    max_tokens: maxTokens,
    stream
  };

  const handleCopyResponse = () => {
    const text = typeof currentResponse.body === 'string' 
      ? currentResponse.body 
      : JSON.stringify(currentResponse.body, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="my-8 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      {/* Endpoint URL bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0d0d0d] border-b border-[#141414]">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-[6px] text-xs font-mono font-bold border ${getMethodBadgeClass()}`}>
            {endpoint.method}
          </span>
          <span className="font-mono text-sm font-semibold text-neutral-100">
            {endpoint.path}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {endpoint.authRequired && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-400 bg-[#141414] border border-[#141414] px-2 py-0.5 rounded-[6px]">
              <Lock className="w-3 h-3 text-neutral-400" />
              Auth Bearer Required
            </span>
          )}
          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">v1.2</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0a0a0a]">
        {/* Left Workbench: Request Configuration */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#141414] pb-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Request Parameters
            </h4>
            <div className="flex items-center gap-1 bg-[#111111] p-0.5 rounded-[6px] border border-[#141414] text-xs">
              <button
                onClick={() => setActiveTab('interactive')}
                className={`px-2.5 py-0.5 rounded-[6px] transition-colors ${
                  activeTab === 'interactive' ? 'bg-[#1e1e1e] text-white font-medium border border-[#141414] shadow-xs' : 'text-neutral-500 hover:text-white'
                }`}
              >
                Builder
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-2.5 py-0.5 rounded-[6px] transition-colors ${
                  activeTab === 'json' ? 'bg-[#1e1e1e] text-white font-medium border border-[#141414] shadow-xs' : 'text-neutral-500 hover:text-white'
                }`}
              >
                JSON Body
              </button>
            </div>
          </div>

          {/* Auth input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Bearer Token
            </label>
            <div className="relative">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-1.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] font-mono text-xs text-neutral-100 focus:ring-1 focus:ring-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {activeTab === 'interactive' ? (
            <div className="space-y-3 text-xs">
              {/* Model */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Model <span className="text-neutral-400">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-neutral-100 focus:ring-1 focus:ring-neutral-400 focus:outline-none font-mono text-left text-xs"
                    id="model-dropdown-trigger"
                  >
                    <span>{models.find(m => m.value === model)?.label || model}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Invisible click backdrop overlay to close the popover */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] py-1 shadow-lg z-50 font-mono text-xs">
                        {models.map((m) => {
                          const isSelected = m.value === model;
                          return (
                            <button
                              key={m.value}
                              type="button"
                              onClick={() => {
                                setModel(m.value);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#141414] transition-colors ${
                                isSelected ? 'text-white font-semibold bg-[#181818]' : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              <span>{m.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* User Prompt */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  User Message
                </label>
                <textarea
                  rows={3}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-neutral-100 focus:ring-1 focus:ring-neutral-400 focus:outline-none"
                />
              </div>

              {/* Temperature & Max tokens grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-neutral-300">Temperature</span>
                    <span className="font-mono text-neutral-500">{temperature.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0d0d0d] p-1 rounded-[6px] border border-[#141414]">
                    <button
                      type="button"
                      onClick={() => setTemperature(prev => Math.max(0, Number((prev - 0.05).toFixed(2))))}
                      className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-xs transition-colors"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono text-xs text-neutral-200 font-semibold">{temperature.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setTemperature(prev => Math.min(1, Number((prev + 0.05).toFixed(2))))}
                      className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-neutral-300">Max Tokens</span>
                    <span className="font-mono text-neutral-500">{maxTokens}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0d0d0d] p-1 rounded-[6px] border border-[#141414]">
                    <button
                      type="button"
                      onClick={() => setMaxTokens(prev => Math.max(128, prev - 128))}
                      className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-xs transition-colors"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono text-xs text-neutral-200 font-semibold">{maxTokens}</span>
                    <button
                      type="button"
                      onClick={() => setMaxTokens(prev => Math.min(4096, prev + 128))}
                      className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Streaming toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stream-check"
                  checked={stream}
                  onChange={(e) => setStream(e.target.checked)}
                  className="rounded-[6px] accent-neutral-300 border-[#141414]"
                />
                <label htmlFor="stream-check" className="font-medium text-neutral-300 cursor-pointer">
                  Stream response chunks (SSE)
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Raw JSON Request Body
              </label>
              <pre className="p-3 rounded-[6px] bg-[#080808] border border-[#141414] text-neutral-200 font-mono text-xs overflow-x-auto">
                {JSON.stringify(constructedPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* Send Request Button */}
          <div className="pt-2">
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-neutral-200 hover:bg-white text-neutral-950 font-semibold text-xs transition-all shadow-sm border border-[#141414] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting HTTP Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Workbench: Response Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#141414] pb-2">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Response Preview
            </h4>

            {/* Status Code Switcher */}
            <div className="flex items-center gap-1">
              {endpoint.responses.map((resp) => (
                <button
                  key={resp.status}
                  onClick={() => setSelectedResponseStatus(resp.status)}
                  className={`px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-medium transition-colors border ${
                    selectedResponseStatus === resp.status
                      ? 'bg-[#222222] text-white border-[#141414]'
                      : 'bg-[#111111] text-neutral-500 border-[#141414] hover:text-white'
                  }`}
                >
                  {resp.status}
                </button>
              ))}
            </div>
          </div>

          {/* Response Meta info */}
          <div className="flex items-center justify-between text-xs bg-[#0d0d0d] p-2.5 rounded-[6px] border border-[#141414] font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[6px] bg-neutral-300" />
              <span className="font-semibold text-neutral-100">
                {currentResponse.status} {currentResponse.statusText}
              </span>
            </div>
            <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
              <span>Time: <strong className="text-neutral-200">{hasSent ? `${simulatedLatency}ms` : '—'}</strong></span>
              <span>Size: <strong className="text-neutral-200">1.2 KB</strong></span>
            </div>
          </div>

          {/* Response Body Window */}
          <div className="relative rounded-[6px] bg-[#080808] border border-[#141414] overflow-hidden text-neutral-200">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d0d] border-b border-[#141414] text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">application/json</span>
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
              >
                {copiedResponse ? <Check className="w-3 h-3 text-neutral-200" /> : <Copy className="w-3 h-3" />}
                <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto max-h-[300px] text-neutral-200">
              {typeof currentResponse.body === 'string'
                ? currentResponse.body
                : JSON.stringify(currentResponse.body, null, 2)}
            </pre>
          </div>

          {/* Response headers preview */}
          <div className="text-[11px] text-neutral-500 font-mono space-y-1">
            <div>x-ryvax-request-id: <span className="text-neutral-300">req_8849201a9f02c</span></div>
            <div>x-ryvax-ratelimit-remaining: <span className="text-neutral-300">994</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
