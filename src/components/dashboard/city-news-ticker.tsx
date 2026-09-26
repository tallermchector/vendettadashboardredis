'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Newspaper,
    Radio,
    Flame,
    ShieldAlert,
    TrendingUp,
    Clock,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    RefreshCw,
    AlertTriangle,
    Crosshair,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type NewsCategory = 'TODAS' | 'BAJO_MUNDO' | 'POLICIAL' | 'MERCADO_NEGRO' | 'RUMORES';

export interface NewsItem {
    id: string;
    headline: string;
    summary: string;
    fullReport: string;
    category: NewsCategory;
    source: string;
    district: string;
    coordinates?: string;
    impactLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'INFORMATIVO';
    gameWorldImpact: string;
    minutesAgo: number;
    isBreaking?: boolean;
}

const INITIAL_NEWS_ITEMS: NewsItem[] = [
    {
        id: 'news-1',
        headline: 'Tiroteo en los muelles de Little Italy sacude la madrugada',
        summary: 'Un intercambio de disparos con armas automáticas en el almacén 14 deja dos camiones blindados calcinados y la policía desconcertada.',
        fullReport: 'Cerca de las 03:30 AM, vecinos del sector portuario reportaron ráfagas de subfusil Thompson procedentes de las inmediaciones del muelle 4. Según fuentes no oficiales, una disputa por un cargamento de munición pesada entre cuadrillas locales culminó con la intervención de coches blindados sin matrícula. La policía acordonó el área encontrando casquillos de grueso calibre y rastros de cargamentos transportados apresuradamente en lanchas rápidas hacia aguas abiertas.',
        category: 'BAJO_MUNDO',
        source: 'La Gazzetta di Vendetta',
        district: 'Distrito Portuario',
        coordinates: '1:4:12',
        impactLevel: 'CRITICO',
        gameWorldImpact: 'Tensión armada en aumento en muelles (+10% alerta)',
        minutesAgo: 4,
        isBreaking: true,
    },
    {
        id: 'news-2',
        headline: 'Redada sorpresa de la Policía Metropolitana en casinos clandestinos',
        summary: 'El comisario Moretti ordena clausurar tres salones de juego no autorizados en el corazón financiero. No hubo detenidos de alto rango.',
        fullReport: 'En un operativo simultáneo ejecutado por más de 40 agentes con apoyo de la brigada de asalto, se intervinieron tres locales que operaban bajo la fachada de clubes de billar y sastrerías de lujo. A pesar del despliegue, la caja fuerte principal fue vaciada minutos antes de la llegada policial, lo que refuerza las sospechas de soplos internos en el departamento de justicia.',
        category: 'POLICIAL',
        source: 'Radio Policía 104.2 FM',
        district: 'Centro Financiero',
        coordinates: '1:1:5',
        impactLevel: 'ALTO',
        gameWorldImpact: 'Vigilancia bancaria incrementada (+15% patrullaje)',
        minutesAgo: 18,
        isBreaking: true,
    },
    {
        id: 'news-3',
        headline: 'Escasez de armamento de precisión dispara los precios en el mercado negro',
        summary: 'Los intermediarios clandestinos informan de interrupciones en los convoyes transfronterizos, encareciendo los rifles y subfusiles.',
        fullReport: 'El cierre temporal de las rutas ferroviarias del este debido a inspecciones extraordinarias ha colapsado el flujo habitual de cajones de armamento. Proveedores de los callejones advierten que el coste por kilo de pólvora y piezas mecanizadas podría mantenerse elevado durante las próximas semanas hasta que se habiliten pasos alternativos.',
        category: 'MERCADO_NEGRO',
        source: 'El Heraldo Clandestino',
        district: 'Zona Industrial Este',
        coordinates: '2:3:8',
        impactLevel: 'MEDIO',
        gameWorldImpact: 'Precios de armas en mercado negro volátiles',
        minutesAgo: 32,
    },
    {
        id: 'news-4',
        headline: 'Cónclave secreto de caporegimes en una hacienda a las afueras',
        summary: 'Testigos observaron caravanas de limusinas negras convergiendo en las colinas. Rumores de un nuevo pacto de no agresión territorial.',
        fullReport: 'Diversos patriarcas de las familias más influyentes habrían mantenido una reunión a puerta cerrada durante más de cuatro horas. Aunque los detalles del cónclave permanecen bajo estricto voto de silencio, informantes afirman que se discutió la repartición de los contratos portuarios y la neutralidad de los barrios residenciales.',
        category: 'RUMORES',
        source: 'El Correo de la Sombra',
        district: 'Colinas del Norte',
        coordinates: '3:2:1',
        impactLevel: 'ALTO',
        gameWorldImpact: 'Pactos entre familias en estado de negociación',
        minutesAgo: 45,
    },
    {
        id: 'news-5',
        headline: 'Fuga masiva frustrada en la prisión de máxima seguridad de Sing-Rock',
        summary: 'La detonación de un explosivo plástico en el muro oeste desata la alarma general. Varios líderes de bandas intentaban coordinar la evasión.',
        fullReport: 'A medianoche, un artefacto de baja potencia detonó contra la pared exterior del pabellón B. Los guardias de las torres repelieron de inmediato a los cómplices que esperaban en furgones blindados. Las autoridades han decretado confinamiento absoluto de todos los reclusos hasta nuevo aviso.',
        category: 'POLICIAL',
        source: 'Crónica Judicial Urbana',
        district: 'Isla de la Penitenciaría',
        coordinates: '1:9:9',
        impactLevel: 'MEDIO',
        gameWorldImpact: 'Refuerzos en prisiones y traslados de custodias',
        minutesAgo: 62,
    },
    {
        id: 'news-6',
        headline: 'Huelga del sindicato de estibadores paraliza la carga de mercancías',
        summary: 'Los obreros del puerto bloquean las grúas exigiendo primas de riesgo tras los continuos asaltos nocturnos a los depósitos aduaneros.',
        fullReport: 'Más de quinientos trabajadores han secundado el paro laboral en las terminales marítimas. Los representantes sindicales reclaman mayor seguridad privada y garantías salariales. Mientras tanto, decenas de buques de carga aguardan fondeados en la bahía a la espera de poder atracar.',
        category: 'MERCADO_NEGRO',
        source: 'Boletín Obrero & Portuario',
        district: 'Muelles del Sur',
        coordinates: '1:5:2',
        impactLevel: 'MEDIO',
        gameWorldImpact: 'Retrasos en suministros marítimos (-5% velocidad)',
        minutesAgo: 85,
    },
    {
        id: 'news-7',
        headline: 'Apertura clandestina del cabaret "El Faraón": Oro y ruleta tras bambalinas',
        summary: 'El club nocturno de moda atrae a magnates y gánsteres por igual, sirviendo champán francés y partidas de póker con apuestas millonarias.',
        fullReport: 'Bajo el manto de un club de jazz exclusivo con orquesta en vivo, "El Faraón" esconde en sus sótanos una de las mesas de ruleta más suntuosas de la ciudad. Agentes de incógnito admiten la dificultad de intervenir el recinto dada la concurrencia de senadores y altos funcionarios entre sus clientes habituales.',
        category: 'BAJO_MUNDO',
        source: 'La Noche y el Neón',
        district: 'Distrito de Entretenimiento',
        coordinates: '2:1:14',
        impactLevel: 'INFORMATIVO',
        gameWorldImpact: 'Flujo de dinero circulante en locales nocturnos',
        minutesAgo: 110,
    },
    {
        id: 'news-8',
        headline: 'Falsificadores introducen billetes de alta denominación en la zona comercial',
        summary: 'Comerciantes del centro alertan sobre papel moneda falsificado con sellos bancarios casi idénticos a los oficiales.',
        fullReport: 'Los peritos de la reserva monetaria han emitido una circular advirtiendo a las entidades de crédito sobre la circulación de series apócrifas de cien dólares. Se sospecha de una imprenta industrial oculta en algún sótano de los suburbios industriales.',
        category: 'MERCADO_NEGRO',
        source: 'El Heraldo Financiero',
        district: 'Bulevar Central',
        coordinates: '1:2:7',
        impactLevel: 'ALTO',
        gameWorldImpact: 'Inspecciones estrictas en transacciones de dinero',
        minutesAgo: 135,
    },
];

