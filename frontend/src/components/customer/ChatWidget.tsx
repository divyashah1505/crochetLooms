'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Minus,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Sparkles,
  Bot,
  AlertCircle,
} from 'lucide-react';
import { useChatStore } from '../../store/chat.store';

const DEFAULT_CHATBOT_URL = 'https://frontend-3f3iogert-shah-divyas-projects.vercel.app/';

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    isExpanded,
    openChat,
    closeChat,
    toggleChat,
    toggleMinimize,
    toggleExpand,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [showGreetingBadge, setShowGreetingBadge] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const chatbotUrl =
    process.env.NEXT_PUBLIC_CHATBOT_URL || DEFAULT_CHATBOT_URL;

  // Auto-hide greeting badge after 12s if not interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreetingBadge(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none select-none">
      
      {/* Floating Chat Trigger Button (when chat is closed) */}
      {!isOpen && (
        <div className="relative flex items-center pointer-events-auto">
          {/* Greeting tooltip pill */}
          {showGreetingBadge && (
            <div className="mr-3 bg-white/95 backdrop-blur-sm border border-clay-200 px-3.5 py-2 rounded-2xl shadow-cozy flex items-center gap-2 animate-bounce">
              <span className="text-base">🧶</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-yarn-mocha">Need help choosing yarn or gifts?</span>
                <span className="text-[10px] text-stone-500">Ask our AI Crochet Assistant!</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGreetingBadge(false);
                }}
                className="text-stone-400 hover:text-stone-600 p-0.5"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Main Floating Button */}
          <button
            id="open-chatbot-btn"
            onClick={toggleChat}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-clay-600 via-clay-500 to-yarn-terracotta text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="Open Chatbot Assistant"
          >
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
            <MessageCircle className="w-6 h-6 transition-transform group-hover:rotate-6" />
          </button>
        </div>
      )}

      {/* Minimized Pill Bar */}
      {isOpen && isMinimized && (
        <div className="pointer-events-auto bg-white border border-clay-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 animate-fadeIn">
          <div className="relative flex items-center gap-2 cursor-pointer" onClick={toggleMinimize}>
            <div className="w-6 h-6 rounded-full bg-clay-500 text-white flex items-center justify-center text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-yarn-mocha">Crochet Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <button
            onClick={toggleMinimize}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            title="Restore chat"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={closeChat}
            className="p-1 text-stone-400 hover:text-red-500 transition-colors"
            title="Close chat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Popup Modal Window */}
      {isOpen && !isMinimized && (
        <div
          className={`pointer-events-auto flex flex-col bg-white border border-clay-200/90 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-[92vw] sm:w-[620px] lg:w-[720px] h-[82vh] max-h-[750px]'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-clay-700 via-clay-600 to-yarn-terracotta text-white shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center text-lg shadow-inner">
                🧶
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-clay-700 rounded-full" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">Crochet Assistant</span>
                  <span className="text-[10px] bg-white/20 text-white font-medium px-1.5 py-0.2 rounded-full">AI</span>
                </div>
                <span className="text-[11px] text-clay-100/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online • Handcrafted Support
                </span>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-xl hover:bg-white/15 text-clay-100 hover:text-white transition-colors"
                title="Reload Chat"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={toggleExpand}
                className="p-1.5 rounded-xl hover:bg-white/15 text-clay-100 hover:text-white transition-colors hidden sm:inline-flex"
                title={isExpanded ? 'Collapse Size' : 'Expand Size'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={toggleMinimize}
                className="p-1.5 rounded-xl hover:bg-white/15 text-clay-100 hover:text-white transition-colors"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 rounded-xl hover:bg-white/15 text-clay-100 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="relative flex-1 w-full bg-cream-50 overflow-hidden flex flex-col">
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-cream-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-2xl bg-clay-100 text-clay-600 flex items-center justify-center mb-3 animate-pulse">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <p className="text-xs font-semibold text-yarn-mocha mb-1">Connecting to Crochet Assistant...</p>
                <p className="text-[11px] text-stone-500 max-w-[240px]">Setting up your personalized handcrafted shopping guide</p>
              </div>
            )}

            {/* Chatbot Iframe */}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={chatbotUrl}
              title="Crochet AI Chatbot"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0 flex-1 bg-white"
              allow="camera; microphone; clipboard-read; clipboard-write; web-share"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />

            {/* Vercel Refused Connection Helper / Banner */}
            <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-900 text-xs flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Seeing &quot;vercel.com refused to connect&quot;?</span>
                </div>
                <a
                  href={chatbotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-semibold text-[10px] inline-flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[10px] text-amber-700 leading-snug">
                Vercel preview links protect themselves by default. In your <strong>Vercel Dashboard &rarr; Project Settings &rarr; Deployment Protection</strong>, toggle <strong>Vercel Authentication</strong> to <strong>Disabled</strong>, then reload!
              </p>
            </div>

            {/* Quick Helper Bar */}
            <div className="px-3 py-1.5 bg-cream-100/90 border-t border-cream-200 text-[11px] text-stone-500 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] text-stone-600">
                <Sparkles className="w-3 h-3 text-yarn-honey" /> Powered by CrochetLoom AI
              </span>
              <button
                onClick={handleRefresh}
                className="text-clay-600 hover:text-clay-800 font-medium inline-flex items-center gap-1 text-[10px]"
                title="Reload the chatbot iframe"
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
