export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-kdugold to-transparent" />
            <span className="text-xs font-semibold text-kdugold uppercase tracking-wide">
              Kyungdong University
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-kdugold via-transparent to-transparent" />
          </div>
          
          <p className="text-sm text-muted-foreground">
            A space where Kyungdong University students connect, share, and grow
          </p>
          
          <div className="pt-4 text-xs text-muted-foreground/80">
            <p>Developed by Student Name</p>
            <p className="mt-1">Student ID: 20XX-XXXXX | Department of Computer Science | Batch 20XX</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
