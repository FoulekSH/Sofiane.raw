import prisma from '@/lib/prisma'
import Gallery from '@/components/Gallery'
import ContactForm from '@/components/ContactForm'
import ScrollReveal from '@/components/ScrollReveal'
import Hero from '@/components/Hero'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const photos = await prisma.photo.findMany({
    where: { isPublic: true },
    orderBy: { order: 'asc' }
  })

  // Log to server console to debug on VPS
  console.log(`[Home] Found ${photos.length} public photos.`)

  const featuredPhoto = photos.find(p => p.isFeatured) || photos[0]

  return (
    <main className="min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* SECTION 1: HERO CINÉMATIQUE */}
      <Hero photo={featuredPhoto?.filename} />

      {/* SECTION 2: L'OEUVRE À LA UNE (Highlighting belle_image.jpg) */}
      <section className="py-32 px-4 md:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
           <div className="w-full md:w-1/2">
              <ScrollReveal direction="left">
                 <div className="relative aspect-[4/5] overflow-hidden group">
                    <img 
                      src={`/photos/${featuredPhoto?.filename}`} 
                      alt="Featured Work" 
                      className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 border border-white/10 m-4"></div>
                 </div>
              </ScrollReveal>
           </div>
           <div className="w-full md:w-1/2 space-y-12">
              <ScrollReveal direction="right">
                 <div className="space-y-6">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-[0.6em] font-bold">Featured Series</span>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white italic">
                      L'ESSENCE <br /> DU REGARD.
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed font-light max-w-md">
                      Une étude sur la vulnérabilité et la force intérieure. Cette série explore les textures de la peau sous une lumière naturelle brute, révélant ce qui se cache derrière le paraître.
                    </p>
                 </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2} direction="right">
                 <div className="flex gap-12 border-t border-zinc-900 pt-12">
                    <div>
                       <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 font-bold">Camera</p>
                       <p className="text-white text-sm font-light uppercase tracking-widest">Sony A7R IV</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 font-bold">Lens</p>
                       <p className="text-white text-sm font-light uppercase tracking-widest">85mm f/1.4 GM</p>
                    </div>
                 </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4} direction="right">
                 <a href="#gallery" className="inline-block group">
                    <div className="flex items-center gap-4">
                       <div className="h-px w-12 bg-zinc-800 group-hover:w-24 transition-all duration-500"></div>
                       <span className="text-xs uppercase tracking-[0.4em] font-bold text-zinc-500 group-hover:text-white transition-colors">Découvrir la série</span>
                    </div>
                 </a>
              </ScrollReveal>
           </div>
        </div>
      </section>

      {/* SECTION 3: THE VISION */}
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

      {/* SECTION 4: GALERIE (Masonry) */}
      <section id="gallery" className="py-32 px-4 md:px-12 bg-white text-zinc-950">
        <div className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <ScrollReveal direction="left">
            <div className="space-y-4">
               <span className="text-zinc-400 text-[10px] uppercase tracking-[0.4em] font-bold">Selected Works</span>
               <h2 className="text-8xl md:text-[12rem] font-bold tracking-tighter leading-none">WORKS.</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="pb-6 max-w-sm">
               <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                  Chaque projet est une collaboration unique visant à sublimer votre vision à travers mon prisme.
               </p>
               <div className="flex gap-4">
                  <span className="px-3 py-1 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold">Portrait</span>
                  <span className="px-3 py-1 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold">Editorial</span>
                  <span className="px-3 py-1 border border-zinc-200 text-[9px] uppercase tracking-widest font-bold">Commercial</span>
               </div>
            </div>
          </ScrollReveal>
        </div>
        
        <Gallery photos={photos.map(p => p.filename)} />
      </section>

      {/* SECTION 5: SERVICES & PACKAGES (Vendeur) */}
      <section className="py-48 px-4 md:px-8 bg-zinc-950">
         <div className="max-w-7xl mx-auto space-y-32">
            <ScrollReveal>
               <div className="text-center space-y-4">
                  <span className="text-[10px] text-zinc-700 uppercase tracking-[0.6em] font-bold">Services</span>
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">Collaborations</h2>
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
                     <span className="text-zinc-800 text-6xl font-serif italic group-hover:text-zinc-500 transition-colors duration-700">{service.id}</span>
                     <div className="space-y-6">
                        <h3 className="text-2xl text-white uppercase tracking-widest">{service.title}</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">{service.desc}</p>
                     </div>
                     <ul className="space-y-4">
                        {service.features.map(f => (
                           <li key={f} className="text-[10px] uppercase tracking-[0.2em] text-zinc-700 flex items-center gap-3">
                              <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                              {f}
                           </li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>
      </section>
      
      {/* SECTION 6: CONTACT */}
      <section id="contact" className="py-48 px-4 md:px-8 bg-zinc-950 text-center relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-zinc-800 to-transparent"></div>
         <ScrollReveal>
            <div className="mb-24 space-y-4">
               <span className="text-[10px] text-zinc-700 uppercase tracking-[0.6em] font-bold">Prêt pour la suite ?</span>
               <h2 className="text-6xl md:text-8xl font-light leading-none">DÉBUTER UNE <br /><span className="italic font-serif">HISTOIRE.</span></h2>
            </div>
         </ScrollReveal>
         <ContactForm />
      </section>
      
      <footer className="py-12 px-8 flex flex-col md:flex-row justify-between items-center text-zinc-700 text-[9px] tracking-[0.4em] uppercase border-t border-zinc-900">
        <div>SOFIANE RAW • {new Date().getFullYear()} © ALL RIGHTS RESERVED</div>
        <div className="mt-6 md:mt-0 flex gap-8">
           <a href="#" className="hover:text-white transition">Instagram</a>
           <a href="#" className="hover:text-white transition">LinkedIn</a>
           <a href="#" className="hover:text-white transition">Behance</a>
        </div>
      </footer>
    </main>
  )
}
