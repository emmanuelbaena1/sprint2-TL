import { useEffect, useState } from "react";

type Role = "Cliente" | "Operador Logístico" | "Supervisor Logístico" | "Administrador";
type ApiUser = { token: string; email: string; fullName: string; role: string };
type ShipmentApi = { trackingId: string; recipientName: string; recipientAddress: string; weightCategory: string; status: string; createdAt: string };
type EventApi = { id: number; stage: string; location: string; eventDateTime: string; groupEvent?: boolean; note?: string };
const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
function statusTone(status: string): "blue" | "green" | "amber" | "red" | "gray" { if (status === "Entregado") return "green"; if (status === "Cancelado") return "red"; if (status === "En tránsito" || status === "En reparto") return "amber"; if (status === "En central") return "amber"; return "blue"; }
type GroupApi = { id: number; name: string; active: boolean; createdAt: string; shipments: { trackingId: string; recipientName: string; status: string }[] };
function roleFromApi(role: string): Role { return ({ CLIENTE: "Cliente", OPERADOR_LOGISTICO: "Operador Logístico", SUPERVISOR_LOGISTICO: "Supervisor Logístico", ADMINISTRADOR: "Administrador" } as Record<string, Role>)[role] || "Cliente"; }
function statusFromApi(status: string): string { return ({ RECIBIDO_EN_ORIGEN: "Recibido en origen", EN_CENTRAL: "En central", EN_TRANSITO: "En tránsito", EN_REPARTO: "En reparto", ENTREGADO: "Entregado", CANCELADO: "Cancelado" } as Record<string, string>)[status] || status; }
async function api<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const details = Array.isArray(body.details) ? body.details.join(" ") : "";
    throw new Error(details || body.error || body.message || "No fue posible completar la operación.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
type IconName =
  | "archive"
  | "arrow"
  | "box"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "dashboard"
  | "download"
  | "edit"
  | "eye"
  | "group"
  | "history"
  | "lock"
  | "logout"
  | "menu"
  | "package"
  | "people"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "truck"
  | "user"
  | "warning"
  | "whatsapp";

const paths: Record<IconName, React.ReactNode> = {
  archive: <><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  box: <><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></>,
  edit: <><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  group: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2-7 6-7s6 3 6 7M15 14c3 0 5 2 5 5"/></>,
  history: <><path d="M4 7v5h5"/><path d="M5 12a8 8 0 1 0 2-6"/><path d="M12 7v5l3 2"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  package: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M9 5v5"/></>,
  people: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2-7 6-7s6 3 6 7"/><circle cx="17" cy="9" r="2"/><path d="M16 14c3 0 5 2 5 5"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  search: <><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6a8 8 0 0 0-1.6 1L6.5 6 4.4 9.5l2 1.5a7 7 0 0 0 0 2l-2 1.5L6.5 18l2.3-1a8 8 0 0 0 1.6 1l.3 2.6h4L15 18a8 8 0 0 0 1.6-1l2.3 1 2.1-3.5-2-1.5a7 7 0 0 0 .1-1Z"/></>,
  shield: <><path d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></>,
  warning: <><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  whatsapp: <><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 3 2 4.5 5 5"/></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Button({ children, variant = "primary", icon, onClick, type = "button", disabled = false }: { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon}/>}<span>{children}</span></button>;
}

function Input({ label, value, placeholder, type = "text", disabled = false, error, helper, onChange }: { label: string; value?: string; placeholder?: string; type?: string; disabled?: boolean; error?: string; helper?: string; onChange?: (value: string) => void }) {
  return <label className="field"><span className="field-label">{label}</span><input className={error ? "input input-error" : "input"} value={value} placeholder={placeholder} type={type} disabled={disabled} onChange={(e) => onChange?.(e.target.value)}/>{error && <span className="field-error"><Icon name="warning" size={14}/>{error}</span>}{helper && <span className="field-helper">{helper}</span>}</label>;
}

function Select({ label, value, children, disabled = false, onChange }: { label: string; value?: string; children: React.ReactNode; disabled?: boolean; onChange?: (value: string) => void }) {
  return <label className="field"><span className="field-label">{label}</span><span className="select-wrap"><select className="input" value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)}>{children}</select><Icon name="chevron" size={16}/></span></label>;
}

function Textarea({ label, value, placeholder, onChange }: { label: string; value?: string; placeholder?: string; onChange?: (value: string) => void }) {
  return <label className="field"><span className="field-label">{label}</span><textarea className="input textarea" value={value} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}/></label>;
}

function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" | "red" | "gray" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

const stages = ["Recibido en origen", "En central", "En tránsito", "En reparto", "Entregado"];

function Pipeline({ current = "En tránsito" }: { current?: string }) {
  const currentIndex = stages.indexOf(current);
  return <div className="pipeline">{stages.map((stage, index) => <div className={`pipe-step ${index < currentIndex ? "done" : index === currentIndex ? "current" : ""}`} key={stage}><div className="pipe-line"/><div className="pipe-dot">{index < currentIndex ? <Icon name="check" size={16}/> : index + 1}</div><div className="pipe-label">{stage}</div></div>)}</div>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><div className="page-title">{title}</div>{description && <div className="page-description">{description}</div>}</div>{action && <div className="heading-actions">{action}</div>}</div>;
}

