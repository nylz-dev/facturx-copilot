export default function BlogFooter() {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} FacturXPro. Tous droits réservés.
      </div>
    </footer>
  );
}
