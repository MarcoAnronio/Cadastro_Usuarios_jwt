import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * { box-sizing: border-box; }
  body { margin: 0; background: #f2f4f8; color: #243247; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; }
  h1, h2, p { margin: 0 0 12px; }
  h1 { font-size: clamp(1.6rem, 4vw, 2rem); letter-spacing: -.03em; }
  h2 { font-size: 1.15rem; }
  button, input { font: inherit; }
  button { border: 1px solid transparent; border-radius: 6px; padding: 9px 15px; color: white; background: #245eb1; cursor: pointer; font-weight: 600; }
  button:hover { background: #194a90; }
  button:disabled { opacity: .6; cursor: wait; }
  button.secondary { background: #fff; color: #245eb1; border-color: #c4d2e5; }
  button.secondary:hover { background: #edf3fb; }
  button.danger { color: #a82b32; background: #fff; border-color: #e7c2c5; }
  button.danger:hover { background: #fff0f0; }
  :focus-visible { outline: 3px solid #80a8e5; outline-offset: 3px; }
  input { width: 100%; min-width: 0; background: white; border: 1px solid #b7c4d4; border-radius: 6px; padding: 9px 11px; color: #243247; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: .9rem; font-weight: 600; }
  fieldset { margin: 0; padding: 0; border: 0; min-width: 0; display: grid; gap: 16px; }
  .container { width: min(1100px, 100%); padding: 40px 24px; margin: 0 auto; }
  .app-header, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
  .eyebrow { color: #245eb1; font-size: .75rem; font-weight: 700; letter-spacing: .14em; }
  .muted { color: #617086; font-size: .9rem; font-weight: 400; }
  .card { padding: 24px; margin-bottom: 24px; background: white; border: 1px solid #dde4ed; border-radius: 10px; box-shadow: 0 3px 12px #24324706; }
  .card h2 { margin-bottom: 20px; }
  .auth-card { max-width: 460px; margin: 20px auto; }
  .auth-card > button { margin-top: 16px; width: 100%; }
  .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .actions, .account { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .form-grid .actions { grid-column: 1 / -1; }
  .search { display: flex; align-items: end; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .grow { flex: 1; min-width: 200px; }
  .notice { padding: 12px 16px; border-radius: 6px; background: #e9f4ef; color: #22533a; margin-bottom: 20px; }
  .notice.error { background: #fff0f0; color: #93282e; }
  .empty { padding: 24px 0; color: #617086; }
  .table-scroll { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; text-align: left; font-size: .9rem; }
  th { color: #617086; background: #f7f9fc; }
  td, th { padding: 14px 12px; border-bottom: 1px solid #e3e9f1; overflow-wrap: anywhere; }
  td:last-child { min-width: 170px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  @media(max-width: 600px) {
    .container { padding: 24px 14px; }
    .card { padding: 18px; }
    .form-grid { grid-template-columns: 1fr; }
    .app-header { align-items: flex-start; flex-direction: column; }
    .section-heading { gap: 8px; flex-wrap: wrap; }
  }
`;
