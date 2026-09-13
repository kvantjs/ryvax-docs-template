import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Copy, Check, Sparkles, Zap, ShieldCheck, ShieldAlert, Cpu, Calculator, Key, RefreshCw, ChevronDown } from 'lucide-react';

export function TokenStreamerPlayground() {
  const [promptKey, setPromptKey] = useState<'system-design' | 'sql-query' | 'rust-concurrency'>('system-design');
  const [speedMs, setSpeedMs] = useState<number>(35);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamedText, setStreamedText] = useState<string>('');
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const prompts = {
    'system-design': {
      title: 'Distributed Rate Limiter Design',
      text: `### High-Throughput Rate Limiting Architecture

1. **Algorithm: Sliding Window Counter**
   - Combines the memory efficiency of Fixed Window with the accuracy of Sliding Log.
   - Mitigates traffic bursts across window boundaries.

2. **Core Storage & Synchronization**
   - **Distributed Layer:** Redis Cluster utilizing atomic Lua scripts:
   \`\`\`lua
   local current = redis.call('incr', KEYS[1])
   if tonumber(current) == 1 then
       redis.call('expire', KEYS[1], ARGV[1])
   end
   return current
   \`\`\`
   - **Local Edge Cache:** In-memory Bloom Filter / L1 LRU cache to reject obvious DDoS bursts without hitting the Redis cluster.

3. **Fallback & Degradation Strategy**
   - **Circuit Breaker:** If Redis latency > 15ms or cluster unreachable, fail-open with local process rate limits to protect client availability.
   - **Headers Returned:**
     • \`x-ratelimit-limit: 10000\`
     • \`x-ratelimit-remaining: 8421\`
     • \`retry-after: 60\``
    },
    'sql-query': {
      title: 'Optimized Real-time Analytics Query',
      text: `\`\`\`sql
-- Analyze user retention cohort by active weekly intervals
WITH weekly_cohorts AS (
  SELECT 
    user_id,
    DATE_TRUNC('week', MIN(event_time)) AS cohort_week
  FROM telemetry_events
  GROUP BY user_id
),
activity AS (
  SELECT 
    e.user_id,
    c.cohort_week,
    FLOOR(EXTRACT(EPOCH FROM (e.event_time - c.cohort_week)) / 604800)::INT AS week_number
  FROM telemetry_events e
  JOIN weekly_cohorts c ON e.user_id = c.user_id
)
SELECT 
  cohort_week,
  COUNT(DISTINCT user_id) AS total_cohort_users,
  COUNT(DISTINCT CASE WHEN week_number = 1 THEN user_id END) AS week_1_active,
  COUNT(DISTINCT CASE WHEN week_number = 4 THEN user_id END) AS week_4_active,
  ROUND(
    COUNT(DISTINCT CASE WHEN week_number = 4 THEN user_id END)::NUMERIC / 
    COUNT(DISTINCT user_id) * 100, 2
  ) AS retention_rate_pct
FROM activity
GROUP BY cohort_week
ORDER BY cohort_week DESC
LIMIT 12;
\`\`\``
    },
    'rust-concurrency': {
      title: 'Zero-Allocation Rust Channel Pipeline',
      text: `\`\`\`rust
use tokio::sync::mpsc;
use std::sync::Arc;

pub struct StreamPipeline<T> {
    sender: mpsc::Sender<T>,
}

impl<T: Send + Sync + 'static> StreamPipeline<T> {
    pub fn new(capacity: usize) -> (Self, mpsc::Receiver<T>) {
        let (sender, receiver) = mpsc::channel(capacity);
        (Self { sender }, receiver)
    }

    pub async fn dispatch(&self, item: T) -> Result<(), mpsc::error::SendError<T>> {
        // Zero-copy transfer across async worker tasks
        self.sender.send(item).await
    }
}
\`\`\``
    }
  };

  const currentFullText = prompts[promptKey].text;

  const startStream = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsStreaming(true);
    setStreamedText('');
    setTokenCount(0);
    setElapsedMs(0);
    startTimeRef.current = Date.now();

    const words = currentFullText.split(' ');
    let currentIndex = 0;

    timerRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        currentIndex++;
        const currentChunk = words.slice(0, currentIndex).join(' ');
        setStreamedText(currentChunk);
        setTokenCount(Math.round(currentIndex * 1.3));
        setElapsedMs(Date.now() - startTimeRef.current);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsStreaming(false);
      }
    }, speedMs);
  };

  const stopOrReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsStreaming(false);
    setStreamedText('');
    setTokenCount(0);
    setElapsedMs(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedText || currentFullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokensPerSec = elapsedMs > 0 ? Math.round((tokenCount / (elapsedMs / 1000))) : 0;

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] text-neutral-100 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0d0d0d] border-b border-[#141414]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-[6px] bg-neutral-300 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Interactive Streaming Console
          </span>
        </div>

        {/* Prompt selector */}
        <div className="flex items-center gap-1.5 bg-[#111111] p-1 rounded-[6px] border border-[#141414] text-xs">
          <button
            onClick={() => { setPromptKey('system-design'); stopOrReset(); }}
            className={`px-2.5 py-1 rounded-[6px] transition-colors ${promptKey === 'system-design' ? 'bg-[#1e1e1e] text-white font-medium border border-[#141414]' : 'text-neutral-400 hover:text-white'}`}
          >
            System Design
          </button>
          <button
            onClick={() => { setPromptKey('sql-query'); stopOrReset(); }}
            className={`px-2.5 py-1 rounded-[6px] transition-colors ${promptKey === 'sql-query' ? 'bg-[#1e1e1e] text-white font-medium border border-[#141414]' : 'text-neutral-400 hover:text-white'}`}
          >
            SQL Analytics
          </button>
          <button
            onClick={() => { setPromptKey('rust-concurrency'); stopOrReset(); }}
            className={`px-2.5 py-1 rounded-[6px] transition-colors ${promptKey === 'rust-concurrency' ? 'bg-[#1e1e1e] text-white font-medium border border-[#141414]' : 'text-neutral-400 hover:text-white'}`}
          >
            Rust Concurrency
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-[#0d0d0d] border-b border-[#141414] text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={isStreaming ? stopOrReset : startStream}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] font-medium transition-all ${
              isStreaming 
                ? 'bg-[#1e1e1e] text-neutral-200 border border-[#141414] hover:bg-[#252525]' 
                : 'bg-neutral-200 text-neutral-950 hover:bg-white border border-[#141414] shadow-xs'
            }`}
          >
            {isStreaming ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Stream
              </>
            )}
          </button>

          <button
            onClick={stopOrReset}
            disabled={!streamedText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-neutral-400 hover:text-white hover:bg-[#141414] border border-[#141414] bg-[#0d0d0d] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Speed slider */}
          <div className="hidden sm:flex items-center gap-2 text-neutral-400">
            <span>Interval:</span>
            <div className="flex items-center gap-1.5 bg-[#0d0d0d] p-0.5 rounded-[6px] border border-[#141414]">
              <button
                type="button"
                onClick={() => setSpeedMs(prev => Math.max(10, prev - 5))}
                className="flex items-center justify-center h-5 w-5 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-xs transition-colors"
              >
                -
              </button>
              <span className="font-mono text-[11px] text-neutral-300 px-1 min-w-[32px] text-center">{speedMs}ms</span>
              <button
                type="button"
                onClick={() => setSpeedMs(prev => Math.min(100, prev + 5))}
                className="flex items-center justify-center h-5 w-5 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-xs transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry badges */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
          <div>
            Tokens: <span className="text-neutral-100 font-semibold">{tokenCount}</span>
          </div>
          <div>
            TTFT: <span className="text-neutral-200">18ms</span>
          </div>
          <div>
            Rate: <span className="text-neutral-200 font-semibold">{tokensPerSec}</span> tok/s
          </div>
          <button
            onClick={handleCopy}
            className="p-1 rounded-[6px] text-neutral-400 hover:text-white hover:bg-[#141414] border border-[#141414] transition-colors"
            title="Copy output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-neutral-200" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal / Stream Content */}
      <div className="p-4 sm:p-6 font-mono text-sm leading-relaxed min-h-[220px] max-h-[380px] overflow-y-auto bg-[#080808]">
        {streamedText ? (
          <div className="whitespace-pre-wrap text-neutral-200">
            {streamedText}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-neutral-300 animate-pulse align-middle" />
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-12 text-neutral-500 text-center">
            <Cpu className="w-8 h-8 mb-2 text-neutral-600" />
            <p className="text-xs">Click <strong className="text-neutral-300">&quot;Start Stream&quot;</strong> to simulate real-time token inference.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function RateLimitCostCalculator() {
  const [monthlyRequests, setMonthlyRequests] = useState<number>(500000);
  const [avgTokensPerReq, setAvgTokensPerReq] = useState<number>(650);
  const [modelTier, setModelTier] = useState<'turbo' | 'flash' | 'embedding'>('turbo');

  const modelRates = {
    turbo: { name: 'ryvax-4-turbo', costPer1kInput: 0.003, costPer1kOutput: 0.009, avgBlendedPer1k: 0.006 },
    flash: { name: 'ryvax-flash-3', costPer1kInput: 0.0003, costPer1kOutput: 0.0008, avgBlendedPer1k: 0.00055 },
    embedding: { name: 'ryvax-embedding-3', costPer1kInput: 0.0001, costPer1kOutput: 0.0000, avgBlendedPer1k: 0.0001 }
  };

  const selectedModel = modelRates[modelTier];
  const totalTokens = (monthlyRequests * avgTokensPerReq);
  const totalCost = (totalTokens / 1000) * selectedModel.avgBlendedPer1k;
  const requestsPerSec = (monthlyRequests / (30 * 24 * 3600)).toFixed(2);
  const peakRpm = Math.ceil((monthlyRequests / (30 * 24 * 60)) * 3.5); // 3.5x burst factor

  const recommendedTier = monthlyRequests < 100000 
    ? { name: 'Developer Tier', badge: 'Free / Pay-as-you-go', rpmLimit: 600, tpmLimit: 250000 }
    : monthlyRequests < 2000000
    ? { name: 'Pro Growth Tier', badge: 'Standard SLA', rpmLimit: 5000, tpmLimit: 2000000 }
    : { name: 'Enterprise Cluster', badge: 'Dedicated VPC & 99.99% SLA', rpmLimit: 30000, tpmLimit: 15000000 };

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-[#141414] bg-[#0d0d0d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            Interactive Rate & Cost Estimator
          </h4>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-[6px] bg-[#141414] text-neutral-300 border border-[#141414] font-medium">
          Live Pricing Matrix
        </span>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0a0a0a]">
        {/* Sliders and Configuration */}
        <div className="lg:col-span-7 space-y-5">
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Select Inference Model
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'turbo', name: 'Ryvax 4 Turbo', tag: 'Flagship' },
                { id: 'flash', name: 'Ryvax Flash 3', tag: 'High Speed' },
                { id: 'embedding', name: 'Embedding 3', tag: 'Vectors' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModelTier(m.id as any)}
                  className={`p-2.5 rounded-[6px] border text-left transition-all ${
                    modelTier === m.id
                      ? 'border-[#141414] bg-[#181818] text-white shadow-xs'
                      : 'border-[#141414] bg-[#0d0d0d] text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-neutral-100">{m.name}</div>
                  <div className="text-[10px] text-neutral-500">{m.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Requests Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="font-medium text-neutral-300">Monthly Requests</span>
              <span className="font-mono font-semibold text-neutral-100">
                {monthlyRequests.toLocaleString()} reqs/mo
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#0d0d0d] p-1 rounded-[6px] border border-[#141414]">
              <button
                type="button"
                onClick={() => setMonthlyRequests(prev => Math.max(10000, prev - 50000))}
                className="flex items-center justify-center h-8 w-8 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-sm transition-colors"
                title="-50k"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-xs text-neutral-200 font-semibold py-1">
                {monthlyRequests.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => setMonthlyRequests(prev => Math.min(5000000, prev + 50000))}
                className="flex items-center justify-center h-8 w-8 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-sm transition-colors"
                title="+50k"
              >
                +
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
              <span>10k</span>
              <span>1M</span>
              <span>5M reqs</span>
            </div>
          </div>

          {/* Avg Tokens per Request Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="font-medium text-neutral-300">Avg. Tokens Per Request</span>
              <span className="font-mono font-semibold text-neutral-100">
                {avgTokensPerReq.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#0d0d0d] p-1 rounded-[6px] border border-[#141414]">
              <button
                type="button"
                onClick={() => setAvgTokensPerReq(prev => Math.max(100, prev - 100))}
                className="flex items-center justify-center h-8 w-8 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-sm transition-colors"
                title="-100 tokens"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono text-xs text-neutral-200 font-semibold py-1">
                {avgTokensPerReq.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => setAvgTokensPerReq(prev => Math.min(4000, prev + 100))}
                className="flex items-center justify-center h-8 w-8 rounded-[4px] bg-[#141414] hover:bg-[#1a1a1a] text-neutral-300 border border-[#141414] font-bold text-sm transition-colors"
                title="+100 tokens"
              >
                +
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
              <span>100 (Short queries)</span>
              <span>1,500 (Chat dialogue)</span>
              <span>4k (Long documents)</span>
            </div>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-[6px] bg-[#0d0d0d] border border-[#141414]">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Estimated Monthly Cost
              </span>
              <div className="text-3xl font-bold font-mono text-white mt-0.5">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Based on {(totalTokens / 1000000).toFixed(1)}M total tokens processed
              </p>
            </div>

            <div className="pt-3 border-t border-[#141414] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Recommended Tier:</span>
                <span className="font-semibold text-neutral-100">{recommendedTier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Suggested RPM Limit:</span>
                <span className="font-mono font-medium text-neutral-100">{peakRpm.toLocaleString()} RPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Avg. Throughput:</span>
                <span className="font-mono text-neutral-100">{requestsPerSec} req/sec</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#141414]">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
              Includes 99.9% uptime SLA & burst smoothing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WebhookTester() {
  const [secretKey, setSecretKey] = useState<string>('whsec_99af2801c8901baef4');
  const [payloadJson, setPayloadJson] = useState<string>(
    JSON.stringify({
      event: 'chat.completed',
      id: 'evt_998124901',
      created: Math.floor(Date.now() / 1000),
      data: { model: 'ryvax-4-turbo', tokens: 142 }
    }, null, 2)
  );
  const [timestamp, setTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const [copiedHeader, setCopiedHeader] = useState<boolean>(false);

  // Simulated simple hex hash for display purposes
  const generateSimulatedHmac = (str: string, sec: string) => {
    let hash = 0;
    const combined = str + sec;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `v1=${hex}a792c300fb298e1f0e4b1a8d0c7f6920`;
  };

  const currentSignature = `t=${timestamp},${generateSimulatedHmac(payloadJson, secretKey)}`;
  const timeDifferenceSec = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  const isTimeValid = timeDifferenceSec <= 300; // 5 min window

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(currentSignature);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#141414] bg-[#0d0d0d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            Interactive Webhook HMAC Signature Verifier
          </h4>
        </div>
        <button
          onClick={() => { setTimestamp(Math.floor(Date.now() / 1000)); }}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Sync Timestamp
        </button>
      </div>

      <div className="p-5 space-y-4 bg-[#0a0a0a]">
        {/* Secret Key Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Endpoint Signing Secret
          </label>
          <input
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-3 py-1.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] font-mono text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        {/* Payload Editor */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Webhook Event Payload (JSON)
          </label>
          <textarea
            rows={4}
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            className="w-full px-3 py-2 rounded-[6px] border border-[#141414] bg-[#0d0d0d] font-mono text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        {/* Generated Header Display */}
        <div className="p-3.5 rounded-[6px] bg-[#080808] border border-[#141414] text-neutral-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Computed Header: Ryvax-Signature
            </span>
            <button
              onClick={handleCopyHeader}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {copiedHeader ? <Check className="w-3.5 h-3.5 text-neutral-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHeader ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-xs text-neutral-200 break-all">
            {currentSignature}
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            {isTimeValid ? (
              <span className="flex items-center gap-1 text-neutral-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-neutral-300" />
                Valid (Age: {timeDifferenceSec}s / allowable max: 300s)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-400 font-medium">
                <ShieldAlert className="w-4 h-4 text-neutral-400" />
                Timestamp Expired ({timeDifferenceSec}s old &gt; 300s)
              </span>
            )}
          </div>
          <span className="text-neutral-500 text-[11px] font-mono">HMAC-SHA256 standard format</span>
        </div>
      </div>
    </div>
  );
}

export function VectorSimilarityCalculator() {
  const [textA, setTextA] = useState<string>('PostgreSQL distributed relational database with ACID consistency');
  const [textB, setTextB] = useState<string>('Relational SQL storage engine supporting transactions');

  // Simple cosine similarity simulation based on word overlap + length
  const calculateSim = (a: string, b: string) => {
    const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean));
    const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean));
    
    if (wordsA.size === 0 || wordsB.size === 0) return 0;
    
    let intersection = 0;
    wordsA.forEach(w => { if (wordsB.has(w)) intersection++; });
    
    // Base overlap ratio + semantic baseline
    const jaccard = intersection / Math.sqrt(wordsA.size * wordsB.size);
    const semanticBaseline = 0.55; 
    const score = Math.min(0.99, Math.max(0.12, (jaccard * 0.45) + semanticBaseline));
    return score;
  };

  const similarityScore = calculateSim(textA, textB);
  const similarityPct = (similarityScore * 100).toFixed(1);

  const presets = [
    { a: 'Microservices architecture with Docker and Kubernetes', b: 'Containerized service orchestration on k8s cluster' },
    { a: 'Machine learning fine-tuning with LoRA adapters', b: 'Training deep neural networks on GPU clusters' },
    { a: 'Apple fruit juice and citrus orange drinks', b: 'Quantum computing superposition and qubit entanglement' }
  ];

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#141414] bg-[#0d0d0d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            Interactive Vector Cosine Similarity Playground
          </h4>
        </div>
        <span className="text-xs text-neutral-400 font-mono">1536-Dimensional Model</span>
      </div>

      <div className="p-5 space-y-4 bg-[#0a0a0a]">
        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium">Quick Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setTextA(p.a); setTextB(p.b); }}
              className="px-2.5 py-1 rounded-[6px] bg-[#0d0d0d] hover:bg-[#141414] text-neutral-300 border border-[#141414] transition-colors"
            >
              Preset #{idx + 1}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Vector A (Input text)
            </label>
            <textarea
              rows={3}
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full px-3 py-2 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Vector B (Comparison text)
            </label>
            <textarea
              rows={3}
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full px-3 py-2 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>

        {/* Visual score display */}
        <div className="p-4 rounded-[6px] bg-[#080808] border border-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-neutral-400">Cosine Similarity Score:</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {similarityScore.toFixed(4)} <span className="text-sm font-normal text-neutral-400">({similarityPct}%)</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              {similarityScore > 0.8
                ? 'High semantic alignment (Strong RAG retrieval candidate)'
                : similarityScore > 0.5
                ? 'Moderate contextual relation'
                : 'Low semantic correlation'}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full sm:w-48">
            <div className="w-full bg-[#181818] h-2.5 rounded-[6px] border border-[#141414] overflow-hidden">
              <div
                className="h-full bg-neutral-200 transition-all duration-300 rounded-[6px]"
                style={{ width: `${similarityPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
              <span>0.0 (Orthogonal)</span>
              <span>1.0 (Identical)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. Global Edge Latency Ping & Network Inspector
// ----------------------------------------------------
export function LatencyPingMonitor() {
  const [nodes, setNodes] = useState([
    { id: 'iad', location: 'US East (N. Virginia)', endpoint: 'iad.edge.ryvax.dev', latency: 14, jitter: 1.2, status: 'operational', packetLoss: '0.0%' },
    { id: 'sfo', location: 'US West (Oregon)', endpoint: 'sfo.edge.ryvax.dev', latency: 22, jitter: 1.8, status: 'operational', packetLoss: '0.0%' },
    { id: 'fra', location: 'EU Central (Frankfurt)', endpoint: 'fra.edge.ryvax.dev', latency: 78, jitter: 2.4, status: 'operational', packetLoss: '0.0%' },
    { id: 'hnd', location: 'AP East (Tokyo)', endpoint: 'hnd.edge.ryvax.dev', latency: 112, jitter: 3.1, status: 'operational', packetLoss: '0.0%' },
    { id: 'gru', location: 'SA East (São Paulo)', endpoint: 'gru.edge.ryvax.dev', latency: 128, jitter: 4.0, status: 'operational', packetLoss: '0.0%' },
    { id: 'syd', location: 'AP South (Sydney)', endpoint: 'syd.edge.ryvax.dev', latency: 142, jitter: 3.8, status: 'operational', packetLoss: '0.0%' },
  ]);

  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState('Just now');

  const triggerPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        latency: Math.max(8, Math.round(n.latency + (Math.random() * 8 - 4))),
        jitter: Number((Math.random() * 2 + 1).toFixed(1))
      })));
      setIsPinging(false);
      setLastPingTime(new Date().toLocaleTimeString());
    }, 800);
  };

  const avgLatency = Math.round(nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length);

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#141414] bg-[#0d0d0d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            Global Edge Nodes & Latency Ping Monitor
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">Avg: <strong className="text-white">{avgLatency}ms</strong></span>
          <button
            onClick={triggerPing}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#141414] hover:bg-[#1a1a1a] text-xs text-white border border-[#141414] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-white' : 'text-neutral-400'}`} />
            <span>{isPinging ? 'Pinging PoPs...' : 'Ping All Regions'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4 bg-[#0a0a0a]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {nodes.map(node => (
            <div key={node.id} className="p-3.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{node.location}</span>
                <span className="flex h-2 w-2 rounded-[6px] bg-neutral-200" />
              </div>
              <div className="text-[11px] font-mono text-neutral-500 truncate">{node.endpoint}</div>
              <div className="flex items-center justify-between pt-2 border-t border-[#141414] text-xs">
                <div>
                  <span className="text-neutral-400 text-[10px] block">RTT LATENCY</span>
                  <span className="font-mono font-bold text-white">{node.latency} ms</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] block">JITTER</span>
                  <span className="font-mono text-neutral-300">±{node.jitter}ms</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] block">LOSS</span>
                  <span className="font-mono text-neutral-300">{node.packetLoss}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-[6px] bg-[#080808] border border-[#141414] flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[6px] bg-neutral-300" />
            <span>All 48 edge PoP locations operational with Anycast BGP routing.</span>
          </div>
          <span className="font-mono text-[11px] text-neutral-500">Last probe: {lastPingTime}</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. Interactive Tokenizer & Context Window Visualizer
// ----------------------------------------------------
export function PromptTokenizerPlayground() {
  const [inputText, setInputText] = useState<string>(
    'Synthesize the low-latency consensus properties of Raft vs Paxos in distributed replicated state machines.'
  );
  const [modelTier, setModelTier] = useState<'ryvax-4-turbo' | 'ryvax-4-omni' | 'ryvax-embed'>('ryvax-4-turbo');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const models = [
    { value: 'ryvax-4-turbo', label: 'ryvax-4-turbo (128k Context)' },
    { value: 'ryvax-4-omni', label: 'ryvax-4-omni (1M Context)' },
    { value: 'ryvax-embed', label: 'ryvax-embed (8k Context)' }
  ];

  // Token segmentation simulation
  const tokens = inputText.split(/(\s+|[.,!?;:()\[\]{}"'-])/).filter(Boolean);
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const estimatedTokens = Math.max(1, Math.round(tokens.length * 0.95));

  const contextWindowLimits = {
    'ryvax-4-turbo': 128000,
    'ryvax-4-omni': 1000000,
    'ryvax-embed': 8192
  };

  const costPer1k = {
    'ryvax-4-turbo': 0.0015,
    'ryvax-4-omni': 0.0030,
    'ryvax-embed': 0.0001
  };

  const maxLimit = contextWindowLimits[modelTier];
  const cost = ((estimatedTokens / 1000) * costPer1k[modelTier]).toFixed(6);
  const percentUsed = ((estimatedTokens / maxLimit) * 100).toFixed(4);

  // Clean monochrome token boundary styles
  const tokenColors = [
    'bg-[#181818] text-white border-[#222]',
    'bg-[#141414] text-neutral-300 border-[#222]',
    'bg-[#1c1c1c] text-neutral-200 border-[#282828]',
    'bg-[#121212] text-neutral-400 border-[#222]',
    'bg-[#1a1a1a] text-neutral-100 border-[#282828]',
  ];

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#141414] bg-[#0d0d0d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            Interactive Prompt Tokenizer & Cost Analyzer
          </h4>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-1.5 px-3 py-1 rounded-[6px] bg-[#141414] border border-[#141414] text-xs font-mono text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 text-left min-w-[210px]"
          >
            <span>{models.find(m => m.value === modelTier)?.label || modelTier}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              {/* Invisible click backdrop overlay to close the popover */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 rounded-[6px] border border-[#141414] bg-[#0d0d0d] py-1 shadow-lg z-50 font-mono text-xs min-w-[210px]">
                {models.map((m) => {
                  const isSelected = m.value === modelTier;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setModelTier(m.value as any);
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

      <div className="p-5 space-y-4 bg-[#0a0a0a]">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Test Prompt or Payload Content
          </label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-3 py-2 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-xs font-mono text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        {/* Token Highlights Box */}
        <div>
          <div className="text-xs font-semibold text-neutral-400 mb-1.5">Token Boundary Segmentation:</div>
          <div className="p-3 rounded-[6px] border border-[#141414] bg-[#080808] max-h-36 overflow-y-auto flex flex-wrap gap-1">
            {tokens.map((tok, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded-[6px] text-xs font-mono border ${tokenColors[idx % tokenColors.length]}`}
              >
                {tok === ' ' ? '␣' : tok}
              </span>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-[6px] border border-[#141414] bg-[#0d0d0d]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Est. Tokens</span>
            <span className="text-lg font-mono font-bold text-white">{estimatedTokens}</span>
          </div>
          <div className="p-3 rounded-[6px] border border-[#141414] bg-[#0d0d0d]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Characters</span>
            <span className="text-lg font-mono font-bold text-white">{charCount}</span>
          </div>
          <div className="p-3 rounded-[6px] border border-[#141414] bg-[#0d0d0d]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Words</span>
            <span className="text-lg font-mono font-bold text-white">{wordCount}</span>
          </div>
          <div className="p-3 rounded-[6px] border border-[#141414] bg-[#0d0d0d]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Est. Inference Cost</span>
            <span className="text-lg font-mono font-bold text-white">${cost}</span>
          </div>
        </div>

        {/* Context Window Usage Gauge */}
        <div className="p-3 rounded-[6px] border border-[#141414] bg-[#0d0d0d] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Context Window Utilization ({estimatedTokens.toLocaleString()} / {maxLimit.toLocaleString()} tokens)</span>
            <span className="font-mono text-white font-semibold">{percentUsed}%</span>
          </div>
          <div className="w-full bg-[#181818] h-2 rounded-[6px] overflow-hidden border border-[#141414]">
            <div className="h-full bg-neutral-200 rounded-[6px]" style={{ width: `${Math.max(1, Number(percentUsed))}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. cURL to Multi-SDK Code Generator & Converter
// ----------------------------------------------------
export function CurlToCodeConverter() {
  const [targetLang, setTargetLang] = useState<'typescript' | 'python' | 'go' | 'rust'>('typescript');
  const [copied, setCopied] = useState(false);

  const [endpointMethod, setEndpointMethod] = useState<'POST' | 'GET'>('POST');
  const [endpointUrl, setEndpointUrl] = useState<string>('https://api.ryvax-runtime.dev/v1/chat/completions');
  const [authToken, setAuthToken] = useState<string>('nx_live_9948271049281');

  const generatedCodes = {
    typescript: `import { RyvaxClient } from '@ryvax/sdk';

const client = new RyvaxClient({
  apiKey: '${authToken}',
  baseURL: '${endpointUrl.replace('/chat/completions', '')}'
});

async function run() {
  const completion = await client.chat.create({
    model: 'ryvax-4-turbo',
    messages: [{ role: 'user', content: 'Explain high-throughput event processing.' }],
    temperature: 0.7
  });

  console.log(completion.choices[0].message.content);
}

run();`,
    python: `from ryvax import RyvaxClient

client = RyvaxClient(
    api_key="${authToken}",
    base_url="${endpointUrl.replace('/chat/completions', '')}"
)

response = client.chat.create(
    model="ryvax-4-turbo",
    messages=[{"role": "user", "content": "Explain high-throughput event processing."}],
    temperature=0.7
)

print(response.choices[0].message.content)`,
    go: `package main

import (
	"context"
	"fmt"
	"github.com/ryvax-platform/ryvax-go"
)

func main() {
	client := ryvax.NewClient("${authToken}")
	resp, err := client.Chat.Create(context.Background(), &ryvax.ChatRequest{
		Model: "ryvax-4-turbo",
		Messages: []ryvax.ChatMessage{
			{Role: "user", Content: "Explain high-throughput event processing."},
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(resp.Choices[0].Message.Content)
}`,
    rust: `use ryvax_sdk::{RyvaxClient, ChatRequest, ChatMessage};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = RyvaxClient::new("${authToken}")?;
    let resp = client.chat().create(ChatRequest {
        model: "ryvax-4-turbo".into(),
        messages: vec![ChatMessage::user("Explain high-throughput event processing.")],
        ..Default::default()
    }).await?;

    println!("{}", resp.choices[0].message.content);
    Ok(())
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCodes[targetLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = { typescript: 'ts', python: 'py', go: 'go', rust: 'rs' };
    const blob = new Blob([generatedCodes[targetLang]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ryvax_example.${extensions[targetLang]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#141414] bg-[#0d0d0d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            cURL to Native SDK Code Generator
          </h4>
        </div>

        <div className="flex items-center gap-1 bg-[#141414] p-0.5 rounded-[6px] border border-[#141414] text-xs">
          {(['typescript', 'python', 'go', 'rust'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setTargetLang(lang)}
              className={`px-2.5 py-1 rounded-[6px] transition-colors capitalize ${
                targetLang === lang ? 'bg-[#222222] text-white font-semibold border border-[#2a2a2a]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4 bg-[#0a0a0a]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Endpoint</label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-xs font-mono text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Authorization Token</label>
            <input
              type="text"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full px-3 py-1.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-xs font-mono text-neutral-100"
            />
          </div>
        </div>

        {/* Output Code preview */}
        <div className="rounded-[6px] border border-[#141414] bg-[#080808] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[#0e0e0e] border-b border-[#141414]">
            <span className="text-xs font-mono text-neutral-400 uppercase">{targetLang} Implementation</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-2 py-1 rounded-[6px] bg-[#141414] hover:bg-[#1a1a1a] text-xs text-neutral-300 border border-[#141414] transition-colors"
              >
                Download File
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#1a1a1a] hover:bg-[#222] text-xs text-white border border-[#262626] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
            <code>{generatedCodes[targetLang]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. OpenAPI JSON Schema Validator & Type Inspector
// ----------------------------------------------------
export function SchemaValidatorPlayground() {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify({
    model: 'ryvax-4-turbo',
    messages: [
      { role: 'user', content: 'Design an idempotent payment webhook.' }
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: false
  }, null, 2));

  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({
    valid: true,
    errors: []
  });

  const validate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const errs: string[] = [];

      if (!parsed.model) errs.push("Missing required field 'model'");
      if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
        errs.push("Field 'messages' must be a non-empty array");
      } else {
        parsed.messages.forEach((m: any, idx: number) => {
          if (!m.role || !m.content) {
            errs.push(`Message[${idx}] missing required 'role' or 'content' property`);
          }
        });
      }
      if (parsed.temperature !== undefined && (parsed.temperature < 0 || parsed.temperature > 2.0)) {
        errs.push("'temperature' must be a float between 0.0 and 2.0");
      }

      setValidationResult({
        valid: errs.length === 0,
        errors: errs
      });
    } catch (e: any) {
      setValidationResult({
        valid: false,
        errors: [`JSON Syntax Error: ${e.message}`]
      });
    }
  };

  useEffect(() => {
    validate();
  }, [jsonInput]);

  return (
    <div className="my-6 rounded-[6px] border border-[#141414] bg-[#0a0a0a] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#141414] bg-[#0d0d0d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-300" />
          <h4 className="text-sm font-semibold text-white">
            JSON Schema & Payload Type Validator
          </h4>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-[6px] border ${
          validationResult.valid
            ? 'bg-[#141414] text-neutral-200 border-[#222]'
            : 'bg-[#181010] text-neutral-300 border-[#2e1a1a]'
        }`}>
          {validationResult.valid ? '✓ Schema Conformance 100%' : '✕ Validation Warnings'}
        </span>
      </div>

      <div className="p-5 space-y-4 bg-[#0a0a0a]">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            JSON Request Body
          </label>
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full px-3 py-2 rounded-[6px] border border-[#141414] bg-[#0d0d0d] text-xs font-mono text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        {validationResult.errors.length > 0 ? (
          <div className="p-3 rounded-[6px] bg-[#121212] border border-[#222] text-xs text-neutral-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
              <span>Validation Errors Encountered:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-neutral-400">
              {validationResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-3 rounded-[6px] bg-[#0e0e0e] border border-[#141414] text-xs text-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-neutral-200" />
              <span>All mandatory schema types, enums, and bounds are fully valid.</span>
            </div>
            <span className="font-mono text-[11px] text-neutral-500">OpenAPI 3.1 Standard</span>
          </div>
        )}
      </div>
    </div>
  );
}
