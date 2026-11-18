import { t, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";
import { ui } from "@/content/about";

/** Rose contact band at the bottom of every page. */
export default function Footer({ lang }: { lang: Locale }) {
  return (
    <footer className="mt-24 bg-rose text-bordeaux md:mt-32">
      <div className="wrap grid gap-10 py-16 md:grid-cols-2 md:py-20">
        <div>
          <h2 className="font-serif text-4xl leading-tight md:text-6xl">{t(ui.contactTitle, lang)}</h2>
          <p className="mt-4 max-w-md text-ink/80">{t(ui.contactText, lang)}</p>
        </div>
        <ul className="space-y-3 self-end text-lg md:justify-self-end md:text-right">
          <li>
            <a className="link" href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <a className="link" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          </li>
          <li>
            <a className="link" href={site.cv} download>{t(ui.cv, lang)} ↓</a>
          </li>
        </ul>
      </div>
      <div className="wrap flex justify-between border-t border-bordeaux/20 py-5 text-xs">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{t(site.school, lang)}</span>
      </div>
    </footer>
  );
}
