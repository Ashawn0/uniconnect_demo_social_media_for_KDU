export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-kdu-navy text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-kdu-gold">
            Kyungdong University
          </p>
          <p className="mt-1 text-lg font-semibold">UniConnect Student Platform</p>
          <p className="mt-3 text-sm text-white/70">
            Enabling collaboration between students, faculty, and departments with a unified
            communication and resource hub.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-kdu-gold">
            Campus contacts
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/80">
            <li>Student Affairs: +82-33-660-1111</li>
            <li>IT Support: support@kdu.ac.kr</li>
            <li>Admissions Office: admissions@kdu.ac.kr</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-kdu-gold">
            Quick links
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/80">
            <li>Academic Calendar</li>
            <li>Library &amp; Research</li>
            <li>Student Welfare Services</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 bg-kdu-blue/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Kyungdong University. All rights reserved.</p>
          <p>Designed and maintained by the Digital Campus Experience Team.</p>
        </div>
      </div>
    </footer>
  );
}
