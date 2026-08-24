import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-16 max-w-[1440px] mx-auto space-y-16">
      {/* Header & Brand Identity */}
      <header className="border-b-4 border-black pb-8 flex justify-between items-end dark:border-white">
        <div>
          <span className="label-caps text-[#B08D57] block mb-2">Architectural Monograph</span>
          <h1 className="hero-text font-bold uppercase tracking-tight">XII</h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="label-caps text-muted-foreground">Exhibit No. 01</p>
          <p className="caption-text text-muted-foreground">Brutalist Precision & Luxury Gold</p>
        </div>
      </header>

      {/* Main Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Asymmetrical Editorial Focus Card (8 cols) */}
        <div className="md:col-span-8 border-4 border-black p-8 bg-card space-y-6 dark:border-white">
          <div className="flex justify-between items-center border-b-2 border-black pb-4 dark:border-white">
            <span className="label-caps text-xs px-3 py-1 bg-black text-white dark:bg-white dark:text-black">
              Authentic Specification
            </span>
            <span className="caption-text text-[#B08D57] font-semibold">
              #B08D57 Luxury Gold
            </span>
          </div>

          <h2 className="section-title">THE ARCHITECTURAL CHRONOGRAPH</h2>

          <p className="body-lg text-muted-foreground">
            Digital interface rendered as a physical gallery space. Heavy stroke geometries, 0px border radius, and uncompromising asymmetry create an aesthetic of permanence and authority.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="default">Explore Collection</Button>
            <Button variant="gold">Inquire Timepiece</Button>
            <Button variant="outline">Monograph PDF</Button>
          </div>
        </div>

        {/* Timepiece Card Exhibit (4 cols) */}
        <div className="md:col-span-4 border-4 border-black bg-card dark:border-white">
          <div className="h-64 bg-[#D9D9D9] flex items-center justify-center border-b-4 border-black dark:border-white dark:bg-[#2f3131]">
            <span className="hero-text opacity-25 select-none">XII</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="caption-text text-muted-foreground uppercase tracking-widest block">Reference 101</span>
                <h3 className="card-title">Chronograph I</h3>
              </div>
              <span className="label-caps text-[#B08D57] font-bold">$12,400</span>
            </div>

            <div className="border-t-2 border-black pt-4 space-y-2 dark:border-white text-sm">
              <div className="flex justify-between body-md">
                <span className="text-muted-foreground">Case</span>
                <span className="font-semibold">316L Brushed Steel</span>
              </div>
              <div className="flex justify-between body-md">
                <span className="text-muted-foreground">Strap</span>
                <span className="font-semibold">Matte Black Rubber</span>
              </div>
            </div>

            <Button variant="solid" className="w-full mt-4">
              Acquire Timepiece
            </Button>
          </div>
        </div>
      </section>

      {/* Typography & System Specimen */}
      <section className="border-4 border-black p-8 bg-[#eeeeee] dark:bg-[#1b1b1b] dark:border-white space-y-8">
        <h2 className="section-title border-b-4 border-black pb-4 dark:border-white">
          SYSTEM SPECIMEN
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Colors */}
          <div className="space-y-4">
            <h3 className="card-title">Color Palette</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-black text-white border-2 border-black">
                PRIMARY BLACK (#000000)
              </div>
              <div className="p-4 bg-[#B08D57] text-white border-2 border-black">
                LUXURY GOLD (#B08D57)
              </div>
              <div className="p-4 bg-[#D9D9D9] text-black border-2 border-black">
                CONCRETE (#D9D9D9)
              </div>
              <div className="p-4 bg-[#A5A5A5] text-black border-2 border-black">
                STEEL (#A5A5A5)
              </div>
            </div>
          </div>

          {/* Form & Controls */}
          <div className="space-y-4">
            <h3 className="card-title">Brutalist Controls</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search Timepieces..."
                className="w-full p-4 border-4 border-black bg-white dark:bg-black dark:border-white body-md focus:outline-none focus:ring-0"
              />
              <div className="flex items-center gap-3">
                <div className="size-6 border-4 border-black bg-black dark:border-white dark:bg-white" />
                <span className="label-caps text-sm">Active Selection (Filled Square)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

