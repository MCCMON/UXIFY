import { useEffect, useRef, useState } from 'react'
import CinematicReport from './CinematicReport'
import { supabase } from '../lib/supabase'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .ux { background: #0e0608; color: #f5f0f0; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  /* NAV */
  .ux-nav { position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:18px 48px;background:rgba(8,8,16,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(181,183,185,0.08); }
  .ux-logo { font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px; }
  .ux-logo span { color:#6E1E2A; }
  .ux-nav-right { display:flex;align-items:center;gap:12px; }
  .ux-nav-user { font-size:13px;color:#8a8a8a;background:rgba(181,183,185,0.05);border:1px solid rgba(181,183,185,0.1);padding:6px 14px;border-radius:8px; }
  .ux-nav-cta { background:#6E1E2A;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s; }
  .ux-nav-cta:hover { background:#8a2535;transform:translateY(-1px); }
  .ux-nav-out { background:transparent;color:#8a8a8a;border:1px solid rgba(181,183,185,0.15);padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s; }
  .ux-nav-out:hover { color:#f5f0f0;border-color:rgba(181,183,185,0.3); }

  /* HERO */
  .ux-hero { min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 32px 80px;position:relative;overflow:hidden; }
  .ux-orb { position:absolute;border-radius:50%;pointer-events:none; }
  .orb-main { width:700px;height:700px;background:radial-gradient(circle,rgba(110,30,42,0.18) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-60%); }
  .orb-red { width:400px;height:400px;background:radial-gradient(circle,rgba(181,183,185,0.06) 0%,transparent 70%);bottom:10%;right:5%; }
  .ux-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(110,30,42,0.12);border:1px solid rgba(110,30,42,0.3);border-radius:100px;padding:6px 16px;font-size:13px;color:#B5B7B9;margin-bottom:28px;position:relative;z-index:1;animation:fadeUp 0.6s ease both; }
  .ux-dot { width:6px;height:6px;background:#6E1E2A;border-radius:50%;animation:ux-pulse 2s infinite; }
  @keyframes ux-pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
  .ux-h1 { font-family:'Syne',sans-serif;font-size:clamp(44px,6vw,88px);font-weight:800;line-height:1.0;letter-spacing:-3px;margin-bottom:20px;position:relative;z-index:1;animation:fadeUp 0.6s 0.1s ease both; }
  .ux-h1-grad { display:block;background:linear-gradient(135deg,#c0303f 0%,#B5B7B9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
  .ux-hero-sub { font-size:18px;color:#8a8a8a;max-width:500px;margin:0 auto 36px;font-weight:300;position:relative;z-index:1;animation:fadeUp 0.6s 0.2s ease both; }
  .ux-actions { display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;animation:fadeUp 0.6s 0.3s ease both; }
  .ux-btn { background:#6E1E2A;color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s; }
  .ux-btn:hover { background:#8a2535;transform:translateY(-2px);box-shadow:0 14px 36px rgba(110,30,42,0.3); }
  .ux-btn:disabled { opacity:0.5;cursor:not-allowed;transform:none; }
  .ux-btn-ghost { background:transparent;color:#8a8a8a;border:1px solid rgba(181,183,185,0.1);padding:14px 32px;border-radius:10px;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s; }
  .ux-btn-ghost:hover { color:#f5f0f0;border-color:rgba(181,183,185,0.25); }

  /* HERO SCORE CARD */
  .ux-score-card { background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:20px;padding:28px 32px;max-width:620px;margin:60px auto 0;box-shadow:0 40px 80px rgba(0,0,0,0.5);position:relative;z-index:1;animation:fadeUp 0.8s 0.4s ease both; }
  .ux-card-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:24px; }
  .ux-card-lbl { font-family:'Syne',sans-serif;font-size:12px;font-weight:600;color:#8a8a8a;text-transform:uppercase;letter-spacing:1.5px; }
  .ux-overall { font-family:'Syne',sans-serif;font-size:38px;font-weight:800;color:#6E1E2A; }
  .ux-score-row { display:flex;align-items:center;gap:14px;margin-bottom:14px; }
  .ux-score-lbl { font-size:13px;color:#8a8a8a;width:72px;flex-shrink:0; }
  .ux-bar-wrap { flex:1;height:5px;background:rgba(181,183,185,0.08);border-radius:100px;overflow:hidden; }
  .ux-bar-fill { height:100%;border-radius:100px;transition:width 1.5s cubic-bezier(.4,0,.2,1); }
  .ux-score-num { font-size:13px;font-weight:600;color:#f5f0f0;width:28px;text-align:right; }

  /* MARQUEE */
  .ux-marquee-wrap { overflow:hidden;border-top:1px solid rgba(181,183,185,0.1);border-bottom:1px solid rgba(181,183,185,0.1);padding:20px 0;background:rgba(110,30,42,0.06); }
  .ux-marquee { display:flex;gap:60px;width:max-content;animation:marquee 20s linear infinite; }
  @keyframes marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} }
  .ux-marquee-item { font-family:'Syne',sans-serif;font-size:14px;font-weight:600;color:#8a8a8a;text-transform:uppercase;letter-spacing:2px;white-space:nowrap;display:flex;align-items:center;gap:16px; }
  .ux-marquee-dot { width:4px;height:4px;background:#6E1E2A;border-radius:50%; }

  /* PROBLEM */
  .ux-problem { padding:100px 48px;max-width:1100px;margin:0 auto; }
  .ux-problem-grid { display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-top:60px; }
  .ux-problem-list { display:flex;flex-direction:column;gap:20px; }
  .ux-problem-item { display:flex;align-items:flex-start;gap:16px;background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:14px;padding:20px;transition:all 0.3s; }
  .ux-problem-item:hover { border-color:rgba(110,30,42,0.4);transform:translateX(6px); }
  .ux-problem-x { font-size:20px;flex-shrink:0; }
  .ux-problem-text { font-size:14px;color:#B5B7B9;line-height:1.6; }
  .ux-problem-text strong { color:#f5f0f0;font-size:15px;display:block;margin-bottom:4px; }
  .ux-fix-card { background:linear-gradient(135deg,rgba(110,30,42,0.2),rgba(181,183,185,0.05));border:1px solid rgba(110,30,42,0.35);border-radius:20px;padding:40px;text-align:center; }
  .ux-fix-score { font-family:'Syne',sans-serif;font-size:96px;font-weight:800;background:linear-gradient(135deg,#c0303f,#B5B7B9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1; }
  .ux-fix-label { font-family:'Syne',sans-serif;font-size:14px;font-weight:600;color:#8a8a8a;text-transform:uppercase;letter-spacing:2px;margin-top:12px; }

  /* STEPS */
  .ux-steps-wrap { padding:80px 48px;max-width:1100px;margin:0 auto; }
  .ux-steps-timeline { position:relative;margin-top:60px; }
  .ux-steps-line { position:absolute;left:28px;top:0;bottom:0;width:2px;background:rgba(181,183,185,0.08); }
  .ux-steps-line-fill { position:absolute;left:28px;top:0;width:2px;background:linear-gradient(180deg,#6E1E2A,#B5B7B9);transition:height 0.8s ease; }
  .ux-step-row { display:flex;gap:32px;align-items:flex-start;margin-bottom:48px;position:relative;z-index:1; }
  .ux-step-bubble { width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:18px;font-weight:800;background:#180a0c;border:2px solid rgba(255,255,255,0.1);transition:all 0.4s; }
  .ux-step-bubble.active { background:#6E1E2A;border-color:#6E1E2A;box-shadow:0 0 24px rgba(110,30,42,0.5); }
  .ux-step-content { padding-top:12px; }
  .ux-step-title { font-family:'Syne',sans-serif;font-size:22px;font-weight:800;margin-bottom:8px; }
  .ux-step-desc { color:#8a8a8a;font-size:15px;line-height:1.7;max-width:480px; }

  /* FEATURES */
  .ux-feat-wrap { padding:80px 48px;max-width:1100px;margin:0 auto; }
  .ux-feat-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:52px; }
  .ux-feat-card { background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:16px;padding:32px;transition:all 0.3s;position:relative;overflow:hidden; }
  .ux-feat-card:hover { border-color:rgba(110,30,42,0.3);transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,0.3); }
  .ux-feat-icon { width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px; }
  .ux-feat-title { font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:10px; }
  .ux-feat-desc { color:#8a8a8a;font-size:14px;line-height:1.7; }
  .ux-feat-score-bar { margin-top:20px;height:3px;background:rgba(181,183,185,0.08);border-radius:100px;overflow:hidden; }
  .ux-feat-bar-fill { height:100%;border-radius:100px;width:0%;transition:width 1.2s cubic-bezier(.4,0,.2,1); }

  /* STATS */
  .ux-stats-wrap { padding:60px 48px;max-width:1100px;margin:0 auto; }
  .ux-stats-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(181,183,185,0.1);border:1px solid rgba(181,183,185,0.1);border-radius:20px;overflow:hidden; }
  .ux-stat { background:#0e0608;padding:48px;text-align:center; }
  .ux-stat-num { font-family:'Syne',sans-serif;font-size:52px;font-weight:800;letter-spacing:-2px;background:linear-gradient(135deg,#f5f0f0,#B5B7B9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
  .ux-stat-lbl { color:#8a8a8a;font-size:13px;margin-top:8px; }

  /* TESTIMONIALS */
  .ux-testimonial-wrap { padding:80px 48px;max-width:1100px;margin:0 auto; }
  .ux-testimonials { display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px; }
  .ux-testi-card { background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:16px;padding:28px;transition:all 0.3s; }
  .ux-testi-card:hover { border-color:rgba(110,30,42,0.3);transform:translateY(-4px); }
  .ux-stars { color:#6E1E2A;font-size:14px;margin-bottom:14px; }
  .ux-testi-quote { font-size:14px;color:#B5B7B9;line-height:1.7;margin-bottom:20px;font-style:italic; }
  .ux-testi-name { font-family:'Syne',sans-serif;font-size:14px;font-weight:700; }
  .ux-testi-role { font-size:12px;color:#8a8a8a;margin-top:2px; }

  /* CTA SECTION */
  .ux-cta-wrap { padding:120px 48px;text-align:center;position:relative;overflow:hidden; }
  .ux-cta-wrap::before { content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(110,30,42,0.15) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none; }
  .ux-input-wrap { display:flex;gap:10px;max-width:500px;margin:0 auto;position:relative;z-index:1; }
  .ux-input { flex:1;background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:10px;padding:14px 18px;color:#f5f0f0;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s; }
  .ux-input::placeholder { color:#8a8a8a; }
  .ux-input:focus { border-color:#6E1E2A; }

  /* SECTION LABELS */
  .ux-sec-lbl { font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#6E1E2A;margin-bottom:14px; }
  .ux-sec-title { font-family:'Syne',sans-serif;font-size:clamp(28px,3.5vw,48px);font-weight:800;letter-spacing:-1.5px;line-height:1.1;margin-bottom:16px; }
  .ux-sec-sub { color:#8a8a8a;font-size:16px;max-width:480px;font-weight:300;line-height:1.7; }
  .ux-div { height:1px;background:rgba(181,183,185,0.1); }

  /* SCROLL ANIMATIONS */
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .s-fadeup { opacity:0;transform:translateY(40px);transition:opacity 0.7s ease,transform 0.7s ease; }
  .s-fadeleft { opacity:0;transform:translateX(-50px);transition:opacity 0.7s ease,transform 0.7s ease; }
  .s-faderight { opacity:0;transform:translateX(50px);transition:opacity 0.7s ease,transform 0.7s ease; }
  .s-scalein { opacity:0;transform:scale(0.8);transition:opacity 0.6s ease,transform 0.6s ease; }
  .s-visible { opacity:1 !important;transform:none !important; }
  .s-d1 { transition-delay:0.1s !important; }
  .s-d2 { transition-delay:0.2s !important; }
  .s-d3 { transition-delay:0.3s !important; }
  .s-d4 { transition-delay:0.4s !important; }

  /* APP SECTION */
  .app-section { max-width:760px;margin:0 auto;padding:100px 32px 80px; }
  .app-tabs { display:flex;gap:8px;background:rgba(181,183,185,0.05);border:1px solid rgba(181,183,185,0.1);border-radius:12px;padding:5px;margin-bottom:20px;width:fit-content;margin-left:auto;margin-right:auto; }
  .app-tab { padding:9px 24px;border-radius:9px;font-size:14px;font-weight:500;cursor:pointer;border:none;background:transparent;color:#8a8a8a;transition:all 0.2s;font-family:'DM Sans',sans-serif; }
  .app-tab.active { background:#6E1E2A;color:white;box-shadow:0 4px 20px rgba(110,30,42,0.4); }
  .app-url-input { width:100%;background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:12px;padding:16px 20px;font-size:15px;color:#f5f0f0;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.3s;margin-bottom:12px; }
  .app-url-input::placeholder { color:#8a8a8a; }
  .app-url-input:focus { border-color:#6E1E2A; }
  .app-preview { border-radius:12px;overflow:hidden;border:1px solid rgba(181,183,185,0.1);background:#180a0c;margin-bottom:12px; }
  .app-preview-bar { font-size:12px;color:#8a8a8a;padding:9px 14px;border-bottom:1px solid rgba(181,183,185,0.08);display:flex;align-items:center;gap:6px; }
  .app-live-dot { width:7px;height:7px;border-radius:50%;background:#6E1E2A;animation:ux-pulse 2s infinite;display:inline-block; }
  .app-drop-zone { border:2px dashed rgba(110,30,42,0.3);border-radius:16px;padding:52px 40px;text-align:center;cursor:pointer;transition:all 0.3s;background:#180a0c; }
  .app-drop-zone:hover { border-color:rgba(110,30,42,0.6);box-shadow:0 0 40px rgba(110,30,42,0.1); }
  .app-drop-icon { width:64px;height:64px;background:rgba(110,30,42,0.15);border:1px solid rgba(110,30,42,0.25);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px; }
  .app-preview-box { display:flex;align-items:center;gap:16px;background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:12px;padding:16px;margin-bottom:12px; }
  .app-preview-img { width:72px;height:72px;object-fit:cover;border-radius:8px; }
  .app-remove-btn { background:rgba(110,30,42,0.2);border:1px solid rgba(110,30,42,0.3);color:#c0303f;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif; }
  .app-error { background:rgba(192,48,63,0.1);border:1px solid rgba(192,48,63,0.25);border-radius:10px;padding:14px 18px;color:#f87171;font-size:14px;margin-bottom:12px;text-align:center; }
  .app-analyze-btn { width:100%;background:#6E1E2A;color:white;padding:17px;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;border:none;font-family:'Syne',sans-serif;box-shadow:0 8px 32px rgba(110,30,42,0.35);transition:all 0.3s;margin-top:4px; }
  .app-analyze-btn:hover { background:#8a2535;transform:translateY(-2px);box-shadow:0 12px 40px rgba(110,30,42,0.5); }
  .app-analyze-btn:disabled { opacity:0.5;cursor:not-allowed;transform:none; }

  /* LOADING */
  .app-loading { text-align:center;padding:80px 24px; }
  .app-loader { width:72px;height:72px;border-radius:50%;border:3px solid rgba(110,30,42,0.2);border-top-color:#6E1E2A;border-right-color:#c0303f;animation:spin 1s linear infinite;margin:0 auto 24px; }
  .app-loading-title { font-family:'Syne',sans-serif;font-size:22px;font-weight:700;margin-bottom:8px; }
  .app-loading-sub { color:#8a8a8a;font-size:14px; }

  /* RESULTS */
  .app-results { max-width:760px;margin:0 auto;padding:100px 32px 80px; }
  .app-results-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:28px; }
  .app-results-title { font-family:'Syne',sans-serif;font-size:24px;font-weight:800; }
  .app-new-btn { background:rgba(110,30,42,0.15);border:1px solid rgba(110,30,42,0.3);color:#c0303f;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-family:'DM Sans',sans-serif;transition:all 0.2s; }
  .app-new-btn:hover { background:rgba(110,30,42,0.25); }

  /* SCORE DISPLAY */
  .app-score-box { background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:20px;padding:32px;margin-bottom:20px; }
  .app-score-box-title { font-family:'Syne',sans-serif;font-size:12px;font-weight:600;color:#8a8a8a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:20px; }
  .app-score-main { display:flex;align-items:center;gap:28px;flex-wrap:wrap; }
  .app-score-circle { width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#6E1E2A,#c0303f);display:flex;align-items:center;justify-content:center;flex-direction:column;box-shadow:0 0 40px rgba(110,30,42,0.4); }
  .app-score-circle-val { font-family:'Syne',sans-serif;font-size:38px;font-weight:800;line-height:1; }
  .app-score-circle-lbl { font-size:11px;color:rgba(255,255,255,0.6); }
  .app-score-breakdown { display:flex;gap:24px;flex-wrap:wrap; }
  .app-score-mini { text-align:center; }
  .app-score-mini-val { font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#c0303f; }
  .app-score-mini-lbl { font-size:11px;color:#8a8a8a;margin-top:2px; }

  /* SUMMARY */
  .app-summary { background:linear-gradient(135deg,rgba(110,30,42,0.1),rgba(181,183,185,0.03));border:1px solid rgba(110,30,42,0.2);border-radius:16px;padding:24px;margin-bottom:20px; }
  .app-summary-title { font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#6E1E2A;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px; }
  .app-summary-text { font-size:15px;color:#B5B7B9;line-height:1.7; }

  /* ANALYSIS CARDS */
  .app-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:16px; }
  .app-card { background:#180a0c;border:1px solid rgba(181,183,185,0.1);border-radius:16px;padding:24px;transition:border-color 0.2s; }
  .app-card:hover { border-color:rgba(110,30,42,0.3); }
  .app-card-title { display:flex;align-items:center;gap:10px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:16px; }
  .app-card-icon { width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px; }
  .app-issue { display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(181,183,185,0.06);font-size:14px;line-height:1.5;color:#B5B7B9; }
  .app-issue:last-child { border-bottom:none; }
  .app-bullet { width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0; }
  .app-bullet.red { background:#f87171;box-shadow:0 0 6px rgba(248,113,113,0.4); }
  .app-bullet.yellow { background:#fbbf24;box-shadow:0 0 6px rgba(251,191,36,0.4); }
  .app-bullet.green { background:#4ade80;box-shadow:0 0 6px rgba(74,222,128,0.4); }
  .app-rec-item { margin-bottom:14px; }
  .app-rec-header { display:flex;justify-content:space-between;font-size:13px;color:#8a8a8a;margin-bottom:6px; }
  .app-bar-bg { height:5px;background:rgba(181,183,185,0.08);border-radius:100px;overflow:hidden; }
  .app-bar-fill { height:100%;border-radius:100px;background:linear-gradient(90deg,#6E1E2A,#c0303f);transition:width 1.2s cubic-bezier(.4,0,.2,1); }
  .app-priority-high { color:#f87171;font-size:11px;font-weight:700;text-transform:uppercase;margin-right:8px; }
  .app-priority-medium { color:#fbbf24;font-size:11px;font-weight:700;text-transform:uppercase;margin-right:8px; }
  .app-priority-low { color:#4ade80;font-size:11px;font-weight:700;text-transform:uppercase;margin-right:8px; }
  .app-palette { display:flex;flex-wrap:wrap;gap:12px; }
  .app-color-chip { display:flex;flex-direction:column;align-items:center;gap:4px; }
  .app-color-swatch { width:42px;height:42px;border-radius:10px;border:1px solid rgba(255,255,255,0.08); }
  .app-color-hex { font-size:11px;color:#8a8a8a;font-family:monospace; }

  /* FOOTER */
  .ux-footer { border-top:1px solid rgba(181,183,185,0.1);padding:36px 48px;display:flex;align-items:center;justify-content:space-between; }
  .ux-footer-logo { font-family:'Syne',sans-serif;font-size:18px;font-weight:800; }
  .ux-footer-logo span { color:#6E1E2A; }
  .ux-footer-copy { color:#8a8a8a;font-size:13px; }

  @media (max-width: 768px) {
    .ux-nav { padding:16px 20px; }
    .ux-problem-grid { grid-template-columns:1fr; }
    .ux-feat-grid { grid-template-columns:1fr; }
    .ux-testimonials { grid-template-columns:1fr; }
    .ux-stats-grid { grid-template-columns:1fr; }
    .ux-footer { flex-direction:column;gap:12px;text-align:center; }
    .ux-problem,.ux-steps-wrap,.ux-feat-wrap,.ux-stats-wrap,.ux-testimonial-wrap { padding:60px 20px; }
  }
`

const demoScores = [
  { label: 'Headline', value: 82, color: 'linear-gradient(90deg,#6E1E2A,#c0303f)' },
  { label: 'CTA', value: 65, color: 'linear-gradient(90deg,#B5B7B9,#d0d0d0)' },
  { label: 'Trust', value: 91, color: 'linear-gradient(90deg,#8a1a28,#c0303f)' },
  { label: 'Clarity', value: 74, color: 'linear-gradient(90deg,#B5B7B9,#6E1E2A)' },
]

const features = [
  { icon: '📢', bg: 'rgba(110,30,42,0.2)', title: 'Headline', desc: 'Does your headline communicate value in under 5 seconds? We score clarity, specificity, and emotional resonance.', bar: 82, barColor: 'linear-gradient(90deg,#6E1E2A,#c0303f)' },
  { icon: '🎯', bg: 'rgba(181,183,185,0.1)', title: 'CTA', desc: 'Is your call-to-action compelling and obvious? We analyze placement, copy, and whether it tells users what happens next.', bar: 65, barColor: 'linear-gradient(90deg,#B5B7B9,#e0e0e0)' },
  { icon: '🛡️', bg: 'rgba(110,30,42,0.15)', title: 'Trust', desc: 'Do visitors trust you enough to convert? We evaluate social proof, credibility signals, and their placement.', bar: 91, barColor: 'linear-gradient(90deg,#8a1a28,#c0303f)' },
  { icon: '💡', bg: 'rgba(181,183,185,0.08)', title: 'Clarity', desc: 'Can a stranger understand your product in 8 seconds? We measure how clearly your value proposition comes through.', bar: 74, barColor: 'linear-gradient(90deg,#B5B7B9,#6E1E2A)' },
]

const problems = [
  { title: 'Vague headline', desc: 'Talks about the product, not the visitor\'s pain.' },
  { title: 'Weak CTA', desc: '"Get Started" is not a CTA. It\'s a wish.' },
  { title: 'No social proof above fold', desc: 'Testimonials buried in the footer nobody reads.' },
  { title: 'Confusing value prop', desc: 'If I can\'t tell what you do in 5 seconds, I\'m gone.' },
]

const steps = [
  { num: '01', title: 'Drop your URL', desc: 'Paste your landing page URL into UXIFY. No signup, no friction, no credit card. Just your URL.' },
  { num: '02', title: 'AI reads it like a human', desc: 'Our AI analyzes every element — headline, CTA, trust signals, and clarity — the way a conversion expert would.' },
  { num: '03', title: 'Get your score instantly', desc: 'Receive a detailed breakdown across 4 critical categories in under 30 seconds.' },
]

const testimonials = [
  { quote: 'I had no idea my CTA was so weak until UXIFY scored it a 40. Fixed it in 10 minutes, conversions went up immediately.', name: 'Ravi K.', role: 'SaaS Founder' },
  { quote: 'This is the honest outside perspective every founder needs. Brutal, fast, and completely free.', name: 'Priya S.', role: 'Indie Hacker' },
  { quote: 'Ran my landing page through UXIFY before launch. Caught 3 critical issues I would have never noticed myself.', name: 'James T.', role: 'Product Builder' },
]

const marqueeItems = ['Headline Score', 'CTA Analysis', 'Trust Signals', 'Clarity Score', 'Conversion Rate', 'Landing Pages', 'Free Forever', '30 Seconds']

function useScrollObserver(ref) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return visible
}

function AnimatedSection({ children, className = '', delay = 0, type = 'fadeup' }) {
  const ref = useRef(null)
  const visible = useScrollObserver(ref)
  const cls = type === 'fadeleft' ? 's-fadeleft' : type === 'faderight' ? 's-faderight' : type === 'scalein' ? 's-scalein' : 's-fadeup'
  return (
    <div ref={ref} className={`${cls} ${visible ? 's-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

function DemoScoreCard() {
  const ref = useRef(null)
  const visible = useScrollObserver(ref)
  return (
    <div ref={ref} className="ux-score-card" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s ease' }}>
      <div className="ux-card-header">
        <span className="ux-card-lbl">Sample Conversion Report</span>
        <span className="ux-overall">74<span style={{ fontSize: 18, color: '#8a8a8a' }}>/100</span></span>
      </div>
      {demoScores.map((s, i) => (
        <div className="ux-score-row" key={s.label}>
          <span className="ux-score-lbl">{s.label}</span>
          <div className="ux-bar-wrap">
            <div className="ux-bar-fill" style={{ width: visible ? `${s.value}%` : '0%', background: s.color, transitionDelay: `${0.3 + i * 0.15}s` }} />
          </div>
          <span className="ux-score-num">{s.value}</span>
        </div>
      ))}
    </div>
  )
}

function FeatCard({ f, i }) {
  const ref = useRef(null)
  const visible = useScrollObserver(ref)
  return (
    <div ref={ref} className={`ux-feat-card s-fadeup ${visible ? 's-visible' : ''}`} style={{ transitionDelay: `${i * 0.12}s` }}>
      <div className="ux-feat-icon" style={{ background: f.bg }}>{f.icon}</div>
      <div className="ux-feat-title">{f.title}</div>
      <p className="ux-feat-desc">{f.desc}</p>
      <div className="ux-feat-score-bar">
        <div className="ux-feat-bar-fill" style={{ width: visible ? `${f.bar}%` : '0%', background: f.barColor, transitionDelay: `${0.3 + i * 0.12}s` }} />
      </div>
    </div>
  )
}

function StepsSection() {
  const ref = useRef(null)
  const [lineH, setLineH] = useState(0)
  const [active, setActive] = useState(-1)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => { setLineH(33); setActive(0) }, 200)
        setTimeout(() => { setLineH(66); setActive(1) }, 700)
        setTimeout(() => { setLineH(100); setActive(2) }, 1200)
        obs.disconnect()
      }
    }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div className="ux-steps-wrap" ref={ref}>
      <AnimatedSection>
        <p className="ux-sec-lbl">Process</p>
        <h2 className="ux-sec-title">Three steps to a<br />better converting page.</h2>
        <p className="ux-sec-sub">No fluff. No agency fees. Just fast, honest feedback on what's killing your conversions.</p>
      </AnimatedSection>
      <div className="ux-steps-timeline" style={{ paddingLeft: 0 }}>
        <div className="ux-steps-line" />
        <div className="ux-steps-line-fill" style={{ height: `${lineH}%` }} />
        {steps.map((s, i) => (
          <div className="ux-step-row" key={s.num} style={{ opacity: active >= i ? 1 : 0.3, transform: active >= i ? 'translateX(0)' : 'translateX(-20px)', transition: 'all 0.5s ease' }}>
            <div className={`ux-step-bubble ${active >= i ? 'active' : ''}`}>{s.num}</div>
            <div className="ux-step-content">
              <div className="ux-step-title">{s.title}</div>
              <p className="ux-step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CountUp({ end, suffix = '' }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true)
        let start = 0
        const step = (ts) => {
          if (!start) start = ts
          const progress = Math.min((ts - start) / 1500, 1)
          setVal(Math.floor(progress * end))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        obs.disconnect()
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, started])
  return <span ref={ref}>{val}{suffix}</span>
}

const severityColor = (s) => s === 'error' ? 'red' : s === 'warning' ? 'yellow' : 'green'


function CinematicLoader() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    'Capturing screenshot...',
    'Reading your headline...',
    'Analysing CTA strength...',
    'Checking trust signals...',
    'Scoring copy quality...',
    'Generating report...',
  ]

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep(s => s < steps.length - 1 ? s + 1 : s)
    }, 900)
    const progressTimer = setInterval(() => {
      setProgress(p => p < 92 ? p + Math.random() * 8 : p)
    }, 400)
    return () => { clearInterval(stepTimer); clearInterval(progressTimer) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0203', zIndex: 500,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* bg glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(110,30,42,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#6E1E2A,#c0303f,transparent)', width: `${progress}%`, transition: 'width 0.4s ease' }} />

      {/* logo */}
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 64, opacity: 0.4, letterSpacing: -0.5 }}>
        UX<span style={{ color: '#6E1E2A' }}>IFY</span>
      </div>

      {/* big scanning animation */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 48 }}>
        {/* outer ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1px solid rgba(110,30,42,0.2)',
        }} />
        {/* spinning arc */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#c0303f',
          borderRightColor: 'rgba(110,30,42,0.4)',
          animation: 'spin 1s linear infinite',
        }} />
        {/* inner pulse */}
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          background: 'rgba(110,30,42,0.08)',
          border: '1px solid rgba(110,30,42,0.15)',
          animation: 'ux-pulse 1.5s ease infinite',
        }} />
        {/* center dot */}
        <div style={{
          position: 'absolute', inset: '50%', width: 8, height: 8,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%', background: '#c0303f',
          boxShadow: '0 0 16px rgba(192,48,63,0.8)',
          animation: 'ux-pulse 1s ease infinite',
        }} />
      </div>

      {/* progress number */}
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 48, fontWeight: 800, letterSpacing: -2, marginBottom: 8, background: 'linear-gradient(135deg,#f5f0f0,#c0303f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {Math.floor(progress)}%
      </div>

      {/* current step */}
      <div style={{ fontSize: 14, color: '#8a8a8a', letterSpacing: 1, marginBottom: 48, minHeight: 24, transition: 'all 0.3s' }}>
        {steps[step]}
      </div>

      {/* step dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height: 6, borderRadius: 100,
            background: i <= step ? '#6E1E2A' : 'rgba(181,183,185,0.1)',
            transition: 'all 0.4s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

export default function AppMain({ session, onSignOut, onAuthRequired }) {
  const [tab, setTab] = useState('url')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const appRef = useRef()

  const userEmail = session?.user?.email || ''

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const reset = () => { setFile(null); setPreview(null); setUrl(''); setResult(null); setError('') }

  const scrollToApp = () => { appRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  const analyze = async () => {
    if (!session) { onAuthRequired(); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      const token = s?.access_token
      let body
      if (tab === 'image' && file) {
        const base64 = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(r.result.split(',')[1])
          r.onerror = rej
          r.readAsDataURL(file)
        })
        body = { type: 'image', imageBase64: base64, mediaType: file.type }
      } else {
        body = { type: 'url', url }
      }
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ux">

        {/* NAV */}
        <nav className="ux-nav">
          <div className="ux-logo">UX<span>IFY</span></div>
          <div className="ux-nav-right">
            {session ? (
              <>
                <div className="ux-nav-user">👤 {userEmail}</div>
                <button className="ux-nav-out" onClick={onSignOut}>Sign out</button>
              </>
            ) : (
              <button className="ux-nav-cta" onClick={onAuthRequired}>Sign in</button>
            )}
          </div>
        </nav>

        {/* HERO */}
        {!result && !loading && (
          <div className="ux-hero">
            <div className="ux-orb orb-main" />
            <div className="ux-orb orb-red" />
            <div className="ux-badge"><div className="ux-dot" />AI-Powered Conversion Analysis</div>
            <h1 className="ux-h1">Your landing page<br /><span className="ux-h1-grad">is leaking money.</span></h1>
            <p className="ux-hero-sub">UXIFY scores your landing page across Headline, CTA, Trust & Clarity — in 30 seconds. Free.</p>
            <div className="ux-actions">
              <button className="ux-btn" onClick={scrollToApp}>Analyze My Page →</button>
              <button className="ux-btn-ghost" onClick={scrollToApp}>See how it works</button>
            </div>
            <DemoScoreCard />
          </div>
        )}

        {/* MARQUEE */}
        {!result && !loading && (
          <div className="ux-marquee-wrap">
            <div className="ux-marquee">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <div className="ux-marquee-item" key={i}><div className="ux-marquee-dot" />{item}</div>
              ))}
            </div>
          </div>
        )}

        {/* PROBLEM */}
        {!result && !loading && (
          <div className="ux-problem">
            <AnimatedSection>
              <p className="ux-sec-lbl">The Problem</p>
              <h2 className="ux-sec-title">Most landing pages fail<br />before visitors even scroll.</h2>
              <p className="ux-sec-sub">You've spent weeks building. But these silent killers are draining your conversions every single day.</p>
            </AnimatedSection>
            <div className="ux-problem-grid">
              <div className="ux-problem-list">
                {problems.map((p, i) => (
                  <AnimatedSection key={p.title} type="fadeleft" delay={i * 0.12}>
                    <div className="ux-problem-item">
                      <span className="ux-problem-x">✗</span>
                      <div className="ux-problem-text"><strong>{p.title}</strong>{p.desc}</div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection type="faderight" delay={0.2}>
                <div className="ux-fix-card">
                  <div className="ux-fix-score">74</div>
                  <div className="ux-fix-label">Your Conversion Score</div>
                  <p style={{ color: '#8a8a8a', fontSize: 14, marginTop: 16, lineHeight: 1.7 }}>UXIFY tells you exactly what's broken — and how to fix it — in 30 seconds flat.</p>
                  <button className="ux-btn" style={{ marginTop: 24, width: '100%' }} onClick={scrollToApp}>Get My Score →</button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        )}

        {!result && !loading && <div className="ux-div" />}

        {/* STEPS */}
        {!result && !loading && <StepsSection />}
        {!result && !loading && <div className="ux-div" />}

        {/* FEATURES */}
        {!result && !loading && (
          <div className="ux-feat-wrap">
            <AnimatedSection>
              <p className="ux-sec-lbl">Scoring</p>
              <h2 className="ux-sec-title">What UXIFY<br />actually measures.</h2>
              <p className="ux-sec-sub">Every score maps directly to a real conversion lever — not vanity metrics.</p>
            </AnimatedSection>
            <div className="ux-feat-grid">
              {features.map((f, i) => <FeatCard key={f.title} f={f} i={i} />)}
            </div>
          </div>
        )}

        {!result && !loading && <div className="ux-div" />}

        {/* STATS */}
        {!result && !loading && (
          <div className="ux-stats-wrap">
            <AnimatedSection>
              <div className="ux-stats-grid">
                <div className="ux-stat">
                  <div className="ux-stat-num"><CountUp end={30} suffix="s" /></div>
                  <div className="ux-stat-lbl">Time to get your score</div>
                </div>
                <div className="ux-stat">
                  <div className="ux-stat-num"><CountUp end={4} /></div>
                  <div className="ux-stat-lbl">Conversion categories scored</div>
                </div>
                <div className="ux-stat">
                  <div className="ux-stat-num">Free</div>
                  <div className="ux-stat-lbl">No signup. No credit card.</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        )}

        {!result && !loading && <div className="ux-div" />}

        {/* TESTIMONIALS */}
        {!result && !loading && (
          <div className="ux-testimonial-wrap">
            <AnimatedSection>
              <p className="ux-sec-lbl">Loved by founders</p>
              <h2 className="ux-sec-title">Real feedback.<br />Real results.</h2>
            </AnimatedSection>
            <div className="ux-testimonials">
              {testimonials.map((t, i) => (
                <AnimatedSection key={t.name} type="scalein" delay={i * 0.15}>
                  <div className="ux-testi-card">
                    <div className="ux-stars">★★★★★</div>
                    <p className="ux-testi-quote">"{t.quote}"</p>
                    <div className="ux-testi-name">{t.name}</div>
                    <div className="ux-testi-role">{t.role}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        )}

        {!result && !loading && <div className="ux-div" />}

        {/* APP SECTION */}
        {!result && !loading && (
          <div className="app-section" ref={appRef}>
            <AnimatedSection>
              <p className="ux-sec-lbl" style={{ textAlign: 'center' }}>Get Started</p>
              <h2 className="ux-sec-title" style={{ textAlign: 'center', marginBottom: 8 }}>Analyse your landing page<br />right now. Free.</h2>
              <p className="ux-sec-sub" style={{ textAlign: 'center', margin: '0 auto 40px' }}>Paste your URL or upload a screenshot and get your full conversion report in 30 seconds.</p>
            </AnimatedSection>

            <div className="app-tabs">
              <button className={`app-tab ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}>🔗 Paste URL</button>
              <button className={`app-tab ${tab === 'image' ? 'active' : ''}`} onClick={() => setTab('image')}>📸 Upload Screenshot</button>
            </div>

            {tab === 'url' ? (
              <div>
                <input className="app-url-input" placeholder="https://yourlandingpage.com" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url.trim() && analyze()} />
                {url.trim() && (
                  <div className="app-preview">
                    <div className="app-preview-bar"><span className="app-live-dot" /> Live screenshot captured automatically</div>
                    <img src={`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`}
 style={{ width: '100%', display: 'block' }} alt="Preview" />
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!file ? (
                  <div className="app-drop-zone" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}>
                    <div className="app-drop-icon">📸</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Drop your screenshot here</div>
                    <div style={{ color: '#8a8a8a', fontSize: 14, marginBottom: 18 }}>PNG, JPG, WebP supported</div>
                    <button className="ux-btn">Browse files</button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div className="app-preview-box">
                    <img src={preview} className="app-preview-img" alt="Preview" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{file.name}</div>
                      <div style={{ color: '#8a8a8a', fontSize: 13 }}>{(file.size / 1024).toFixed(0)} KB · Ready to analyse</div>
                    </div>
                    <button className="app-remove-btn" onClick={() => { setFile(null); setPreview(null) }}>Remove</button>
                  </div>
                )}
              </div>
            )}

            {error && <div className="app-error">{error}</div>}

            <button className="app-analyze-btn" onClick={session ? analyze : onAuthRequired} disabled={(tab === 'image' && !file) || (tab === 'url' && !url.trim())}>
              {session ? '✦ Analyse My Landing Page →' : 'Sign in to Analyse →'}
            </button>
          </div>
        )}

        {/* CINEMATIC LOADING */}
        {loading && <CinematicLoader />}

        {/* CINEMATIC RESULTS */}
        {result && <CinematicReport result={result} onReset={reset} />}

        {/* FOOTER */}
        <div className="ux-footer">
          <div className="ux-footer-logo">UX<span>IFY</span></div>
          <span className="ux-footer-copy">© 2026 UXIFY · AI Landing Page Analyser</span>
          <span className="ux-footer-copy">uxify-ai.vercel.app</span>
        </div>

      </div>
    </>
  )
}
