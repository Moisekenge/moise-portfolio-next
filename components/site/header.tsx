const links = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="site-header">
      <nav aria-label="Primary" className="flex items-center gap-5 sm:gap-8">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="link-line">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
