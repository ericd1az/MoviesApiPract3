export const MOVIE_API_URL =
  import.meta.env?.VITE_GHIBLI_API_URL || 'https://ghibliapi.vercel.app/films'

export const DISPLAY_PRICE = 49

export function normalizeFilm(film) {
  if (!film || typeof film.id !== 'string' || typeof film.title !== 'string') {
    return null
  }

  return {
    id: film.id,
    title: film.title,
    originalTitle: film.original_title || '',
    description: film.description || 'Una historia para descubrir.',
    director: film.director || 'No disponible',
    year: Number(film.release_date) || 0,
    minutes: Number(film.running_time) || 0,
    score: Number(film.rt_score) || 0,
    poster: film.image?.startsWith('https://') ? film.image : '/poster-fallback.svg',
    banner: film.movie_banner?.startsWith('https://') ? film.movie_banner : '',
    price: DISPLAY_PRICE,
  }
}

export async function fetchMovies(signal) {
  const response = await fetch(MOVIE_API_URL, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`La API respondió con el estado ${response.status}.`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('La API devolvió un formato inesperado.')
  }

  return data.map(normalizeFilm).filter(Boolean)
}

export function formatPrice(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

export function normalizeSearch(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
}
