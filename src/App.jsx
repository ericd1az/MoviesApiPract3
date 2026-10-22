import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Film,
  Globe2,
  Heart,
  Menu,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  X,
} from 'lucide-react'
import { fetchMovies, formatPrice, normalizeSearch } from './lib/movies.js'
import { validateRegistration } from './lib/validation.js'

const CART_KEY = 'lumiere-demo-cart-v1'
const PROFILE_KEY = 'lumiere-profile-v1'
const FEATURED_TITLES = ['Spirited Away', 'Howl\'s Moving Castle', 'My Neighbor Totoro']

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function ImageWithFallback({ src, alt, className = '', loading = 'lazy' }) {
  return (
    <img
      src={src || '/poster-fallback.svg'}
      alt={alt}
      className={className}
      loading={loading}
      onError={(event) => {
        event.currentTarget.onerror = null
        event.currentTarget.src = '/poster-fallback.svg'
      }}
    />
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function Header({ cartCount, onCartOpen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link to="/" className="brand" aria-label="Lumière, ir al inicio">
          <span className="brand-mark"><Film size={22} strokeWidth={2.2} /></span>
          <span className="brand-name">lumière<span className="brand-dot">.</span></span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          <NavLink end to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Inicio</NavLink>
          <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Catálogo</NavLink>
          <NavLink to="/registro" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Registro</NavLink>
        </nav>

        <div className="header-actions">
          <button className="cart-trigger" type="button" onClick={onCartOpen} aria-label={`Abrir cesta con ${cartCount} ${cartCount === 1 ? 'película' : 'películas'}`}>
            <ShoppingBag size={19} />
            <span className="cart-label">Mi cesta</span>
            <span className="cart-count">{cartCount}</span>
          </button>
          <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function SectionIntro({ eyebrow, title, subtitle, action }) {
  return (
    <div className="section-intro">
      <div>
        <span className="eyebrow"><span className="eyebrow-line" />{eyebrow}</span>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function MovieCard({ movie, onDetails, onAdd, inCart, index = 0 }) {
  return (
    <article className="movie-card" style={{ '--card-index': index }}>
      <button className="poster-button" type="button" onClick={() => onDetails(movie)} aria-label={`Ver detalles de ${movie.title}`}>
        <ImageWithFallback src={movie.poster} alt={`Póster de ${movie.title}`} className="movie-poster" />
        <span className="poster-overlay"><span><Play size={19} fill="currentColor" /> Ver detalles</span></span>
        <span className="poster-score"><Star size={13} fill="currentColor" /> {movie.score}%</span>
      </button>
      <div className="movie-card-body">
        <div className="movie-card-meta"><span>{movie.year}</span><span className="meta-dot" /><span>{movie.minutes} min</span></div>
        <h3>{movie.title}</h3>
        <p className="movie-director">Dir. {movie.director}</p>
        <div className="movie-card-footer">
          <div><small>Renta</small><strong>{formatPrice(movie.price)}</strong></div>
          <button className={`add-button ${inCart ? 'is-added' : ''}`} type="button" onClick={() => onAdd(movie)} aria-label={inCart ? `${movie.title} ya está en la cesta` : `Agregar ${movie.title} a la cesta`}>
            {inCart ? <Check size={19} /> : <ArrowUpRight size={20} />}
          </button>
        </div>
      </div>
    </article>
  )
}

function LoadingCards({ count = 4 }) {
  return <div className="movie-grid" aria-label="Cargando películas">{Array.from({ length: count }, (_, index) => <div className="movie-skeleton" key={index}><div /><span /><span /></div>)}</div>
}

function ApiError({ onRetry }) {
  return (
    <div className="api-error" role="status">
      <span className="api-error-icon"><Globe2 size={26} /></span>
      <div><h3>No pudimos cargar las películas</h3><p>Comprueba tu conexión e inténtalo de nuevo.</p></div>
      <button className="button button-ghost" type="button" onClick={onRetry}><RefreshCw size={17} /> Reintentar</button>
    </div>
  )
}

function HomePage({ movies, status, onRetry, onDetails, onAdd, cartIds }) {
  const featured = FEATURED_TITLES.map((title) => movies.find((movie) => movie.title === title)).filter(Boolean)
  const cards = featured.length ? featured : movies.slice(0, 3)
  const heroPosters = cards.length === 3 ? cards : [
    { title: 'Historias para recordar', poster: '/poster-fallback.svg' },
    { title: 'Magia en cada escena', poster: '/poster-fallback.svg' },
    { title: 'Tu próxima favorita', poster: '/poster-fallback.svg' },
  ]

  return (
    <>
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker"><Sparkles size={15} /> TU VIDEOCLUB, A TU MANERA</span>
            <h1>Tu próxima <em>película favorita</em> empieza aquí.</h1>
            <p>Un pequeño rincón para descubrir grandes historias. Explora una colección de cine animado, encuentra la indicada para hoy y agrégala a tu cesta.</p>
            <div className="hero-buttons">
              <Link className="button button-primary" to="/catalogo">Explorar películas <ArrowRight size={18} /></Link>
              <a className="button button-outline" href="#como-funciona"><Play size={16} fill="currentColor" /> Cómo funciona</a>
            </div>
            <div className="hero-trust"><div className="avatar-stack"><span>✦</span><span>★</span><span>✳</span></div><p><strong>Historias con encanto</strong><br />Encuentra tu próxima favorita</p></div>
          </div>
          <div className="hero-visual" aria-label="Selección de películas">
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            {heroPosters.map((movie, index) => <div className={`hero-poster hero-poster-${index + 1}`} key={`${movie.title}-${index}`}><ImageWithFallback src={movie.poster} alt={`Póster de ${movie.title}`} loading="eager" /></div>)}
            <div className="floating-ticket"><span className="ticket-icon"><Ticket size={20} /></span><span><strong>22 historias</strong><small>para viajar sin salir de casa</small></span></div>
            <div className="floating-star"><Star size={15} fill="currentColor" /> CINE PARA SENTIR</div>
          </div>
        </div>
      </section>

      <section className="quick-facts shell" aria-label="Sobre la tienda">
        <div><Film size={22} /><span><strong>{movies.length || '22'} películas</strong><small>de Studio Ghibli</small></span></div>
        <div><Sparkles size={22} /><span><strong>Una historia para ti</strong><small>aventuras para cada ocasión</small></span></div>
        <div><Heart size={22} /><span><strong>Tu selección</strong><small>guarda tus favoritas</small></span></div>
      </section>

      <section className="featured-section shell" id="destacadas">
        <SectionIntro eyebrow="SELECCIÓN DE LA CASA" title={<>Historias para <span className="gradient-text">volver a ver</span></>} subtitle="Un mundo diferente te espera detrás de cada portada." action={<Link className="text-link" to="/catalogo">Ver todo el catálogo <ArrowRight size={18} /></Link>} />
        {status === 'loading' && <LoadingCards count={3} />}
        {status === 'error' && <ApiError onRetry={onRetry} />}
        {status === 'success' && <div className="movie-grid featured-grid">{cards.map((movie, index) => <MovieCard movie={movie} key={movie.id} index={index} onDetails={onDetails} onAdd={onAdd} inCart={cartIds.includes(movie.id)} />)}</div>}
      </section>

      <section className="how-section" id="como-funciona">
        <div className="shell how-inner">
          <SectionIntro eyebrow="ASÍ DE FÁCIL" title={<>Una noche de cine, <span className="gradient-text">a tu ritmo</span></>} subtitle="Elige tus favoritas y prepara una noche de cine a tu medida." />
          <div className="steps-grid">
            <div className="step-card"><span className="step-number">01</span><span className="step-icon icon-peach"><Search size={25} /></span><h3>Explora</h3><p>Busca por título o director y descubre los detalles de cada película.</p></div>
            <div className="step-card"><span className="step-number">02</span><span className="step-icon icon-lilac"><Heart size={25} /></span><h3>Elige</h3><p>Conoce cada historia y encuentra la indicada para ti.</p></div>
            <div className="step-card"><span className="step-number">03</span><span className="step-icon icon-mint"><ShoppingBag size={25} /></span><h3>Guarda</h3><p>Reúne tus favoritas en la cesta para tenerlas siempre a mano.</p></div>
          </div>
        </div>
      </section>

      <section className="bottom-cta shell"><div className="cta-shine" /><div><span className="eyebrow">TU SIGUIENTE MARATÓN</span><h2>Hay una historia esperando por ti.</h2><p>Entra al catálogo y encuentra tu próxima gran aventura.</p></div><Link className="button button-light" to="/catalogo">Ver películas <ArrowRight size={18} /></Link></section>
    </>
  )
}

function CatalogPage({ movies, status, onRetry, onDetails, onAdd, cartIds }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [sort, setSort] = useState('destacadas')

  const visibleMovies = useMemo(() => {
    const search = normalizeSearch(query.trim())
    const filtered = movies.filter((movie) => {
      const matchesSearch = !search || normalizeSearch(`${movie.title} ${movie.director} ${movie.year}`).includes(search)
      const matchesFilter = filter === 'Todas' || (filter === 'Miyazaki' && movie.director.includes('Miyazaki')) || (filter === 'Takahata' && movie.director.includes('Takahata')) || (filter === 'Otras' && !movie.director.includes('Miyazaki') && !movie.director.includes('Takahata'))
      return matchesSearch && matchesFilter
    })

    if (sort === 'recientes') filtered.sort((a, b) => b.year - a.year)
    if (sort === 'clasicos') filtered.sort((a, b) => a.year - b.year)
    if (sort === 'titulo') filtered.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'destacadas') filtered.sort((a, b) => b.score - a.score)
    return filtered
  }, [movies, query, filter, sort])

  return (
    <main className="page-main">
      <section className="page-banner catalog-banner"><div className="shell"><span className="eyebrow"><span className="eyebrow-line" />NUESTRO CATÁLOGO</span><h1>Películas para <em>cada momento.</em></h1><p>De grandes aventuras a pequeños instantes mágicos. Encuentra tu próxima historia favorita.</p></div></section>
      <section className="shell catalog-section">
        <div className="catalog-toolbar">
          <label className="search-box"><Search size={20} aria-hidden="true" /><span className="sr-only">Buscar películas</span><input type="search" placeholder="Busca una película o director..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="sort-box"><span>Ordenar por</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar películas"><option value="destacadas">Mejor puntuación</option><option value="recientes">Más recientes</option><option value="clasicos">Más antiguas</option><option value="titulo">Título A–Z</option></select></label>
        </div>
        <div className="filter-row" role="group" aria-label="Filtrar por director">{['Todas', 'Miyazaki', 'Takahata', 'Otras'].map((item) => <button key={item} type="button" className={`filter-chip ${filter === item ? 'selected' : ''}`} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}</div>
        <div className="results-line"><span>{status === 'success' ? `${visibleMovies.length} película${visibleMovies.length === 1 ? '' : 's'} para explorar` : 'Explorando el catálogo...'}</span><span className="api-indicator"><span /> Colección Studio Ghibli</span></div>
        {status === 'loading' && <LoadingCards count={8} />}
        {status === 'error' && <ApiError onRetry={onRetry} />}
        {status === 'success' && visibleMovies.length === 0 && <div className="empty-results"><Search size={32} /><h2>No encontramos esa película</h2><p>Prueba con otro título, director o filtro.</p><button className="button button-ghost" type="button" onClick={() => { setQuery(''); setFilter('Todas') }}>Limpiar búsqueda</button></div>}
        {status === 'success' && visibleMovies.length > 0 && <div className="movie-grid catalog-grid">{visibleMovies.map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} onDetails={onDetails} onAdd={onAdd} inCart={cartIds.includes(movie.id)} />)}</div>}
      </section>
    </main>
  )
}

function FormField({ label, id, type = 'text', value, onChange, onBlur, error, touched, placeholder, autoComplete, endAction }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap ${touched && error ? 'has-error' : ''}`}><input id={id} name={id} type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(touched && error)} aria-describedby={touched && error ? `${id}-error` : undefined} required />{endAction}</div>
      {touched && error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  )
}

function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', terms: false })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [successName, setSuccessName] = useState(() => {
    try { return localStorage.getItem(PROFILE_KEY) || '' } catch { return '' }
  })
  const [showPassword, setShowPassword] = useState(false)
  const errors = validateRegistration(values)
  const visible = (field) => touched[field] || submitted

  function change(event) {
    const { name, value, type, checked } = event.target
    setValues((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length === 0) {
      const name = values.name.trim()
      try { localStorage.setItem(PROFILE_KEY, name) } catch { /* El perfil permanece en esta sesión. */ }
      setSuccessName(name)
      setValues((previous) => ({ ...previous, password: '', confirmPassword: '' }))
    }
  }

  function resetProfile() {
    try { localStorage.removeItem(PROFILE_KEY) } catch { /* Sin almacenamiento disponible. */ }
    setSuccessName('')
    setSubmitted(false)
    setTouched({})
    setValues({ name: '', email: '', password: '', confirmPassword: '', terms: false })
  }

  return (
    <main className="page-main registration-page">
      <div className="shell registration-grid">
        <div className="registration-story"><span className="eyebrow"><span className="eyebrow-line" />UN LUGAR PARA SOÑAR</span><h1>Las mejores historias se disfrutan <em>juntos.</em></h1><p>Haz espacio para tus favoritas. Descubre películas que te emocionen y arma tu próxima noche de cine.</p><div className="registration-benefits"><div><span><Check size={17} /></span> Descubre una colección llena de magia</div><div><span><Check size={17} /></span> Organiza tus favoritas en la cesta</div><div><span><Check size={17} /></span> Encuentra nuevas historias para cada momento</div></div><div className="registration-decoration"><span>“</span>Una película puede llevarte a cualquier lugar.<small>— Tu próxima noche de cine</small></div></div>
        <section className="registration-card" aria-labelledby="register-title">
          {successName ? <div className="register-success" role="status"><div className="success-icon"><Check size={34} /></div><span className="eyebrow">TU ESPACIO LUMIÈRE</span><h2 id="register-title">¡Bienvenido, {successName}!</h2><p>Tu perfil está listo en este dispositivo. Ya puedes explorar la colección y elegir tus favoritas.</p><Link to="/catalogo" className="button button-primary">Explorar películas <ArrowRight size={18} /></Link><button className="reset-link" type="button" onClick={resetProfile}>Cambiar de perfil</button></div> : <><div className="registration-card-header"><span className="form-icon"><Ticket size={24} /></span><span className="eyebrow">CREA TU ESPACIO</span><h2 id="register-title">Comienza por aquí.</h2><p>Completa tus datos para crear tu perfil.</p></div><form onSubmit={submit} noValidate>
              <FormField id="name" label="Nombre completo" value={values.name} onChange={change} onBlur={() => setTouched((previous) => ({ ...previous, name: true }))} error={errors.name} touched={visible('name')} placeholder="Por ejemplo, Ana López" autoComplete="name" />
              <FormField id="email" label="Correo electrónico" type="email" value={values.email} onChange={change} onBlur={() => setTouched((previous) => ({ ...previous, email: true }))} error={errors.email} touched={visible('email')} placeholder="tu@correo.com" autoComplete="email" />
              <FormField id="password" label="Contraseña" type={showPassword ? 'text' : 'password'} value={values.password} onChange={change} onBlur={() => setTouched((previous) => ({ ...previous, password: true }))} error={errors.password} touched={visible('password')} placeholder="Mínimo 8 caracteres" autoComplete="new-password" endAction={<button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
              <FormField id="confirmPassword" label="Confirmar contraseña" type={showPassword ? 'text' : 'password'} value={values.confirmPassword} onChange={change} onBlur={() => setTouched((previous) => ({ ...previous, confirmPassword: true }))} error={errors.confirmPassword} touched={visible('confirmPassword')} placeholder="Repite tu contraseña" autoComplete="new-password" />
              <div className="terms-group"><label className="checkbox-line"><input type="checkbox" name="terms" checked={values.terms} onChange={change} onBlur={() => setTouched((previous) => ({ ...previous, terms: true }))} aria-invalid={Boolean(visible('terms') && errors.terms)} aria-describedby={visible('terms') && errors.terms ? 'terms-error' : undefined} /><span>Acepto guardar mi nombre en este dispositivo para personalizar mi experiencia.</span></label>{visible('terms') && errors.terms && <p className="field-error" id="terms-error">{errors.terms}</p>}</div>
              <button className="button button-primary submit-button" type="submit">Crear mi perfil <ArrowRight size={18} /></button><p className="form-note"><ShieldCheck size={16} /> Tu contraseña no se guarda.</p>
            </form></>}
        </section>
      </div>
    </main>
  )
}

function MovieModal({ movie, onClose, onAdd, inCart }) {
  useEffect(() => {
    if (!movie) return undefined
    function onKeyDown(event) { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('dialog-open')
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.classList.remove('dialog-open') }
  }, [movie, onClose])

  if (!movie) return null

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="movie-modal" role="dialog" aria-modal="true" aria-labelledby="movie-dialog-title"><button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar detalles"><X size={21} /></button><div className="modal-art"><ImageWithFallback src={movie.poster} alt={`Póster de ${movie.title}`} loading="eager" /></div><div className="modal-content"><span className="eyebrow">UNA PELÍCULA PARA DESCUBRIR</span><h2 id="movie-dialog-title">{movie.title}</h2>{movie.originalTitle && <p className="original-title">{movie.originalTitle}</p>}<div className="modal-facts"><span><Star size={16} fill="currentColor" /> {movie.score}%</span><span>{movie.year}</span><span><Clock3 size={16} /> {movie.minutes} min</span></div><p className="modal-description">{movie.description}</p><p className="modal-director"><strong>Dirección</strong><span>{movie.director}</span></p><div className="modal-buy"><div><small>Renta</small><strong>{formatPrice(movie.price)}</strong></div><button className="button button-primary" type="button" onClick={() => onAdd(movie)}>{inCart ? <><Check size={18} /> En tu cesta</> : <><ShoppingBag size={18} /> Agregar a cesta</>}</button></div></div></section></div>
}

function CartDrawer({ open, onClose, items, cartCount, onRemove }) {
  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('dialog-open')
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.classList.remove('dialog-open') }
  }, [open, onClose])

  if (!open) return null

  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="drawer-heading"><div><span className="eyebrow">TU SELECCIÓN</span><h2 id="cart-title">Mi cesta <span>({cartCount})</span></h2></div><button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar cesta"><X size={21} /></button></div><div className="drawer-content">{items.length ? items.map((movie) => <div className="cart-item" key={movie.id}><ImageWithFallback src={movie.poster} alt="" /><div><h3>{movie.title}</h3><p>Renta</p><strong>{formatPrice(movie.price)}</strong></div><button type="button" className="remove-button" onClick={() => onRemove(movie.id)} aria-label={`Quitar ${movie.title} de la cesta`}><Trash2 size={18} /></button></div>) : <div className="cart-empty"><span><ShoppingBag size={30} /></span><h3>Tu cesta está vacía</h3><p>Explora el catálogo y guarda una película para tu próxima noche de cine.</p><Link to="/catalogo" onClick={onClose} className="button button-primary">Ver catálogo <ArrowRight size={17} /></Link></div>}</div>{items.length > 0 && <div className="drawer-bottom"><div className="cart-total"><span>Total estimado</span><strong>{formatPrice(items.reduce((sum, movie) => sum + movie.price, 0))}</strong></div><p>Rentas en línea próximamente</p></div>}</aside></div>
}

function Footer() {
  return <footer className="site-footer"><div className="shell footer-top"><div><Link to="/" className="brand"><span className="brand-mark"><Film size={20} /></span><span className="brand-name">lumière<span className="brand-dot">.</span></span></Link><p>Un pequeño espacio para grandes historias. Encuentra tu próxima película favorita.</p></div><div><h3>Explora</h3><Link to="/">Inicio</Link><Link to="/catalogo">Películas</Link><Link to="/registro">Registro</Link></div><div><h3>Para tu noche de cine</h3><span>Historias inolvidables</span><span>Una colección para todos los gustos</span><span>Tu próxima favorita te espera</span></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} Lumière</span><span>Hecho para descubrir historias <Heart size={14} fill="currentColor" /></span></div></footer>
}

function NotFoundPage() {
  return <main className="not-found shell"><Film size={48} /><h1>Esta escena no existe.</h1><p>La página que buscas se perdió entre los créditos.</p><Link to="/" className="button button-primary">Volver al inicio <ArrowRight size={18} /></Link></main>
}

export default function App() {
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [cartIds, setCartIds] = useState(readCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    setStatus('loading')
    fetchMovies(controller.signal).then((films) => { if (active) { setMovies(films); setStatus('success') } }).catch(() => { if (active) setStatus('error') }).finally(() => window.clearTimeout(timeout))
    return () => { active = false; window.clearTimeout(timeout); controller.abort() }
  }, [reloadKey])

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cartIds)) }, [cartIds])
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 3300); return () => window.clearTimeout(timer) }, [toast])

  function addToCart(movie) {
    if (cartIds.includes(movie.id)) { setToast(`${movie.title} ya está en tu cesta`); return }
    setCartIds((previous) => [...previous, movie.id])
    setToast(`${movie.title} se agregó a tu cesta`)
  }

  const cartItems = movies.filter((movie) => cartIds.includes(movie.id))

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header cartCount={cartIds.length} onCartOpen={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage movies={movies} status={status} onRetry={() => setReloadKey((key) => key + 1)} onDetails={setSelectedMovie} onAdd={addToCart} cartIds={cartIds} />} />
        <Route path="/catalogo" element={<CatalogPage movies={movies} status={status} onRetry={() => setReloadKey((key) => key + 1)} onDetails={setSelectedMovie} onAdd={addToCart} cartIds={cartIds} />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onAdd={addToCart} inCart={Boolean(selectedMovie && cartIds.includes(selectedMovie.id))} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} cartCount={cartIds.length} onRemove={(id) => setCartIds((previous) => previous.filter((item) => item !== id))} />
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </div>
  )
}
