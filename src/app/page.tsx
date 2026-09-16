import prisma from '@/lib/prisma'
import Gallery from '@/components/Gallery'
import ContactForm from '@/components/ContactForm'
import ScrollReveal from '@/components/ScrollReveal'
import Hero from '@/components/Hero'
import CategoryCarousel from '@/components/CategoryCarousel'
import PrestigeMarquee from '@/components/PrestigeMarquee'
import Link from 'next/link'
import { resolveCategory, categoryMatches } from '@/lib/categories'

export const revalidate = 60

export default async function Home() {
  try {
    const [photos, heroFlagged, featuredFlagged] = await Promise.all([
      prisma.photo.findMany({
        where: {
          isPublic: true,
          showOnHomePage: true
        },
        orderBy: { order: 'asc' }
      }),
      // La photo "Fond du titre" et la photo "À la une" sont choisies
      // indépendamment du fait qu'elles soient affichées dans la grille
      // d'accueil : il suffit qu'elles soient publiques.
      prisma.photo.findFirst({ where: { isPublic: true, isHero: true } }),
      prisma.photo.findFirst({ where: { isPublic: true, isFeatured: true } })
    ])

    const heroPhoto = heroFlagged || photos[0]
    const featuredPhoto = featuredFlagged || photos[1] || photos[0]

    const prestigeCategory = resolveCategory("prestige")
    const prestigePhotos = prestigeCategory
      ? photos.filter(p => categoryMatches(p.category, prestigeCategory))
      : []

    return (
      <main className="min-h-screen bg-zinc-950 overflow-x-hidden">
        {/* SECTION 1: HERO CINÉMATIQUE */}
        <Hero photo={heroPhoto?.filename || ""} />

        {/* SECTION PRESTIGE — bandeau défilant, n'apparaît que si des photos sont taguées "Prestige" */}
        <PrestigeMarquee photos={prestigePhotos} />

        {/* SECTION 2: L'OEUVRE À LA UNE */}
        <section className="py-32 px-4 md:px-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
             <div className="w-full md:w-1/2">
                <ScrollReveal direction="left">
                   <div className="relative aspect-[4/5] overflow-hidden group">
                      {featuredPhoto && (
                        <img 
                          src={`/api/photos/${featuredPhoto.filename}`} 
                          alt="Featured Work" 
                          className="w-full h-full object-cover md:grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105 pointer-events-none select-none"
                        />
                      )}
                      <div className="absolute inset-0 z-10"></div>
                      <div className="absolute inset-0 border border-white/10 m-4 z-20 pointer-events-none"></div>
                      <div className="absolute bottom-8 left-8 z-30">
                         <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold">Projet éditorial — 2026</p>
                      </div>
                   </div>
                </ScrollReveal>
             </div>
             <div className="w-full md:w-1/2 space-y-12">
                 <ScrollReveal direction="right">
                    <div className="space-y-6">
                       <span className="text-[10px] text-zinc-400 uppercase tracking-[0.6em] font-bold">Série à la une</span>
                       <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none text-white italic">
                         {(featuredPhoto?.title && !featuredPhoto.title.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? featuredPhoto.title : "L'ESSENCE DU REGARD."}
                       </h2>
                       <p className="text-zinc-400 text-lg leading-relaxed font-light max-w-md">
                         {featuredPhoto?.description || "Une étude sur la vulnérabilité et la force intérieure. Cette série explore les textures de la peau sous une lumière naturelle brute, révélant ce qui se cache derrière le paraître."}
                       </p>
                    </div>
                 </ScrollReveal>
                
                <ScrollReveal delay={0.4} direction="right">
                   <Link 
                     href={featuredPhoto?.category ? `/portfolio/${featuredPhoto.category.split(',')[0].trim().toLowerCase()}` : "#gallery"} 
                     className="inline-block group relative z-50 cursor-pointer"
                   >
                      <div className="flex items-center gap-4">
                         <div className="h-px w-12 bg-zinc-800 group-hover:w-24 transition-all duration-500"></div>
                         <span className="text-xs uppercase tracking-[0.4em] font-bold text-zinc-500 group-hover:text-white transition-colors">Découvrir la série</span>
                      </div>
                   </Link>
                </ScrollReveal>
             </div>
          </div>
        </section>
        
        {/* Rest of the components ... */}
        <section className="py-48 px-4 md:px-8 bg-zinc-900/20 text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-zinc-800 to-transparent"></div>
           <div className="max-w-4xl mx-auto space-y-16">
              <ScrollReveal>
                 <h2 className="text-4xl md:text-6xl font-light italic text-zinc-300 leading-tight">
                   "Je ne photographie pas ce que je vois, je photographie ce que je ressens."
                 </h2>
              </ScrollReveal>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-bold">
                 <ScrollReveal delay={0.1}>Authenticité</ScrollReveal>
                 <div className="h-px w-4 bg-zinc-800 hidden md:block"></div>
                 <ScrollReveal delay={0.2}>Minimalisme</ScrollReveal>
                 <div className="h-px w-4 bg-zinc-800 hidden md:block"></div>
                 <ScrollReveal delay={0.3}>Excellence</ScrollReveal>
              </div>
           </div>
        </section>

        <CategoryCarousel />

        <section id="gallery" className="py-32 px-4 md:px-12 bg-white text-zinc-950">
          <div className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <ScrollReveal direction="left">
              <div className="space-y-4">
                 <span className="text-zinc-400 text-[10px] uppercase tracking-[0.4em] font-bold">Projets sélectionnés</span>
                 <h2 className="text-[clamp(3rem,12vw,12rem)] font-bold tracking-[-0.06em] leading-[0.8] break-words">PORTFOLIO.</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="pb-6 max-w-sm">
                 <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    Chaque projet est une collaboration unique visant à sublimer votre vision à travers mon prisme.
                 </p>
                 <div className="flex flex-wrap gap-4">
                    <Link href="/portfolio/portrait" className="px-3 py-1 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold hover:bg-zinc-950 hover:text-white transition-colors">Portraits</Link>
                    <Link href="/portfolio/editorial" className="px-3 py-1 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold hover:bg-zinc-950 hover:text-white transition-colors">Éditorial</Link>
                    <Link href="/portfolio/branding" className="px-3 py-1 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold hover:bg-zinc-950 hover:text-white transition-colors">Branding</Link>
                 </div>
              </div>
            </ScrollReveal>
          </div>
          
          <Gallery photos={photos.map(p => p.filename)} />
        </section>

        <section className="py-48 px-4 md:px-8 bg-zinc-950">
           <div className="max-w-7xl mx-auto space-y-32">
              <ScrollReveal>
                 <div className="text-center space-y-4">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-[0.6em] font-bold">Services</span>
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">Collaborations</h2>
                 </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
                 {[
                   { 
                     id: '01', 
                     title: 'Editorial / Mode', 
                     desc: 'Direction artistique complète, shooting studio ou extérieur, retouches haute-fidélité.',
                     features: ['Lookbook', 'Campagne Marque', 'Portfolio Mannequin']
                   },
                   { 
                     id: '02', 
                     title: 'Luxe / Événement', 
                     desc: 'Reportage discret et élégant pour vos événements les plus prestigieux.',
                     features: ['Mariage High-End', 'Gala / Soirée', 'Backstage']
                   },
                   { 
                     id: '03', 
                     title: 'Corporate / Brand', 
                     desc: 'Une identité visuelle forte pour vos outils de communication professionnelle.',
                     features: ['Portrait Dirigeant', 'Architecture', 'Lifestyle Brand']
                   }
                 ].map((service, i) => (
                    <div key={service.id} className="bg-zinc-950 p-16 space-y-12 hover:bg-zinc-900/50 transition duration-1000 group">
                       <span className="text-zinc-700 text-6xl font-serif italic group-hover:text-zinc-400 transition-colors duration-700">{service.id}</span>
                       <div className="space-y-6">
                          <h3 className="text-2xl text-white uppercase tracking-widest">{service.title}</h3>
                          <p className="text-zinc-400 text-sm leading-relaxed">{service.desc}</p>
                       </div>
                       <ul className="space-y-4">
                          {service.features.map(f => (
                             <li key={f} className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                                <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
                                {f}
                             </li>
                          ))}
                       </ul>
                    </div>
                 ))}
              </div>

              <ScrollReveal>
                 <div className="flex flex-col items-center gap-8 text-center pt-8">
                    <p className="text-zinc-400 text-sm uppercase tracking-widest max-w-md">
                       Un projet en tête ? Discutons-en et donnons-lui vie.
                    </p>
                    <a
                       href="#contact"
                       className="group relative px-14 py-5 overflow-hidden bg-white rounded-full transition-all duration-500 hover:bg-zinc-200 hover:scale-105"
                    >
                       <span className="relative z-10 text-black text-xs font-black uppercase tracking-[0.4em]">
                          Demander un devis
                       </span>
                    </a>
                 </div>
              </ScrollReveal>
           </div>
        </section>
        
        <section id="contact" className="py-48 px-4 md:px-8 bg-zinc-950 text-center relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-zinc-800 to-transparent"></div>
           <ScrollReveal>
              <div className="mb-24 space-y-4">
                 <span className="text-[10px] text-zinc-400 uppercase tracking-[0.6em] font-bold">Prêt pour la suite ?</span>
                 <h2 className="text-[clamp(2.8rem,10vw,8rem)] font-light leading-[0.9] break-words">DÉBUTER UNE <br /><span className="italic font-serif">HISTOIRE.</span></h2>
              </div>
           </ScrollReveal>
           <ContactForm />
        </section>
        
        <footer className="py-12 px-8 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-[9px] tracking-[0.4em] uppercase border-t border-zinc-900">
          <div>SOFIANE RAW • {new Date().getFullYear()} © ALL RIGHTS RESERVED</div>
          <div className="mt-6 md:mt-0 flex gap-8">
             <a href="https://www.instagram.com/sofiane.raw/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Instagram</a>
             <a href="https://www.tiktok.com/@sofiane.raw?lang=fr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">TikTok</a>
             <a href="https://www.linkedin.com/in/sofiane-belhou/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">LinkedIn</a>
             <a href="#" className="hover:text-white transition">Credits</a>
          </div>
        </footer>
      </main>
    )
  } catch (error) {
    console.error("Error rendering Home page:", error)
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tighter text-white">SOFIANE .RAW</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Une erreur temporaire est survenue. Veuillez rafraîchir la page.</p>
        </div>
      </main>
    )
  }
}