/**
 * Color de seccion. No es decorativo: hereda el mismo vocabulario semantico
 * que las colas de arriba, para que un icono carmin signifique "hostil" en
 * toda la pagina y no solo en un modulo. El morado del original no existe en
 * el sistema, asi que RUMORES baja a madera: es el unico rumor que no llega
 * confirmado por ningun cable oficial.
 */
const CATEGORY_LABELS: Record<NewsCategory, { label: string; chip: string; icon: React.ReactNode }> = {
    TODAS:         { label: 'Todas',          chip: 'border-wood bg-ink-1 text-parch-300',            icon: <Newspaper className="h-3 w-3" /> },
    BAJO_MUNDO:    { label: 'Bajo Mundo',      chip: 'border-crimson/50 bg-crimson/15 text-crimson-light', icon: <Flame className="h-3 w-3" /> },
    POLICIAL:      { label: 'Ley y Orden',    chip: 'border-blue-700/70 bg-blue-950/50 text-blue-300', icon: <ShieldAlert className="h-3 w-3" /> },
    MERCADO_NEGRO: { label: 'Mercado Negro',  chip: 'border-gold/50 bg-gold/10 text-gold-light',     icon: <TrendingUp className="h-3 w-3" /> },
    RUMORES:       { label: 'Rumores',         chip: 'border-umber/40 bg-ink-1 text-parch-400',         icon: <Radio className="h-3 w-3" /> },
};

