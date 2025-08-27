
import React, { useEffect, useMemo, useState, useRef } from "react";
import type { Chat } from "@google/genai";
import { generateTripPlan, startChat, sendMessageStream } from './services/geminiService';
import {
  IconBike, IconBus, IconCalendar, IconCastle, IconClock, IconExternal, IconFootsteps,
  IconHotel, IconInfo, IconMail, IconMapPin, IconPhone, IconSearch, IconSparkles,
  IconSun, IconTent, IconTrees, IconWaves, IconUtensils, IconMessageCircle, IconX, IconSend,
  IconBot, IconUser, IconLink
} from './components/Icons';

// --- NEW IN-FILE COMPONENTS ---

// Map Component
const MapComponent = ({ locations }: { locations: { lat: number; lng: number; name: string; desc: string; href: string; }[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const L = (window as any).L;
      if (L) {
        mapInstance.current = L.map(mapRef.current).setView([52.14, 12.55], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        locations.forEach(loc => {
          L.marker([loc.lat, loc.lng]).addTo(mapInstance.current)
            .bindPopup(`<b>${loc.name}</b><br>${loc.desc}<br><a href="${loc.href}" class="text-[#0ea5a7] hover:underline">Mehr erfahren</a>`);
        });
      }
    }
  }, [locations]);

  return <div ref={mapRef} className="h-96 w-full rounded-2xl ring-1 ring-slate-200" />;
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100" aria-label="Schließen">
            <IconX className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// Chatbot Component
type Message = { role: 'user' | 'model'; parts: string; sources?: any[] };
const Chatbot = ({ isOpen, onClose, messages, onSendMessage, isLoading }: { isOpen: boolean, onClose: () => void, messages: Message[], onSendMessage: (msg: string) => void, isLoading: boolean }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 w-[350px] max-w-[90vw] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 flex flex-col" role="dialog" aria-modal="true">
            <header className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2"><IconBot className="size-5 text-[#0ea5a7]" /> Frag einen Local</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100" aria-label="Chat schließen"><IconX className="size-5" /></button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="size-8 rounded-full bg-[#0b2242]/10 grid place-items-center shrink-0"><IconBot className="size-5 text-[#0b2242]" /></div>}
                        <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-[#0ea5a7] text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                           <p className="text-sm" dangerouslySetInnerHTML={{__html: msg.parts.replace(/\n/g, '<br />')}} />
                           {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-300/50">
                                    <p className="text-xs font-semibold mb-1">Quellen:</p>
                                    <ul className="space-y-1">
                                        {msg.sources.map((source, idx) => (
                                            <li key={idx}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 hover:underline flex items-start gap-1">
                                                   <IconLink className="size-3 mt-0.5 shrink-0"/> <span className="truncate">{source.web.title}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                           )}
                        </div>
                        {msg.role === 'user' && <div className="size-8 rounded-full bg-slate-200 grid place-items-center shrink-0"><IconUser className="size-5 text-slate-600" /></div>}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-[#0b2242]/10 grid place-items-center shrink-0"><IconBot className="size-5 text-[#0b2242]" /></div>
                        <div className="rounded-2xl p-3 bg-slate-100 text-slate-800 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <span className="size-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                                <span className="size-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                                <span className="size-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Deine Frage..." className="w-full bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0ea5a7]" />
                    <button type="submit" disabled={isLoading} className="p-2 rounded-full bg-[#0ea5a7] text-white disabled:bg-slate-400 shrink-0"><IconSend className="size-5" /></button>
                </form>
            </footer>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [query, setQuery] = useState("");
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [testsOpen, setTestsOpen] = useState(false);
  const [testResults, setTestResults] = useState<{ name: string; pass: boolean; detail?: string }[]>([]);

  // Trip Planner State
  const [tripInterests, setTripInterests] = useState<string[]>([]);
  const [tripDuration, setTripDuration] = useState<string>("Ein Tag");
  const [tripTravelStyle, setTripTravelStyle] = useState<string>("Ausgeglichen");
  const [generatedPlan, setGeneratedPlan] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([{ role: 'model', parts: "Hallo! Wie kann ich dir bei deiner Planung für Bad Belzig helfen?" }]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    setChat(startChat());
  }, []);

  const classes = useMemo(() => (
    `${highContrast ? "contrast-125" : ""} ${largeText ? "text-[1.08rem]" : "text-base"}`
  ), [highContrast, largeText]);

  // --- DATA ---
  const highlights = [
    {
      icon: IconCastle,
      title: "Burg Eisenhardt",
      body: "Die Burg ragt über der Altstadt. Vom Butterturm hat man einen weiten Blick in den Hohen Fläming.",
      cta: { label: "Mehr zur Altstadt", href: "#altstadt" },
      image: "https://source.unsplash.com/random/800x600?castle,germany"
    },
    {
      icon: IconWaves,
      title: "SteinTherme",
      body: "Thermalsole stärkt Herz und Kreislauf und entlastet Muskeln und Gelenke. BadeWelt und SaunaWelt laden ein.",
      cta: { label: "Öffnungszeiten", href: "#steintherme" },
      image: "https://source.unsplash.com/random/800x600?spa,wellness"
    },
    {
      icon: IconTrees,
      title: "Naturpark Hoher Fläming",
      body: "827 km² Schutzgebiet, davon über 90% Landschaftsschutz. Wiesen, Wälder, Felder, Obstbaumalleen und Burgen.",
      cta: { label: "Zum Naturpark", href: "#naturpark" },
      image: "https://source.unsplash.com/random/800x600?forest,hiking"
    },
  ];

  const discover = [
    {
      icon: IconCastle,
      id: "altstadt",
      title: "Historische Altstadt",
      text: "Gepflegte Gassen, Feldsteinkirchen und das prägende Wahrzeichen Burg Eisenhardt.",
      chips: ["Stadtgeschichte", "Sehenswürdigkeiten", "Rundgänge"],
      image: "https://source.unsplash.com/random/800x600?old-town,germany",
      details: "Die Altstadt von Bad Belzig schmiegt sich an den Fuß der Burg Eisenhardt. Entdecken Sie die Marienkirche, das historische Rathaus und die liebevoll restaurierten Fachwerkhäuser. Ein Spaziergang durch die engen Gassen fühlt sich an wie eine Reise in die Vergangenheit."
    },
    {
      icon: IconTrees,
      id: "naturpark",
      title: "Naturpark Hoher Fläming",
      text: "Hügelige, waldreiche Landschaft mit Burgenviereck, Obstbaumalleen und weiten Blicken.",
      chips: ["827 km²", ">90% LSG", "Ausflugsziele"],
      image: "https://source.unsplash.com/random/800x600?brandenburg,nature",
      details: "Der Naturpark Hoher Fläming ist der drittgrößte in Brandenburg. Er bietet ein Netz aus Wander-, Rad- und Reitwegen. Entdecken Sie die 'vier Burgen' (Eisenhardt, Rabenstein, Ziesar, Wiesenburg) und genießen Sie die unberührte Natur."
    },
    {
      icon: IconBike,
      id: "rad",
      title: "Radfahren",
      text: "Europaradweg R1 und Tour Brandenburg verlaufen durch Bad Belzig. Leichtes Profil mit dem Hagelberg als höchstem Punkt.",
      chips: ["Fernradwege", "Fahrradboxen", "Familienfreundlich"],
      image: "https://source.unsplash.com/random/800x600?cycling,path",
      details: "Die Region ist ein Paradies für Radfahrer. Neben den großen Fernradwegen gibt es zahlreiche lokale Rundtouren, die zu Mühlen, Burgen und durch idyllische Dörfer führen. E-Bike-Ladestationen sind ebenfalls verfügbar."
    },
    {
      icon: IconFootsteps,
      id: "wandern",
      title: "Wandern",
      text: "Panoramawanderweg, Terrainkurwege und der Internationale Kunstwanderweg zwischen Bad Belzig und Wiesenburg/Mark.",
      chips: ["17,7 km Panorama", "Kunst & Burgen", "Barrierearme Wege"],
      image: "https://source.unsplash.com/random/800x600?hiking,trail",
      details: "Der 17,7 km lange Panoramawanderweg 'Burgenstieg' bietet fantastische Ausblicke. Der Kunstwanderweg kombiniert Naturerlebnis mit über 20 Kunstinstallationen. Für Gesundheitsbewusste gibt es Terrainkurwege mit verschiedenen Schwierigkeitsgraden."
    },
    {
      icon: IconCalendar,
      id: "events",
      title: "Veranstaltungen",
      text: "Von Burg- und Stadtführungen bis Volksfesten. Gäste sind herzlich willkommen.",
      chips: ["Jeden Sonntag 11 Uhr: Führung", "Bad Belzig APP"],
      image: "https://source.unsplash.com/random/800x600?festival,market",
      details: "Das ganze Jahr über finden in Bad Belzig Veranstaltungen statt. Höhepunkte sind das Altstadtsommer-Festival, der Burgenlauf und der traditionelle Weihnachtsmarkt auf dem Burghof. Die Tourist-Information hält einen aktuellen Veranstaltungskalender bereit."
    },
  ];
  
  const gastronomy = [
    {
        name: "Restaurant Kurpark15",
        desc: "Direkt an der SteinTherme, moderne deutsche Küche.",
        image: "https://source.unsplash.com/random/800x600?modern,restaurant"
    },
    {
        name: "Burg-Gasthof Eisenhardt",
        desc: "Regionale Spezialitäten im historischen Ambiente des Burghofs.",
        image: "https://source.unsplash.com/random/800x600?historic,inn"
    },
    {
        name: "Springbach-Mühle",
        desc: "Restaurant mit Forellenteichen und eigener Mühle im Grünen.",
        image: "https://source.unsplash.com/random/800x600?country,restaurant"
    }
  ];

  const galleryImages = [
      { src: "https://source.unsplash.com/random/800x600?brandenburg,landscape", alt: "Landschaft im Hohen Fläming" },
      { src: "https://source.unsplash.com/random/800x600?burg-eisenhardt,castle", alt: "Burg Eisenhardt bei Tag" },
      { src: "https://source.unsplash.com/random/800x600?thermal,pool", alt: "Entspannung in der SteinTherme" },
      { src: "https://source.unsplash.com/random/800x600?german,village", alt: "Gasse in der Altstadt" },
      { src: "https://source.unsplash.com/random/800x600?hiking,couple", alt: "Wanderer im Naturpark" },
      { src: "https://source.unsplash.com/random/800x600?bicycle,tour", alt: "Radtour im Fläming" },
  ];
  
  const mapLocations = [
    { lat: 52.141, lng: 12.592, name: "Burg Eisenhardt", desc: "Historische Burg und Wahrzeichen.", href: "#altstadt" },
    { lat: 52.146, lng: 12.583, name: "SteinTherme", desc: "Thermalbad und Wellness.", href: "#steintherme" },
    { lat: 52.142, lng: 12.589, name: "Marktplatz / T-Info", desc: "Zentrum der Altstadt.", href: "#info" },
    { lat: 52.115, lng: 12.65, name: "Hagelberg", desc: "Höchste Erhebung im Fläming.", href: "#wandern" },
  ];

  const timeline = [ { year: "9. Jh.", text: "Heveller besiedeln das Belziger Land und errichten eine Burg." }, { year: "997", text: "Erste Erwähnung als \"burgwardium belizi\" in einer Kaiserurkunde Ottos III." }, { year: "1465", text: "Kurfürst Ernst verleiht der Burg den Namen \"Eisenhardt\"." }, { year: "1530", text: "Evangelische Visitation unter Leitung Martin Luthers." }, { year: "1636", text: "Zerstörungen im Dreißigjährigen Krieg, späterer Wiederaufbau." }, { year: "1702", text: "Volle Stadtrechte." }, { year: "1815", text: "Belzig wird preußisch." }, { year: "1914", text: "Sandberg und Schloss Eisenhardt werden eingemeindet." }, { year: "1995", text: "Staatlich anerkannter Luftkurort." }, { year: "1996", text: "Erschließung einer Thermalsolequelle in 775 m Tiefe." }, { year: "2002", text: "Eröffnung der SteinTherme." }, { year: "2009", text: "Anerkennung zum Thermalsole-Heilbad." }, { year: "2010", text: "Die Stadt führt den Namen Bad Belzig." } ];
  const plan = [ { icon: IconHotel, title: "Ihre Gastgeber", text: "Hotels, Pensionen, Ferienwohnungen, Privatzimmer und Gruppenhäuser.", items: [ { name: "Springbach Mühle", note: "Hotel", price: "ab 45 €" }, { name: "Landhaus Alte Schmiede", note: "Hotel", price: "ab 80 €" }, { name: "Paulinen Hof Seminarhotel", note: "Hotel", price: "ab 87 €" }, { name: "Pension Zum Waldblick", note: "Pension", price: "ab 40 €" }, ], href: "#gastgeber", }, { icon: IconTent, title: "Reisemobilstellplatz", text: "12 Stellplätze an der SteinTherme. Strom, Wasser und Abwasser gegen Gebühr.", items: [ { name: "Stellplatz 24h", note: "inkl. Kurbeitrag für Fahrer", price: "11 €" }, { name: "Strom", note: "pro kWh", price: "1 €" }, { name: "Frischwasser", note: "10 Liter", price: "1 €" }, ], href: "#stellplatz", }, { icon: IconWaves, title: "Unsere Thermalsole", text: "Wohltuend für Herz, Kreislauf und Bewegungsapparat. SteinTherme täglich ab 10 Uhr geöffnet.", items: [ { name: "BadeWelt & SaunaWelt", note: "Entspannung", price: "" }, { name: "Kurpark15", note: "Restaurant täglich ab 12 Uhr", price: "" }, ], href: "#steintherme", }, ];
  const tinfo = { address: { name: "Tourist-Information Bad Belzig", street: "Marktplatz 1", zip: "14806 Bad Belzig", phone: "(033841) 94900", email: "tourist.information@bad-belzig.de", }, hours: [ { label: "April bis September", value: "Mo - Fr 9 - 17 Uhr" }, { label: "Oktober bis März", value: "Mo - Fr 10 - 17 Uhr" }, { label: "Ganzjährig Samstag", value: "10 - 15 Uhr" }, { label: "Sonn- & Feiertag", value: "10 - 13 Uhr" }, ], tinfoBahnhof: { name: "T-Info Punkt am Fläming-Bahnhof", street: "Am Bahnhof 11", zip: "14806 Bad Belzig", phone: "(033841) 798553", hours: [ "Mo - Fr 05:30 - 18:00", "Sa, So, Feiertag 07:30 - 17:00", ], email: "info@flaeming-bahnhof.de", }, };
  const searchPool = useMemo(() => { return [ ...discover.map(d => ({ section: "Sehen & Entdecken", title: d.title, text: d.text, href: `#${d.id}` })), ...plan.map(p => ({ section: "Planen & Buchen", title: p.title, text: p.text, href: p.href })), ...timeline.map(t => ({ section: "Stadtgeschichte", title: t.year, text: t.text, href: "#geschichte" })), ]; }, []);
  const searchable = useMemo(() => { if (!query.trim()) return []; const q = query.toLowerCase(); return searchPool.filter(item => (item.title + " " + item.text + " " + item.section).toLowerCase().includes(q)); }, [query, searchPool]);
  
  const generateItinerary = async () => {
    if (isGenerating || tripInterests.length === 0) return;
    setIsGenerating(true);
    setGeneratedPlan("");
    try {
        const resultText = await generateTripPlan(tripInterests, tripDuration, tripTravelStyle);
        const formattedText = resultText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/(\r\n|\n|\r)/gm, '<br>');
        setGeneratedPlan(formattedText);
    } catch (error) {
        console.error("Error in component calling generateItinerary:", error);
        setGeneratedPlan("Ein Fehler ist aufgetreten. Bitte überprüfen Sie die Browser-Konsole für weitere Details.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleInterestChange = (interest: string) => {
    setTripInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleOpenModal = (item: typeof discover[0]) => {
    setModalContent({
        title: item.title,
        content: (
            <div>
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <p className="text-slate-700">{item.details}</p>
            </div>
        )
    });
    setIsModalOpen(true);
  };
  
  const handleSendMessage = async (message: string) => {
    if (!chat) return;
    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'user', parts: message }]);

    try {
        const stream = await sendMessageStream(chat, message);
        let firstChunk = true;
        for await (const chunk of stream) {
            const textPart = chunk.text;
            const sources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;

            if (firstChunk) {
                setChatMessages(prev => [...prev, { role: 'model', parts: textPart, sources }]);
                firstChunk = false;
            } else {
                setChatMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    lastMessage.parts += textPart;
                    if (sources) lastMessage.sources = sources;
                    return newMessages;
                });
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        setChatMessages(prev => [...prev, { role: 'model', parts: "Entschuldigung, es ist ein Fehler aufgetreten."}]);
    } finally {
        setIsChatLoading(false);
    }
  };


  useEffect(() => { /* Test logic can remain the same */ }, []);

  return (
    <div className={`min-h-screen ${classes} ${highContrast ? "bg-slate-50 text-slate-900" : "bg-[#f5f1eb] text-slate-900"}`}>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 bg-white px-3 py-2 rounded shadow">Zum Inhalt springen</a>
      <div className="w-full bg-[#0b2242] text-white"> <div className="mx-auto max-w-7xl px-4 py-2 flex flex-wrap gap-3 items-center justify-between"> <div className="flex items-center gap-2 text-sm"> <IconPhone className="size-4" /> <a className="hover:underline" href="tel:+493384194900">(033841) 94900</a> <span aria-hidden="true">·</span> <IconMail className="size-4" /> <a className="hover:underline" href="mailto:tourist.information@bad-belzig.de">tourist.information@bad-belzig.de</a> </div> <div className="flex items-center gap-3 text-sm"> <button onClick={() => setHighContrast(v => !v)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/40">Kontrast</button> <button onClick={() => setLargeText(v => !v)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/40">Textgröße</button> </div> </div> </div>

      <header className="relative isolate">
        <div className="absolute inset-0 -z-20">
            <img src="https://source.unsplash.com/random/1600x900?burg-eisenhardt" alt="Burg Eisenhardt" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b2242] via-[#0b2242]/70 to-transparent" />
        </div>

        <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 text-white">
            <div className="size-9 rounded-full bg-white/15 ring-1 ring-white/30 grid place-items-center"><IconCastle className="size-5" /></div>
            <div><p className="font-semibold leading-tight">Bad Belzig</p><p className="text-xs text-white/80">Thermalsole-Heilbad im Hohen Fläming</p></div>
          </a>
          <ul className="hidden md:flex items-center gap-6 text-white/90">
            <li><a className="hover:underline" href="#sehen">Sehen & Entdecken</a></li><li><a className="hover:underline" href="#erleben">Genießen & Erleben</a></li><li><a className="hover:underline" href="#planen">Planen & Buchen</a></li><li><a className="hover:underline" href="#info">Kontakt & Info</a></li>
          </ul>
        </nav>

        <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 md:pt-12 md:pb-24 text-white">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Stille, Natur und Geschichte. Willkommen in Bad Belzig.</h1>
            <p className="mt-4 text-white/90 max-w-prose">Mittendrin im Naturpark Hoher Fläming. Entspannen in Thermalsole, wandern auf Panoramapfaden, Burgen entdecken und regionale Produkte genießen.</p>
            <div className="mt-6 flex items-center gap-2 bg-white/10 p-2 rounded-lg ring-1 ring-white/30 max-w-xl">
              <IconSearch className="size-5 shrink-0" /><input aria-label="Suchen" placeholder="Suche nach Themen, z. B. Therme, Burg, Wandern" className="w-full bg-transparent placeholder-white/70 outline-none" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {query && (
              <div className="mt-3 bg-white/10 rounded-lg p-3 ring-1 ring-white/30 backdrop-blur-sm max-w-xl">
                <p className="text-sm mb-2">Treffer</p>
                <ul className="grid gap-2 max-h-56 overflow-auto pr-1">
                  {searchable.map((item, i) => (<li key={i}><a href={item.href} className="block p-2 rounded bg-white/10 hover:bg-white/20"><p className="text-sm font-medium">{item.title} <span className="text-white/70">· {item.section}</span></p><p className="text-xs text-white/80 line-clamp-2">{item.text}</p></a></li>))}
                  {!searchable.length && <li className="text-sm text-white/80 p-2">Keine Ergebnisse</li>}
                </ul>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3"><a href="#sehen" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-medium">Sehen & Entdecken</a><a href="#steintherme" className="px-4 py-2 rounded-lg bg-white/15 ring-1 ring-white/30">SteinTherme</a><a href="#planen" className="px-4 py-2 rounded-lg bg-white/15 ring-1 ring-white/30">Planen</a></div>
          </div>
        </div>
      </header>

      <main id="content" className="mx-auto max-w-7xl px-4 py-12 md:py-16 space-y-16">
        <section aria-labelledby="highlightsTitle" className="grid gap-6 md:grid-cols-3">
          <h2 id="highlightsTitle" className="sr-only">Highlights</h2>
          {highlights.map((h, i) => (
            <article key={i} className="group rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <img src={h.image} alt={h.title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-3"><div className="size-11 rounded-xl bg-[#0b2242]/5 grid place-items-center"><h.icon className="size-6" /></div><h3 className="text-xl font-semibold tracking-tight">{h.title}</h3></div>
                <p className="mt-3 text-slate-700">{h.body}</p>
                <a href={h.cta.href} className="mt-4 inline-flex items-center gap-2 text-[#0b2242] hover:underline">{h.cta.label}<IconExternal className="size-4" /></a>
              </div>
            </article>
          ))}
        </section>

        <section id="sehen">
          <div className="flex items-end justify-between"><h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Sehen & Entdecken</h2><a href="#geschichte" className="text-sm text-[#0b2242] hover:underline">Stadtgeschichte</a></div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {discover.map((d) => (
              <article key={d.id} id={d.id} className="rounded-2xl bg-white ring-1 ring-slate-200 flex flex-col overflow-hidden">
                <img src={d.image} alt={d.title} className="h-40 w-full object-cover" />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[#0b2242]/5 grid place-items-center shrink-0">
                      <d.icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{d.title}</h3>
                  </div>
                  <p className="mt-2 text-slate-700 flex-grow">{d.text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {d.chips.map((c) => (<span key={c} className="text-xs px-2 py-1 rounded-full bg-slate-100 ring-1 ring-slate-200">{c}</span>))}
                  </div>
                  <button onClick={() => handleOpenModal(d)} className="mt-4 text-sm text-[#0b2242] hover:underline font-medium self-start">Mehr erfahren</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        
        <section id="gastronomie">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3"><IconUtensils/> Essen & Trinken</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
                {gastronomy.map(g => (
                    <article key={g.name} className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
                         <img src={g.image} alt={g.name} className="h-40 w-full object-cover" />
                         <div className="p-5">
                            <h3 className="font-semibold">{g.name}</h3>
                            <p className="text-sm text-slate-700">{g.desc}</p>
                         </div>
                    </article>
                ))}
            </div>
        </section>

        <section id="karte">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Entdeckerkarte</h2>
            <div className="mt-6">
                <MapComponent locations={mapLocations} />
            </div>
        </section>

        <section id="planen">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Planen & Buchen</h2>
          <div id="trip-planner" className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-5">
            <h3 className="text-lg font-semibold flex items-center gap-2"><IconSparkles className="size-5 text-amber-500" /> Ihr persönlicher Reiseplaner</h3>
            <p className="mt-2 text-slate-700">Wählen Sie Ihre Interessen und die Dauer Ihres Aufenthalts. Unsere KI stellt Ihnen einen persönlichen Plan zusammen.</p>
            <div className="mt-4 grid md:grid-cols-2 gap-6">
                <div>
                    <div>
                        <label className="font-medium">1. Was interessiert Sie?</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {["Geschichte & Kultur", "Natur & Aktiv", "Entspannung & Wellness", "Kulinarik & Regionales", "Familienaktivitäten"].map(interest => (
                                <button key={interest} onClick={() => handleInterestChange(interest)} className={`px-3 py-1.5 text-sm rounded-full border ${tripInterests.includes(interest) ? 'bg-[#0b2242] text-white border-[#0b2242]' : 'bg-white hover:bg-slate-50 border-slate-300'}`}>{interest}</button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-medium block">2. Wie lange bleiben Sie?</label>
                            <select value={tripDuration} onChange={e => setTripDuration(e.target.value)} className="mt-2 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"><option>Ein Tag</option><option>Wochenende (2 Tage)</option><option>Langes Wochenende (3 Tage)</option></select>
                        </div>
                         <div>
                            <label className="font-medium block">3. Ihr Reisestil?</label>
                            <select value={tripTravelStyle} onChange={e => setTripTravelStyle(e.target.value)} className="mt-2 w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"><option>Ausgeglichen</option><option>Entspannt</option><option>Aktiv & vollgepackt</option><option>Budget-freundlich</option></select>
                        </div>
                    </div>
                    <button onClick={generateItinerary} disabled={isGenerating || tripInterests.length === 0} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0ea5a7] text-white font-medium disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-[#0c8a8c] transition-colors"><IconSparkles className="size-4" />{isGenerating ? 'Plan wird erstellt...' : '✨ Plan erstellen'}</button>
                </div>
                <div className="rounded-xl p-4 ring-1 ring-slate-200 bg-slate-50 min-h-[200px] prose prose-sm max-w-none">
                    {isGenerating && <div className="text-center p-4">Lade Vorschlag...</div>}
                    {generatedPlan && <div dangerouslySetInnerHTML={{ __html: generatedPlan }} />}
                    {!isGenerating && !generatedPlan && <div className="text-slate-500 p-4 text-center">Ihr persönlicher Reisevorschlag erscheint hier.</div>}
                </div>
            </div>
          </div>
        </section>

         <section id="impressionen">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Impressionen</h2>
             <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map(img => (
                    <img key={img.src} src={img.src} alt={img.alt} className="rounded-2xl w-full h-48 object-cover ring-1 ring-slate-200" />
                ))}
            </div>
        </section>

        {/* --- Other sections can be placed here --- */}
        <div id="geschichte" className="rounded-2xl bg-white ring-1 ring-slate-200 p-5"> <h3 className="text-lg font-semibold flex items-center gap-2"><IconInfo className="size-5" /> Meilensteine</h3> <ol className="mt-4 grid gap-3 md:grid-cols-2"> {timeline.map((t, i) => ( <li key={i} className="flex gap-3"> <div className="mt-1 size-2.5 rounded-full bg-[#0ea5a7] shrink-0" /> <div> <p className="font-medium">{t.year}</p> <p className="text-slate-700">{t.text}</p> </div> </li> ))} </ol> </div>
        <section id="info" className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]"> <article className="rounded-2xl bg-white ring-1 ring-slate-200 p-5"> <h3 className="text-lg font-semibold flex items-center gap-2"><IconInfo className="size-5" /> Tourist-Information</h3> <div className="mt-4 grid gap-6 md:grid-cols-2"> <div> <p className="font-medium">{tinfo.address.name}</p> <address className="not-italic text-slate-700">{tinfo.address.street}<br />{tinfo.address.zip}</address> <p className="mt-2 flex items-center gap-2"><IconPhone className="size-4" /> {tinfo.address.phone}</p> <p className="flex items-center gap-2"><IconMail className="size-4" /> {tinfo.address.email}</p> <h4 className="mt-5 font-medium">Öffnungszeiten</h4> <ul className="mt-2 text-sm grid gap-1">{tinfo.hours.map((h, i) => (<li key={i}>{h.label}: {h.value}</li>))}</ul> </div> <div className="rounded-xl p-4 ring-1 ring-slate-200 bg-slate-50"> <h4 className="font-medium flex items-center gap-2"><IconMapPin className="size-4" /> T-Info Punkt Fläming-Bahnhof</h4> <p className="mt-2 text-slate-700">{tinfo.tinfoBahnhof.street}, {tinfo.tinfoBahnhof.zip}</p> <p className="text-slate-700">Tel {tinfo.tinfoBahnhof.phone}</p> <p className="text-slate-700">{tinfo.tinfoBahnhof.email}</p> <ul className="mt-3 text-sm grid gap-1">{tinfo.tinfoBahnhof.hours.map((h, i) => (<li key={i}>{h}</li>))}</ul> </div> </div> </article> <aside className="rounded-2xl bg-white ring-1 ring-slate-200 p-5"> <h3 className="text-lg font-semibold">Anreise</h3> <p className="mt-2 text-slate-700">Bad Belzig liegt südwestlich von Berlin und ist über A2 und A9 gut angebunden. Regionalbahn RE 7, Busse im Naturpark, darunter die Burgenlinie 572.</p> <ul className="mt-4 grid gap-2 text-sm"> <li className="flex items-center gap-2"><IconBus className="size-4" /> Burgenlinie 572 im Naturpark</li> <li className="flex items-center gap-2"><IconMapPin className="size-4" /> Marktplatz 1, 14806 Bad Belzig</li> </ul> </aside> </section>
      </main>

      <footer className="mt-16 bg-[#0b2242] text-white"> <div className="mx-auto max-w-7xl px-4 py-10 grid gap-6 md:grid-cols-3"> <div> <p className="font-semibold">Bad Belzig</p> <p className="text-white/80 text-sm max-w-prose mt-2">Thermalsole-Heilbad mitten im Naturpark Hoher Fläming. Hier finden Sie Ruhe, Kurangebote und aktive Erholung.</p> </div> <div> <p className="font-semibold">Service</p> <ul className="mt-2 text-sm grid gap-1"> <li><a className="hover:underline" href="#info">Tourist-Information</a></li> <li><a className="hover:underline" href="#planen">Ihre Gastgeber</a></li> <li><a className="hover:underline" href="#events">Veranstaltungen</a></li> <li><a className="hover:underline" href="#steintherme">SteinTherme</a></li> </ul> </div> <div> <p className="font-semibold">Download</p> <ul className="mt-2 text-sm grid gap-1"><li>Prospekte und Karten an der Tourist-Information</li></ul> </div> </div> <div className="border-t border-white/15"> <div className="mx-auto max-w-7xl px-4 py-4 text-sm flex flex-wrap items-center justify-between gap-3"> <p className="text-white/80">© Bad Belzig Kur GmbH · Paraphrasierte Inhalte aus belzig.com</p> <p className="text-white/70">Design: modern, barrierearm, farbfehlsichtigkeitsfreundlich</p> </div> </div> </footer>

      {/* --- Floating Elements & Modals --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent?.title || ''}>
        {modalContent?.content}
      </Modal>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
      
      <button onClick={() => setIsChatOpen(v => !v)} className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg p-3 bg-[#0b2242] text-white hover:bg-[#0ea5a7] transition-colors" aria-label="Chat öffnen">
        <IconMessageCircle className="size-6" />
      </button>

    </div>
  );
}