function Stat({ label, value, icon, trend, tone = "blue" }: { label: string; value: string; icon: IconName; trend?: string; tone?: string }) {
  return <Card className="stat-card"><div className={`stat-icon tone-${tone}`}><Icon name={icon}/></div><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{trend && <div className="stat-trend">{trend}</div>}</div></Card>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function EmptyState({ icon = "package", title, description, action }: { icon?: IconName; title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty"><div className="empty-icon"><Icon name={icon} size={28}/></div><div className="empty-title">{title}</div><div className="empty-copy">{description}</div>{action}</div>;
}

function Modal({ title, children, onClose, footer, danger = false }: { title: string; children: React.ReactNode; onClose: () => void; footer: React.ReactNode; danger?: boolean }) {
  return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div className={`modal-icon ${danger ? "danger" : ""}`}><Icon name={danger ? "warning" : "check"}/></div><div className="modal-title">{title}</div><Button variant="ghost" icon="close" onClick={onClose}>Cerrar</Button></div><div className="modal-body">{children}</div><div className="modal-footer">{footer}</div></div></div>;
}

function Auth({ onLogin }: { onLogin: (user: ApiUser) => void }) {
  const [view, setView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState({ email: "", fullName: "", identification: "", password: "", address: "", cityCountry: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const emailIsValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const registerComplete = Object.values(register).every((value) => value.trim().length > 0);
  const registerValid = registerComplete && emailIsValid(register.email) && /^[0-9]{1,10}$/.test(register.identification) && register.password.length >= 8;
  const submitLogin = async () => {
    setError(""); setSuccess("");
    if (!emailIsValid(email)) { setError("Escribe un correo electrónico válido."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    try { onLogin(await api<ApiUser>("/auth/login", undefined, { method: "POST", body: JSON.stringify({ email, password }) })); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo."); }
  };
  const submitRegister = async () => {
    setError(""); setSuccess("");
    if (!registerValid) { setError("Revisa los campos marcados. Completa todos los datos para continuar."); return; }
    try { await api("/auth/register", undefined, { method: "POST", body: JSON.stringify(register) }); setEmail(register.email); setPassword(""); setView("login"); setSuccess("Tu cuenta quedó creada. Ya puedes iniciar sesión con el correo y la contraseña registrados."); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo."); }
  };
  const changeView = (next: "login" | "register") => { setView(next); setError(""); setSuccess(""); };
  const loginEmailError = email && !emailIsValid(email) ? "Escribe un correo con formato nombre@dominio.com." : "";
  const loginPasswordError = password && password.length < 8 ? "Debe tener al menos 8 caracteres." : "";
  const registerEmailError = register.email && !emailIsValid(register.email) ? "Escribe un correo con formato nombre@dominio.com." : "";
  const registerIdError = register.identification && !/^[0-9]{1,10}$/.test(register.identification) ? "Usa solo números, hasta 10 dígitos." : "";
  const registerPasswordError = register.password && register.password.length < 8 ? "Usa al menos 8 caracteres." : "";
  return <div className="auth-shell"><div className="auth-brand"><Brand light/><div className="auth-message"><div className="auth-kicker">Plataforma logística empresarial</div><div className="auth-hero">Control total en cada etapa del recorrido.</div><div className="auth-subtitle">Gestiona envíos, monitorea movimientos y toma decisiones con información confiable.</div><div className="auth-features"><span><Icon name="shield"/> Acceso seguro por rol</span><span><Icon name="history"/> Historial de trazabilidad</span><span><Icon name="truck"/> Operación en tiempo real</span></div></div><div className="auth-decoration"><Icon name="box" size={110}/></div></div><main className="auth-main"><div className="auth-card wide"><div className="auth-title">{view === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}</div><div className="auth-copy">{view === "login" ? "Ingresa tus credenciales. El sistema identificará automáticamente tu rol." : "Tu cuenta inicia con el rol Cliente."}</div>{success && <div className="alert alert-success" role="status"><Icon name="check"/><div><strong>{success}</strong></div></div>}{view === "login" ? <><Input label="Correo electrónico" value={email} error={loginEmailError} onChange={(value) => { setEmail(value); setError(""); setSuccess(""); }}/><Input label="Contraseña" type="password" value={password} error={loginPasswordError} helper="Mínimo 8 caracteres" onChange={(value) => { setPassword(value); setError(""); setSuccess(""); }}/>{error && <div className="alert alert-error" role="alert"><Icon name="warning"/><div><strong>{error}</strong></div></div>}<div className="auth-row"><label className="check-label"><input type="checkbox"/> Mantener mi correo</label><button className="text-button" onClick={() => setError("La recuperación de contraseña aún no está disponible. Contacta al administrador.")}>¿Olvidaste tu contraseña?</button></div><Button onClick={submitLogin} disabled={!email.trim() || !password}>Iniciar sesión <Icon name="arrow"/></Button><div className="demo-box"><strong>Acceso conectado</strong><span>El rol se obtiene de la cuenta registrada.</span></div><div className="auth-switch">¿No tienes una cuenta? <button onClick={() => changeView("register")}>Crear cuenta</button></div></> : <><div className="form-grid two"><Input label="Nombre completo" value={register.fullName} onChange={(value) => { setRegister({ ...register, fullName: value }); setError(""); }}/><Input label="Identificación" value={register.identification} error={registerIdError} onChange={(value) => { setRegister({ ...register, identification: value }); setError(""); }} placeholder="Solo números, máximo 10" helper="Dato único e inmutable"/><Input label="Correo electrónico" value={register.email} error={registerEmailError} onChange={(value) => { setRegister({ ...register, email: value }); setError(""); }} placeholder="nombre@correo.com"/><Input label="Contraseña" value={register.password} error={registerPasswordError} onChange={(value) => { setRegister({ ...register, password: value }); setError(""); }} type="password" placeholder="Mínimo 8 caracteres" helper="Mínimo 8 caracteres"/><Input label="Dirección" value={register.address} onChange={(value) => { setRegister({ ...register, address: value }); setError(""); }} placeholder="Dirección completa"/><Input label="Ciudad - país" value={register.cityCountry} onChange={(value) => { setRegister({ ...register, cityCountry: value }); setError(""); }} placeholder="Ej. Medellín - Colombia"/></div><div className="alert alert-info compact"><Icon name="shield"/><div><strong>Rol asignado: Cliente</strong><span>Los roles se asignan desde Administración.</span></div></div>{error && <div className="alert alert-error" role="alert"><Icon name="warning"/><div><strong>{error}</strong></div></div>}<Button onClick={submitRegister}>Crear cuenta</Button><div className="auth-switch">¿Ya tienes cuenta? <button onClick={() => changeView("login")}>Iniciar sesión</button></div></>}</div></main></div>;
}

function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? "brand-light" : ""}`}><div className="brand-mark"><Icon name="box" size={21}/></div><div><b>TRACKLINE</b><span>Logistics Platform</span></div></div>;
}

const menus: Record<Role, { label: string; icon: IconName; page: string }[]> = {
  Cliente: [
    { label: "Resumen", icon: "dashboard", page: "dashboard" }, { label: "Mis envíos", icon: "package", page: "shipments" }, { label: "Consultar tracking", icon: "search", page: "tracking" }, { label: "Mi perfil", icon: "user", page: "profile" }, { label: "Contactar por WhatsApp", icon: "whatsapp", page: "whatsapp" },
  ],
  "Operador Logístico": [
    { label: "Resumen operativo", icon: "dashboard", page: "dashboard" }, { label: "Registrar envío", icon: "plus", page: "new" }, { label: "Envíos", icon: "package", page: "shipments" }, { label: "Grupos de paquetes", icon: "group", page: "groups" }, { label: "Registrar evento", icon: "truck", page: "event" }, { label: "Consultar tracking", icon: "search", page: "tracking" }, { label: "Mi perfil", icon: "user", page: "profile" },
  ],
  "Supervisor Logístico": [
    { label: "Panel de supervisión", icon: "dashboard", page: "dashboard" }, { label: "Envíos por usuario", icon: "people", page: "users" }, { label: "Consultar tracking", icon: "search", page: "tracking" }, { label: "Tiempos de tránsito", icon: "clock", page: "transit" }, { label: "Retrasos", icon: "warning", page: "delays" }, { label: "Volumen de envíos", icon: "chart", page: "volume" }, { label: "Mi perfil", icon: "user", page: "profile" },
  ],
  Administrador: [
    { label: "Panel administrativo", icon: "dashboard", page: "dashboard" }, { label: "Gestión de roles", icon: "shield", page: "roles" }, { label: "Cuentas bloqueadas", icon: "lock", page: "blocked" }, { label: "Registro de seguridad", icon: "history", page: "audit" }, { label: "Mi perfil", icon: "user", page: "profile" },
  ],
};

function Shell({ role, user, token, onLogout }: { role: Role; user: ApiUser; token: string; onLogout: () => void }) {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState("");
  const [selectedTrackingId, setSelectedTrackingId] = useState("");

  const title = menus[role].find((item) => item.page === page)?.label || "Trackline";
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3000); };
  const openTracking = (trackingId: string) => { setSelectedTrackingId(trackingId); setPage("tracking"); };
  return <div className="app-shell"><aside className="sidebar"><Brand/><nav>{menus[role].map((item) => <button className={page === item.page ? "nav-item active" : "nav-item"} key={item.page} onClick={() => { if (item.page === "tracking") setSelectedTrackingId(""); setPage(item.page); }}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav><div className="sidebar-security"><Icon name="shield"/><div><b>Sesión protegida</b><span>Cierre automático tras 5 min sin actividad</span></div></div><button className="logout" onClick={onLogout}><Icon name="logout"/> Cerrar sesión</button></aside><div className="app-area"><header className="topbar"><div><div className="breadcrumb">Trackline <span>/</span> {title}</div></div><div className="top-actions"><div className="divider"/><div className="user-block"><div className="avatar">{user.fullName.split(" ").map((part) => part[0]).slice(0,2).join("")}</div><div><b>{user.fullName}</b><span>{role}</span></div><Icon name="chevron" size={15}/></div></div></header><main className="content">{page === "dashboard" && <Dashboard role={role} token={token} go={setPage} onTracking={openTracking}/>} {page === "shipments" && <Shipments role={role} go={setPage} notify={notify} token={token} onTracking={openTracking}/>} {page === "tracking" && <Tracking role={role} token={token} initialTrackingId={selectedTrackingId}/>} {page === "profile" && <Profile role={role} notify={notify} token={token}/>} {page === "new" && <NewShipment notify={notify} token={token}/>} {page === "groups" && <Groups notify={notify} token={token}/>} {page === "event" && <EventRegistration notify={notify} token={token}/>} {page === "users" && <SupervisorUsers go={setPage}/>} {page === "transit" && <PendingReport type="transit"/>} {page === "delays" && <PendingReport type="delays"/>} {page === "volume" && <Volume/>} {page === "roles" && <Roles notify={notify} token={token}/>} {page === "blocked" && <Blocked notify={notify} token={token}/>} {page === "audit" && <Audit/>} {page === "whatsapp" && <Whatsapp/>}</main></div>{toast && <div className="toast"><span><Icon name="check"/></span><div><b>Operación completada</b><small>{toast}</small></div></div>}</div>;
}

function Dashboard({ role, token, go, onTracking }: { role: Role; token: string; go: (page: string) => void; onTracking: (trackingId: string) => void }) {
  if (role === "Cliente") return <><PageTitle eyebrow="Resumen" title="Consulta tus envíos" description="Accede a los envíos asociados a tu identificación." action={<Button icon="search" onClick={() => go("shipments")}>Ver mis envíos</Button>}/><InDeliverySummary role={role} token={token} onTracking={onTracking}/></>;
  if (role === "Operador Logístico") return <><PageTitle eyebrow="Operación" title="Resumen operativo" description="Registra envíos y eventos logísticos." action={<Button icon="plus" onClick={() => go("new")}>Registrar envío</Button>}/><InDeliverySummary role={role} token={token} onTracking={onTracking}/></>;
  if (role === "Supervisor Logístico") return <><PageTitle eyebrow="Supervisión logística" title="Consultas operativas" description="Supervisa los envíos asociados a los usuarios." action={<Button onClick={() => go("users")}>Ver usuarios con envíos</Button>}/><InDeliverySummary role={role} token={token} onTracking={onTracking}/><div className="alert alert-warning"><Icon name="warning"/><div><strong>Reportes en refinamiento</strong><span>El documento no define fórmula para tiempos de tránsito ni regla objetiva para retrasos.</span></div></div><Card><EmptyState icon="people" title="Consulta la operación registrada" description="El volumen se muestra con datos reales del sistema." action={<Button variant="secondary" onClick={() => go("volume")}>Consultar volumen</Button>}/></Card></>;
  return <><PageTitle eyebrow="Administración del sistema" title="Control de accesos" description="Gestiona roles y cuentas bloqueadas." action={<Button icon="shield" onClick={() => go("roles")}>Gestionar roles</Button>}/><Card><EmptyState icon="shield" title="Administración conectada" description="Las funciones administrativas usan las cuentas registradas." action={<Button variant="secondary" onClick={() => go("roles")}>Abrir gestión de roles</Button>}/></Card></>;
}
function InDeliverySummary({ role, token, onTracking }: { role: Role; token: string; onTracking: (trackingId: string) => void }) {
  const [rows, setRows] = useState<ShipmentApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const endpoint = role === "Cliente" ? "/tracking/mine" : role === "Operador Logístico" ? "/operador/shipments" : "/supervisor/shipments/in-delivery";
    api<ShipmentApi[]>(endpoint, token).then(setRows).catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los paquetes.")).finally(() => setLoading(false));
  }, [role, token]);
  const inDelivery = rows.filter((shipment) => shipment.status === "EN_REPARTO");
  return <Card><div className="card-header"><div><div className="card-title">Paquetes en reparto</div><div className="card-subtitle">Envíos que actualmente están en ruta de entrega</div></div><Badge tone="amber">{loading ? "…" : inDelivery.length}</Badge></div>{loading ? <div className="loading-state">Cargando paquetes...</div> : error ? <div className="alert alert-error" role="alert">{error}</div> : inDelivery.length ? <Table headers={["Seguimiento","Destinatario","Destino",""]}>{inDelivery.map((shipment) => <tr key={shipment.trackingId}><td><strong>{shipment.trackingId}</strong></td><td>{shipment.recipientName}</td><td>{shipment.recipientAddress}</td><td><Button variant="ghost" icon="eye" onClick={() => onTracking(shipment.trackingId)}>Ver tracking</Button></td></tr>)}</Table> : <EmptyState icon="truck" title="No hay paquetes en reparto" description="Los envíos aparecerán aquí cuando se registre la etapa En reparto."/>}</Card>;
}
function Shipments({ role, go, notify, token, onTracking }: { role: Role; go: (page: string) => void; notify: (message: string) => void; token: string; onTracking: (trackingId: string) => void }) {
  const [rows, setRows] = useState<ShipmentApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancel, setCancel] = useState<ShipmentApi | null>(null);
  const [reason, setReason] = useState("");
  const [query, setQuery] = useState("");
  const visibleRows = rows.filter((shipment) => `${shipment.trackingId} ${shipment.recipientName} ${shipment.recipientAddress}`.toLowerCase().includes(query.trim().toLowerCase()));
  const eligible = cancel?.status === "EN_CENTRAL" || cancel?.status === "RECIBIDO_EN_ORIGEN";
  const refresh = () => { setLoading(true); api<ShipmentApi[]>(role === "Cliente" ? "/tracking/mine" : "/operador/shipments", token).then(setRows).catch((error) => notify(error.message)).finally(() => setLoading(false)); };
  useEffect(refresh, [role, token]);
  return <><PageTitle eyebrow={role === "Cliente" ? "Asociados a tu identificación" : "Gestión de envíos"} title={role === "Cliente" ? "Mis envíos" : "Envíos registrados"} description={role === "Cliente" ? "Solo puedes acceder a envíos cuyo destinatario coincide con tu identificación." : "Consulta el estado, registra eventos o cancela envíos elegibles."} action={role !== "Cliente" ? <Button icon="plus" onClick={() => go("new")}>Registrar envío</Button> : undefined}/><Card><div className="toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar por TRK o destinatario"/></div></div>{loading ? <div className="loading-state">Cargando envíos...</div> : visibleRows.length ? <Table headers={["ID de seguimiento", "Destinatario", "Destino", "Categoría", "Estado actual", "Creado", ""]}>{visibleRows.map((shipment) => <tr key={shipment.trackingId}><td><strong>{shipment.trackingId}</strong></td><td>{shipment.recipientName}</td><td>{shipment.recipientAddress}</td><td>{shipment.weightCategory}</td><td><Badge tone={statusTone(statusFromApi(shipment.status))}>{statusFromApi(shipment.status)}</Badge></td><td>{new Date(shipment.createdAt).toLocaleString()}</td><td><div className="row-actions"><Button variant="ghost" icon="eye" onClick={() => onTracking(shipment.trackingId)}>Ver tracking</Button>{role === "Operador Logístico" && !["CANCELADO", "ENTREGADO"].includes(shipment.status) && <Button variant="ghost" icon="close" onClick={() => setCancel(shipment)}>Cancelar</Button>}</div></td></tr>)}</Table> : <EmptyState title="No hay envíos registrados" description="Cuando existan envíos asociados, aparecerán aquí."/>}</Card>{cancel && <Modal danger title="Confirmar cancelación" onClose={() => setCancel(null)} footer={<><Button variant="ghost" onClick={() => setCancel(null)}>Volver</Button><Button variant="danger" disabled={!eligible || !reason.trim()} onClick={async () => { try { await api(`/operador/shipments/${cancel.trackingId}/cancel`, token, { method: "POST", body: JSON.stringify({ reason }) }); notify("Envío cancelado y evento añadido al historial."); setCancel(null); setReason(""); refresh(); } catch (error) { notify(error instanceof Error ? error.message : "Error al cancelar."); } }}>Confirmar cancelación</Button></>}><div className="cancel-summary"><span>Envío</span><b>{cancel.trackingId}</b><Badge>{statusFromApi(cancel.status)}</Badge></div>{eligible ? <Textarea label="Motivo de cancelación" value={reason} onChange={setReason} placeholder="Motivo que quedará en el historial"/> : <div className="alert alert-error"><Icon name="lock"/><div><strong>La etapa actual no admite cancelación</strong><span>Solo se permite desde Recibido en origen o En central.</span></div></div>}</Modal>}</>;
}

function Tracking({ role, token, initialTrackingId = "" }: { role: Role; token: string; initialTrackingId?: string }) {
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [trk, setTrk] = useState(initialTrackingId);
  const [shipment, setShipment] = useState<ShipmentApi | null>(null);
  const [events, setEvents] = useState<EventApi[]>([]);
  const [error, setError] = useState("");
  const denied = role === "Administrador";
  const runSearch = async (trackingId = trk) => {
    const trackingCode = trackingId.trim();
    if (!trackingCode) return;
    setTrk(trackingCode); setSearching(true); setSearched(false); setError("");
    try { const result = await api<ShipmentApi>(`/tracking/${encodeURIComponent(trackingCode)}`, token); const history = await api<EventApi[]>(`/tracking/${encodeURIComponent(trackingCode)}/events`, token); setShipment(result); setEvents(history); }
    catch (e) { setShipment(null); setEvents([]); setError(e instanceof Error ? e.message : "No encontramos el envío o no tienes permiso para verlo."); }
    finally { setSearching(false); setSearched(true); }
  };
  useEffect(() => { if (initialTrackingId) void runSearch(initialTrackingId); else { setTrk(""); setShipment(null); setEvents([]); setSearched(false); setError(""); } }, [initialTrackingId, token]);
  if (denied) return <><PageTitle eyebrow="Seguridad de acceso" title="Consulta de tracking"/><Card><EmptyState icon="lock" title="Acceso denegado" description="El rol Administrador no está autorizado para consultar el estado ni el historial de los envíos."/></Card></>;
  const exists = Boolean(shipment);
  return <><PageTitle eyebrow="Seguimiento autorizado" title="Consulta de tracking" description={initialTrackingId ? "Mostramos el envío que seleccionaste." : "Busca un único envío mediante su identificador de seguimiento."}/><Card className="tracking-search"><div className="search-label">ID de seguimiento</div><div className="big-search"><Icon name="search"/><input value={trk} onChange={(e) => setTrk(e.target.value)} placeholder="Ej. TRK-XXXXXXXXXX"/><Button onClick={() => void runSearch()} disabled={!trk.trim() || searching}>Consultar</Button></div><div className="security-note"><Icon name="shield" size={15}/> La autorización se valida en el servidor con la sesión; los clientes solo consultan envíos asociados a su identificación.</div></Card>{searching && <Card><div className="loading-state"><span className="spinner"/><b>Consultando envío...</b></div></Card>}{searched && !exists && <Card><EmptyState icon="search" title="No encontramos el envío" description={error || "No existe un envío asociado al identificador ingresado o no tienes autorización para consultarlo."}/></Card>}{searched && exists && shipment && <><Card className="tracking-result"><div className="tracking-top"><div><span>ID de seguimiento</span><b>{shipment.trackingId}</b></div><Badge>{statusFromApi(shipment.status)}</Badge><div><span>Destino</span><b>{shipment.recipientAddress}</b></div></div><Pipeline current={statusFromApi(shipment.status)}/></Card><Card><div className="card-header"><div><div className="card-title">Historial de movimientos</div><div className="card-subtitle">Eventos del envío en orden cronológico</div></div></div>{events.length ? <div className="timeline">{events.map((event) => <div className="timeline-item" key={event.id}><div className="timeline-marker"><Icon name="check" size={15}/></div><div><div className="timeline-title">{statusFromApi(event.stage)}{event.groupEvent && <Badge>Evento grupal</Badge>}</div><div className="timeline-place">{event.location}{event.note && ` · ${event.note}`}</div></div><time>{new Date(event.eventDateTime).toLocaleString()}</time></div>)}</div> : <EmptyState icon="history" title="Aún no hay movimientos" description="El envío no tiene eventos logísticos registrados."/>}</Card></>}</>;
}

function NewShipment({ notify, token }: { notify: (message: string) => void; token: string }) {
  const [weight, setWeight] = useState("");
  const [form, setForm] = useState({ senderCompanyName: "", senderContactNumber: "", recipientName: "", recipientIdentification: "", recipientAddress: "" });
  const [busy, setBusy] = useState(false);
  const change = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const num = Number(weight);
  const category = !weight ? "Pendiente" : num <= 20 ? "Pequeño" : num <= 40 ? "Mediano" : num <= 70 ? "Grande" : num <= 2000 ? "Extragrande" : "No admitido";
  const invalid = !Number.isFinite(num) || num <= 0 || num > 2000;
  const create = async () => { setBusy(true); try { const result = await api<{ trackingId: string; message?: string }>("/operador/shipments", token, { method: "POST", body: JSON.stringify({ ...form, weight: num }) }); notify(`${result.message || "Envío registrado."} Tracking: ${result.trackingId}`); setForm({ senderCompanyName: "", senderContactNumber: "", recipientName: "", recipientIdentification: "", recipientAddress: "" }); setWeight(""); } catch (error) { notify(error instanceof Error ? error.message : "No fue posible registrar el envío."); } finally { setBusy(false); } };
  return <><PageTitle eyebrow="HU-07 · Gestión de envíos" title="Registrar nuevo envío" description="Completa los datos; el servidor calculará y guardará solo la categoría del peso."/><Card><div className="form-grid two"><Input label="Empresa remitente" value={form.senderCompanyName} onChange={change("senderCompanyName")}/><Input label="Contacto de empresa" value={form.senderContactNumber} onChange={change("senderContactNumber")}/><Input label="Nombre del destinatario" value={form.recipientName} onChange={change("recipientName")}/><Input label="Identificación (máximo 10 dígitos)" value={form.recipientIdentification} onChange={change("recipientIdentification")}/><Input label="Dirección del destinatario" value={form.recipientAddress} onChange={change("recipientAddress")}/><Input label="Peso (lb)" value={weight} onChange={setWeight} type="number" error={weight && invalid ? "Ingresa un peso mayor a 0 y máximo 2000 lb." : undefined}/></div><div className="alert alert-info compact"><Icon name="box"/><div><strong>Categoría: {category}</strong><span>{category === "Extragrande" ? "El envío tendrá un tratamiento diferente y seguirá las etapas normales." : "Peso >20–40 lb: Mediano · >40–70 lb: Grande · >70–2000 lb: Extragrande."}</span></div></div><div className="form-actions"><Button disabled={busy || invalid || Object.values(form).some((v) => !v.trim())} onClick={create}>{busy ? "Registrando…" : "Registrar y generar seguimiento"}</Button></div></Card></>;
}
function EventRegistration({ notify, token }: { notify: (message: string) => void; token: string }) {
  const [trackingId, setTrackingId] = useState(""); const [status, setStatus] = useState<ShipmentApi | null>(null); const [centers, setCenters] = useState<{id:number;name:string;city:string}[]>([]); const [centerId,setCenterId]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const stages=["RECIBIDO_EN_ORIGEN","EN_CENTRAL","EN_TRANSITO","EN_REPARTO","ENTREGADO"]; const nextStage=status && status.status !== "ENTREGADO" && status.status !== "CANCELADO" ? stages[stages.indexOf(status.status)+1] || "" : "";
  useEffect(()=>{api<typeof centers>("/operador/centers",token).then(setCenters).catch(()=>setCenters([]));},[token]);
  const find=async()=>{setError("");try{setStatus(await api<ShipmentApi>(`/tracking/${encodeURIComponent(trackingId.trim())}`,token));}catch(e){setStatus(null);setError(e instanceof Error?e.message:"No se encontró el envío.");}};
  const save=async()=>{if(!status||!nextStage)return;setBusy(true);try{await api("/operador/shipment-events",token,{method:"POST",body:JSON.stringify({trackingId:status.trackingId,stage:nextStage,logisticCenterId:["EN_REPARTO","ENTREGADO"].includes(nextStage)?null:Number(centerId)})});notify(`Evento registrado: ${statusFromApi(nextStage)}.`);await find();}catch(e){setError(e instanceof Error?e.message:"No se pudo registrar el evento.");}finally{setBusy(false);}};
  return <><PageTitle eyebrow="HU-09 · Trazabilidad" title="Registro de evento logístico" description="El servidor impide saltos, repeticiones y retrocesos entre etapas."/><Card><div className="event-query"><Input label="ID de seguimiento" value={trackingId} onChange={setTrackingId} placeholder="TRK-…"/><Button variant="secondary" onClick={find}>Consultar</Button>{status&&<div className="current-status"><span>Estado actual</span><Badge>{statusFromApi(status.status)}</Badge></div>}</div>{error&&<div className="alert alert-error"><Icon name="warning"/><div>{error}</div></div>}{status&&<><div className="divider-line"/><div className="form-grid two event-fields"><Select label="Siguiente etapa" value={nextStage} disabled><option value={nextStage}>{nextStage?statusFromApi(nextStage):"Sin etapas disponibles"}</option></Select>{nextStage&&!['EN_REPARTO','ENTREGADO'].includes(nextStage)&&<Select label="Centro logístico" value={centerId} onChange={setCenterId}><option value="">Selecciona un centro</option>{centers.map(center=><option key={center.id} value={center.id}>{center.name} — {center.city}</option>)}</Select>}</div><div className="alert alert-info compact"><Icon name="shield"/><div><strong>Lugar automático</strong><span>En reparto y Entregado utilizan la dirección del destinatario; las etapas de red usan un centro activo.</span></div></div><div className="form-actions"><Button disabled={busy||!nextStage||(!['EN_REPARTO','ENTREGADO'].includes(nextStage)&&!centerId)} onClick={save}>{busy?"Guardando…":"Registrar evento"}</Button></div></>}</Card></>;
}
function Groups({ notify, token }: { notify: (message: string) => void; token: string }) {
  const [modal,setModal]=useState(false); const [groups,setGroups]=useState<GroupApi[]>([]); const [shipmentsList,setShipmentsList]=useState<ShipmentApi[]>([]); const [selected,setSelected]=useState<string[]>([]); const [name,setName]=useState(""); const [stage,setStage]=useState("RECIBIDO_EN_ORIGEN"); const [centerId,setCenterId]=useState(""); const [centers,setCenters]=useState<{id:number;name:string;city:string}[]>([]);
  const refresh=()=>api<GroupApi[]>("/operador/groups",token).then(setGroups).catch(e=>notify(e.message));
  useEffect(()=>{refresh();api<ShipmentApi[]>("/operador/shipments",token).then(setShipmentsList).catch(()=>{});api<typeof centers>("/operador/centers",token).then(setCenters).catch(()=>{});},[token]);
  const create=async()=>{try{await api<GroupApi>("/operador/groups",token,{method:"POST",body:JSON.stringify({name,trackingIds:selected})});setModal(false);setSelected([]);setName("");notify("Grupo creado.");refresh();}catch(e){notify(e instanceof Error?e.message:"No se pudo crear.");}};
  const apply=async(id:number)=>{try{const result=await api<{updatedTrackingIds:string[];skippedReasons:string[]}>(`/operador/groups/${id}/events`,token,{method:"POST",body:JSON.stringify({stage,logisticCenterId:stage==="EN_REPARTO"?null:Number(centerId)})});notify(`Actualizados: ${result.updatedTrackingIds.length}; omitidos: ${result.skippedReasons.join("; ")||"ninguno"}`);refresh();}catch(e){notify(e instanceof Error?e.message:"No se pudo aplicar.");}};
  return <><PageTitle eyebrow="HU-03 · Operación masiva" title="Grupos de paquetes" description="Cada envío puede estar en un grupo activo. Entregado se registra individualmente." action={<Button icon="plus" onClick={()=>setModal(true)}>Crear grupo</Button>}/>{groups.length?groups.map(group=><Card key={group.id}><div className="card-header"><div><div className="card-title">{group.name}</div><div className="card-subtitle">{group.shipments.length} envíos · {new Date(group.createdAt).toLocaleString()}</div></div><Button variant="danger" onClick={async()=>{await api(`/operador/groups/${group.id}`,token,{method:"DELETE"});notify("Grupo disuelto; los historiales se conservan.");refresh();}}>Disolver</Button></div><div className="form-grid two"><Select label="Etapa" value={stage} onChange={setStage}><option value="RECIBIDO_EN_ORIGEN">Recibido en origen</option><option value="EN_CENTRAL">En central</option><option value="EN_TRANSITO">En tránsito</option><option value="EN_REPARTO">En reparto</option></Select>{stage!=="EN_REPARTO"&&<Select label="Centro logístico" value={centerId} onChange={setCenterId}><option value="">Selecciona centro</option>{centers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}</Select>}</div><Button disabled={stage!=="EN_REPARTO"&&!centerId} onClick={()=>apply(group.id)}>Aplicar evento</Button></Card>):<Card><EmptyState icon="group" title="No hay grupos activos" description="Crea un grupo con envíos que no pertenezcan a otro grupo activo."/></Card>}<div className="alert alert-warning"><Icon name="warning"/><div><strong>Reglas de grupo</strong><span>Entregado y Cancelado no se aplican masivamente. Envíos no elegibles se omiten con el motivo correspondiente.</span></div></div>{modal&&<Modal title="Crear grupo" onClose={()=>setModal(false)} footer={<><Button variant="ghost" onClick={()=>setModal(false)}>Cancelar</Button><Button disabled={!name.trim()||!selected.length} onClick={create}>Crear grupo</Button></>}><Input label="Nombre del grupo" value={name} onChange={setName}/><div className="selection-list">{shipmentsList.map(s=><label key={s.trackingId}><input type="checkbox" checked={selected.includes(s.trackingId)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,s.trackingId]:prev.filter(id=>id!==s.trackingId))}/><span><b>{s.trackingId}</b><small>{s.recipientName} · {statusFromApi(s.status)}</small></span></label>)}</div></Modal>}</>;
}
function Profile({ role, notify, token }: { role: Role; notify: (message: string) => void; token: string }) {
  type ProfileData = {fullName:string;email:string;identification:string;address:string;cityCountry:string;role:string;createdAt:string};
  const [profile, setProfile] = useState<ProfileData|null>(null);
  const [address, setAddress] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = () => { setLoading(true); api<ProfileData>("/profile", token).then((data) => { setProfile(data); setAddress(data.address); setCityCountry(data.cityCountry); }).catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar tu perfil.")).finally(() => setLoading(false)); };
  useEffect(load, [token]);
  const save = async () => { setError(""); setSaving(true); try { const updated = await api<NonNullable<typeof profile>>("/profile", token, { method: "PUT", body: JSON.stringify({ address, cityCountry }) }); setProfile(updated); setAddress(updated.address); setCityCountry(updated.cityCountry); notify("Perfil actualizado correctamente."); } catch (e) { setError(e instanceof Error ? e.message : "No se pudieron guardar los cambios."); } finally { setSaving(false); } };
  const changed = Boolean(profile && (address.trim() !== profile.address || cityCountry.trim() !== profile.cityCountry));
  return <><PageTitle eyebrow="HU-06 · Perfil" title="Mi perfil" description="Consulta tus datos y actualiza tu dirección y ciudad-país."/>{loading ? <Card><div className="loading-state">Cargando perfil...</div></Card> : profile ? <Card><div className="form-grid two"><Input label="Nombre completo" value={profile.fullName} disabled/><Input label="Correo electrónico" value={profile.email} disabled/><Input label="Identificación" value={profile.identification} disabled/><Input label="Rol" value={role} disabled/><Input label="Dirección" value={address} onChange={(value) => setAddress(value)} placeholder="Tu dirección"/><Input label="Ciudad - país" value={cityCountry} onChange={(value) => setCityCountry(value)} placeholder="Ej. Medellín - Colombia"/></div>{profile.createdAt && <div className="security-note">Cuenta creada: {new Date(profile.createdAt).toLocaleDateString()}</div>}{error && <div className="alert alert-error" role="alert">{error}</div>}<div className="form-actions"><Button onClick={save} disabled={saving || !changed || !address.trim() || !cityCountry.trim()}>{saving ? "Guardando…" : "Guardar cambios"}</Button></div></Card> : <Card><EmptyState icon="user" title="No pudimos cargar el perfil" description={error || "Vuelve a intentarlo."}/></Card>}</>;
}
function SupervisorUsers({ go }: { go: (page: string) => void }) {
  const [users,setUsers]=useState<{id:number;fullName:string;identification:string;email:string}[]>([]);
  useEffect(()=>{const raw=localStorage.getItem("tracking-session");if(!raw)return;const token=(JSON.parse(raw) as {token:string}).token;api<typeof users>("/supervisor/users-with-shipments",token).then(setUsers).catch(()=>setUsers([]));},[]);
  return <><PageTitle eyebrow="HU-13 · Solo Supervisor" title="Envíos por usuario" description="Asociación mediante la identificación del destinatario."/><Card>{users.length?<Table headers={["Usuario","Identificación","Correo",""]}>{users.map(user=><tr key={user.id}><td><strong>{user.fullName}</strong></td><td>{user.identification}</td><td>{user.email}</td><td><Button variant="ghost" icon="eye" onClick={()=>go("tracking")}>Consultar envío</Button></td></tr>)}</Table>:<EmptyState icon="people" title="No hay usuarios con envíos asociados" description="La lista se forma con las cuentas cuya identificación coincide con destinatarios registrados."/>}</Card></>;
}
function PendingReport({ type }: { type: "transit" | "delays" }) {
  const transit = type === "transit";
  return <><PageTitle eyebrow={transit ? "HU-14 · Indicador operativo" : "HU-15 · Excepciones"} title={transit ? "Tiempos de tránsito" : "Envíos con retraso"} description="Acceso exclusivo para Supervisor Logístico."/ ><Card><EmptyState icon={transit ? "clock" : "warning"} title={transit ? "Cálculo pendiente de definición" : "Regla de retraso pendiente de definición"} description={transit ? "El archivo no fija el instante inicial, final ni las etapas usadas en el cálculo. No se muestra una fórmula para evitar inventar una regla." : "El archivo no establece fecha estimada de entrega ni condición objetiva de retraso. La lista estará disponible cuando se defina la regla."}/></Card><div className="alert alert-info"><Icon name="shield"/><div><strong>Diseño preparado para el refinamiento</strong><span>{transit ? "Cuando se definan los eventos necesarios, aquí se mostrará el tiempo transcurrido por envío." : "Cuando exista una condición oficial, aquí aparecerán únicamente los envíos que la cumplan."}</span></div></div></>;
}

function Volume() {
  const [count,setCount]=useState<number|null>(null);
  useEffect(()=>{const raw=localStorage.getItem("tracking-session");if(!raw)return;api<number>("/supervisor/volume",(JSON.parse(raw) as {token:string}).token).then(setCount).catch(()=>setCount(null));},[]);
  return <><PageTitle eyebrow="HU-16 · Operación consolidada" title="Volumen de envíos" description="Cantidad total registrada, sin filtros adicionales."/><div className="volume-hero"><div><span>Volumen total</span><b>{count===null?"—":count.toLocaleString()}</b><small>{count===null?"No fue posible cargar el dato":"Dato real del sistema"}</small></div><Icon name="chart" size={54}/></div></>;
}
function Roles({ notify, token }: { notify: (message: string) => void; token: string }) {
  const [users,setUsers]=useState<{id:number;fullName:string;email:string;identification:string;role:string}[]>([]); const [selected,setSelected]=useState<{id:number;fullName:string;role:string}|null>(null); const [role,setRole]=useState("CLIENTE");
  const refresh=()=>api<typeof users>("/admin/users",token).then(setUsers).catch(e=>notify(e.message)); useEffect(()=>{refresh();},[token]);
  const labels:Record<string,string>={CLIENTE:"Cliente",OPERADOR_LOGISTICO:"Operador Logístico",SUPERVISOR_LOGISTICO:"Supervisor Logístico",ADMINISTRADOR:"Administrador"};
  const save=async()=>{if(!selected)return;try{await api(`/admin/users/${selected.id}/role?role=${role}`,token,{method:"PUT"});notify("Rol actualizado. El servidor aplica el rol vigente al siguiente acceso.");setSelected(null);refresh();}catch(e){notify(e instanceof Error?e.message:"No se pudo actualizar el rol.");}};
  return <><PageTitle eyebrow="HU-17 / HU-S-21" title="Gestión de roles" description="Solo Administración puede asignar Cliente, Operador Logístico o Supervisor Logístico."/><Card>{users.length?<Table headers={["Cuenta","Identificación","Rol actual",""]}>{users.map(user=><tr key={user.id}><td>{user.fullName}<br/><small>{user.email}</small></td><td>{user.identification}</td><td><Badge>{labels[user.role]||user.role}</Badge></td><td>{user.role!=="ADMINISTRADOR"&&<Button variant="secondary" onClick={()=>{setSelected(user);setRole(user.role);}}>Cambiar rol</Button>}</td></tr>)}</Table>:<EmptyState icon="people" title="No hay cuentas para gestionar" description="Las cuentas registradas aparecerán aquí."/>}</Card>{selected&&<Modal title={`Cambiar rol de ${selected.fullName}`} onClose={()=>setSelected(null)} footer={<><Button variant="ghost" onClick={()=>setSelected(null)}>Cancelar</Button><Button onClick={save}>Guardar cambio</Button></>}><Select label="Nuevo rol" value={role} onChange={setRole}><option value="CLIENTE">Cliente</option><option value="OPERADOR_LOGISTICO">Operador Logístico</option><option value="SUPERVISOR_LOGISTICO">Supervisor Logístico</option></Select></Modal>}</>;
}
function Blocked({ notify, token }: { notify: (message: string) => void; token: string }) {
  const [users,setUsers]=useState<{id:number;fullName:string;email:string;accountLocked:boolean;penaltyUntil:string|null}[]>([]); const refresh=()=>api<typeof users>("/admin/users/security-status",token).then(setUsers).catch(e=>notify(e.message)); useEffect(()=>{refresh();},[token]);
  return <><PageTitle eyebrow="HU-S-19 · Control de fuerza bruta" title="Cuentas bloqueadas" description="Tras 5 intentos se aplica una pausa de 1 minuto; después de 2 más, una pausa de 2 minutos; 2 intentos adicionales bloquean la cuenta hasta que Administración la desbloquee."/><Card>{users.length?<Table headers={["Cuenta","Estado","Acción"]}>{users.map(user=><tr key={user.id}><td>{user.fullName}<br/><small>{user.email}</small></td><td><Badge tone={user.accountLocked?"red":"amber"}>{user.accountLocked?"Bloqueada hasta desbloqueo":`Pausa temporal hasta ${new Date(user.penaltyUntil as string).toLocaleTimeString()}`}</Badge></td><td><Button onClick={async()=>{try{await api(`/admin/users/${user.id}/unlock`,token,{method:"PUT"});notify("Bloqueo o pausa retirados; la cuenta puede volver a intentarlo.");refresh();}catch(e){notify(e instanceof Error?e.message:"No se pudo desbloquear.");}}}>Desbloquear</Button></td></tr>)}</Table>:<EmptyState icon="lock" title="No hay cuentas en pausa ni bloqueadas" description="Las pausas temporales también aparecerán aquí mientras estén activas."/>}</Card></>;
}
function Audit() { return <><PageTitle eyebrow="Seguridad" title="Registro de seguridad" description="La consulta de logs requiere almacenamiento aún pendiente."/><Card><EmptyState icon="history" title="Sin registro disponible" description="No se muestran eventos ficticios como datos del sistema."/></Card></>; }

function Whatsapp() {
  return <><PageTitle eyebrow="Atención al cliente" title="Contáctanos por WhatsApp" description="Estamos para ayudarte con tus envíos."/><Card className="whatsapp-card"><div className="wa-icon"><Icon name="whatsapp" size={40}/></div><div><div className="wa-title">¿Tienes una duda, reclamo o sugerencia?</div><div className="wa-copy">Nuestro equipo de atención puede orientarte sobre tus envíos y ayudarte a resolver cualquier inquietud.</div><div className="contact-hours"><strong>Horario de atención</strong><span>Lunes a viernes, de 8:00 a. m. a 5:00 p. m. (hora Colombia)</span><small>Atendemos en días hábiles. Los mensajes recibidos fuera de este horario serán respondidos el siguiente día hábil.</small></div><div className="security-note"><Icon name="whatsapp" size={15}/> Atención por WhatsApp durante el horario indicado.</div></div></Card></>;
}
export default function App() {
  const [session, setSession] = useState<{ user: ApiUser; token: string } | null>(() => { try { const saved = localStorage.getItem("tracking-session"); return saved ? JSON.parse(saved) : null; } catch { return null; } });
  const logout = () => { const raw = localStorage.getItem("tracking-session"); if (raw) { const saved = JSON.parse(raw) as { token: string }; void api("/auth/logout", saved.token, { method: "POST" }).catch(() => {}); } localStorage.removeItem("tracking-session"); setSession(null); };
  const acceptLogin = (user: ApiUser) => { const next = { user, token: user.token }; localStorage.setItem("tracking-session", JSON.stringify(next)); setSession(next); };
  const [lastActivity, setLastActivity] = useState(Date.now());
  useEffect(() => { setLastActivity(Date.now()); }, [session]);
  useEffect(() => { if (!session) return; const touch = () => setLastActivity(Date.now()); window.addEventListener("pointerdown", touch); window.addEventListener("keydown", touch); const timer = window.setInterval(() => { if (Date.now() - lastActivity >= 5 * 60_000) logout(); }, 5000); return () => { window.removeEventListener("pointerdown", touch); window.removeEventListener("keydown", touch); window.clearInterval(timer); }; }, [session, lastActivity]);
  return session ? <Shell role={roleFromApi(session.user.role)} user={session.user} token={session.token} onLogout={logout}/> : <Auth onLogin={acceptLogin}/>;
}