/** Pastilla de seccion. Un unico lugar, para que chip y leyenda no divergan. */
function CategoryChip({ category, className }: { category: NewsCategory, className?: string }) {
    const config = CATEGORY_LABELS[category];
    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.1em]',
            config.chip, className
        )}>
            {config.icon}
            {config.label}
        </span>
    )
}

export function CityNewsCard() {
    const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
    const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('TODAS');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter items according to selected category
    const filteredNews = useMemo(() => {
        if (selectedCategory === 'TODAS') return news;
        return news.filter(item => item.category === selectedCategory);
    }, [news, selectedCategory]);

    // Ensure valid index when category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedCategory]);

    const activeItem = filteredNews[currentIndex] || filteredNews[0] || news[0];

    const handleNext = useCallback(() => {
        if (filteredNews.length === 0) return;
        setCurrentIndex(prev => (prev + 1) % filteredNews.length);
    }, [filteredNews.length]);

    const handlePrev = useCallback(() => {
        if (filteredNews.length === 0) return;
        setCurrentIndex(prev => (prev - 1 + filteredNews.length) % filteredNews.length);
    }, [filteredNews.length]);

    // Auto-advance ticker timer (every 7 seconds)
    useEffect(() => {
        if (!isAutoPlay || filteredNews.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 7000);

        return () => clearInterval(interval);
    }, [isAutoPlay, filteredNews.length, handleNext]);

    // Handle wire refresh / new dispatch
    const handleRefreshWire = () => {
        setIsRefreshing(true);
        // Shuffle or add small time variance for dynamic feel
        setTimeout(() => {
            setNews(prev => {
                const updated = [...prev];
                // Rotate items slightly
                const first = updated.shift();
                if (first) updated.push(first);
                return updated;
            });
            setIsRefreshing(false);
            setCurrentIndex(0);
        }, 600);
    };

    /**
     * Relevancia. Cuatro niveles y solo el mas alto se mueve: un latido en los
     * cuatro badges seria ruido. `CRITICO` late; `ALTO` es oro macizo; el resto
     * baja a madera, porque "moderado" e "informativo" no son estados, son la
     * ausencia de estado.
     */
    const getImpactBadge = (level: NewsItem['impactLevel']) => {
        switch (level) {
            case 'CRITICO':
                return <span className="inline-flex items-center gap-1 rounded border border-crimson bg-crimson/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] text-crimson-light"><span className="h-1.5 w-1.5 rounded-full bg-crimson-light" aria-hidden="true" />Critico</span>;
            case 'ALTO':
                return <span className="inline-flex items-center gap-1 rounded border border-gold/60 bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] text-gold-light">Alta relevancia</span>;
            case 'MEDIO':
                return <span className="inline-flex items-center rounded border border-wood px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] text-parch-400">Moderado</span>;
            default:
                return <span className="inline-flex items-center rounded border border-wood/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.1em] text-parch-400/70">Informativo</span>;
        }
    };

    return (
        <div className="dossier anim-view overflow-hidden" id="city-news-card">
            {/* Cabecera del teletipo. Sin <Card>/<CardHeader>: el modulo ya es
                un dossier y las primitivas de shadcn anaden un segundo bisel y
                una segunda sombra. */}
            <div className="ribbon ribbon-crimson-gold" />

            <div className="flex flex-col gap-3 border-b border-wood p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    {/* Sello de la gazeta: madera hundida con filete, no un
                        cuadrado rojo. */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border-2 border-wood bg-ink-1 text-crimson-light">
                        <Newspaper className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="flex flex-wrap items-center gap-2 font-heading text-lg leading-none text-parch-50">
                            La Gazzetta di Vendetta
                            <span className="inline-flex items-center gap-1.5 rounded border border-crimson/60 bg-crimson/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[.14em] text-crimson-light">
                                <span className="h-1.5 w-1.5 rounded-full bg-crimson-light" aria-hidden="true" />
                                Teletipo en vivo
                            </span>
                        </h3>
                        <p className="mt-1 text-[11px] text-parch-400">
                            Crónica urbana, movimientos policiales y rumores del bajo mundo
                        </p>
                    </div>
                </div>

                {/* Mandos del teletipo */}
                <div className="flex shrink-0 items-center gap-1.5">
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 border-wood text-parch-300 hover:border-gold hover:bg-gold/10 hover:text-gold-light"
                                    onClick={handleRefreshWire}
                                    disabled={isRefreshing}
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
                                    <span className="sr-only">Sintonizar nueva frecuencia de teletipo</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Sintonizar nueva frecuencia de teletipo</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 border-wood text-parch-300 hover:border-gold hover:bg-gold/10 hover:text-gold-light"
                                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                                >
                                    {isAutoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-gold" />}
                                    <span className="sr-only">{isAutoPlay ? 'Pausar avance automático' : 'Reanudar avance automático'}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{isAutoPlay ? 'Pausar avance automático' : 'Reanudar avance automático'}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* El contador va en mono tabular: es un dial, no un texto. */}
                    <div className="flex items-center rounded border border-wood bg-ink-1/60 p-0.5">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={filteredNews.length <= 1}
                            className="flex h-6 w-6 items-center justify-center rounded text-parch-300 transition-colors hover:bg-gold/15 hover:text-gold-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-30"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span className="sr-only">Noticia anterior</span>
                        </button>
                        <span className="px-1.5 font-mono text-[11px] tabular-nums text-parch-300">
                            {filteredNews.length > 0 ? `${currentIndex + 1}/${filteredNews.length}` : '0/0'}
                        </span>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={filteredNews.length <= 1}
                            className="flex h-6 w-6 items-center justify-center rounded text-parch-300 transition-colors hover:bg-gold/15 hover:text-gold-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-30"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="sr-only">Noticia siguiente</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros de seccion. Un unico control segmentado, no cinco
                pastillas: son cinco modos de ver la misma lista, no cinco
                categories de contenido. */}
            <div className="no-sb flex items-center gap-1 overflow-x-auto border-b border-wood px-3 py-2" role="tablist" aria-label="Secciones del teletipo">
                {(['TODAS', 'BAJO_MUNDO', 'POLICIAL', 'MERCADO_NEGRO', 'RUMORES'] as NewsCategory[]).map(cat => {
                    const isSelected = selectedCategory === cat;
                    const config = CATEGORY_LABELS[cat];
                    return (
                        <button
                            key={cat}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.1em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
                                isSelected ? config.chip : 'border-transparent text-parch-400 hover:bg-ink-1 hover:text-parch-200'
                            )}
                        >
                            {config.icon}
                            {config.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Despacho activo ────────────────────────────────────────────
                Ventana hundida del teletipo, no papel. La firma de pergamino
                esta reservada a las cuatro colas: una hoja que se reimprime
                sola cada siete segundos contradice el mecanismo, y dos
                superficies en papel en la misma vista compiten por el mismo
                peso visual. */}
            <div className="space-y-3 p-4">
                {activeItem ? (
                    <article
                        className="group relative cursor-pointer rounded border border-wood bg-ink-1/70 p-3.5 transition-colors hover:border-gold/50"
                        onClick={() => setSelectedNewsDetail(activeItem)}
                    >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {activeItem.isBreaking && (
                                    <span className="inline-flex items-center gap-1 rounded border border-crimson bg-crimson px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-parch-50">
                                        <Zap className="h-3 w-3 fill-current" />
                                        Última hora
                                    </span>
                                )}
                                <CategoryChip category={activeItem.category} />
                                {getImpactBadge(activeItem.impactLevel)}
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] text-parch-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-parch-400/60" aria-hidden="true" />
                                    {activeItem.minutesAgo} min
                                </span>
                                {activeItem.coordinates && (
                                    <span className="flex items-center gap-1 rounded border border-wood bg-ink-2 px-1.5 py-0.5 text-parch-300">
                                        <Crosshair className="h-3 w-3 text-gold/70" aria-hidden="true" />
                                        [{activeItem.coordinates}]
                                    </span>
                                )}
                            </div>
                        </div>

                        <h4 className="text-[15px] font-semibold leading-snug text-parch-50 transition-colors group-hover:text-gold-light">
                            {activeItem.headline}
                        </h4>

                        <p className="mt-1.5 text-xs leading-relaxed text-parch-300/90">
                            {activeItem.summary}
                        </p>

                        <div className="mt-2.5 flex flex-col gap-2 border-t border-wood/60 pt-2.5 text-[11px] sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2 text-parch-400">
                                <span className="truncate font-semibold text-parch-200">{activeItem.source}</span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{activeItem.district}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 sm:justify-end">
                                <span className="inline-flex items-center gap-1.5 rounded border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[11px] text-gold-light">
                                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                                    {activeItem.gameWorldImpact}
                                </span>
                                <span className="flex items-center gap-0.5 font-medium text-gold transition-transform group-hover:translate-x-0.5">
                                    Leer informe
                                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                                </span>
                            </div>
                        </div>

                        {/* Dial de avance. La duracion real de la animacion la
                            fija el mismo 7000ms del temporizador de arriba, en
                            un custom property: antes eran dos constantes
                            (7000 en setInterval, 7s en el style inline) que
                            solo se mantendian en sincronia por costumbre. */}
                        {isAutoPlay && filteredNews.length > 1 && (
                            <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-lg bg-wood/60">
                                <div
                                    key={`${activeItem.id}-${currentIndex}`}
                                    className="h-full bg-gradient-to-r from-crimson to-gold animate-progress"
                                    style={{ '--progress-duration': '7000ms' } as React.CSSProperties}
                                />
                            </div>
                        )}
                    </article>
                ) : (
                    <p className="py-8 text-center text-sm text-parch-400">
                        No hay despachos en esta seccion.
                    </p>
                )}

                {/* Otros cables: titulares de reserva, en cascada. */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {filteredNews
                        .filter(item => item.id !== activeItem?.id)
                        .slice(0, 3)
                        .map(item => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => setSelectedNewsDetail(item)}
                                className="group flex flex-col justify-between rounded border border-wood/60 bg-ink-2/50 p-2.5 text-left transition-colors hover:border-gold/50 hover:bg-ink-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                            >
                                <div>
                                    <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[10px] text-parch-400">
                                        <span className="truncate font-sans text-[10px] font-bold uppercase tracking-[.1em] text-parch-300">{item.source}</span>
                                        <span className="shrink-0">{item.minutesAgo}m</span>
                                    </div>
                                    <p className="line-clamp-2 text-xs font-medium leading-snug text-parch-200 transition-colors group-hover:text-gold-light">
                                        {item.headline}
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-1 border-t border-wood/50 pt-1.5 text-[10px] text-parch-400">
                                    <span className="truncate">{item.district}</span>
                                    <ChevronRight className="h-2.5 w-2.5 shrink-0 text-gold/70" aria-hidden="true" />
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* Informe completo. Aqui SI hay papel: un expediente es un
                documento, se lee de una sentada y no vuelve. El pergamino entra
                aqui con su tinta umber — la mecanica del sistema, no una
                excepcion— y el efecto en el mundo vuelve a dorado porque es
                la unica linea accionable del informe. */}
            <Dialog open={!!selectedNewsDetail} onOpenChange={open => !open && setSelectedNewsDetail(null)}>
                <DialogContent className="max-w-md md:max-w-lg border-2 border-wood bg-card">
                    {selectedNewsDetail && (
                        <>
                            <DialogHeader>
                                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                    <CategoryChip category={selectedNewsDetail.category} />
                                    {getImpactBadge(selectedNewsDetail.impactLevel)}
                                </div>
                                <DialogTitle className="font-heading text-xl leading-tight text-parch-50">
                                    {selectedNewsDetail.headline}
                                </DialogTitle>
                                <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 font-mono text-[11px] text-parch-400">
                                    <span className="font-sans font-semibold uppercase tracking-[.1em] text-parch-300">{selectedNewsDetail.source}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{selectedNewsDetail.district}</span>
                                    {selectedNewsDetail.coordinates && (
                                        <>
                                            <span aria-hidden="true">·</span>
                                            <span className="text-gold">[{selectedNewsDetail.coordinates}]</span>
                                        </>
                                    )}
                                    <span aria-hidden="true">·</span>
                                    <span>Hace {selectedNewsDetail.minutesAgo} min</span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 py-1">
                                <blockquote className="parchment border-l-4 border-l-crimson p-3 text-xs italic leading-relaxed">
                                    <p className="parchment-ink">&ldquo;{selectedNewsDetail.summary}&rdquo;</p>
                                </blockquote>

                                <div className="space-y-2">
                                    <p className="eyebrow">Informe del teletipo</p>
                                    <p className="text-justify text-sm leading-relaxed text-parch-200">
                                        {selectedNewsDetail.fullReport}
                                    </p>
                                </div>

                                <div className="flex items-start gap-2.5 rounded border border-gold/40 bg-gold/10 p-2.5 text-xs">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                                    <div>
                                        <p className="font-bold uppercase tracking-[.1em] text-gold-light">Efecto en el mundo de juego</p>
                                        <p className="mt-0.5 font-mono text-[11px] text-parch-200">{selectedNewsDetail.gameWorldImpact}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-wood pt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedNewsDetail(null)}
                                    className="font-heading text-xs uppercase tracking-wider"
                                >
                                    Cerrar despacho
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
